from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.router import api_router
from app.services.ingestion_service import start_ingestion_scheduler, stop_ingestion_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[FastAPI Startup] Initializing Tamil Nadu Flood Alert System Backend...")
    start_ingestion_scheduler()
    yield
    print("[FastAPI Shutdown] Cleaning up background tasks...")
    stop_ingestion_scheduler()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Configuration-driven CORS Middleware (No wildcarding for security hardening)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "allowed_origins": settings.ALLOWED_ORIGINS,
        "docs": "/docs"
    }
