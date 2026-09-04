import os
import requests
import pandas as pd
from datetime import datetime
from app.core.config import settings
from app.data.district_profiles import get_district_environmental_features
from app.ml.predict import build_feature_dataframe

CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "rainfall_features.csv")


def get_live_weather_and_features(district: str):
    if district not in settings.DISTRICTS:
        district = "Coimbatore"

    lat, lon = settings.DISTRICTS[district]

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
        print("[Weather API Warning] Falling back to local dataset:", e)

    return get_csv_fallback_features(district)


def get_csv_fallback_features(district: str):
    try:
        if not os.path.exists(CSV_PATH):
            print(f"[CSV Warning] File not found: {CSV_PATH}")
            return None

        df = pd.read_csv(CSV_PATH)
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
