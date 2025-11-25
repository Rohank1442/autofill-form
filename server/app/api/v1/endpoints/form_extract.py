# app/api/v1/endpoints/form_extract.py
from fastapi import APIRouter, Body
from typing import Any
from pydantic import BaseModel

from app.services.form_scraper import scrape_page

router = APIRouter()

class ExtractRequest(BaseModel):
    url: str

@router.post("/extract")
async def extract_form(req: ExtractRequest):
    """
    Scrape the page and return candidate form fields and context
    """
    result = await scrape_page(req.url)
    return {"fields": result}