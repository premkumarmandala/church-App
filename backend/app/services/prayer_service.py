"""Service shim re-exporting from database.prayer_service."""
from database.prayer_service import PrayerService, prayer_service

__all__ = ["PrayerService", "prayer_service"]
