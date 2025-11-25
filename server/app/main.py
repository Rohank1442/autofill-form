# app/main.py
from fastapi import FastAPI
from app.api.v1.endpoints import user, form_extract, auto_fill, health
from app.core.config import settings
from app.db.session import init_db

app = FastAPI(title="Autofill-AI", version="0.1.0")

# Include routers
app.include_router(health.router, prefix="/api/v1")
app.include_router(user.router, prefix="/api/v1/user", tags=["user"])
app.include_router(form_extract.router, prefix="/api/v1/form", tags=["form"])
app.include_router(auto_fill.router, prefix="/api/v1/form", tags=["form"])

# startup tasks
@app.on_event("startup")
async def startup_event():
    init_db()
    # any other startup tasks like connecting to model, caches etc.