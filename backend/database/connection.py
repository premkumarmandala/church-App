"""Database connection and session management for PostgreSQL with fallback."""
import logging
from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from database.models import Base

logger = logging.getLogger("church.database")

# Ensure database directory and private storage directory exist
DB_DIR = settings.BACKEND_DIR / "database"
DB_DIR.mkdir(parents=True, exist_ok=True)
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def create_db_engine():
    """Create SQLAlchemy engine with PostgreSQL or fallback to local SQLite."""
    db_url = settings.get_database_url()
    is_postgres = "postgresql" in db_url

    if is_postgres:
        try:
            # Configure PostgreSQL engine with connection pooling
            engine = create_engine(
                db_url,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
                pool_recycle=300,
                connect_args={"connect_timeout": 3},
            )
            # Test connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to PostgreSQL database at %s", settings.POSTGRES_HOST)
            return engine
        except Exception as e:
            logger.warning(
                "Could not connect to PostgreSQL (%s). Falling back to local SQLite database in backend/database/ for uninterrupted operation. Error: %s",
                db_url.split("@")[-1] if "@" in db_url else db_url,
                str(e),
            )

    # Fallback to consolidated database file inside backend/database/
    sqlite_path = DB_DIR / "prayer_requests.db"
    sqlite_url = f"sqlite:///{sqlite_path}"
    logger.info("Using local database at %s", sqlite_path)
    return create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},
    )


engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Initialize database tables."""
    try:
        import cms.models  # noqa: F401
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully in backend/database/.")
    except Exception as e:
        logger.error("Error creating database tables: %s", str(e))


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for yielding database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
