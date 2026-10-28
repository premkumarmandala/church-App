"""Application configuration and environment settings."""
import os
from pathlib import Path
from pydantic import BaseModel


class Settings(BaseModel):
    """Global configuration settings for Grace Church API."""

    # Project directories
    APP_DIR: Path = Path(__file__).resolve().parent
    BACKEND_DIR: Path = APP_DIR.parent
    PROJECT_ROOT: Path = BACKEND_DIR.parent
    DATA_DIR: Path = BACKEND_DIR / "data"
    FRONTEND_DIR: Path = PROJECT_ROOT / "frontend"
    DOCS_DIR: Path = PROJECT_ROOT / "docs"

    # API metadata
    TITLE: str = "Grace Church Bible API"
    DESCRIPTION: str = (
        "High-performance REST API for Church Bible study and services. "
        "Supports English KJV and Telugu Holy Bible, chapter reading, parallel reading, "
        "keyword search across all 66 canonical books, and daily verse feeds."
    )
    VERSION: str = "1.0.0"

    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("X_ZOHO_CATALYST_LISTEN_PORT", os.getenv("PORT", "8000")))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

    # CORS configuration - Allow all origins by default for multi-frontend flexibility
    CORS_ORIGINS: list[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]


settings = Settings()
