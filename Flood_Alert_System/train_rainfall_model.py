import pandas as pd
import joblib
import os
import sys

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from imblearn.over_sampling import SMOTE

# Add current directory to path for district_profiles import
sys.path.insert(0, os.path.dirname(__file__))
from data.district_profiles import get_district_environmental_features, DEFAULT_ENVIRONMENTAL_FEATURES


def train_and_save_model():
    print("==========================================")
    print("Training Enhanced Flood Risk ML Model")
    print("==========================================")

    # 1. Load Dataset
    data_path = "data/rainfall_ml_dataset.csv"
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    df = pd.read_csv(data_path)
    print(f"Loaded dataset: {len(df)} rows across {df['District'].nunique()} districts.")

    # 2. Enrich Dataset with Environmental & Infrastructure Features
    print("Mapping environmental & infrastructure features (DrainageSystems, Urbanization, Deforestation, CoastalVulnerability, DamsQuality)...")
    
    env_rows = []
    for district in df["District"]:
        env_rows.append(get_district_environmental_features(district))
    
    env_df = pd.DataFrame(env_rows)
    for col in env_df.columns:
        df[col] = env_df[col]

    # Feature List
    feature_names = [
        "Rainfall_1Day",
        "Rainfall_3Day",
        "Rainfall_7Day",
        "Rainfall_7Day_Avg",
        "DrainageSystems",
        "Urbanization",
        "Deforestation",
        "CoastalVulnerability",
        "DamsQuality"
    ]

    X = df[feature_names]
    y = df["FloodRisk"]

    print(f"Feature set ({len(feature_names)} features): {feature_names}")
    print("Class distribution before resampling:")
    print(y.value_counts().to_dict())

    # 3. Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    # Evaluate Model BEFORE SMOTE
    print("\n--- Baseline Model (Before SMOTE) ---")
    scaler_base = StandardScaler()
    X_train_scaled_base = scaler_base.fit_transform(X_train)
    X_test_scaled_base = scaler_base.transform(X_test)

    model_base = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced")
    model_base.fit(X_train_scaled_base, y_train)
    y_pred_base = model_base.predict(X_test_scaled_base)
    print("Baseline Accuracy:", accuracy_score(y_test, y_pred_base))
    print("Baseline Classification Report:")
    print(classification_report(y_test, y_pred_base, zero_division=0))

    # 4. Apply SMOTE Oversampling
    print("\n--- Applying SMOTE Oversampling ---")
    smote = SMOTE(random_state=42)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
    print("Class distribution AFTER SMOTE:")
    print(pd.Series(y_train_resampled).value_counts().to_dict())

    # 5. Fit & Save StandardScaler
    print("\n--- Fitting StandardScaler ---")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_resampled)
    X_test_scaled = scaler.transform(X_test)

    os.makedirs("model", exist_ok=True)
    joblib.dump(scaler, "model/scaler.pkl")
    print("Scaler saved successfully to model/scaler.pkl")

    # 6. Train Final Random Forest Classifier
    print("\n--- Training Final Random Forest Model ---")
    final_model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        class_weight="balanced"
    )
    final_model.fit(X_train_scaled, y_train_resampled)

    # 7. Evaluate Final Model
    y_pred = final_model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    print("\nFinal Model Accuracy (After SMOTE & Scaling):", acc)
    print("\nFinal Classification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    print("Final Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # 8. Save Final Model
    model_path = "model/rainfall_model.pkl"
    joblib.dump(final_model, model_path)
    print("\nEnhanced Model saved successfully!")
    print(f"Location: {model_path}")


if __name__ == "__main__":
    train_and_save_model()