"""Business logic, default data seeding, and file uploads for Church Website CMS."""
import logging
import mimetypes
import os
import re
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from cms.models import (
    AboutSection,
    AdminUser,
    Announcement,
    BibleDisplaySettings,
    CMSMedia,
    ContactInfo,
    Event,
    GalleryItem,
    HomeSection,
    Ministry,
    Sermon,
    ServiceTiming,
    SiteSettings,
)
from cms.repository import cms_repository

logger = logging.getLogger("church.cms.services")

# Allowed upload extensions and their classifications
ALLOWED_EXTENSIONS = {
    # Images
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
    ".webp": "image",
    ".svg": "image",
    ".gif": "image",
    # Audio
    ".mp3": "audio",
    ".wav": "audio",
    ".m4a": "audio",
    ".aac": "audio",
    ".ogg": "audio",
    # Video
    ".mp4": "video",
    ".webm": "video",
    ".mov": "video",
    ".avi": "video",
    ".mkv": "video",
    # Documents
    ".pdf": "document",
    ".docx": "document",
    ".doc": "document",
    ".txt": "document",
}

# Mapping of accepted feature alias names to central admin-data folder paths
FEATURE_FOLDERS = {
    "home/banners": "home/banners",
    "home/announcements": "home/announcements",
    "banners": "home/banners",
    "announcements": "home/announcements",
    "sermons/videos": "sermons/videos",
    "sermons/thumbnails": "sermons/thumbnails",
    "sermons": "sermons/thumbnails",
    "events": "events",
    "ministries": "ministries",
    "gallery": "gallery",
    "documents": "documents",
    "home": "home/banners",
    "about": "home/banners",
    "general": "home/banners",
}


class CMSService:
    """Service orchestrating CMS data seeding, content aggregation, and media handling."""

    def seed_default_cms_data(self, db: Session) -> None:
        """Seed default content from the initial public website if tables are empty."""
        # 1. Site Settings
        cms_repository.get_site_settings(db)

        # 2. Home Section
        cms_repository.get_home_section(db)

        # 3. About Section
        cms_repository.get_about_section(db)

        # 4. Bible Settings
        cms_repository.get_bible_settings(db)

        # 5. Contact Info
        cms_repository.get_contact_info(db)

        # 6. Service Timings
        if db.query(ServiceTiming).count() == 0:
            default_timings = [
                {
                    "title": "Sunday Worship",
                    "hours": "10:00 AM – 12:00 PM",
                    "subtitle": "English & Telugu",
                    "card_class": "card-blue",
                    "icon_name": "cross",
                    "day_of_week": "Sunday",
                    "order_index": 1,
                    "is_published": True,
                },
                {
                    "title": "Sunday School",
                    "hours": "10:00 AM – 11:00 AM",
                    "subtitle": "Children & Youth",
                    "card_class": "card-peach",
                    "icon_name": "users",
                    "day_of_week": "Sunday",
                    "order_index": 2,
                    "is_published": True,
                },
                {
                    "title": "Wednesday Prayer",
                    "hours": "7:00 PM – 8:00 PM",
                    "subtitle": "Online & In-Person",
                    "card_class": "card-purple",
                    "icon_name": "pray",
                    "day_of_week": "Wednesday",
                    "order_index": 3,
                    "is_published": True,
                },
                {
                    "title": "Friday Bible Study",
                    "hours": "7:00 PM – 8:00 PM",
                    "subtitle": "English & Telugu",
                    "card_class": "card-green",
                    "icon_name": "book",
                    "day_of_week": "Friday",
                    "order_index": 4,
                    "is_published": True,
                },
            ]
            for t in default_timings:
                db.add(ServiceTiming(**t))
            db.commit()

        # 7. Announcements
        if db.query(Announcement).count() == 0:
            default_announcements = [
                {
                    "title": "YOUTH CONFERENCE 2026",
                    "subtitle": "Rise Up & Shine Forth - Ignite Your Faith",
                    "date_text": "Aug 15 – 17, 2026",
                    "time_text": "10:00 AM Daily",
                    "location": "Sanctuary & Youth Hall",
                    "image": "home/assets/youth_conference.jpg",
                    "action_text": "Register Now",
                    "action_link": "#events",
                    "tag": "Youth Ministry",
                    "tag_class": "badge-youth",
                    "order_index": 1,
                    "is_published": True,
                },
                {
                    "title": "WOMEN'S FELLOWSHIP",
                    "subtitle": "A Time of Prayer, Worship & Sisterhood",
                    "date_text": "Sat, Aug 24, 2026",
                    "time_text": "10:00 AM – 11:30 AM",
                    "location": "Church Main Hall",
                    "image": "home/assets/womens_fellowship.jpg",
                    "action_text": "Register Now",
                    "action_link": "#events",
                    "tag": "Fellowship",
                    "tag_class": "badge-fellowship",
                    "order_index": 2,
                    "is_published": True,
                },
                {
                    "title": "Special Prayer Meeting",
                    "subtitle": "Intercessory Prayer for Families & Nation",
                    "date_text": "Aug 30, 2026",
                    "time_text": "6:30 PM – 8:00 PM",
                    "location": "Church Sanctuary",
                    "image": "home/assets/open_bible_banner.jpg",
                    "action_text": "Join In-Person",
                    "action_link": "#contact",
                    "tag": "Prayer & Care",
                    "tag_class": "badge-outreach",
                    "order_index": 3,
                    "is_published": True,
                },
            ]
            for a in default_announcements:
                db.add(Announcement(**a))
            db.commit()

        # 8. Sermons
        if db.query(Sermon).count() == 0:
            default_sermons = [
                {
                    "title": "Walking in Faith",
                    "speaker": "Ps. John Samuel",
                    "date_text": "• Aug 11, 2026",
                    "duration": "45:20",
                    "thumbnail": "home/assets/sermon_pastor.jpg",
                    "passage": "Hebrews 11:1–6",
                    "description": "Discover the foundations of biblical faith and stepping boldly into God's promises.",
                    "order_index": 1,
                    "is_published": True,
                },
                {
                    "title": "The Power of Prayer",
                    "speaker": "Ps. John Samuel",
                    "date_text": "• Aug 4, 2026",
                    "duration": "38:15",
                    "thumbnail": "home/assets/hero_cross_sunset.jpg",
                    "passage": "James 5:16",
                    "description": "An inspiring message on how earnest, righteous prayer moves the hand of God.",
                    "order_index": 2,
                    "is_published": True,
                },
                {
                    "title": "A Heart of Gratitude",
                    "speaker": "Ps. John Samuel",
                    "date_text": "• Jul 28, 2026",
                    "duration": "42:10",
                    "thumbnail": "home/assets/prayer_hands.jpg",
                    "passage": "1 Thessalonians 5:16–18",
                    "description": "Learning to praise God in every season with thanksgiving and joy.",
                    "order_index": 3,
                    "is_published": True,
                },
                {
                    "title": "Growing in God's Word",
                    "speaker": "Ps. John Samuel",
                    "date_text": "• Jul 21, 2026",
                    "duration": "50:05",
                    "thumbnail": "home/assets/open_bible_banner.jpg",
                    "passage": "2 Timothy 3:16–17",
                    "description": "Deepening your daily walk through the inspired Scripture.",
                    "order_index": 4,
                    "is_published": True,
                },
            ]
            for s in default_sermons:
                db.add(Sermon(**s))
            db.commit()

        # 9. Events
        if db.query(Event).count() == 0:
            default_events = [
                {
                    "title": "Church Picnic",
                    "subtitle": "Community Fun, Games & Fellowship",
                    "date_text": "Sep 14, 2026",
                    "time_text": "11:00 AM – 4:00 PM",
                    "location": "Riverside Park",
                    "image": "home/assets/church_picnic.jpg",
                    "action_text": "Register Now",
                    "registration_link": "#contact",
                    "registration_open": True,
                    "category_tag": "Fellowship",
                    "description": "Bring your family and friends for a wonderful afternoon of picnic games and barbecue.",
                    "order_index": 1,
                    "is_published": True,
                },
                {
                    "title": "BIBLE CAMP",
                    "subtitle": "Spiritual Retreat for Youth & Children",
                    "date_text": "Oct 5 – 7, 2026",
                    "time_text": "All Day Retreat",
                    "location": "Camp Grace Retreat Center",
                    "image": "home/assets/bible_camp.jpg",
                    "action_text": "Register Now",
                    "registration_link": "#contact",
                    "registration_open": True,
                    "category_tag": "Youth",
                    "description": "Three days of worship, Bible immersion, campfire fellowship, and team building.",
                    "order_index": 2,
                    "is_published": True,
                },
                {
                    "title": "Christmas Celebration",
                    "subtitle": "A Night of Carols, Joy & Fellowship",
                    "date_text": "Dec 25, 2026",
                    "time_text": "6:00 PM – 8:30 PM",
                    "location": "Church Main Sanctuary",
                    "image": "home/assets/christmas_celebration.jpg",
                    "action_text": "Learn More",
                    "registration_link": "#contact",
                    "registration_open": True,
                    "category_tag": "Special Service",
                    "description": "Celebrating the birth of our Savior Jesus Christ with choir specials and candle lighting.",
                    "order_index": 3,
                    "is_published": True,
                },
            ]
            for e in default_events:
                db.add(Event(**e))
            db.commit()

        # 10. Ministries
        if db.query(Ministry).count() == 0:
            default_ministries = [
                {
                    "name": "Children's Ministry",
                    "slug": "children",
                    "short_description": "Nurturing young hearts with biblical foundation, crafts, and songs.",
                    "photo": "home/assets/children_ministry.jpg",
                    "leader_name": "Sister Sarah & Team",
                    "meeting_time": "Sundays 10:00 AM",
                    "order_index": 1,
                    "is_published": True,
                },
                {
                    "name": "Youth Ministry",
                    "slug": "youth",
                    "short_description": "Empowering teens and young adults to stand bold for Christ.",
                    "photo": "home/assets/youth_conference.jpg",
                    "leader_name": "Bro. David Grace",
                    "meeting_time": "Saturdays 5:00 PM",
                    "order_index": 2,
                    "is_published": True,
                },
                {
                    "name": "Women's Ministry",
                    "slug": "women",
                    "short_description": "Encouraging sisters in faith, discipleship, and prayer fellowship.",
                    "photo": "home/assets/womens_fellowship.jpg",
                    "leader_name": "Sister Elizabeth",
                    "meeting_time": "Saturdays (Monthly)",
                    "order_index": 3,
                    "is_published": True,
                },
                {
                    "name": "Men's Ministry",
                    "slug": "men",
                    "short_description": "Building strong godly fathers, husbands, and leaders in Christ.",
                    "photo": "home/assets/fellowship_service.jpg",
                    "leader_name": "Elder Thomas",
                    "meeting_time": "Monthly Breakfasts",
                    "order_index": 4,
                    "is_published": True,
                },
                {
                    "name": "Prayer Ministry",
                    "slug": "prayer",
                    "short_description": "Faithful intercession for our church, community, and global needs.",
                    "photo": "home/assets/prayer_hands.jpg",
                    "leader_name": "Pastoral Care Team",
                    "meeting_time": "Daily & Wednesdays",
                    "order_index": 5,
                    "is_published": True,
                },
                {
                    "name": "Outreach Ministry",
                    "slug": "outreach",
                    "short_description": "Sharing the love of Christ through local and regional benevolence.",
                    "photo": "home/assets/worship_service.jpg",
                    "leader_name": "Pastor John Samuel",
                    "meeting_time": "Bi-weekly Mission Outreach",
                    "order_index": 6,
                    "is_published": True,
                },
            ]
            for m in default_ministries:
                db.add(Ministry(**m))
            db.commit()

        # 11. Gallery Items
        if db.query(GalleryItem).count() == 0:
            default_gallery = [
                {
                    "title": "Sunday Worship Gathering",
                    "caption": "Joyful praise in the sanctuary",
                    "media_type": "image",
                    "media_url": "home/assets/worship_service.jpg",
                    "category": "Worship",
                    "order_index": 1,
                    "is_published": True,
                },
                {
                    "title": "Youth Conference Praise",
                    "caption": "Young believers worshiping God with passion",
                    "media_type": "image",
                    "media_url": "home/assets/youth_conference.jpg",
                    "category": "Youth",
                    "order_index": 2,
                    "is_published": True,
                },
                {
                    "title": "Children Learning Bible Verses",
                    "caption": "Sunday school children scripture memory time",
                    "media_type": "image",
                    "media_url": "home/assets/children_ministry.jpg",
                    "category": "Fellowship",
                    "order_index": 3,
                    "is_published": True,
                },
                {
                    "title": "Community Church Fellowship",
                    "caption": "Brothers and sisters breaking bread together",
                    "media_type": "image",
                    "media_url": "home/assets/fellowship_service.jpg",
                    "category": "Fellowship",
                    "order_index": 4,
                    "is_published": True,
                },
            ]
            for g in default_gallery:
                db.add(GalleryItem(**g))
            db.commit()

        # 12. Admin & Pastoral Users
        if db.query(AdminUser).count() == 0:
            default_users = [
                {
                    "name": "Pastor John Samuel",
                    "email": "pastor@gracefellowship.org",
                    "role": "Senior Pastor & Super Admin",
                    "status": "Active",
                    "avatar_initials": "PS",
                    "last_login": "Today, 2:30 PM",
                },
                {
                    "name": "Deacon David Raj",
                    "email": "david.raj@gracefellowship.org",
                    "role": "Prayer Coordinator",
                    "status": "Active",
                    "avatar_initials": "DR",
                    "last_login": "Yesterday, 8:15 PM",
                },
                {
                    "name": "Sister Sarah Grace",
                    "email": "sarah.grace@gracefellowship.org",
                    "role": "Intercession Lead",
                    "status": "Active",
                    "avatar_initials": "SG",
                    "last_login": "Oct 30, 2026",
                },
                {
                    "name": "Brother Timothy Paul",
                    "email": "timothy.paul@gracefellowship.org",
                    "role": "Media & Tech Minister",
                    "status": "Active",
                    "avatar_initials": "TP",
                    "last_login": "Oct 28, 2026",
                },
            ]
            for u in default_users:
                db.add(AdminUser(**u))
            db.commit()

    def get_public_content(self, db: Session) -> dict[str, Any]:
        """Aggregate all published content for the public website."""
        self.seed_default_cms_data(db)

        return {
            "settings": cms_repository.get_site_settings(db).to_dict(),
            "home": cms_repository.get_home_section(db).to_dict(),
            "about": cms_repository.get_about_section(db).to_dict(),
            "bible_settings": cms_repository.get_bible_settings(db).to_dict(),
            "contact": cms_repository.get_contact_info(db).to_dict(),
            "service_timings": [t.to_dict() for t in cms_repository.list_service_timings(db, only_published=True)],
            "announcements": [a.to_dict() for a in cms_repository.list_announcements(db, only_published=True)],
            "sermons": [s.to_dict() for s in cms_repository.list_sermons(db, only_published=True)],
            "events": [e.to_dict() for e in cms_repository.list_events(db, only_published=True)],
            "ministries": [m.to_dict() for m in cms_repository.list_ministries(db, only_published=True)],
            "gallery": [g.to_dict() for g in cms_repository.list_gallery(db, only_published=True)],
        }

    async def save_uploaded_media(
        self,
        file: UploadFile,
        db: Session,
        folder: Optional[str] = "home/banners",
        title: Optional[str] = "",
        description: Optional[str] = "",
    ) -> dict[str, Any]:
        """Save uploaded media file into backend/admin-data/{folder} and register in PostgreSQL."""
        if not file.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided.")

        raw_name = Path(file.filename).name
        ext = Path(raw_name).suffix.lower()

        # Validate file extension
        if ext not in ALLOWED_EXTENSIONS:
            allowed_list = ", ".join(sorted(ALLOWED_EXTENSIONS.keys()))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Disallowed file type '{ext}'. Allowed types: {allowed_list}",
            )

        file_type = ALLOWED_EXTENSIONS[ext]

        # Resolve target folder inside admin-data
        folder_key = (folder or "home/banners").strip().lower().replace("\\", "/")
        if folder_key.startswith("admin-data/"):
            folder_key = folder_key[len("admin-data/"):]

        # Disallow uploading to private prayer-requests through general CMS endpoint
        if folder_key.startswith("prayer-requests") or "prayer-requests" in folder_key:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Direct upload to private prayer-requests folder is not permitted.",
            )

        resolved_folder = FEATURE_FOLDERS.get(folder_key, "home/banners")
        target_dir = settings.ADMIN_DATA_DIR / resolved_folder
        target_dir.mkdir(parents=True, exist_ok=True)

        # Path traversal guard
        try:
            if not target_dir.resolve().is_relative_to(settings.ADMIN_DATA_DIR.resolve()):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid target folder path.")
        except (ValueError, AttributeError):
            if not str(target_dir.resolve()).startswith(str(settings.ADMIN_DATA_DIR.resolve())):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid target folder path.")

        # Generate unique safe file name
        clean_stem = re.sub(r"[^a-zA-Z0-9_-]", "_", Path(raw_name).stem)[:40] or "media"
        unique_name = f"{clean_stem}_{uuid.uuid4().hex[:8]}{ext}"
        target_path = target_dir / unique_name

        # Stream write with size limit validation
        written_size = 0
        try:
            with open(target_path, "wb") as buffer:
                while chunk := await file.read(1024 * 64):
                    written_size += len(chunk)
                    if written_size > settings.MAX_MEDIA_SIZE_BYTES:
                        buffer.close()
                        target_path.unlink(missing_ok=True)
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"File exceeds maximum allowed size of {settings.MAX_MEDIA_SIZE_BYTES // (1024 * 1024)} MB.",
                        )
                    buffer.write(chunk)
        except HTTPException:
            target_path.unlink(missing_ok=True)
            raise
        except Exception as write_err:
            target_path.unlink(missing_ok=True)
            logger.error("Failed to write uploaded file to disk: %s", str(write_err))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file on server: {str(write_err)}",
            )

        relative_path = f"admin-data/{resolved_folder}/{unique_name}"
        public_url = f"/api/cms/media/{relative_path}"

        # Detect MIME type
        mime = file.content_type
        if not mime or mime == "application/octet-stream":
            guessed, _ = mimetypes.guess_type(str(target_path))
            mime = guessed or "application/octet-stream"

        # Register metadata in PostgreSQL cms_media table
        try:
            media_item = cms_repository.create_media(
                db,
                {
                    "title": (title or clean_stem).strip(),
                    "description": (description or "").strip(),
                    "content_type": resolved_folder,
                    "file_name": file.filename,
                    "file_path": relative_path,
                    "file_type": file_type,
                    "file_size": written_size,
                    "mime_type": mime,
                    "status": "active",
                    "display_order": 0,
                    "published_at": datetime.now(timezone.utc),
                },
            )
            media_id = media_item.id
        except Exception as db_err:
            target_path.unlink(missing_ok=True)
            logger.error("Database registration failed for uploaded file; file cleaned up: %s", str(db_err))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database record creation failed. Upload rolled back safely.",
            )

        return {
            "id": media_id,
            "filename": unique_name,
            "original_filename": file.filename,
            "url": public_url,
            "relative_path": relative_path,
            "size": written_size,
            "mime_type": mime,
            "folder": resolved_folder,
            "file_type": file_type,
        }

    def safely_delete_media_file(
        self,
        db: Session,
        file_path: str,
        exclude_table: Optional[str] = None,
        exclude_id: Optional[int] = None,
    ) -> bool:
        """Safely remove a media file from disk and media registry only if no other entity references it."""
        if not file_path:
            return False

        # If still referenced elsewhere, preserve the file
        if cms_repository.is_media_referenced(db, file_path, exclude_table=exclude_table, exclude_id=exclude_id):
            logger.info("File %s is referenced by another entity; preserving physical file.", file_path)
            return False

        # Normalize relative path
        clean = file_path.strip().lstrip("/\\")
        if clean.startswith("api/cms/media/"):
            clean = clean[len("api/cms/media/"):]
        if clean.startswith("admin-data/"):
            clean = clean[len("admin-data/"):]

        # Delete physical file from admin-data
        disk_path = (settings.ADMIN_DATA_DIR / clean).resolve()
        try:
            if disk_path.is_relative_to(settings.ADMIN_DATA_DIR.resolve()) and disk_path.exists() and disk_path.is_file():
                disk_path.unlink(missing_ok=True)
                logger.info("Deleted physical media file: %s", disk_path)
        except Exception as e:
            logger.warning("Error deleting media file %s: %s", disk_path, str(e))

        # Delete cms_media record if exists
        media_rec = cms_repository.get_media_by_path(db, file_path)
        if media_rec:
            db.delete(media_rec)
            db.commit()

        return True

    def replace_media_file(
        self,
        db: Session,
        old_path: Optional[str],
        new_path: Optional[str],
        exclude_table: Optional[str] = None,
        exclude_id: Optional[int] = None,
    ) -> None:
        """Safely clean up replaced media file if not shared."""
        if old_path and new_path and old_path != new_path:
            self.safely_delete_media_file(db, old_path, exclude_table=exclude_table, exclude_id=exclude_id)


cms_service = CMSService()

