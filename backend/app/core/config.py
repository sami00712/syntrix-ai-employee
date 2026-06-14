from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Syntrix AI Employee"
    BUSINESS_NAME: str = "Syntrix Labs"
    EMPLOYEE_NAME: str = "Syntrix AI"
    
    DATABASE_URL: str = ""
    
    FRONTEND_URL: str = "http://localhost:3000"
    
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            import json
            return json.loads(v)
        return v

    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "google/gemini-2.0-flash-lite-preview-02-05:free"

    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    SUPABASE_URL: str = ""
    SUPABASE_JWT_SECRET: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    OTP_DIGITS: int = 6

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
