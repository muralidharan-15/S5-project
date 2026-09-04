import joblib
import pandas as pd
import numpy as np
import os
import sys

# Ensure parent directory is in path for data/district_profiles import
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from data.district_profiles import get_district_environmental_features, DEFAULT_ENVIRONMENTAL_FEATURES

MODEL_PATH = os.path.join(os.path.dirname(__file__), "rainfall_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")


def load_model_and_scaler(model_path=MODEL_PATH, scaler_path=SCALER_PATH):
    """Loads the trained Random Forest model and StandardScaler."""
    model = None
    scaler = None
    try:
        if os.path.exists(model_path):
            model = joblib.load(model_path)
    except Exception as e:
        print(f"Error loading model from {model_path}: {e}")

    try:
        if os.path.exists(scaler_path):
            scaler = joblib.load(scaler_path)
    except Exception as e:
        print(f"Error loading scaler from {scaler_path}: {e}")

    return model, scaler


def predict(rainfall_1day, rainfall_3day, rainfall_7day, rainfall_7day_avg, district_name=None, env_features=None):
    """
    Predicts flood risk based on rainfall parameters and environmental profile.
    
    Parameters:
        rainfall_1day (float): 1-day rainfall accumulation in mm
        rainfall_3day (float): 3-day rainfall accumulation in mm
        rainfall_7day (float): 7-day rainfall accumulation in mm
        rainfall_7day_avg (float): 7-day average daily rainfall in mm
        district_name (str, optional): Tamil Nadu district name for environmental lookup
        env_features (dict, optional): Custom environmental features dict
    """
    model, scaler = load_model_and_scaler()
    if model is None:
        return "Model loading failed"

    if env_features is None:
        env_features = get_district_environmental_features(district_name)

    features_dict = {
        "Rainfall_1Day": float(rainfall_1day),
        "Rainfall_3Day": float(rainfall_3day),
        "Rainfall_7Day": float(rainfall_7day),
        "Rainfall_7Day_Avg": float(rainfall_7day_avg),
        "DrainageSystems": float(env_features.get("DrainageSystems", DEFAULT_ENVIRONMENTAL_FEATURES["DrainageSystems"])),
        "Urbanization": float(env_features.get("Urbanization", DEFAULT_ENVIRONMENTAL_FEATURES["Urbanization"])),
        "Deforestation": float(env_features.get("Deforestation", DEFAULT_ENVIRONMENTAL_FEATURES["Deforestation"])),
        "CoastalVulnerability": float(env_features.get("CoastalVulnerability", DEFAULT_ENVIRONMENTAL_FEATURES["CoastalVulnerability"])),
        "DamsQuality": float(env_features.get("DamsQuality", DEFAULT_ENVIRONMENTAL_FEATURES["DamsQuality"]))
    }

    features_df = pd.DataFrame([features_dict])

    # Apply StandardScaler if available
    if scaler is not None:
        features_input = scaler.transform(features_df)
    else:
        features_input = features_df

    prediction = int(model.predict(features_input)[0])
    
    # Calculate confidence percentage via predict_proba
    probabilities = model.predict_proba(features_input)[0]
    confidence = float(np.max(probabilities) * 100)
    
    risk_levels = {
        0: "LOW FLOOD RISK 🟢",
        1: "MODERATE FLOOD RISK 🟡",
        2: "HIGH FLOOD RISK 🔴"
    }

    label = risk_levels.get(prediction, "UNKNOWN")
    
    # Compute Explainable AI (SHAP) Drivers
    try:
        from model.explainability import compute_shap_explanation
        xai = compute_shap_explanation(model, scaler, features_df, prediction)
        primary = xai.get("primary_driver", "")
        return f"{label} — {confidence:.1f}% confidence | Primary Driver: {primary}"
    except Exception:
        return f"{label} — {confidence:.1f}% confidence"



if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print("==========================================")
    print("CLI Flood Risk Prediction Helper")
    print("==========================================")
    
    # Sample Test Calls
    result_chennai = predict(rainfall_1day=45.0, rainfall_3day=110.0, rainfall_7day=210.0, rainfall_7day_avg=30.0, district_name="Chennai")
    print(f"Sample Chennai High Rain Risk Result: {result_chennai}")

    result_coimbatore = predict(rainfall_1day=5.0, rainfall_3day=12.0, rainfall_7day=30.0, rainfall_7day_avg=4.2, district_name="Coimbatore")
    print(f"Sample Coimbatore Low Rain Risk Result: {result_coimbatore}")
