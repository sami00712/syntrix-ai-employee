from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api.v1 import api_router
from app.core.config import settings
from app.db.session import init_db

app = FastAPI(
    title="Syntrix AI Employee API",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Ensure static directory exists
os.makedirs("static/uploads", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
def on_startup():
    print(f"CORS Origins: {settings.BACKEND_CORS_ORIGINS}")
    init_db()

# Set all CORS enabled origins from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=".*",
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "AI Employee API is running"}

@app.get("/api/v1/config")
def get_config():
    return {
        "business_name": settings.BUSINESS_NAME,
        "employee_name": settings.EMPLOYEE_NAME
    }
