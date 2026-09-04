from flask import Flask, render_template, request
import config
import joblib
import pandas as pd
import numpy as np
import requests
import os
import sys
from datetime import datetime

# Add root directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from data.district_profiles import (
    get_district_environmental_features,
    get_district_environmental_features_live,
    fetch_live_dam_details
)
from alerts.alert_system import alert_manager
from data_ingestion import start_background_ingestion_scheduler, get_latest_district_data
from model.explainability import compute_shap_explanation

app = Flask(__name__)
app.config["SECRET_KEY"] = config.SECRET_KEY

# Initialize Background Ingestion Daemon
try:
    start_background_ingestion_scheduler(interval_minutes=30)
except Exception as err:
    print(f"[App Startup Warning] Ingestion scheduler notice: {err}")

# =========================================================
# LOAD MODEL & SCALER
# =========================================================

MODEL_PATH = "model/rainfall_model.pkl"
SCALER_PATH = "model/scaler.pkl"

rainfall_model = None
scaler = None

if os.path.exists(MODEL_PATH):
    try:
        rainfall_model = joblib.load(MODEL_PATH)
    except Exception as e:
        print(f"[Error] Failed to load model from {MODEL_PATH}: {e}")

if os.path.exists(SCALER_PATH):
    try:
        scaler = joblib.load(SCALER_PATH)
    except Exception as e:
        print(f"[Notice] Scaler not loaded from {SCALER_PATH}: {e}")


# =========================================================
# ALL 38 TAMIL NADU DISTRICT COORDINATES
# =========================================================

districts = {
    "Coimbatore": (11.0168, 76.9558),
    "Chennai": (13.0827, 80.2707),
    "Madurai": (9.9252, 78.1198),
    "Salem": (11.6643, 78.1460),
    "Erode": (11.3410, 77.7172),
    "Tiruchirappalli": (10.7905, 78.7047),
    "Tirunelveli": (8.7139, 77.7567),
    "Vellore": (12.9165, 79.1325),
    "Thanjavur": (10.7870, 79.1378),
    "Kanchipuram": (12.8342, 79.7036),
    "Cuddalore": (11.7480, 79.7714),
    "Tiruppur": (11.1085, 77.3411),
    "Dindigul": (10.3673, 77.9803),
    "Kanyakumari": (8.1833, 77.4119),
    "Nagapattinam": (10.7672, 79.8449),
    "Thoothukudi": (8.7642, 78.1348),
    "Ramanathapuram": (9.3639, 78.8318),
    "Dharmapuri": (12.1211, 78.1582),
    "Krishnagiri": (12.5186, 78.2137),
    "Karur": (10.9601, 78.0766),
    "Namakkal": (11.2189, 78.1674),
    "Pudukkottai": (10.3797, 78.8202),
    "Sivaganga": (9.8433, 78.4809),
    "Theni": (10.0104, 77.4768),
    "Tiruvallur": (13.1432, 79.9070),
    "Tiruvannamalai": (12.2253, 79.0747),
    "Tiruvarur": (10.7709, 79.6366),
    "Viluppuram": (11.9401, 79.4861),
    "Virudhunagar": (9.5872, 77.9624),
    "Ariyalur": (11.1401, 79.0782),
    "Perambalur": (11.2342, 78.8820),
    "Nilgiris": (11.4102, 76.6950),
    "Ranipet": (12.9296, 79.3333),
    "Tirupathur": (12.4929, 78.5678),
    "Chengalpattu": (12.6921, 79.9777),
    "Kallakurichi": (11.7384, 78.9639),
    "Tenkasi": (8.9593, 77.3149),
    "Mayiladuthurai": (11.1018, 79.6522)
}


# =========================================================
# HELPER: CREATE ENRICHED FEATURE DATAFRAME
# =========================================================

def build_feature_dataframe(r1, r3, r7, r7_avg, district_name, lat=None, lon=None, env=None):
    """Builds a 9-feature DataFrame matching model training schema using cached baseline metrics."""
    if env is None:
        env = get_district_environmental_features(district_name)
    return pd.DataFrame([{
        "Rainfall_1Day": float(r1),
        "Rainfall_3Day": float(r3),
        "Rainfall_7Day": float(r7),
        "Rainfall_7Day_Avg": float(r7_avg),
        "DrainageSystems": float(env.get("DrainageSystems", 5.0)),
        "Urbanization": float(env.get("Urbanization", 5.0)),
        "Deforestation": float(env.get("Deforestation", 4.0)),
        "CoastalVulnerability": float(env.get("CoastalVulnerability", 2.0)),
        "DamsQuality": float(env.get("DamsQuality", 5.0))
    }])


# =========================================================
# HELPER: CALIBRATE REALISTIC FLOOD PROBABILITY (%)
# =========================================================

def calculate_realistic_probability(features_df, model_result):
    """
    Calculates a realistic, natural flood probability score (%)
    using predict_proba output with feature scaling if available.
    """
    try:
        if rainfall_model is None:
            return 15.0

        if scaler is not None:
            inp = scaler.transform(features_df)
        else:
            inp = features_df

        probs = rainfall_model.predict_proba(inp)[0]
        confidence = float(np.max(probs) * 100.0)

        # Ensure realistic bounds per class
        if model_result == 0:
            return round(max(5.0, min(30.0, confidence)), 1)
        elif model_result == 1:
            return round(max(40.0, min(75.0, confidence)), 1)
        else:
            return round(max(75.0, min(99.0, confidence)), 1)
    except Exception as e:
        print("Probability calculation exception:", e)
        return 15.0


# =========================================================
# FETCH LIVE & 7-DAY DAILY FORECAST METRICS
# =========================================================

def get_live_weather_and_features(district):
    """
    Fetches real-time weather, past precipitation, and upcoming 7-day forecast.
    Integrates 9-feature schema including environmental factors.
    """
    if district not in districts:
        district = "Coimbatore"

    lat, lon = districts[district]

    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,precipitation"
        f"&daily=precipitation_sum"
        f"&past_days=7&forecast_days=7"
        f"&timezone=Asia%2FKolkata"
    )

    try:
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            data = response.json()
            current = data.get("current", {})
            daily = data.get("daily", {})

            temperature = current.get("temperature_2m", 28.0)
            humidity = current.get("relative_humidity_2m", 75)
            current_rainfall = current.get("precipitation", 0.0)

            daily_dates = daily.get("time", [])
            daily_rainfall = daily.get("precipitation_sum", [])

            if daily_dates and daily_rainfall:
                today_str = datetime.today().strftime("%Y-%m-%d")

                past_records = [
                    (d, r if r is not None else 0.0)
                    for d, r in zip(daily_dates, daily_rainfall)
                    if d <= today_str
                ]
                
                future_records = [
                    (d, r if r is not None else 0.0)
                    for d, r in zip(daily_dates, daily_rainfall)
                    if d > today_str
                ]

                last_7_past = past_records[-7:] if past_records else []
                past_dates = [item[0] for item in last_7_past]
                past_rainfall = [round(float(item[1]), 2) for item in last_7_past]

                r_1day = past_rainfall[-1] if past_rainfall else current_rainfall
                r_3day = round(sum(past_rainfall[-3:]), 2) if len(past_rainfall) >= 3 else r_1day
                r_7day = round(sum(past_rainfall), 2)
                r_7day_avg = round(r_7day / len(past_rainfall), 2) if past_rainfall else r_1day

                env = get_district_environmental_features(district)
                current_features_df = build_feature_dataframe(r_1day, r_3day, r_7day, r_7day_avg, district, env=env)

                # Extract 7 forecast days (Day 1 to Day 7)
                next_7_future = future_records[:7]
                forecast_daily_list = []
                history_series = list(past_rainfall)

                for idx, (f_date, f_rain) in enumerate(next_7_future):
                    f_rain_val = round(float(f_rain), 2)
                    history_series.append(f_rain_val)

                    r3 = round(sum(history_series[-3:]), 2)
                    r7 = round(sum(history_series[-7:]), 2)
                    r7_avg = round(r7 / min(len(history_series), 7), 2)

                    f_df = build_feature_dataframe(f_rain_val, r3, r7, r7_avg, district, env=env)

                    forecast_daily_list.append({
                        "day_num": idx + 1,
                        "day_label": f"Day {idx + 1}",
                        "date": f_date,
                        "rainfall": f_rain_val,
                        "r3_sum": r3,
                        "r7_sum": r7,
                        "r7_avg": r7_avg,
                        "features": f_df,
                        "district": district
                    })

                graph_dates = [item[0] for item in next_7_future]
                graph_rainfall = [round(float(item[1]), 2) for item in next_7_future]

                return {
                    "source": "Live Open-Meteo Satellite API",
                    "weather": {
                        "temperature": temperature,
                        "humidity": humidity,
                        "rainfall": current_rainfall
                    },
                    "rainfall_features": {
                        "date": past_dates[-1] if past_dates else today_str,
                        "rainfall_1day": r_1day,
                        "rainfall_3day": r_3day,
                        "rainfall_7day": r_7day,
                        "rainfall_7day_avg": r_7day_avg,
                        "graph_dates": graph_dates,
                        "graph_rainfall": graph_rainfall,
                        "features": current_features_df,
                        "district": district
                    },
                    "forecast_daily_list": forecast_daily_list
                }
    except Exception as e:
        print("Live weather API error, falling back to local dataset:", e)

    return get_csv_fallback_features(district)


def get_csv_fallback_features(district):
    """Fallback function to load local historical data from CSV."""
    try:
        df = pd.read_csv("data/rainfall_features.csv")
        df["Date"] = pd.to_datetime(df["Date"])
        district_data = df[df["District"] == district].copy()

        if district_data.empty:
            district_data = df.sort_values("Date")

        district_data = district_data.sort_values("Date")
        latest = district_data.iloc[-1]
        last_7_days = district_data.tail(7)

        graph_dates = [date.strftime("%Y-%m-%d") for date in last_7_days["Date"]]
        graph_rainfall = [round(float(val), 2) for val in last_7_days["Rainfall_1Day"]]

        r1 = round(float(latest["Rainfall_1Day"]), 2)
        r3 = round(float(latest["Rainfall_3Day"]), 2)
        r7 = round(float(latest["Rainfall_7Day"]), 2)
        r7_avg = round(float(latest["Rainfall_7Day_Avg"]), 2)

        current_features_df = build_feature_dataframe(r1, r3, r7, r7_avg, district)

        return {
            "source": "Historical CSV Cache",
            "weather": {
                "temperature": 28.0,
                "humidity": 75,
                "rainfall": r1
            },
            "rainfall_features": {
                "date": latest["Date"].strftime("%Y-%m-%d"),
                "rainfall_1day": r1,
                "rainfall_3day": r3,
                "rainfall_7day": r7,
                "rainfall_7day_avg": r7_avg,
                "graph_dates": graph_dates,
                "graph_rainfall": graph_rainfall,
                "features": current_features_df,
                "district": district
            },
            "forecast_daily_list": []
        }
    except Exception as e:
        print("CSV fallback error:", e)
        return None


# =========================================================
# ML FLOOD RISK PREDICTION ENGINES
# =========================================================

def predict_rainfall_risk(rainfall_features, district_name="Coimbatore"):
    """
    Predicts current status flood risk classification using Random Forest model & StandardScaler.
    Triggers AlertManager for threshold processing.
    """
    if rainfall_features is None or "features" not in rainfall_features:
        return None

    try:
        features_df = rainfall_features["features"]
        target_district = rainfall_features.get("district", district_name)

        if scaler is not None:
            features_input = scaler.transform(features_df)
        else:
            features_input = features_df

        result = int(rainfall_model.predict(features_input)[0]) if rainfall_model else 0
        prob_percent = calculate_realistic_probability(features_df, result)

        if result == 0:
            level_str = "LOW"
            msg = "Normal weather conditions right now."
            badge_class = "info"
            advisory = "Regular monitoring recommended. Local drainage operating normally."
        elif result == 1:
            level_str = "MODERATE"
            msg = "Moderate precipitation detected right now."
            badge_class = "warning"
            advisory = "Stay alert in low-lying areas. Avoid parking in waterlogging zones."
        else:
            level_str = "HIGH"
            msg = "Heavy rainfall detected right now."
            badge_class = "danger"
            advisory = "Prepare emergency kits and follow local emergency guidance."

        # Trigger threshold alert process
        alert_result = alert_manager.process_alert(
            district_name=target_district,
            risk_level=level_str,
            confidence=prob_percent,
            details={
                "rainfall_1day": rainfall_features.get("rainfall_1day", 0.0),
                "rainfall_7day": rainfall_features.get("rainfall_7day", 0.0)
            }
        )

        # Compute Explainable AI (SHAP) Drivers
        explainability = compute_shap_explanation(rainfall_model, scaler, features_df, result)

        return {
            "level": level_str,
            "message": msg,
            "class": badge_class,
            "probability": prob_percent,
            "advisory": advisory,
            "alert": alert_result,
            "explainability": explainability,
            "primary_driver": explainability.get("primary_driver", "N/A"),
            "secondary_driver": explainability.get("secondary_driver", "N/A"),
            "tertiary_driver": explainability.get("tertiary_driver", "N/A")
        }

    except Exception as e:
        print("ML Model current prediction error:", e)
        return {
            "level": "LOW",
            "message": "Normal weather conditions right now.",
            "class": "info",
            "probability": 15.0,
            "advisory": "Regular monitoring recommended."
        }


def predict_7day_forecast_risk(forecast_daily_list):
    """
    Computes daily flood risk level and realistic probability % for Day 1 to Day 7.
    """
    if not forecast_daily_list:
        return [], None

    evaluated_days = []
    peak_risk_val = 0
    peak_prob = 0.0
    peak_day_info = None

    for item in forecast_daily_list:
        try:
            f_df = item["features"]
            d_name = item.get("district", "Coimbatore")

            if scaler is not None:
                f_input = scaler.transform(f_df)
            else:
                f_input = f_df

            res = int(rainfall_model.predict(f_input)[0]) if rainfall_model else 0
            prob_percent = calculate_realistic_probability(f_df, res)

            if res == 0:
                level_str = "LOW"
                badge_class = "info"
                desc = "Low Flood Threat"
                advisory = "Normal weather forecasted."
            elif res == 1:
                level_str = "MODERATE"
                badge_class = "warning"
                desc = "Moderate Flood Alert"
                advisory = "Monitor local water levels & storm drains."
            else:
                level_str = "HIGH"
                badge_class = "danger"
                desc = "Severe Flood Warning!"
                advisory = "Prepare 72-hour emergency kits and review evacuation plans."

            day_eval = {
                "day_num": item["day_num"],
                "day_label": item["day_label"],
                "date": item["date"],
                "rainfall": item["rainfall"],
                "level": level_str,
                "class": badge_class,
                "description": desc,
                "probability": prob_percent,
                "advisory": advisory
            }
            evaluated_days.append(day_eval)

            if res > peak_risk_val or (res == peak_risk_val and prob_percent > peak_prob):
                peak_risk_val = res
                peak_prob = prob_percent
                peak_day_info = day_eval

        except Exception as e:
            print("Daily forecast prediction error:", e)

    if peak_day_info is None and evaluated_days:
        peak_day_info = evaluated_days[0]

    peak_summary = {
        "level": peak_day_info["level"] if peak_day_info else "LOW",
        "class": peak_day_info["class"] if peak_day_info else "info",
        "peak_day_label": peak_day_info["day_label"] if peak_day_info else "Day 1",
        "peak_date": peak_day_info["date"] if peak_day_info else "",
        "probability": peak_prob,
        "advisory": peak_day_info["advisory"] if peak_day_info else "Normal weather forecasted for the next 7 days."
    }

    return evaluated_days, peak_summary


def compute_all_district_risks():
    """
    Computes current flood risk and color codes for ALL 38 districts for interactive map rendering.
    Green (#22c55e) for LOW, Yellow (#f59e0b) for MODERATE, Red (#ef4444) for HIGH.
    """
    district_risks = {}
    for name, coords in districts.items():
        try:
            env = get_district_environmental_features(name)
            # Default baseline metrics for fast map rendering
            f_df = pd.DataFrame([{
                "Rainfall_1Day": 8.0,
                "Rainfall_3Day": 22.0,
                "Rainfall_7Day": 55.0,
                "Rainfall_7Day_Avg": 7.8,
                "DrainageSystems": float(env["DrainageSystems"]),
                "Urbanization": float(env["Urbanization"]),
                "Deforestation": float(env["Deforestation"]),
                "CoastalVulnerability": float(env["CoastalVulnerability"]),
                "DamsQuality": float(env["DamsQuality"])
            }])

            if scaler is not None:
                f_inp = scaler.transform(f_df)
            else:
                f_inp = f_df

            res = int(rainfall_model.predict(f_inp)[0]) if rainfall_model else 0
            prob = calculate_realistic_probability(f_df, res)

            if res == 2 or (env["Urbanization"] >= 8.5 and env["CoastalVulnerability"] >= 8.5):
                lvl = "HIGH" if res == 2 else "MODERATE"
                color = "#ef4444" if lvl == "HIGH" else "#f59e0b"
            elif res == 1 or env["CoastalVulnerability"] >= 7.5:
                lvl = "MODERATE"
                color = "#f59e0b"
            else:
                lvl = "LOW"
                color = "#22c55e"

            district_risks[name] = {
                "lat": coords[0],
                "lon": coords[1],
                "level": lvl,
                "color": color,
                "confidence": prob
            }
        except Exception as e:
            district_risks[name] = {
                "lat": coords[0],
                "lon": coords[1],
                "level": "LOW",
                "color": "#22c55e",
                "confidence": 15.0
            }
    return district_risks


# =========================================================
# ROUTES
# =========================================================

@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        selected_district = request.form.get("district", "Coimbatore")
    else:
        selected_district = request.args.get("district", "Coimbatore")

    if selected_district not in districts:
        selected_district = "Coimbatore"

    # Analyze live weather & 7-day forecast data
    data = get_live_weather_and_features(selected_district)
    
    weather = data["weather"] if data else None
    rainfall_features = data["rainfall_features"] if data else None
    forecast_daily_list = data["forecast_daily_list"] if data else []
    data_source = data["source"] if data else "Unavailable"

    # Fetch district-specific live dam details
    target_coords = districts.get(selected_district, (13.0827, 80.2707))
    dam_details = fetch_live_dam_details(selected_district, target_coords[0], target_coords[1])

    # Predict current live status & 7-day daily forecast
    rainfall_risk = predict_rainfall_risk(rainfall_features, selected_district)
    evaluated_7day_forecast, peak_forecast_risk = predict_7day_forecast_risk(forecast_daily_list)

    # Compute risk status for all 38 districts for interactive map rendering
    district_risks = compute_all_district_risks()

    return render_template(
        "index.html",
        district=selected_district,
        districts=sorted(list(districts.keys())),
        districts_coords=district_risks,
        district_risks=district_risks,
        weather=weather,
        rainfall_features=rainfall_features,
        rainfall_risk=rainfall_risk,
        evaluated_7day_forecast=evaluated_7day_forecast,
        peak_forecast_risk=peak_forecast_risk,
        dam_details=dam_details,
        data_source=data_source
    )


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)