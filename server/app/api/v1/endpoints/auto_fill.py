from fastapi import APIRouter, Depends
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.config import settings
from pydantic import BaseModel
import openai
from typing import Optional, List # <--- REQUIRED IMPORTS

router = APIRouter()

# -----------------------------
# UPDATED PYDANTIC MODELS
# -----------------------------

class FieldIn(BaseModel):
    label: str
    context: Optional[str] = None # Requires 'from typing import Optional'
    input_type: Optional[str] = None
    # We still need the selector/XPath from the original FormField
    # I'll add the selector back as it's critical for the backend to tell
    # the frontend *where* to put the value.
    selector: str 

class AutoFillRequest(BaseModel):
    fields: List[FieldIn] # Requires 'from typing import List'
    user_profile_id: int # Changed from user_id to user_profile_id
    job_description: Optional[str] = None # New optional field


openai.api_key = settings.OPENAI_API_KEY


@router.post("/generate")
def generate_autofill(data: AutoFillRequest, db: Session = Depends(get_db)):
    # Use the new field name
    user = db.query(User).filter(User.id == data.user_profile_id).first()

    if not user or not user.profile_json:
        return {"error": "Resume not uploaded yet"}

    resume_data = user.profile_json

    # Add the new fields (context, input_type, job_description) to the prompt
    prompt_fields = [
        {
            "label": field.label, 
            "context": field.context, 
            "input_type": field.input_type
        } 
        for field in data.fields
    ]
    
    # Build prompt for the LLM
    prompt = f"""
You are an assistant that fills online forms using a user's resume.

Here is the user's resume data (JSON):
{resume_data}

{f"Here is the job description to tailor the response: {data.job_description}" if data.job_description else ""}

Here are the form fields to fill, including their context and input type:
{prompt_fields}

Return a JSON object with a single key 'mapping', whose value is a JSON array. Each element in the array must be:
{{
  "field_label": "<the form field's label>",
  "value": "<the best matching value>"
}}

If the resume has no suitable value, set value=""
"""

    completion = openai.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )

    mapping = completion.choices[0].message.content
    import json
    mapping = json.loads(mapping)

    # Now attach selectors
    result = []
    for m in mapping.get("mapping", []):
        # Look up by the required 'label' field
        matched_field = next(
             (f for f in data.fields if f.label == m["field_label"]), None
        )
        if matched_field:
            result.append({
                "selector": matched_field.selector,
                "value": m["value"]
            })

    return {"values": result}