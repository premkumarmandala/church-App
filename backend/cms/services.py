"""Business logic, default data seeding, and file uploads for Church Website CMS."""
import os
import re
import shutil
import uuid
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


CMS_UPLOAD_DIR = settings.BACKEND_DIR / "storage" / "cms_uploads"
CMS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


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

    async def save_uploaded_media(self, file: UploadFile) -> dict[str, Any]:
        """Save uploaded media file and return accessible URL path."""
        if not file.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided.")

        clean_name = re.sub(r"[^a-zA-Z0-9._-]", "_", Path(file.filename).name)
        ext = Path(clean_name).suffix.lower()
        unique_name = f"{uuid.uuid4().hex[:8]}_{clean_name}"

        # Target storage location
        target_dir = settings.FRONTEND_DIR / "home" / "assets" / "uploads"
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / unique_name

        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        relative_url = f"home/assets/uploads/{unique_name}"
        return {
            "filename": unique_name,
            "original_filename": file.filename,
            "url": relative_url,
            "size": target_path.stat().st_size,
        }


cms_service = CMSService()

