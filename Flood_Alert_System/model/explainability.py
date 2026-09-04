import numpy as np
import pandas as pd

# Mapping raw 9-feature keys to human-readable display terms
FEATURE_DISPLAY_NAMES = {
    "Rainfall_1Day": "1-Day Rain Volume",
    "Rainfall_3Day": "3-Day Cumulative Rain",
    "Rainfall_7Day": "7-Day Cumulative Rain",
    "Rainfall_7Day_Avg": "7-Day Daily Avg Rain",
    "DrainageSystems": "Poor Drainage Infrastructure",
    "Urbanization": "High Urbanization Level",
    "Deforestation": "Deforestation Index",
    "CoastalVulnerability": "Coastal Exposure",
    "DamsQuality": "Dam Capacity & Quality"
}

_tree_explainer = None


def get_tree_explainer(model):
    """Lazily initializes and caches shap.TreeExplainer for the Random Forest model."""
    global _tree_explainer
    if _tree_explainer is None and model is not None:
        try:
            import shap
            _tree_explainer = shap.TreeExplainer(model)
        except Exception as e:
            print(f"[XAI Notice] SHAP TreeExplainer notice: {e}")
            _tree_explainer = None
    return _tree_explainer


def format_raw_value(feature_name, raw_val):
    """Formats raw feature value into human-readable string with units."""
    val = float(raw_val)
    if "Rainfall" in feature_name:
        if "Avg" in feature_name:
            return f"{val:.1f} mm/day"
        else:
            return f"{val:.1f} mm"
    else:
        return f"Score: {val:.1f}/10"


def generate_summary_banner(top_driver):
    """Generates a dynamic 1-sentence plain-English summary banner."""
    feat = top_driver["feature"]
    disp = top_driver["display_name"]
    pct_str = top_driver["pct_display"]
    raw_str = top_driver["raw_display"]

    if feat in ["Rainfall_7Day", "Rainfall_7Day_Avg"]:
        reason = "heavily dominated by prolonged 7-day cumulative rainfall accumulation"
    elif feat in ["Rainfall_1Day", "Rainfall_3Day"]:
        reason = "primarily driven by sharp short-term precipitation intensity over recent days"
    elif feat in ["Urbanization", "DrainageSystems"]:
        reason = "elevated due to high urban concrete coverage and drainage infrastructure bottlenecks"
    elif feat == "CoastalVulnerability":
        reason = "amplified by high coastal storm surge exposure and vulnerability factors"
    elif feat == "Deforestation":
        reason = "influenced by reduced natural soil absorption capacities from regional deforestation"
    elif feat == "DamsQuality":
        reason = "impacted by local reservoir management and dam storage capacities"
    else:
        reason = f"primarily influenced by {disp.lower()}"

    return f"Risk prediction is {reason} ({disp}: {pct_str}, {raw_str})."


def compute_shap_explanation(model, scaler, features_df, predicted_class):
    """
    Computes SHAP values, impact percentages, raw feature values, and dynamic summary.
    
    Parameters:
        model: Trained RandomForestClassifier
        scaler: Fitted StandardScaler
        features_df: pandas DataFrame containing the 9 features
        predicted_class (int): Predicted risk class index (0=LOW, 1=MODERATE, 2=HIGH)
        
    Returns:
        dict: Explainability metadata containing refined XAI metrics and summary banner.
    """
    feature_names = [
        "Rainfall_1Day", "Rainfall_3Day", "Rainfall_7Day", "Rainfall_7Day_Avg",
        "DrainageSystems", "Urbanization", "Deforestation", "CoastalVulnerability", "DamsQuality"
    ]

    # Preprocess feature input
    if scaler is not None:
        scaled_input = scaler.transform(features_df)
    else:
        scaled_input = features_df.values

    shap_values_raw = None
    explainer = get_tree_explainer(model)

    if explainer is not None:
        try:
            shap_out = explainer.shap_values(scaled_input)
            
            # Multi-class output handling: list of arrays or 3D numpy array
            if isinstance(shap_out, list):
                cls_idx = min(int(predicted_class), len(shap_out) - 1)
                shap_values_raw = shap_out[cls_idx][0]
            elif isinstance(shap_out, np.ndarray):
                if shap_out.ndim == 3:
                    cls_idx = min(int(predicted_class), shap_out.shape[2] - 1)
                    shap_values_raw = shap_out[0, :, cls_idx]
                elif shap_out.ndim == 2:
                    shap_values_raw = shap_out[0]
        except Exception as err:
            print(f"[XAI Warning] Exception computing SHAP values: {err}")

    # Heuristic fallback if SHAP calculation was unavailable
    if shap_values_raw is None or len(shap_values_raw) != len(feature_names):
        if hasattr(model, 'feature_importances_'):
            raw_vals = model.feature_importances_ * np.abs(scaled_input[0])
            shap_values_raw = np.abs(raw_vals)
        else:
            shap_values_raw = np.ones(len(feature_names))

    # Calculate absolute impacts & percentages
    abs_shap = np.abs(shap_values_raw)
    total_magnitude = np.sum(abs_shap)
    if total_magnitude == 0:
        total_magnitude = 1.0

    impact_percentages = (abs_shap / total_magnitude) * 100.0

    driver_list = []
    for idx, f_name in enumerate(feature_names):
        display_name = FEATURE_DISPLAY_NAMES.get(f_name, f_name)
        shap_val = float(shap_values_raw[idx])
        pct = round(float(impact_percentages[idx]), 1)
        direction = "positive" if shap_val >= 0 else "negative"

        # Raw value extraction & formatting
        raw_val = float(features_df.iloc[0][f_name]) if (features_df is not None and f_name in features_df.columns) else 0.0
        raw_display = format_raw_value(f_name, raw_val)

        # Handle < 0.1% (Negligible) thresholding
        if pct < 0.1:
            pct_display = "< 0.1% (Negligible)"
        else:
            pct_display = f"{pct:.1f}%"

        driver_list.append({
            "feature": f_name,
            "display_name": display_name,
            "shap_value": round(shap_val, 4),
            "impact_percent": pct,
            "pct_display": pct_display,
            "raw_val": raw_val,
            "raw_display": raw_display,
            "direction": direction
        })

    # Sort descending by impact percentage
    driver_list.sort(key=lambda x: x["impact_percent"], reverse=True)

    top_3 = driver_list[:3]

    p_driver = f"{top_3[0]['display_name']}: {top_3[0]['pct_display']} ({top_3[0]['raw_display']})" if len(top_3) > 0 else "N/A"
    s_driver = f"{top_3[1]['display_name']}: {top_3[1]['pct_display']} ({top_3[1]['raw_display']})" if len(top_3) > 1 else "N/A"
    t_driver = f"{top_3[2]['display_name']}: {top_3[2]['pct_display']} ({top_3[2]['raw_display']})" if len(top_3) > 2 else "N/A"

    summary_banner = generate_summary_banner(top_3[0]) if len(top_3) > 0 else "Risk evaluation based on 9-feature SHAP decomposition."

    return {
        "primary_driver": p_driver,
        "secondary_driver": s_driver,
        "tertiary_driver": t_driver,
        "summary_banner": summary_banner,
        "top_drivers": top_3,
        "all_drivers": driver_list
    }
