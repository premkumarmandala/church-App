"""Database compatibility shim re-exporting from backend/database."""
from database import (
    Base,
    DB_DIR,
    PrayerAttachment,
    PrayerRequest,
    PrayerService,
    SessionLocal,
    engine,
    get_db,
    init_db,
    prayer_service,
)

__all__ = [
    "get_db",
    "init_db",
    "engine",
    "SessionLocal",
    "DB_DIR",
    "Base",
    "PrayerRequest",
    "PrayerAttachment",
    "PrayerService",
    "prayer_service",
]
