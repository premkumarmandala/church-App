"""Application configuration and environment settings."""
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from pydantic import BaseModel

# Project directory paths
APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

# Load environment variables from .env in project root or backend folder
env_path = PROJECT_ROOT / ".env"
if not env_path.exists():
    env_path = BACKEND_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


class Settings(BaseModel):
    """Global configuration settings for Grace Church API."""

    # Project directories
    APP_DIR: Path = APP_DIR
    BACKEND_DIR: Path = BACKEND_DIR
    PROJECT_ROOT: Path = PROJECT_ROOT
    DATA_DIR: Path = BACKEND_DIR / "data"
    FRONTEND_DIR: Path = PROJECT_ROOT / "frontend"
    DOCS_DIR: Path = PROJECT_ROOT / "docs"
    STORAGE_DIR: Path = BACKEND_DIR / "storage" / "prayer_attachments"

    # API metadata
    TITLE: str = "Grace Church Bible & Prayer API"
    DESCRIPTION: str = (
        "High-performance REST API for Grace Fellowship Church. "
        "Supports English KJV and Telugu Holy Bible, chapter reading, parallel reading, "
        "full-text search, and PostgreSQL-powered Pastoral Prayer Request services."
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

    # PostgreSQL Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "church_db")
    POSTGRES_SSLMODE: Optional[str] = os.getenv("POSTGRES_SSLMODE", None)

    # Admin Authentication & Pastoral Security
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "pastor")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "GraceChurch2026!")
    ADMIN_JWT_SECRET: str = os.getenv("ADMIN_JWT_SECRET", "grace-church-pastoral-jwt-secret-key-2026")
    ADMIN_JWT_ALGORITHM: str = "HS256"
    ADMIN_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ADMIN_TOKEN_EXPIRE_MINUTES", "1440"))

    # File Upload & Media Attachment Limits
    MAX_ATTACHMENT_SIZE_BYTES: int = int(os.getenv("MAX_ATTACHMENT_SIZE_BYTES", str(100 * 1024 * 1024)))  # 100 MB

    def get_database_url(self) -> str:
        """Resolve and normalize database URL for SQLAlchemy 2.0 with Psycopg 3."""
        raw_url = (self.DATABASE_URL or "").strip()
        if raw_url:
            # Normalize standard postgres URLs to psycopg3 driver for SQLAlchemy
            if raw_url.startswith("postgres://"):
                return raw_url.replace("postgres://", "postgresql+psycopg://", 1)
            if raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+psycopg://"):
                return raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
            return raw_url

        # Build from individual components
        user = self.POSTGRES_USER
        password = self.POSTGRES_PASSWORD
        auth = f"{user}:{password}@" if password else f"{user}@"
        url = f"postgresql+psycopg://{auth}{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        if self.POSTGRES_SSLMODE:
            url += f"?sslmode={self.POSTGRES_SSLMODE}"
        return url


settings = Settings()
