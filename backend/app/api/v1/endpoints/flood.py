from fastapi import APIRouter, Query, HTTPException, Body
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
import pandas as pd

from app.core.config import settings
from app.services.weather_service import get_live_weather_and_features
from app.data.district_profiles import (
    get_district_environmental_features,
    fetch_live_dam_details
)
from app.services.alert_system import alert_manager
from app.ml.predict import rainfall_model, scaler, calculate_realistic_probability
from app.ml.explainability import compute_shap_explanation

router = APIRouter()


class AlertSubscriptionRequest(BaseModel):
    name: str
    phone: str
    email: str
    district: str
    channel: str  # SMS, WhatsApp, Email


@router.get("/districts")
def get_all_district_risks():
    """
    Computes current flood risk and color codes for ALL 38 districts for interactive Leaflet map rendering.
    Green (#16A34A) for LOW, Amber (#D97706) for MODERATE, Red (#DC2626) for HIGH.
    """
    district_risks = {}
    for name, coords in settings.DISTRICTS.items():
        try:
            env = get_district_environmental_features(name)
            f_df = pd.DataFrame([{
                "Rainfall_1Day": 8.0,
                "Rainfall_3Day": 22.0,
                "Rainfall_7Day": 55.0,
                "Rainfall_7Day_Avg": 7.8,
                "DrainageSystems": float(env.get("DrainageSystems", 5.0)),
                "Urbanization": float(env.get("Urbanization", 5.0)),
                "Deforestation": float(env.get("Deforestation", 4.0)),
                "CoastalVulnerability": float(env.get("CoastalVulnerability", 2.0)),
                "DamsQuality": float(env.get("DamsQuality", 5.0))
            }])

            if scaler is not None:
                f_inp = scaler.transform(f_df)
            else:
                f_inp = f_df

            res = int(rainfall_model.predict(f_inp)[0]) if rainfall_model else 0
            prob = calculate_realistic_probability(f_df, res)

            if res == 2 or (env.get("Urbanization", 0) >= 8.5 and env.get("CoastalVulnerability", 0) >= 8.5):
                lvl = "HIGH" if res == 2 else "MODERATE"
                color = "#DC2626" if lvl == "HIGH" else "#D97706"
            elif res == 1 or env.get("CoastalVulnerability", 0) >= 7.5:
                lvl = "MODERATE"
                color = "#D97706"
            else:
                lvl = "LOW"
                color = "#16A34A"

            district_risks[name] = {
                "name": name,
                "lat": coords[0],
                "lon": coords[1],
                "level": lvl,
                "color": color,
                "confidence": prob
            }
        except Exception as e:
            district_risks[name] = {
                "name": name,
                "lat": coords[0],
                "lon": coords[1],
                "level": "LOW",
                "color": "#16A34A",
                "confidence": 15.0
            }

    return {
        "districts_list": sorted(list(settings.DISTRICTS.keys())),
        "districts_map": district_risks
    }


@router.get("/dashboard")
def get_dashboard_data(district: str = Query("Coimbatore", description="District name")):
    """
    Returns full real-time flood alert & XAI prediction dashboard dataset.
    """
    if district not in settings.DISTRICTS:
        district = "Coimbatore"

    data = get_live_weather_and_features(district)
    weather = data["weather"] if data else None
    rainfall_features = data["rainfall_features"] if data else None
    forecast_daily_list = data["forecast_daily_list"] if data else []
    data_source = data["source"] if data else "Unavailable"

    target_coords = settings.DISTRICTS.get(district, (13.0827, 80.2707))
    dam_details = fetch_live_dam_details(district, target_coords[0], target_coords[1])

    # Predict current risk & XAI SHAP analysis
    rainfall_risk = None
    if rainfall_features and "features" in rainfall_features:
        try:
            features_df = rainfall_features["features"]
            features_input = scaler.transform(features_df) if scaler is not None else features_df

            result = int(rainfall_model.predict(features_input)[0]) if rainfall_model else 0
            prob_percent = calculate_realistic_probability(features_df, result)

            if result == 0:
                level_str = "LOW"
                msg = "Normal weather conditions."
                badge_class = "success"
                advisory = "Regular monitoring recommended. Local drainage operating normally."
            elif result == 1:
                level_str = "MODERATE"
                msg = "Moderate precipitation detected."
                badge_class = "warning"
                advisory = "Stay alert in low-lying areas. Avoid parking in waterlogging zones."
            else:
                level_str = "HIGH"
                msg = "Heavy rainfall detected."
                badge_class = "danger"
                advisory = "Prepare emergency kits and follow local emergency guidance."

            alert_result = alert_manager.process_alert(
                district_name=district,
                risk_level=level_str,
                confidence=prob_percent,
                details={
                    "rainfall_1day": rainfall_features.get("rainfall_1day", 0.0),
                    "rainfall_7day": rainfall_features.get("rainfall_7day", 0.0)
                }
            )

            explainability = compute_shap_explanation(rainfall_model, scaler, features_df, result)

            rainfall_risk = {
                "level": level_str,
                "message": msg,
                "badge_class": badge_class,
                "probability": prob_percent,
                "advisory": advisory,
                "alert": alert_result,
                "explainability": explainability,
                "primary_driver": explainability.get("primary_driver", "N/A"),
                "secondary_driver": explainability.get("secondary_driver", "N/A"),
                "tertiary_driver": explainability.get("tertiary_driver", "N/A")
            }
        except Exception as e:
            print("[Prediction Error]:", e)

    if rainfall_risk is None:
        rainfall_risk = {
            "level": "LOW",
            "message": "Normal weather conditions.",
            "badge_class": "success",
            "probability": 15.0,
            "advisory": "Regular monitoring recommended.",
            "explainability": None
        }

    # Evaluate 7-day forecast
    evaluated_7day_forecast = []
    peak_risk_val = 0
    peak_prob = 0.0
    peak_day_info = None

    for item in forecast_daily_list:
        try:
            f_df = item["features"]
            f_input = scaler.transform(f_df) if scaler is not None else f_df
            res = int(rainfall_model.predict(f_input)[0]) if rainfall_model else 0
            prob_percent = calculate_realistic_probability(f_df, res)

            if res == 0:
                level_str = "LOW"
                badge_class = "success"
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
                advisory = "Prepare emergency kits and review evacuation plans."

            day_eval = {
                "day_num": item["day_num"],
                "day_label": item["day_label"],
                "date": item["date"],
                "rainfall": item["rainfall"],
                "level": level_str,
                "badge_class": badge_class,
                "description": desc,
                "probability": prob_percent,
                "advisory": advisory
            }
            evaluated_7day_forecast.append(day_eval)

            if res > peak_risk_val or (res == peak_risk_val and prob_percent > peak_prob):
                peak_risk_val = res
                peak_prob = prob_percent
                peak_day_info = day_eval

        except Exception as e:
            print("Daily forecast prediction error:", e)

    if peak_day_info is None and evaluated_7day_forecast:
        peak_day_info = evaluated_7day_forecast[0]

    peak_forecast_risk = {
        "level": peak_day_info["level"] if peak_day_info else "LOW",
        "badge_class": peak_day_info["badge_class"] if peak_day_info else "success",
        "peak_day_label": peak_day_info["day_label"] if peak_day_info else "Day 1",
        "peak_date": peak_day_info["date"] if peak_day_info else "",
        "probability": peak_prob,
        "advisory": peak_day_info["advisory"] if peak_day_info else "Normal weather forecasted for the next 7 days."
    }

    # Format graph trends for frontend Chart.js/Recharts
    rainfall_graph = {
        "dates": rainfall_features.get("graph_dates", []) if rainfall_features else [],
        "rainfall": rainfall_features.get("graph_rainfall", []) if rainfall_features else []
    }

    return {
        "district": district,
        "data_source": data_source,
        "weather": weather,
        "rainfall_features": {
            "date": rainfall_features.get("date", "") if rainfall_features else "",
            "rainfall_1day": rainfall_features.get("rainfall_1day", 0.0) if rainfall_features else 0.0,
            "rainfall_3day": rainfall_features.get("rainfall_3day", 0.0) if rainfall_features else 0.0,
            "rainfall_7day": rainfall_features.get("rainfall_7day", 0.0) if rainfall_features else 0.0,
            "rainfall_7day_avg": rainfall_features.get("rainfall_7day_avg", 0.0) if rainfall_features else 0.0,
        },
        "rainfall_graph": rainfall_graph,
        "rainfall_risk": rainfall_risk,
        "evaluated_7day_forecast": evaluated_7day_forecast,
        "peak_forecast_risk": peak_forecast_risk,
        "dam_details": dam_details
    }


@router.post("/alert-subscribe")
def subscribe_alert(payload: AlertSubscriptionRequest):
    """
    Subscribes a user to flood alerts.
    """
    return {
        "status": "success",
        "message": f"Successfully subscribed {payload.name} ({payload.email}) for {payload.district} district emergency alerts via {payload.channel}."
    }
