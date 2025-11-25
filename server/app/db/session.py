# app/db/session.py
from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {})

def init_db():
    # create tables
    SQLModel.metadata.create_all(engine)
