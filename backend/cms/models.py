"""SQLAlchemy ORM models for Church Website CMS."""
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Text,
)
from database.models import Base


class SiteSettings(Base):
    """Global website branding, SEO, and navigation settings."""
    __tablename__ = "cms_site_settings"

    id = Column(Integer, primary_key=True, default=1)
    church_name = Column(String(200), default="Grace Fellowship Church", nullable=False)
    church_tagline = Column(String(255), default="Worship • Grow • Serve • Share", nullable=False)
    logo_url = Column(String(500), default="", nullable=False)
    primary_color = Column(String(50), default="#0f1e36", nullable=False)
    footer_text = Column(Text, default="A Bible-believing family church dedicated to worship, discipleship, and community outreach.", nullable=False)
    copyright_text = Column(String(255), default="© 2026 Grace Fellowship Church. All rights reserved.", nullable=False)
    seo_title = Column(String(255), default="Grace Fellowship Church - Worship • Grow • Serve • Share", nullable=False)
    seo_description = Column(Text, default="Welcome to Grace Fellowship Church. Join us for Sunday worship, service timings, announcements, and online Bible study.", nullable=False)
    seo_keywords = Column(String(500), default="Grace Fellowship Church, Sunday Service, Holy Bible Telugu English, Prayer Requests", nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "church_name": self.church_name,
            "church_tagline": self.church_tagline,
            "logo_url": self.logo_url,
            "primary_color": self.primary_color,
            "footer_text": self.footer_text,
            "copyright_text": self.copyright_text,
            "seo_title": self.seo_title,
            "seo_description": self.seo_description,
            "seo_keywords": self.seo_keywords,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class HomeSection(Base):
    """Homepage Hero section and custom display controls."""
    __tablename__ = "cms_home_sections"

    id = Column(Integer, primary_key=True, default=1)
    welcome_text = Column(String(100), default="Welcome to", nullable=False)
    hero_title = Column(String(200), default="Grace Fellowship Church", nullable=False)
    hero_subtitle = Column(Text, default="A family of believers growing together in Christ's love.", nullable=False)
    hero_verse = Column(Text, default="“For where two or three gather in my name, there am I with them.” — Matthew 18:20", nullable=False)
    hero_bg_image = Column(String(500), default="home/assets/hero_cross_sunset.jpg", nullable=False)
    cta_primary_text = Column(String(100), default="Join Us This Sunday", nullable=False)
    cta_primary_link = Column(String(200), default="#service-timings", nullable=False)
    cta_secondary_text = Column(String(100), default="Watch Sermons", nullable=False)
    cta_secondary_link = Column(String(200), default="#sermons", nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "welcome_text": self.welcome_text,
            "hero_title": self.hero_title,
            "hero_subtitle": self.hero_subtitle,
            "hero_verse": self.hero_verse,
            "hero_bg_image": self.hero_bg_image,
            "cta_primary_text": self.cta_primary_text,
            "cta_primary_link": self.cta_primary_link,
            "cta_secondary_text": self.cta_secondary_text,
            "cta_secondary_link": self.cta_secondary_link,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class AboutSection(Base):
    """About Us: History, Mission, Vision, Beliefs, and Leadership."""
    __tablename__ = "cms_about_section"

    id = Column(Integer, primary_key=True, default=1)
    history_text = Column(Text, default="Founded in faith, Grace Fellowship Church has stood as a beacon of Christ's love and grace in our community for over two decades.", nullable=False)
    mission_text = Column(Text, default="To glorify God by making disciples of Jesus Christ who love God, love people, and transform communities.", nullable=False)
    vision_text = Column(Text, default="A vibrant, Christ-centered, multi-generational church impacting generations with the Gospel.", nullable=False)
    beliefs_json = Column(Text, default='["The Authority of Scripture", "The Trinity (Father, Son, Holy Spirit)", "Salvation by Grace Through Faith", "Water Baptism and Communion", "The Power of Prayer and Intercession"]', nullable=False)
    lead_pastor_name = Column(String(150), default="Pastor John Samuel", nullable=False)
    lead_pastor_title = Column(String(100), default="Senior Pastor", nullable=False)
    lead_pastor_bio = Column(Text, default="Serving with humility and love, Pastor John Samuel has dedicated his life to teaching God's Word with clarity, passion, and pastoral care.", nullable=False)
    lead_pastor_image = Column(String(500), default="home/assets/sermon_pastor.jpg", nullable=False)
    campus_image = Column(String(500), default="home/assets/church_building.jpg", nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "history_text": self.history_text,
            "mission_text": self.mission_text,
            "vision_text": self.vision_text,
            "beliefs_json": self.beliefs_json,
            "lead_pastor_name": self.lead_pastor_name,
            "lead_pastor_title": self.lead_pastor_title,
            "lead_pastor_bio": self.lead_pastor_bio,
            "lead_pastor_image": self.lead_pastor_image,
            "campus_image": self.campus_image,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class BibleDisplaySettings(Base):
    """Bible Reader display options without modifying original Scripture texts."""
    __tablename__ = "cms_bible_settings"

    id = Column(Integer, primary_key=True, default=1)
    default_translation = Column(String(20), default="kjv", nullable=False)
    allow_parallel_reading = Column(Boolean, default=True, nullable=False)
    show_verse_numbers = Column(Boolean, default=True, nullable=False)
    daily_verse_enabled = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "default_translation": self.default_translation,
            "allow_parallel_reading": self.allow_parallel_reading,
            "show_verse_numbers": self.show_verse_numbers,
            "daily_verse_enabled": self.daily_verse_enabled,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Sermon(Base):
    """Sermon messages and video/audio media."""
    __tablename__ = "cms_sermons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    speaker = Column(String(150), default="Ps. John Samuel", nullable=False)
    date_text = Column(String(100), nullable=False)
    duration = Column(String(30), default="45:00", nullable=False)
    thumbnail = Column(String(500), default="home/assets/sermon_pastor.jpg", nullable=False)
    video_url = Column(String(500), default="", nullable=False)
    audio_url = Column(String(500), default="", nullable=False)
    passage = Column(String(150), default="", nullable=False)
    description = Column(Text, default="", nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "speaker": self.speaker,
            "date_text": self.date_text,
            "duration": self.duration,
            "thumbnail": self.thumbnail,
            "video_url": self.video_url,
            "audio_url": self.audio_url,
            "passage": self.passage,
            "description": self.description,
            "is_published": self.is_published,
            "order_index": self.order_index,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Event(Base):
    """Church upcoming and special events."""
    __tablename__ = "cms_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    subtitle = Column(String(255), default="", nullable=False)
    date_text = Column(String(100), nullable=False)
    time_text = Column(String(100), default="", nullable=False)
    location = Column(String(255), default="Church Sanctuary", nullable=False)
    image = Column(String(500), default="home/assets/church_picnic.jpg", nullable=False)
    action_text = Column(String(60), default="Register Now", nullable=False)
    registration_link = Column(String(500), default="", nullable=False)
    registration_open = Column(Boolean, default=True, nullable=False)
    category_tag = Column(String(80), default="Fellowship", nullable=False)
    description = Column(Text, default="", nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "subtitle": self.subtitle,
            "date_text": self.date_text,
            "time_text": self.time_text,
            "location": self.location,
            "image": self.image,
            "action_text": self.action_text,
            "registration_link": self.registration_link,
            "registration_open": self.registration_open,
            "category_tag": self.category_tag,
            "description": self.description,
            "is_published": self.is_published,
            "order_index": self.order_index,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Ministry(Base):
    """Church ministries and outreach departments."""
    __tablename__ = "cms_ministries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(100), default="", nullable=False)
    short_description = Column(String(255), default="", nullable=False)
    full_description = Column(Text, default="", nullable=False)
    photo = Column(String(500), default="home/assets/children_ministry.jpg", nullable=False)
    leader_name = Column(String(150), default="", nullable=False)
    meeting_time = Column(String(150), default="", nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "short_description": self.short_description,
            "full_description": self.full_description,
            "photo": self.photo,
            "leader_name": self.leader_name,
            "meeting_time": self.meeting_time,
            "is_published": self.is_published,
            "order_index": self.order_index,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class GalleryItem(Base):
    """Photo and video gallery media library."""
    __tablename__ = "cms_gallery"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    caption = Column(Text, default="", nullable=False)
    media_type = Column(String(20), default="image", nullable=False)  # 'image' or 'video'
    media_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), default="", nullable=False)
    category = Column(String(80), default="Worship", nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "caption": self.caption,
            "media_type": self.media_type,
            "media_url": self.media_url,
            "thumbnail_url": self.thumbnail_url,
            "category": self.category,
            "is_published": self.is_published,
            "order_index": self.order_index,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ServiceTiming(Base):
    """Weekly church worship and prayer schedule."""
    __tablename__ = "cms_service_timings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    hours = Column(String(100), nullable=False)
    subtitle = Column(String(150), default="English & Telugu", nullable=False)
    card_class = Column(String(50), default="card-blue", nullable=False)
    icon_name = Column(String(50), default="cross", nullable=False)
    day_of_week = Column(String(50), default="Sunday", nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "hours": self.hours,
            "subtitle": self.subtitle,
            "card_class": self.card_class,
            "icon_name": self.icon_name,
            "day_of_week": self.day_of_week,
            "is_published": self.is_published,
            "order_index": self.order_index,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Announcement(Base):
    """Bulletins, urgent announcements, and event highlights."""
    __tablename__ = "cms_announcements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    subtitle = Column(String(255), default="", nullable=False)
    date_text = Column(String(100), nullable=False)
    time_text = Column(String(100), default="", nullable=False)
    location = Column(String(255), default="Church Sanctuary", nullable=False)
    image = Column(String(500), default="home/assets/youth_conference.jpg", nullable=False)
    action_text = Column(String(60), default="Register Now", nullable=False)
    action_link = Column(String(500), default="#events", nullable=False)
    tag = Column(String(60), default="Youth Ministry", nullable=False)
    tag_class = Column(String(60), default="badge-youth", nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "subtitle": self.subtitle,
            "date_text": self.date_text,
            "time_text": self.time_text,
            "location": self.location,
            "image": self.image,
            "action_text": self.action_text,
            "action_link": self.action_link,
            "tag": self.tag,
            "tag_class": self.tag_class,
            "is_published": self.is_published,
            "order_index": self.order_index,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ContactInfo(Base):
    """Church contact information, geolocation, and social channels."""
    __tablename__ = "cms_contact_info"

    id = Column(Integer, primary_key=True, default=1)
    address_line1 = Column(String(200), default="123 Faith Avenue,", nullable=False)
    address_line2 = Column(String(200), default="Banjara Hills,", nullable=False)
    city_state_zip = Column(String(150), default="Hyderabad, Telangana 500001", nullable=False)
    phone = Column(String(60), default="+91 98765 43210", nullable=False)
    email = Column(String(150), default="info@gracefellowship.org", nullable=False)
    google_maps_url = Column(String(500), default="https://maps.google.com/?q=Grace+Fellowship+Church+Hyderabad", nullable=False)
    facebook_url = Column(String(500), default="https://facebook.com", nullable=False)
    youtube_url = Column(String(500), default="https://youtube.com", nullable=False)
    instagram_url = Column(String(500), default="https://instagram.com", nullable=False)
    whatsapp_number = Column(String(60), default="+919876543210", nullable=False)
    church_exterior_image = Column(String(500), default="home/assets/church_building.jpg", nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "address_line1": self.address_line1,
            "address_line2": self.address_line2,
            "city_state_zip": self.city_state_zip,
            "phone": self.phone,
            "email": self.email,
            "google_maps_url": self.google_maps_url,
            "facebook_url": self.facebook_url,
            "youtube_url": self.youtube_url,
            "instagram_url": self.instagram_url,
            "whatsapp_number": self.whatsapp_number,
            "church_exterior_image": self.church_exterior_image,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class AuditLog(Base):
    """Admin change and modification log for tracking activity."""
    __tablename__ = "cms_audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    admin_username = Column(String(100), nullable=False)
    module = Column(String(80), nullable=False)
    action = Column(String(50), nullable=False)  # 'create', 'update', 'delete', 'publish', 'unpublish'
    details = Column(Text, default="", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "admin_username": self.admin_username,
            "module": self.module,
            "action": self.action,
            "details": self.details,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AdminUser(Base):
    """Pastoral team & administrator accounts."""
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    role = Column(String(100), nullable=False)
    status = Column(String(20), default="Active", nullable=False)
    avatar_initials = Column(String(10), default="A", nullable=False)
    last_login = Column(String(60), default="Today", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "status": self.status,
            "avatar_initials": self.avatar_initials,
            "last_login": self.last_login,
        }


