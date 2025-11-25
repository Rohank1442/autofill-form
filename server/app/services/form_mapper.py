# app/services/form_mapper.py
# utility helpers to map input labels to canonical keys (non-LLM heuristics + fallbacks)
def label_to_key(label: str) -> str:
    l = (label or "").lower()
    if any(x in l for x in ["name", "full name", "given name", "applicant name"]):
        return "name"
    if "email" in l:
        return "email"
    if any(x in l for x in ["phone", "mobile", "contact"]):
        return "phone"
    if "linkedin" in l:
        return "linkedin"
    if "github" in l:
        return "github"
    if "resume" in l or "cv" in l or "upload" in l:
        return "resume_upload"
    if "why" in l or "why do" in l or "why should" in l:
        return "long_answer"
    # fallback
    return "unknown"
