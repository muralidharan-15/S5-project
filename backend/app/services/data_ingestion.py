import os
import sys
import time
import requests
import pandas as pd
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler

from app.data.district_profiles import (
    fetch_live_coastal_vulnerability,
    fetch_live_dams_quality,
    fetch_live_urbanization,
    fetch_live_deforestation,
    fetch_live_drainage_systems,
    fetch_live_dam_details
)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DISTRICTS_CSV = os.path.join(DATA_DIR, "districts.csv")
LIVE_DATA_CSV = os.path.join(DATA_DIR, "live_data.csv")

os.makedirs(DATA_DIR, exist_ok=True)
scheduler = None


def load_districts_csv():
    if not os.path.exists(DISTRICTS_CSV):
        return {}
    
    df = pd.read_csv(DISTRICTS_CSV)
    districts = {}
    for _, row in df.iterrows():
        name = str(row["District"]).strip()
        lat = float(row["Latitude"])
        lon = float(row["Longitude"])
        districts[name] = (lat, lon)
    return districts


def fetch_live_district_weather(district_name: str, lat: float, lon: float) -> dict:
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&"
            f"current_weather=true&"
            f"hourly=relative_humidity_2m,precipitation,temperature_2m,weather_code&"
            f"daily=precipitation_sum,temperature_2m_max,temperature_2m_min,weather_code&"
            f"past_days=7&forecast_days=7&timezone=auto"
        )

        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            raise ValueError(f"Open-Meteo returned status {response.status_code}")

        data = response.json()
        current = data.get("current_weather", {})
        daily = data.get("daily", {})

        coastal_info = fetch_live_coastal_vulnerability(district_name, lat, lon)
        dams_info = fetch_live_dams_quality(district_name, lat, lon)
        urban_info = fetch_live_urbanization(district_name, lat, lon)
        deforest_info = fetch_live_deforestation(district_name, lat, lon)
        drainage_info = fetch_live_drainage_systems(district_name, lat, lon)
        dam_details = fetch_live_dam_details(district_name, lat, lon)

        precip_list = daily.get("precipitation_sum", [])
        dates_list = daily.get("time", [])

        past_precip = precip_list[:7] if len(precip_list) >= 7 else precip_list
        current_day_precip = precip_list[7] if len(precip_list) > 7 else (past_precip[-1] if past_precip else 0.0)

        r_1day = float(current_day_precip)
        r_3day = float(sum(past_precip[-3:])) if len(past_precip) >= 3 else float(sum(past_precip))
        r_7day = float(sum(past_precip[-7:])) if len(past_precip) >= 7 else float(sum(past_precip))
        r_7day_avg = float(r_7day / max(len(past_precip), 1))

        return {
            "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "District": district_name,
            "Latitude": lat,
            "Longitude": lon,
            "Temperature": float(current.get("temperature", 28.0)),
            "WeatherCode": int(current.get("weathercode", 0)),
            "WindSpeed": float(current.get("windspeed", 5.0)),
            "Rainfall_1Day": round(r_1day, 2),
            "Rainfall_3Day": round(r_3day, 2),
            "Rainfall_7Day": round(r_7day, 2),
            "Rainfall_7Day_Avg": round(r_7day_avg, 2),
            "DrainageSystems": drainage_info.get("DrainageSystems", 5.0),
            "Urbanization": urban_info.get("Urbanization", 5.0),
            "Deforestation": deforest_info.get("Deforestation", 4.0),
            "CoastalVulnerability": coastal_info.get("CoastalVulnerability", 2.0),
            "DamsQuality": dams_info.get("DamsQuality", 5.0),
            "Dam_Details": dam_details,
            "Status": "Success"
        }
    except Exception as e:
        print(f"[Ingestion Error] {district_name}: {e}")
        return {
            "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "District": district_name,
            "Latitude": lat,
            "Longitude": lon,
            "Rainfall_1Day": 0.0,
            "Rainfall_3Day": 0.0,
            "Rainfall_7Day": 0.0,
            "Rainfall_7Day_Avg": 0.0,
            "DrainageSystems": 5.0,
            "Urbanization": 5.0,
            "Deforestation": 4.0,
            "CoastalVulnerability": 2.0,
            "DamsQuality": 5.0,
            "Status": f"Failed: {e}"
        }


def run_ingestion_cycle():
    districts = load_districts_csv()
    if not districts:
        return

    records = []
    for d_name, (lat, lon) in districts.items():
        rec = fetch_live_district_weather(d_name, lat, lon)
        records.append(rec)

    new_df = pd.DataFrame(records)
    if os.path.exists(LIVE_DATA_CSV):
        try:
            existing_df = pd.read_csv(LIVE_DATA_CSV)
            combined_df = pd.concat([existing_df, new_df], ignore_index=True)
            combined_df.to_csv(LIVE_DATA_CSV, index=False)
        except Exception:
            new_df.to_csv(LIVE_DATA_CSV, index=False)
    else:
        new_df.to_csv(LIVE_DATA_CSV, index=False)
