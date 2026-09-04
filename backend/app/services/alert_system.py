import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import sys

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FloodAlertSystem")


class AlertManager:
    """
    Threshold-based Emergency Alert System.
    Handles LOW (log only), MODERATE (dashboard banner), and HIGH (Twilio SMS/WhatsApp + Email) alerts.
    Contains robust error handling so third-party network/API errors do not crash the main application.
    """

    def __init__(self, twilio_client=None, smtp_client=None):
        self.twilio_client = twilio_client
        self.smtp_client = smtp_client

    def send_twilio_sms(self, to_number: str, message_body: str) -> bool:
        """Sends SMS / WhatsApp alert via Twilio API with failure fallback."""
        try:
            if self.twilio_client is not None:
                self.twilio_client.messages.create(
                    body=message_body,
                    from_="+15005550006",
                    to=to_number
                )
                logger.info(f"[Twilio Alert] Dispatched SMS to {to_number}")
                return True

            logger.info(f"[Twilio Alert Simulated] Message for {to_number}: '{message_body}'")
            return True

        except Exception as e:
            logger.error(f"[Twilio Alert Error] Failed to send SMS to {to_number}: {e}")
            return False

    def send_email_notification(self, recipient_email: str, subject: str, body_text: str) -> bool:
        """Sends Email notification via SMTP with failure fallback."""
        try:
            if self.smtp_client is not None:
                self.smtp_client.send_message(recipient_email, subject, body_text)
                logger.info(f"[Email Alert] Dispatched email to {recipient_email}")
                return True

            logger.info(f"[Email Alert Simulated] Subject: '{subject}' to {recipient_email}")
            return True

        except Exception as e:
            logger.error(f"[Email Alert Error] Failed to send email to {recipient_email}: {e}")
            return False

    def process_alert(self, district_name: str, risk_level: str, confidence: float = 0.0, details: dict = None) -> dict:
        details = details or {}
        risk_level_upper = str(risk_level).upper().strip()

        log_msg = f"[Alert Assessment] District: {district_name} | Threat Level: {risk_level_upper} | Confidence: {confidence:.1f}%"

        if "LOW" in risk_level_upper:
            logger.info(log_msg)
            return {
                "district": district_name,
                "risk_level": "LOW",
                "confidence": confidence,
                "triggered": False,
                "channels": ["logger"],
                "status": "LOW_RISK_LOGGED"
            }

        elif "MODERATE" in risk_level_upper:
            logger.warning(f"⚠️ {log_msg} - Dashboard Warning Banner Activated")
            return {
                "district": district_name,
                "risk_level": "MODERATE",
                "confidence": confidence,
                "triggered": True,
                "channels": ["logger", "dashboard_banner"],
                "status": "MODERATE_RISK_BANNER"
            }

        elif "HIGH" in risk_level_upper:
            logger.critical(f"🚨 EMERGENCY: {log_msg} - Triggering Emergency Hotlines & Dispatch")
            
            sms_body = (
                f"🚨 FLOOD EMERGENCY ALERT for {district_name}!\n"
                f"Threat Level: HIGH FLOOD RISK ({confidence:.1f}% Confidence).\n"
                f"Immediate Action Required. State Hotline: 1070 | District: 1077."
            )
            email_subject = f"🚨 URGENT FLOOD WARNING: High Risk Detected in {district_name}"
            email_body = (
                f"OFFICIAL FLOOD EMERGENCY DISPATCH\n"
                f"District: {district_name}\n"
                f"Status: HIGH FLOOD RISK\n"
                f"Model Confidence: {confidence:.1f}%\n"
                f"1-Day Rain: {details.get('rainfall_1day', 'N/A')} mm | 7-Day Rain: {details.get('rainfall_7day', 'N/A')} mm\n"
                f"Preparedness Advisory: Evacuate low-lying zones immediately."
            )

            sms_success = self.send_twilio_sms("+919876543210", sms_body)
            email_success = self.send_email_notification("officials@tn.gov.in", email_subject, email_body)

            return {
                "district": district_name,
                "risk_level": "HIGH",
                "confidence": confidence,
                "triggered": True,
                "channels": ["logger", "dashboard_banner", "twilio_sms", "email"],
                "sms_sent": sms_success,
                "email_sent": email_success,
                "status": "HIGH_RISK_EMERGENCY_DISPATCHED"
            }

        else:
            logger.info(f"Unknown risk level '{risk_level}'. Defaulting to LOW.")
            return {
                "district": district_name,
                "risk_level": "UNKNOWN",
                "triggered": False,
                "channels": ["logger"],
                "status": "UNKNOWN_RISK_DEFAULT"
            }


alert_manager = AlertManager()
