import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, get_live_weather_and_features, predict_rainfall_risk, districts
from model.predict import predict as cli_predict, load_model_and_scaler


class TestFloodAlertSystem(unittest.TestCase):

    def test_districts_config(self):
        """Test that configured districts exist with valid lat/lon coordinates."""
        self.assertIn("Coimbatore", districts)
        self.assertIn("Chennai", districts)
        self.assertEqual(len(districts), 38)
        for name, coords in districts.items():
            self.assertEqual(len(coords), 2)
            self.assertIsInstance(coords[0], float)
            self.assertIsInstance(coords[1], float)

    def test_live_weather_fetching(self):
        """Test live weather & 7-day rainfall feature generation."""
        res = get_live_weather_and_features("Chennai")
        self.assertIsNotNone(res)
        self.assertIn("weather", res)
        self.assertIn("rainfall_features", res)
        
        features = res["rainfall_features"]
        self.assertIn("rainfall_1day", features)
        self.assertIn("graph_dates", features)
        self.assertIn("graph_rainfall", features)

    def test_ml_risk_prediction(self):
        """Test ML risk prediction logic."""
        res = get_live_weather_and_features("Coimbatore")
        prediction = predict_rainfall_risk(res["rainfall_features"], "Coimbatore")
        self.assertIsNotNone(prediction)
        self.assertIn(prediction["level"], ["LOW", "MODERATE", "HIGH"])
        self.assertIn("probability", prediction)
        self.assertIn("alert", prediction)

    def test_cli_predict_helper(self):
        """Test standalone CLI prediction helper in predict.py."""
        model, scaler = load_model_and_scaler()
        self.assertIsNotNone(model)
        self.assertIsNotNone(scaler)

        res_low = cli_predict(5.0, 10.0, 25.0, 3.5, "Coimbatore")
        self.assertIn("LOW FLOOD RISK", res_low)
        self.assertIn("confidence", res_low)

        res_high = cli_predict(50.0, 120.0, 250.0, 35.0, "Chennai")
        self.assertIn("HIGH FLOOD RISK", res_high)
        self.assertIn("confidence", res_high)

    def test_flask_routes(self):
        """Test Flask application endpoints."""
        with app.test_client() as client:
            res_home = client.get("/")
            self.assertEqual(res_home.status_code, 200)

            res_district = client.get("/?district=Chennai")
            self.assertEqual(res_district.status_code, 200)

            res_about = client.get("/about")
            self.assertEqual(res_about.status_code, 200)

            res_contact = client.get("/contact")
            self.assertEqual(res_contact.status_code, 200)


if __name__ == "__main__":
    unittest.main()
