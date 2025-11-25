# app/services/ai_engine.py
import os
from app.core.config import settings
from app.db.session import engine
from sqlmodel import Session
from app.models.user import UserProfile
from typing import List, Dict, Optional
import httpx

# Placeholder: we will call OpenAI or local LLM from here.
# For now implement a simple stub that maps simple labels to profile fields.

async def generate_answers(user_profile_id: int, fields: List[Dict], job_description: Optional[str] = None) -> Dict[str, str]:
    with Session(engine) as session:
        user = session.get(UserProfile, user_profile_id)
        if not user:
            return {}

        profile_text = user.resume_text or ""
        # VERY simple mapping heuristic example
        result = {}
        for f in fields:
            label = (f.get("label") or "").lower()
            if "name" in label:
                result[f.get("label")] = user.full_name
            elif "email" in label:
                result[f.get("label")] = user.email
            elif "phone" in label or "mobile" in label:
                result[f.get("label")] = user.phone or ""
            elif "linkedin" in label:
                result[f.get("label")] = user.linkedin or ""
            else:
                # For long answers we would call LLM here.
                # TODO: replace this with an LLM call to OpenAI
                result[f.get("label")] = f"Please provide details about '{f.get('label')}' (stub)."
        return result

# Example function to call OpenAI (skeleton)
async def call_openai_chat(messages: List[Dict[str,str]], model="gpt-4o-mini", temperature=0.2):
    api_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OpenAI API key not set")
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {"model": model, "messages": messages, "temperature": temperature}
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]