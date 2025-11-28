from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import pdfplumber
import docx
import tempfile
from typing import Optional, List

router = APIRouter()

class ParsedResume(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[str]] = None
    education: Optional[List[str]] = None
    raw_text: Optional[str] = None
    
def extract_text_from_pdf(path: str) -> str:
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def extract_text_from_docx(path: str) -> str:
    doc = docx.Document(path)
    return "\n".join(p.text for p in doc.paragraphs)


@router.post("/parse", response_model=ParsedResume)
async def parse_resume(file: UploadFile = File(...)):
    # Save temporarily
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Detect type
    filename = file.filename.lower()
    try:
        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(tmp_path)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(tmp_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extract error: {str(e)}")

    # Basic parsing (upgrade later with AI)
    import re

    email = None
    phone = None
    full_name = None

    email_match = re.search(r"[a-zA-Z0-9.\-_]+@[a-zA-Z0-9\-_]+\.\w+", text)
    if email_match:
        email = email_match.group(0)

    phone_match = re.search(r"(\+?\d[\d\s\-]{8,15})", text)
    if phone_match:
        phone = phone_match.group(1)

    # Full name heuristic → first line often contains name
    lines = text.split("\n")
    if lines:
        top = lines[0].strip()
        if 3 <= len(top.split()) <= 5:
            full_name = top

    return ParsedResume(
        full_name=full_name,
        email=email,
        phone=phone,
        raw_text=text
    )