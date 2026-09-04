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
        confidence = float(np.max(probs) * 100.0)

        if model_result == 0:
            return round(max(5.0, min(30.0, confidence)), 1)
        elif model_result == 1:
            return round(max(40.0, min(75.0, confidence)), 1)
        else:
            return round(max(75.0, min(99.0, confidence)), 1)
    except Exception as e:
        print("Probability calculation exception:", e)
        return 15.0
