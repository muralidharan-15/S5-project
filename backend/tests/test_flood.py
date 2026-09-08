import sys
import os
import unittest
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app


class TestFloodEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_get_districts_returns_all_38_districts(self):
        """Verify the districts endpoint returns all 38 Tamil Nadu districts with risk mapping."""
        response = self.client.get("/api/v1/flood/districts")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("districts_list", data)
        self.assertIn("districts_map", data)
        self.assertEqual(len(data["districts_list"]), 38)
        self.assertIn("Chennai", data["districts_list"])
        self.assertIn("Virudhunagar", data["districts_list"])
        self.assertIn("Coimbatore", data["districts_list"])

    def test_get_dashboard_telemetry_for_district(self):
        """Verify the dashboard telemetry endpoint returns valid risk and weather data."""
        response = self.client.get("/api/v1/flood/dashboard?district=Virudhunagar")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["district"], "Virudhunagar")
        self.assertIn("weather", data)
        self.assertIn("rainfall_features", data)
        self.assertIn("rainfall_risk", data)
        self.assertIn("evaluated_7day_forecast", data)

    def test_subscribe_flood_alert(self):
        """Verify the alert subscription endpoint registers citizens successfully."""
        payload = {
            "name": "Citizen Officer",
            "phone": "+919876543210",
            "email": "officer@tn.gov.in",
            "district": "Virudhunagar",
            "channel": "SMS"
        }
        response = self.client.post("/api/v1/flood/alert-subscribe", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("Virudhunagar", data["message"])


if __name__ == "__main__":
    unittest.main()
