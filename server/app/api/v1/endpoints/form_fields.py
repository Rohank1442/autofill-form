from fastapi import APIRouter
from typing import Any

router = APIRouter()

@router.post("/extract-fields")
def extract_fields(payload: dict):
    print("Received fields from extension:", payload)
    return {"status": "stored"}