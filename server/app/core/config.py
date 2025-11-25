# app/core/config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    ENV: str = "development"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./autofill.db"
    OPENAI_API_KEY: str = ""
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        env_file = ".env"

settings = Settings()