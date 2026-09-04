# Tamil Nadu Flood Alert & Risk Prediction System

A decoupled, high-performance web application for real-time flood monitoring, risk assessment, machine learning predictions, and emergency alerts across 38 districts of Tamil Nadu.

## Architecture Overview

The system has been modernized from a legacy monolithic Flask application into a decoupled backend and frontend architecture:
- **Backend (FastAPI)**: RESTful API built with Python, FastAPI, Scikit-learn, and APScheduler for automated data ingestion, ML flood risk prediction, explainable AI (SHAP), and multi-channel alerting (SMS/WhatsApp via Twilio & Email via SMTP).
- **Frontend (React + Vite)**: Modern, responsive dashboard powered by React, Tailwind CSS, Leaflet maps, and Recharts for dynamic visual alerts, real-time metrics, and district risk mapping.

---

## Project Structure

```
Flood_Alert_System/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API routes and endpoints (/flood/dashboard, /flood/predict, etc.)
│   │   ├── core/            # System settings and configuration (CORS, env vars)
│   │   ├── data/            # District profiles, coordinates, and historical datasets
│   │   ├── database/        # Database integration and persistence
│   │   ├── ml/              # Machine learning model inference and SHAP explainability
│   │   ├── services/        # Data ingestion and multi-channel alert dispatch (Twilio/SMTP)
│   │   └── main.py          # FastAPI application entry point and middleware configuration
│   ├── requirements.txt     # Python dependencies
│   └── run.py               # Development startup script
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client functions
│   │   ├── components/      # React UI components (MapView, RiskBadge, XaiPanel, etc.)
│   │   ├── pages/           # Application views (Dashboard, About, Contact)
│   │   ├── App.jsx          # Root application component
│   │   └── main.jsx         # React application entry point
│   ├── index.html           # Main HTML document
│   ├── package.json         # Node.js dependencies and scripts
│   └── vite.config.js       # Vite configuration
└── README.md                # Project documentation
```

---

## Setup & Run Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup (FastAPI)

Navigate to the `backend/` directory, install Python dependencies, and start the Uvicorn server:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` (Interactive API docs: `http://localhost:8000/docs`).

### 2. Frontend Setup (React + Vite)

In a separate terminal, navigate to the `frontend/` directory, install npm packages, and run the development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend application will be running at `http://localhost:5173`.

---

## Environment Variables

Sensitive credentials and environment-specific settings are loaded via environment variables (or a local `.env` file in `backend/`). Below is the reference list of required environment variables:

| Variable Name | Description | Example / Default |
| --- | --- | --- |
| `SECRET_KEY` | Secret key for application security | `your-production-secret-key` |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins | `http://localhost:5173,http://127.0.0.1:5173` |
| `DB_HOST` | Database host address | `localhost` |
| `DB_USER` | Database username | `root` |
| `DB_PASSWORD` | Database user password | `your_db_password` |
| `DB_NAME` | Database schema name | `flood_alert` |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID for SMS/WhatsApp alerts | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `your_twilio_auth_token` |
| `TWILIO_PHONE_NUMBER` | Registered Twilio phone number | `+15005550006` |
| `SMTP_SERVER` | SMTP server hostname for email alerts | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port number | `587` |
| `ALERT_EMAIL_SENDER` | Sender email address for emergency alerts | `alerts@example.com` |
| `ALERT_EMAIL_PASSWORD` | Application password for SMTP sender | `your_email_app_password` |
| `DEFAULT_ALERT_RECIPIENT` | Default recipient email address for high risk alerts | `officials@tn.gov.in` |

> **Note**: Never commit `.env` or credential files to source control. Ensure `.env` is listed in `.gitignore`.

---

## Migration Note

The legacy monolithic Flask implementation (`app.py`, `templates/`, `static/`, `Flood_Alert_System/` legacy folder) was removed in commit `adce086` after the FastAPI + React migration was completed and verified. It remains fully recoverable from git history if needed:

```bash
git checkout adce086 -- Flood_Alert_System/
```
