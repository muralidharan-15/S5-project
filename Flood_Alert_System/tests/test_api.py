import unittest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_ingestion import fetch_live_district_weather, update_all_districts_live_data, get_latest_district_data
from app import get_live_weather_and_features


class TestWeatherAPIIntegration(unittest.TestCase):

    def test_live_weather_success(self):
        """Test successful weather fetching from Open-Meteo REST API."""
        result = fetch_live_district_weather("Chennai", 13.0827, 80.2707)
        self.assertIsNotNone(result)
        self.assertEqual(result["District"], "Chennai")
        self.assertIn("Rainfall_1Day", result)
        self.assertIn("Rainfall_3Day", result)
        self.assertIn("Rainfall_7Day", result)
        self.assertIn("Rainfall_7Day_Avg", result)
        self.assertIsInstance(result["Rainfall_1Day"], float)

    @patch('requests.get')
    def test_api_timeout_fallback(self, mock_get):
        """Test graceful fallback behavior when Weather API times out or raises an exception."""
        # Mock requests.get to raise a Timeout exception
        mock_get.side_effect = Exception("Connection Timeout")

        result = fetch_live_district_weather("Chennai", 13.0827, 80.2707)
        self.assertIsNotNone(result)
        self.assertEqual(result["District"], "Chennai")
        self.assertEqual(result["Source"], "Synthetic Fallback Engine")
        self.assertIn("Rainfall_1Day", result)

    @patch('requests.get')
    def test_api_non_200_status_fallback(self, mock_get):
        """Test graceful fallback behavior when API returns a 500 error status code."""
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_get.return_value = mock_response

        result = fetch_live_district_weather("Madurai", 9.9252, 78.1198)
        self.assertIsNotNone(result)
        self.assertEqual(result["District"], "Madurai")
        self.assertEqual(result["Source"], "Synthetic Fallback Engine")

    def test_app_get_live_weather_and_features(self):
        """Test app helper function for live weather and feature dataframe generation."""
        res = get_live_weather_and_features("Coimbatore")
        self.assertIsNotNone(res)
        self.assertIn("weather", res)
        self.assertIn("rainfall_features", res)
        
        features = res["rainfall_features"]
        self.assertIn("rainfall_1day", features)
        self.assertIn("features", features)
        
        # Verify 9 features present in DataFrame
        df_feat = features["features"]
        self.assertEqual(df_feat.shape[1], 9)
        self.assertIn("DrainageSystems", df_feat.columns)
        self.assertIn("Urbanization", df_feat.columns)


if __name__ == "__main__":
    unittest.main()
