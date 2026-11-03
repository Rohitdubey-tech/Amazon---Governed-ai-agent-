import os
import json
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_ENV: str = os.getenv("APP_ENV", "development")
    APP_NAME: str = os.getenv("APP_NAME", "AgentShield AI")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # CORS
    raw_cors = os.getenv("CORS_ORIGINS", '["http://localhost:5173", "http://127.0.0.1:5173"]')
    try:
        CORS_ORIGINS: List[str] = json.loads(raw_cors)
    except Exception:
        CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "agentshield_development_secret_key_change_in_prod")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Database
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", "agentshield_ai")

    # LLM
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    MOCK_GEMINI: bool = os.getenv("MOCK_GEMINI", "true").lower() in ("true", "1", "yes")

    # Storage
    STORAGE_MODE: str = os.getenv("STORAGE_MODE", "local")
    LOCAL_STORAGE_PATH: str = os.getenv("LOCAL_STORAGE_PATH", "./storage")

settings = Settings()
