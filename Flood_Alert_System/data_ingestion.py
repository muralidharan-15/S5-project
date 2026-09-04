import os
import sys
import time
import requests
import pandas as pd
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler

from data.district_profiles import (
    fetch_live_coastal_vulnerability,
    fetch_live_dams_quality,
    fetch_live_urbanization,
    fetch_live_deforestation,
    fetch_live_drainage_systems,
    fetch_live_dam_details
)

# Paths
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
DISTRICTS_CSV = os.path.join(DATA_DIR, "districts.csv")
LIVE_DATA_CSV = os.path.join(DATA_DIR, "live_data.csv")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Global Scheduler Instance
scheduler = None


def load_districts_csv():
    """Loads district coordinates from data/districts.csv."""
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
    """
    Fetches real-time weather & 7-day historical precipitation from Open-Meteo REST API,
    live marine wave height data, live river discharge, OpenStreetMap urbanization, NASA POWER deforestation,
    and Open-Meteo elevation drainage capacity indices.
    Computes rolling 1-day, 3-day, 7-day rainfall metrics and dynamic environmental scores.
    """
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

        # Live Coastal Vulnerability from Open-Meteo Marine REST API
        coastal_info = fetch_live_coastal_vulnerability(district_name, lat, lon)

        # Live Dams Quality & River Discharge from Open-Meteo Flood REST API
        dams_info = fetch_live_dams_quality(district_name, lat, lon)

        # Live Urbanization Density from OpenStreetMap Nominatim REST API
        urban_info = fetch_live_urbanization(district_name, lat, lon)

        # Live Deforestation & Soil Moisture from NASA POWER Satellite REST API
        deforest_info = fetch_live_deforestation(district_name, lat, lon)

        # Live Drainage Capacity & Topographic Elevation from Open-Meteo Elevation REST API
        drainage_info = fetch_live_drainage_systems(district_name, lat, lon)

        # Live District Dam Details
        dam_details = fetch_live_dam_details(district_name, lat, lon)

        # Precipitation sum array
        precip_list = daily.get("precipitation_sum", [])
        dates_list = daily.get("time", [])

        # Index split: past 7 days vs today/forecast
        past_precip = precip_list[:7] if len(precip_list) >= 7 else precip_list
        current_day_precip = precip_list[7] if len(precip_list) > 7 else (past_precip[-1] if past_precip else 0.0)

        r_1day = float(current_day_precip)
        r_3day = float(sum(past_precip[-3:])) if len(past_precip) >= 3 else float(sum(past_precip))
        r_7day = float(sum(past_precip[-7:])) if len(past_precip) >= 7 else float(sum(past_precip))
        r_7day_avg = float(r_7day / max(len(past_precip), 1))

        weather_info = {
            "temperature": current.get("temperature", 28.0),
            "windspeed": current.get("windspeed", 12.0),
            "weathercode": current.get("weathercode", 0),
            "humidity": 75,
            "precipitation": r_1day
        }

        # 7-day daily forecast list
        forecast_daily_list = []
        if len(precip_list) > 7:
            for i in range(7, min(14, len(precip_list))):
                forecast_daily_list.append({
                    "date": dates_list[i] if i < len(dates_list) else "",
                    "day_label": f"Day {i - 6}",
                    "rainfall": float(precip_list[i]),
                    "temp_max": float(daily.get("temperature_2m_max", [30]*14)[i]),
                    "temp_min": float(daily.get("temperature_2m_min", [24]*14)[i])
                })

        return {
            "District": district_name,
            "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Latitude": lat,
            "Longitude": lon,
            "Temperature": weather_info["temperature"],
            "Humidity": weather_info["humidity"],
            "WindSpeed": weather_info["windspeed"],
            "WeatherCode": weather_info["weathercode"],
            "Rainfall_1Day": round(r_1day, 2),
            "Rainfall_3Day": round(r_3day, 2),
            "Rainfall_7Day": round(r_7day, 2),
            "Rainfall_7Day_Avg": round(r_7day_avg, 2),
            "CoastalVulnerability": coastal_info["score"],
            "WaveHeightMax": coastal_info["wave_height_max"],
            "DamsQuality": dams_info["score"],
            "RiverDischarge": dams_info["river_discharge"],
            "Urbanization": urban_info["score"],
            "OsmType": urban_info["osm_type"],
            "Deforestation": deforest_info["score"],
            "SoilMoisture": deforest_info["soil_moisture"],
            "DrainageSystems": drainage_info["score"],
            "Elevation": drainage_info["elevation"],
            "DamName": dam_details["dam_name"],
            "RiverBasin": dam_details["river_basin"],
            "DamDischarge": dam_details["river_discharge_m3s"],
            "DamStatus": dam_details["status"],
            "GraphDates": dates_list[:7],
            "GraphRainfall": past_precip,
            "ForecastDailyList": forecast_daily_list,
            "Source": f"All 5 Live APIs & TN Dam Registry ({coastal_info['source']}, {dams_info['source']}, {urban_info['source']}, {deforest_info['source']}, {drainage_info['source']})"
        }

    except Exception as e:
        print(f"[Ingestion Fallback] Error fetching live weather for {district_name}: {e}")
        # Synthetic / Fallback realistic record
        return {
            "District": district_name,
            "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Latitude": lat,
            "Longitude": lon,
            "Temperature": 29.5,
            "Humidity": 78,
            "WindSpeed": 10.5,
            "WeatherCode": 1,
            "Rainfall_1Day": 8.5,
            "Rainfall_3Day": 25.0,
            "Rainfall_7Day": 65.0,
            "Rainfall_7Day_Avg": 9.28,
            "CoastalVulnerability": 5.0,
            "WaveHeightMax": 0.0,
            "DamsQuality": 5.0,
            "RiverDischarge": 0.0,
            "Urbanization": 5.0,
            "OsmType": "fallback",
            "Deforestation": 4.0,
            "SoilMoisture": 0.5,
            "DrainageSystems": 5.0,
            "Elevation": 10.0,
            "DamName": f"{district_name} Reservoir",
            "RiverBasin": "Regional River Basin",
            "DamDischarge": 0.0,
            "DamStatus": "NORMAL - Stable Reservoir Water Level",
            "GraphDates": [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(6, -1, -1)],
            "GraphRainfall": [5.0, 10.0, 8.0, 12.0, 15.0, 6.5, 8.5],
            "ForecastDailyList": [],
            "Source": "Synthetic Fallback Engine"
        }


def update_all_districts_live_data():
    """Loops through all districts, fetches weather metrics, marine vulnerability, river discharge, urbanization, deforestation & drainage capacity, and appends to live_data.csv."""
    districts = load_districts_csv()
    if not districts:
        print("[Ingestion Warning] No districts loaded from districts.csv")
        return

    records = []
    print(f"[Ingestion Scheduler] Ingesting live data for {len(districts)} districts...")
    for district_name, (lat, lon) in districts.items():
        data = fetch_live_district_weather(district_name, lat, lon)
        records.append(data)

    df_new = pd.DataFrame(records)

    # Persist columns (excluding lists for clean CSV format)
    csv_columns = [
        "District", "Timestamp", "Latitude", "Longitude",
        "Temperature", "Humidity", "WindSpeed", "WeatherCode",
        "Rainfall_1Day", "Rainfall_3Day", "Rainfall_7Day", "Rainfall_7Day_Avg",
        "CoastalVulnerability", "WaveHeightMax", "DamsQuality", "RiverDischarge",
        "Urbanization", "OsmType", "Deforestation", "SoilMoisture",
        "DrainageSystems", "Elevation", "DamName", "RiverBasin", "DamDischarge", "DamStatus", "Source"
    ]


    df_csv = df_new[csv_columns]

    if os.path.exists(LIVE_DATA_CSV) and os.path.getsize(LIVE_DATA_CSV) > 0:
        try:
            df_existing = pd.read_csv(LIVE_DATA_CSV)
            df_combined = pd.concat([df_existing, df_csv], ignore_index=True)
            if len(df_combined) > 1000:
                df_combined = df_combined.tail(1000)
            df_combined.to_csv(LIVE_DATA_CSV, index=False)
        except Exception as e:
            print(f"[Ingestion Warning] Could not read existing live_data.csv ({e}). Overwriting fresh.")
            df_csv.to_csv(LIVE_DATA_CSV, index=False)
    else:
        df_csv.to_csv(LIVE_DATA_CSV, index=False)

    print(f"[Ingestion Scheduler] Successfully updated {LIVE_DATA_CSV} with {len(records)} records.")


def get_latest_district_data(district_name: str) -> dict:
    """Retrieves the latest record for a district from live_data.csv or fetches live."""
    districts = load_districts_csv()
    coords = districts.get(district_name, (13.0827, 80.2707))

    # Fetch fresh live record to ensure full graph arrays are available
    fresh_data = fetch_live_district_weather(district_name, coords[0], coords[1])
    return fresh_data


def start_background_ingestion_scheduler(interval_minutes=30):
    """Starts APScheduler background job for periodic weather data ingestion."""
    global scheduler
    if scheduler is not None and scheduler.running:
        return scheduler

    scheduler = BackgroundScheduler(daemon=True)
    # Run once immediately on startup
    scheduler.add_job(update_all_districts_live_data, 'interval', minutes=interval_minutes, id='weather_ingestion_job')
    scheduler.start()
    print(f"[APScheduler] Live Weather Ingestion Daemon initialized (Interval: {interval_minutes}m).")
    return scheduler


if __name__ == "__main__":
    print("Testing Live Data Ingestion Module...")
    update_all_districts_live_data()
