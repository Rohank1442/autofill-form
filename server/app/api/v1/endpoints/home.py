# app/api/v1/endpoints/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/", tags=["home"])
async def home():
    return {"status": "ok"}
