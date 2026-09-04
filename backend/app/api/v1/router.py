from fastapi import APIRouter
from app.api.v1.endpoints import flood

api_router = APIRouter()
api_router.include_router(flood.router, prefix="/flood", tags=["Flood Prediction & XAI"])
