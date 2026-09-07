import os
import joblib
import numpy as np
import pandas as pd
from app.data.district_profiles import get_district_environmental_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "rainfall_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

rainfall_model = None
scaler = None

if os.path.exists(MODEL_PATH):
    try:
        rainfall_model = joblib.load(MODEL_PATH)
        print(f"[ML Notice] Loaded model from {MODEL_PATH}")
    except Exception as e:
        print(f"[ML Error] Failed to load model: {e}")

if os.path.exists(SCALER_PATH):
    try:
        scaler = joblib.load(SCALER_PATH)
        print(f"[ML Notice] Loaded scaler from {SCALER_PATH}")
    except Exception as e:
        print(f"[ML Error] Scaler notice: {e}")


def build_feature_dataframe(r1, r3, r7, r7_avg, district_name, env=None):
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


def calculate_realistic_probability(features_df, model_result):
    try:
        if rainfall_model is None:
            return 15.0

        if scaler is not None:
            inp = scaler.transform(features_df)
        else:
            inp = features_df

        probs = rainfall_model.predict_proba(inp)[0]
        
        # Extract rainfall accumulation and environmental factors
        r7 = float(features_df["Rainfall_7Day"].iloc[0]) if "Rainfall_7Day" in features_df else 10.0
        r1 = float(features_df["Rainfall_1Day"].iloc[0]) if "Rainfall_1Day" in features_df else 2.0
        coastal = float(features_df["CoastalVulnerability"].iloc[0]) if "CoastalVulnerability" in features_df else 2.0
        urban = float(features_df["Urbanization"].iloc[0]) if "Urbanization" in features_df else 5.0
        
        p_mod = float(probs[1]) if len(probs) > 1 else 0.0
        p_high = float(probs[2]) if len(probs) > 2 else 0.0
        base_flood_score = p_mod * 55.0 + p_high * 95.0

        if model_result == 0:
            # Low Risk tier: dynamically scales between 5.0% and 38.0% based on live rain and local vulnerability
            rain_stress = min(20.0, (r7 / 50.0) * 15.0 + (r1 / 15.0) * 5.0)
            env_stress = (coastal / 10.0) * 4.0 + (urban / 10.0) * 3.0
            val = max(5.0, min(38.0, 5.0 + rain_stress + env_stress + base_flood_score * 0.3))
            return round(val, 1)
        elif model_result == 1:
            # Moderate Risk tier: scales between 40.0% and 74.0%
            val = max(40.0, min(74.0, 40.0 + (r7 / 100.0) * 20.0 + base_flood_score * 0.4))
            return round(val, 1)
        else:
            # High Risk tier: scales between 75.0% and 99.0%
            val = max(75.0, min(99.0, 75.0 + (r7 / 200.0) * 20.0 + base_flood_score * 0.1))
            return round(val, 1)
    except Exception as e:
        print("Probability calculation exception:", e)
        return 15.0

