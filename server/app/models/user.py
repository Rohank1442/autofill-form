# app/models/user.py
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON

class UserProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    resume_text: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    skills: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    raw_json: Optional[dict] = Field(default=None, sa_column=Column(JSON))