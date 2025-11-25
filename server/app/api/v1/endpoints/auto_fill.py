# app/api/v1/endpoints/auto_fill.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.ai_engine import generate_answers

router = APIRouter()

class FieldIn(BaseModel):
    label: str
    context: Optional[str] = None
    input_type: Optional[str] = None

class AutoFillRequest(BaseModel):
    fields: List[FieldIn]
    user_profile_id: int
    job_description: Optional[str] = None

@router.post("/auto-fill")
async def auto_fill(req: AutoFillRequest):
    answers = await generate_answers(req.user_profile_id, req.fields, req.job_description)
    return {"mapping": answers}