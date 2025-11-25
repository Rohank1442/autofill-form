# app/schemas/user.py
from typing import Optional, List
from pydantic import BaseModel, EmailStr

class UserProfileCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    resume_text: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    skills: Optional[List[str]] = None
    raw_json: Optional[dict] = None

class UserProfileRead(UserProfileCreate):
    id: int

    class Config:
        orm_mode = True
