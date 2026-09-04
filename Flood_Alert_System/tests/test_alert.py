import unittest
from unittest.mock import MagicMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from alerts.alert_system import AlertManager, alert_manager


class TestAlertSystem(unittest.TestCase):

    def setUp(self):
        # Create mock clients for testing
        self.mock_twilio = MagicMock()
        self.mock_smtp = MagicMock()
        self.alert_mgr = AlertManager(twilio_client=self.mock_twilio, smtp_client=self.mock_smtp)

    def test_low_risk_alert_threshold(self):
        """Test LOW risk threshold logic (logger only, no alerts dispatched)."""
        res = self.alert_mgr.process_alert(
            district_name="Coimbatore",
            risk_level="LOW",
            confidence=12.5,
            details={"rainfall_1day": 2.0, "rainfall_7day": 10.0}
        )
        self.assertFalse(res["triggered"])
        self.assertEqual(res["risk_level"], "LOW")
        self.assertIn("logger", res["channels"])
        self.mock_twilio.messages.create.assert_not_called()
        self.mock_smtp.send_message.assert_not_called()

    def test_moderate_risk_alert_threshold(self):
        """Test MODERATE risk threshold logic (dashboard banner active)."""
        res = self.alert_mgr.process_alert(
            district_name="Salem",
            risk_level="MODERATE",
            confidence=58.0,
            details={"rainfall_1day": 25.0, "rainfall_7day": 75.0}
        )
        self.assertTrue(res["triggered"])
        self.assertEqual(res["risk_level"], "MODERATE")
        self.assertIn("dashboard_banner", res["channels"])
        self.mock_twilio.messages.create.assert_not_called()

    def test_high_risk_alert_threshold(self):
        """Test HIGH risk threshold logic (dispatches Twilio SMS and SMTP email)."""
        res = self.alert_mgr.process_alert(
            district_name="Chennai",
            risk_level="HIGH",
            confidence=92.5,
            details={"rainfall_1day": 120.0, "rainfall_7day": 340.0}
        )
        self.assertTrue(res["triggered"])
        self.assertEqual(res["risk_level"], "HIGH")
        self.assertIn("twilio_sms", res["channels"])
        self.assertIn("email", res["channels"])
        self.assertTrue(res["sms_sent"])
        self.assertTrue(res["email_sent"])
        self.mock_twilio.messages.create.assert_called_once()
        self.mock_smtp.send_message.assert_called_once()

    def test_twilio_api_failure_handling(self):
        """Test graceful handling when Twilio API raises an error."""
        failing_twilio = MagicMock()
        failing_twilio.messages.create.side_effect = Exception("Twilio API Service Unavailable")
        
        mgr = AlertManager(twilio_client=failing_twilio, smtp_client=self.mock_smtp)
        
        # Should not crash, returns false for sms_sent
        res = mgr.process_alert(
            district_name="Cuddalore",
            risk_level="HIGH",
            confidence=89.0,
            details={"rainfall_1day": 95.0}
        )
        self.assertFalse(res["sms_sent"])
        self.assertTrue(res["triggered"])  # Alert flow completed without unhandled exception

    def test_smtp_failure_handling(self):
        """Test graceful handling when SMTP server fails."""
        failing_smtp = MagicMock()
        failing_smtp.send_message.side_effect = Exception("SMTP Connection Refused")

        mgr = AlertManager(twilio_client=self.mock_twilio, smtp_client=failing_smtp)
        
        res = mgr.process_alert(
            district_name="Nagapattinam",
            risk_level="HIGH",
            confidence=95.0,
            details={"rainfall_1day": 140.0}
        )
        self.assertFalse(res["email_sent"])
        self.assertTrue(res["triggered"])


if __name__ == "__main__":
    unittest.main()
