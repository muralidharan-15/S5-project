import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Settings:
    PROJECT_NAME: str = "Tamil Nadu Flood Alert & Risk Prediction System API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tn-flood-alert-secret-key-2026")
    
    # Configuration-driven CORS origins (comma-separated env var)
    ALLOWED_ORIGINS: list[str] = [
        origin.strip() for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",") if origin.strip()
    ]

    # Database Configuration
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "flood_alert")

    # Twilio SMS / WhatsApp Configuration
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")

    # Email / SMTP Configuration
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    ALERT_EMAIL_SENDER: str = os.getenv("ALERT_EMAIL_SENDER", "")
    ALERT_EMAIL_PASSWORD: str = os.getenv("ALERT_EMAIL_PASSWORD", "")
    DEFAULT_ALERT_RECIPIENT: str = os.getenv("DEFAULT_ALERT_RECIPIENT", "officials@tn.gov.in")
    
    # Coordinates of all 38 Tamil Nadu districts
    DISTRICTS: dict = {
        "Coimbatore": (11.0168, 76.9558),
        "Chennai": (13.0827, 80.2707),
        "Madurai": (9.9252, 78.1198),
        "Salem": (11.6643, 78.1460),
        "Erode": (11.3410, 77.7172),
        "Tiruchirappalli": (10.7905, 78.7047),
        "Tirunelveli": (8.7139, 77.7567),
        "Vellore": (12.9165, 79.1325),
        "Thanjavur": (10.7870, 79.1378),
        "Kanchipuram": (12.8342, 79.7036),
        "Cuddalore": (11.7480, 79.7714),
        "Tiruppur": (11.1085, 77.3411),
        "Dindigul": (10.3673, 77.9803),
        "Kanyakumari": (8.1833, 77.4119),
        "Nagapattinam": (10.7672, 79.8449),
        "Thoothukudi": (8.7642, 78.1348),
        "Ramanathapuram": (9.3639, 78.8318),
        "Dharmapuri": (12.1211, 78.1582),
        "Krishnagiri": (12.5186, 78.2137),
        "Karur": (10.9601, 78.0766),
        "Namakkal": (11.2189, 78.1674),
        "Pudukkottai": (10.3797, 78.8202),
        "Sivaganga": (9.8433, 78.4809),
        "Theni": (10.0104, 77.4768),
        "Tiruvallur": (13.1432, 79.9070),
        "Tiruvannamalai": (12.2253, 79.0747),
        "Tiruvarur": (10.7709, 79.6366),
        "Viluppuram": (11.9401, 79.4861),
        "Virudhunagar": (9.5872, 77.9624),
        "Ariyalur": (11.1401, 79.0782),
        "Perambalur": (11.2342, 78.8820),
        "Nilgiris": (11.4102, 76.6950),
        "Ranipet": (12.9296, 79.3333),
        "Tirupathur": (12.4929, 78.5678),
        "Chengalpattu": (12.6921, 79.9777),
        "Kallakurichi": (11.7384, 78.9639),
        "Tenkasi": (8.9593, 77.3149),
        "Mayiladuthurai": (11.1018, 79.6522)
    }

settings = Settings()
