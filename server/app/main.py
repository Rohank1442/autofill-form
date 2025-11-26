# app/main.py
from fastapi import FastAPI
from app.api.v1.endpoints import user, form_extract, auto_fill, health, home
from app.core.config import settings
from app.db.session import init_db
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import upload

app = FastAPI(title="Autofill-AI", version="0.1.0")
# CORS settings
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "chrome-extension://*",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(home.router)
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(health.router, prefix="/api/v1")
app.include_router(user.router, prefix="/api/v1/user", tags=["user"])
app.include_router(form_extract.router, prefix="/api/v1/form", tags=["form"])
app.include_router(auto_fill.router, prefix="/api/v1/form", tags=["form"])

# startup tasks
@app.on_event("startup")
async def startup_event():
    init_db()
    # any other startup tasks like connecting to model, caches etc.