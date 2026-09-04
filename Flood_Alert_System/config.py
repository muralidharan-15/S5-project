import os

# -------------------------------
# Flask Configuration
# -------------------------------
SECRET_KEY = "flood_alert_secret_key"

# -------------------------------
# Weather API
# -------------------------------
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# -------------------------------
# Machine Learning Model
# -------------------------------
MODEL_PATH = "model/flood_model.pkl"

# -------------------------------
# Database Configuration
# -------------------------------
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = ""
DB_NAME = "flood_alert"

# -------------------------------
# Twilio SMS / WhatsApp Configuration
# -------------------------------
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "AC_MOCK_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "MOCK_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "+15005550006")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

# -------------------------------
# Email Configuration
# -------------------------------
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
ALERT_EMAIL_SENDER = os.getenv("ALERT_EMAIL_SENDER", "alerts@floodguard.ai")
ALERT_EMAIL_PASSWORD = os.getenv("ALERT_EMAIL_PASSWORD", "")
DEFAULT_ALERT_RECIPIENT = os.getenv("DEFAULT_ALERT_RECIPIENT", "officials@tn.gov.in")