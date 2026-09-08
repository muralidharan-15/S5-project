import os
import asyncio
import httpx
import requests
import pandas as pd
from datetime import datetime
from app.core.config import settings
from app.data.district_profiles import (
    get_district_environmental_features,
    TAMIL_NADU_DAMS,
    COASTAL_DISTRICTS
)
from app.ml.predict import build_feature_dataframe

CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "rainfall_features.csv")

# In-memory telemetry cache to avoid blocking on slow external APIs
_SOIL_MOISTURE_CACHE: dict[str, float] = {}
_RIVER_DISCHARGE_CACHE: dict[str, float] = {}
_WAVE_HEIGHT_CACHE: dict[str, float] = {}


async def get_live_weather_and_telemetry_async(district: str) -> dict:
    """
    Concurrently fetches Open-Meteo Weather, Open-Meteo Flood, Open-Meteo Marine (for coastal districts),
    and NASA POWER Satellite telemetry using asyncio.gather and httpx.AsyncClient.
    Latency is bounded by caching non-volatile satellite soil moisture and river discharge.
    """
    if district not in settings.DISTRICTS:
        district = "Coimbatore"

    lat, lon = settings.DISTRICTS[district]
    dam_meta = TAMIL_NADU_DAMS.get(district)
    if not dam_meta:
        dam_meta = {
            "dam_name": f"{district} Local Catchment Basin",
            "river": "Regional River Basin",
            "capacity_tmc": 2.5,
            "lat": lat,
            "lon": lon
        }

    dam_lat = dam_meta.get("lat") or lat
    dam_lon = dam_meta.get("lon") or lon
    is_coastal = district in COASTAL_DISTRICTS

    weather_url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m"
        f"&daily=precipitation_sum"
        f"&past_days=7&forecast_days=7"
        f"&timezone=Asia%2FKolkata"
    )
    flood_url = (
        f"https://flood-api.open-meteo.com/v1/flood?"
        f"latitude={dam_lat}&longitude={dam_lon}&"
        f"daily=river_discharge&forecast_days=1&timezone=auto"
    )
    marine_url = (
        f"https://marine-api.open-meteo.com/v1/marine?"
        f"latitude={lat}&longitude={lon}&"
        f"daily=wave_height_max&forecast_days=1&timezone=auto"
    ) if is_coastal else None

    nasa_url = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point?"
        f"parameters=GWETTOP&community=AG&longitude={lon}&latitude={lat}&"
        f"start=20240101&end=20240105&format=JSON"
    )

    headers = {"User-Agent": "FloodAlertSystem/1.0 (contact@tn.gov.in)"}

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(2.5, connect=1.2), headers=headers) as client:
            req_weather = client.get(weather_url)
            req_flood = client.get(flood_url) if district not in _RIVER_DISCHARGE_CACHE else asyncio.sleep(0, result=None)
            req_marine = client.get(marine_url) if (is_coastal and district not in _WAVE_HEIGHT_CACHE) else asyncio.sleep(0, result=None)
            req_nasa = client.get(nasa_url) if district not in _SOIL_MOISTURE_CACHE else asyncio.sleep(0, result=None)

            res_weather, res_flood, res_marine, res_nasa = await asyncio.gather(
                req_weather, req_flood, req_marine, req_nasa,
                return_exceptions=True
            )


        # 1. Parse Live Weather
        if not isinstance(res_weather, Exception) and res_weather.status_code == 200:
            w_data = res_weather.json()
            current = w_data.get("current", {})
            daily = w_data.get("daily", {})
            elevation = float(w_data.get("elevation", 10.0))

            temperature = float(current.get("temperature_2m", 28.0))
            humidity = float(current.get("relative_humidity_2m", 75))
            wind_speed = float(current.get("wind_speed_10m", 12.0))
            current_rainfall = float(current.get("precipitation", 0.0))

            daily_dates = daily.get("time", [])
            daily_rainfall = daily.get("precipitation_sum", [])

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

            # 2. Parse dynamic environmental features from concurrent calls
            env = get_district_environmental_features(district).copy()

            # Dynamic coastal vulnerability (Open-Meteo Marine)
            max_wave = _WAVE_HEIGHT_CACHE.get(district, 0.5)
            if is_coastal and not isinstance(res_marine, Exception) and res_marine and res_marine.status_code == 200:
                try:
                    m_data = res_marine.json()
                    wave_heights = m_data.get("daily", {}).get("wave_height_max", [])
                    if wave_heights and wave_heights[0] is not None:
                        max_wave = float(wave_heights[0])
                        _WAVE_HEIGHT_CACHE[district] = max_wave
                except Exception:
                    pass
            baseline_coastal = env.get("CoastalVulnerability", 2.0)
            env["CoastalVulnerability"] = round(min(10.0, max(2.0, baseline_coastal + (max_wave * 1.5))), 2)
            env["WaveHeightMax"] = round(max_wave, 2)

            # Dynamic river discharge and dam stress (Open-Meteo Flood)
            discharge = _RIVER_DISCHARGE_CACHE.get(district, 1.5)
            if not isinstance(res_flood, Exception) and res_flood and res_flood.status_code == 200:
                try:
                    f_data = res_flood.json()
                    discharge_list = f_data.get("daily", {}).get("river_discharge", [])
                    if discharge_list and discharge_list[0] is not None:
                        discharge = float(discharge_list[0])
                        _RIVER_DISCHARGE_CACHE[district] = discharge
                except Exception:
                    pass
            baseline_dams = env.get("DamsQuality", 5.0)
            env["DamsQuality"] = round(max(1.0, min(10.0, baseline_dams - (discharge / 50.0))), 2)
            env["RiverDischarge"] = round(discharge, 2)

            # Dynamic deforestation / soil moisture (NASA POWER)
            soil_moisture = _SOIL_MOISTURE_CACHE.get(district, 0.52)
            if not isinstance(res_nasa, Exception) and res_nasa and res_nasa.status_code == 200:
                try:
                    n_data = res_nasa.json()
                    params = n_data.get("properties", {}).get("parameter", {})
                    gwettop_vals = [v for v in params.get("GWETTOP", {}).values() if v != -999.0]
                    if gwettop_vals:
                        soil_moisture = float(gwettop_vals[-1])
                        _SOIL_MOISTURE_CACHE[district] = soil_moisture
                except Exception:
                    pass
            baseline_forest = env.get("Deforestation", 4.0)
            env["Deforestation"] = round(min(10.0, max(1.0, baseline_forest + (0.5 - soil_moisture) * 2.0)), 2)
            env["SoilMoisture"] = round(soil_moisture, 2)

            # Dynamic drainage slope (Elevation)
            if elevation < 20.0:
                slope_bonus = -0.5
            elif elevation > 200.0:
                slope_bonus = 1.0
            else:
                slope_bonus = 0.0
            baseline_drainage = env.get("DrainageSystems", 5.0)
            env["DrainageSystems"] = round(min(10.0, max(1.0, baseline_drainage + slope_bonus)), 2)
            env["Elevation"] = round(elevation, 1)

            # 3. Build features dataframe with live environmental factors
            current_features_df = build_feature_dataframe(r_1day, r_3day, r_7day, r_7day_avg, district, env=env)

            # 4. Build daily forecast features list
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

            # 5. Build live dam status
            if discharge > 50.0:
                dam_status = "CRITICAL - Emergency Spillway Release Warning"
                dam_badge = "danger"
            elif discharge > 15.0:
                dam_status = "WARNING - Controlled Reservoir Release"
                dam_badge = "warning"
            else:
                dam_status = "NORMAL - Stable Reservoir Water Level"
                dam_badge = "success"

            dam_details = {
                "has_dam": True,
                "dam_name": dam_meta["dam_name"],
                "river_basin": dam_meta["river"],
                "capacity_tmc": dam_meta["capacity_tmc"],
                "river_discharge_m3s": round(discharge, 2),
                "status": dam_status,
                "badge_class": dam_badge,
                "source": "Open-Meteo Flood API & TN Dam Registry (Live Concurrent Ingested)"
            }

            return {
                "source": "Live Open-Meteo & NASA POWER Concurrent Telemetry",
                "weather": {
                    "temperature": temperature,
                    "humidity": humidity,
                    "wind_speed": wind_speed,
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
                "forecast_daily_list": forecast_daily_list,
                "dam_details": dam_details,
                "env": env
            }
        else:
            print(f"[Weather API Warning] Open-Meteo status: {getattr(res_weather, 'status_code', 'Exception')}")
    except Exception as e:
        print("[Weather API Warning] Concurrent fetch fallback:", e)

    fallback_data = get_csv_fallback_features(district)
    if fallback_data:
        dam_meta = TAMIL_NADU_DAMS.get(district, {
            "dam_name": f"{district} Local Catchment Basin",
            "river": "Regional River Basin",
            "capacity_tmc": 2.5
        })
        fallback_data["dam_details"] = {
            "has_dam": True,
            "dam_name": dam_meta["dam_name"],
            "river_basin": dam_meta.get("river", "Regional Catchment"),
            "capacity_tmc": dam_meta.get("capacity_tmc", 2.5),
            "river_discharge_m3s": 1.5,
            "status": "NORMAL - Stable Reservoir Water Level (Fallback)",
            "badge_class": "success",
            "source": "TN Dam Registry (Fallback)"
        }
        fallback_data["env"] = get_district_environmental_features(district)
    return fallback_data


def get_live_weather_and_features(district: str):
    """Synchronous wrapper for legacy callers."""
    if district not in settings.DISTRICTS:
        district = "Coimbatore"

    lat, lon = settings.DISTRICTS[district]

    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m"
        f"&daily=precipitation_sum"
        f"&past_days=7&forecast_days=7"
        f"&timezone=Asia%2FKolkata"
    )

    try:
        headers = {"User-Agent": "FloodAlertSystem/1.0 (contact@tn.gov.in)"}
        response = requests.get(url, headers=headers, timeout=4)
        if response.status_code == 200:
            data = response.json()
            current = data.get("current", {})
            daily = data.get("daily", {})

            temperature = float(current.get("temperature_2m", 28.0))
            humidity = float(current.get("relative_humidity_2m", 75))
            wind_speed = float(current.get("wind_speed_10m", 12.0))
            current_rainfall = float(current.get("precipitation", 0.0))

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
                        "wind_speed": wind_speed,
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
                "wind_speed": 12.0,
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
