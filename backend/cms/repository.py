"""Database repository operations for Church Website CMS."""
from typing import Any, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from cms.models import (
    AboutSection,
    AdminUser,
    Announcement,
    AuditLog,
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
from database.models import PrayerRequest


class CMSRepository:
    """Data access layer for all Church Website CMS entities."""

    # ------------------------------------------------------------------------
    # Singleton Sections
    # ------------------------------------------------------------------------
    def get_site_settings(self, db: Session) -> SiteSettings:
        item = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
        if not item:
            item = SiteSettings(id=1)
            db.add(item)
            db.commit()
            db.refresh(item)
        return item

    def update_site_settings(self, db: Session, updates: dict[str, Any]) -> SiteSettings:
        item = self.get_site_settings(db)
        for k, v in updates.items():
            if v is not None and hasattr(item, k):
                setattr(item, k, v)
        db.commit()
        db.refresh(item)
        return item

    def get_home_section(self, db: Session) -> HomeSection:
        item = db.query(HomeSection).filter(HomeSection.id == 1).first()
        if not item:
            item = HomeSection(id=1)
            db.add(item)
            db.commit()
            db.refresh(item)
        return item

    def update_home_section(self, db: Session, updates: dict[str, Any]) -> HomeSection:
        item = self.get_home_section(db)
        for k, v in updates.items():
            if v is not None and hasattr(item, k):
                setattr(item, k, v)
        db.commit()
        db.refresh(item)
        return item

    def get_about_section(self, db: Session) -> AboutSection:
        item = db.query(AboutSection).filter(AboutSection.id == 1).first()
        if not item:
            item = AboutSection(id=1)
            db.add(item)
            db.commit()
            db.refresh(item)
        return item

    def update_about_section(self, db: Session, updates: dict[str, Any]) -> AboutSection:
        item = self.get_about_section(db)
        for k, v in updates.items():
            if v is not None and hasattr(item, k):
                setattr(item, k, v)
        db.commit()
        db.refresh(item)
        return item

    def get_bible_settings(self, db: Session) -> BibleDisplaySettings:
        item = db.query(BibleDisplaySettings).filter(BibleDisplaySettings.id == 1).first()
        if not item:
            item = BibleDisplaySettings(id=1)
            db.add(item)
            db.commit()
            db.refresh(item)
        return item

    def update_bible_settings(self, db: Session, updates: dict[str, Any]) -> BibleDisplaySettings:
        item = self.get_bible_settings(db)
        for k, v in updates.items():
            if v is not None and hasattr(item, k):
                setattr(item, k, v)
        db.commit()
        db.refresh(item)
        return item

    def get_contact_info(self, db: Session) -> ContactInfo:
        item = db.query(ContactInfo).filter(ContactInfo.id == 1).first()
        if not item:
            item = ContactInfo(id=1)
            db.add(item)
            db.commit()
            db.refresh(item)
        return item

    def update_contact_info(self, db: Session, updates: dict[str, Any]) -> ContactInfo:
        item = self.get_contact_info(db)
        for k, v in updates.items():
            if v is not None and hasattr(item, k):
                setattr(item, k, v)
        db.commit()
        db.refresh(item)
        return item

    # ------------------------------------------------------------------------
    # Sermons CRUD
    # ------------------------------------------------------------------------
    def list_sermons(self, db: Session, only_published: bool = False, search: Optional[str] = None) -> list[Sermon]:
        q = db.query(Sermon)
        if only_published:
            q = q.filter(Sermon.is_published.is_(True))
        if search:
            pattern = f"%{search}%"
            q = q.filter((Sermon.title.ilike(pattern)) | (Sermon.speaker.ilike(pattern)) | (Sermon.passage.ilike(pattern)))
        return q.order_by(Sermon.order_index.asc(), Sermon.id.desc()).all()

    def get_sermon(self, db: Session, sermon_id: int) -> Optional[Sermon]:
        return db.query(Sermon).filter(Sermon.id == sermon_id).first()

    def create_sermon(self, db: Session, data: dict[str, Any]) -> Sermon:
        item = Sermon(**data)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update_sermon(self, db: Session, sermon_id: int, updates: dict[str, Any]) -> Optional[Sermon]:
        item = self.get_sermon(db, sermon_id)
        if not item:
            return None
        for k, v in updates.items():
            if v is not None and hasattr(item, k):
                setattr(item, k, v)
        db.commit()
        db.refresh(item)
        return item

    def delete_sermon(self, db: Session, sermon_id: int) -> bool:
        item = self.get_sermon(db, sermon_id)
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True

    # ------------------------------------------------------------------------
    # Events CRUD
    # ------------------------------------------------------------------------
    def list_events(self, db: Session, only_published: bool = False, search: Optional[str] = None) -> list[Event]:
        q = db.query(Event)
        if only_published:
            q = q.filter(Event.is_published.is_(True))
        if search:
            pattern = f"%{search}%"
            q = q.filter((Event.title.ilike(pattern)) | (Event.location.ilike(pattern)) | (Event.category_tag.ilike(pattern)))
        return q.order_by(Event.order_index.asc(), Event.id.desc()).all()

    def get_event(self, db: Session, event_id: int) -> Optional[Event]:
        return db.query(Event).filter(Event.id == event_id).first()

    def create_event(self, db: Session, data: dict[str, Any]) -> Event:
        item = Event(**data)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update_event(self, db: Session, event_id: int, updates: dict[str, Any]) -> Optional[Event]:
        item = self.get_event(db, event_id)
        if not item:
            return None
        for k, v in updates.items():
            if v is not None and hasattr(item, k):
                setattr(item, k, v)
        db.commit()
        db.refresh(item)
        return item

    def delete_event(self, db: Session, event_id: int) -> bool:
        item = self.get_event(db, event_id)
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True

    # ------------------------------------------------------------------------
    # Ministries CRUD
    # ------------------------------------------------------------------------
    def list_ministries(self, db: Session, only_published: bool = False, search: Optional[str] = None) -> list[Ministry]:
        q = db.query(Ministry)
        if only_published:
            q = q.filter(Ministry.is_published.is_(True))
        if search:
            pattern = f"%{search}%"
            q = q.filter((Ministry.name.ilike(pattern)) | (Ministry.short_description.ilike(pattern)))
        return q.order_by(Ministry.order_index.asc(), Ministry.id.asc()).all()

    def get_ministry(self, db: Session, ministry_id: int) -> Optional[Ministry]:
        return db.query(Ministry).filter(Ministry.id == ministry_id).first()

    def create_ministry(self, db: Session, data: dict[str, Any]) -> Ministry:
        item = Ministry(**data)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update_ministry(self, db: Session, ministry_id: int, updates: dict[str, Any]) -> Optional[Ministry]:
        item = self.get_ministry(db, ministry_id)
        if not item:
            return None
        for k, v in updates.items():
            if v is not None and hasattr(item, k):
                setattr(item, k, v)
        db.commit()
        db.refresh(item)
        return item

    def delete_ministry(self, db: Session, ministry_id: int) -> bool:
        item = self.get_ministry(db, ministry_id)
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True

    # ------------------------------------------------------------------------
    # Gallery CRUD
    # ------------------------------------------------------------------------
    def list_gallery(self, db: Session, only_published: bool = False, category: Optional[str] = None) -> list[GalleryItem]:
        q = db.query(GalleryItem)
        if only_published:
            q = q.filter(GalleryItem.is_published.is_(True))
        if category and category != "All":
            q = q.filter(GalleryItem.category == category)
        return q.order_by(GalleryItem.order_index.asc(), GalleryItem.id.desc()).all()

    def get_gallery_item(self, db: Session, item_id: int) -> Optional[GalleryItem]:
        return db.query(GalleryItem).filter(GalleryItem.id == item_id).first()

    def create_gallery_item(self, db: Session, data: dict[str, Any]) -> GalleryItem:
        item = GalleryItem(**data)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update_gallery_item(self, db: Session, item_id: int, updates: dict[str, Any]) -> Optional[GalleryItem]:
        item = self.get_gallery_item(db, item_id)
        if not item:
            return None
        for k, v in updates.items():
            if v is not None and hasattr(item, k):
                setattr(item, k, v)
        db.commit()
        db.refresh(item)
        return item

    def delete_gallery_item(self, db: Session, item_id: int) -> bool:
        item = self.get_gallery_item(db, item_id)
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True

    # ------------------------------------------------------------------------
    # Service Timings CRUD
    # ------------------------------------------------------------------------
    def list_service_timings(self, db: Session, only_published: bool = False) -> list[ServiceTiming]:
        q = db.query(ServiceTiming)
        if only_published:
            q = q.filter(ServiceTiming.is_published.is_(True))
        return q.order_by(ServiceTiming.order_index.asc(), ServiceTiming.id.asc()).all()

    def get_service_timing(self, db: Session, timing_id: int) -> Optional[ServiceTiming]:
        return db.query(ServiceTiming).filter(ServiceTiming.id == timing_id).first()

    def create_service_timing(self, db: Session, data: dict[str, Any]) -> ServiceTiming:
        item = ServiceTiming(**data)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update_service_timing(self, db: Session, timing_id: int, updates: dict[str, Any]) -> Optional[ServiceTiming]:
        item = self.get_service_timing(db, timing_id)
        if not item:
            return None
        for k, v in updates.items():
            if v is not None and hasattr(item, k):
                setattr(item, k, v)
        db.commit()
        db.refresh(item)
        return item

    def delete_service_timing(self, db: Session, timing_id: int) -> bool:
        item = self.get_service_timing(db, timing_id)
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True

    # ------------------------------------------------------------------------
    # Announcements CRUD
    # ------------------------------------------------------------------------
    def list_announcements(self, db: Session, only_published: bool = False, search: Optional[str] = None) -> list[Announcement]:
        q = db.query(Announcement)
        if only_published:
            q = q.filter(Announcement.is_published.is_(True))
        if search:
            pattern = f"%{search}%"
            q = q.filter((Announcement.title.ilike(pattern)) | (Announcement.tag.ilike(pattern)))
        return q.order_by(Announcement.order_index.asc(), Announcement.id.desc()).all()

    def get_announcement(self, db: Session, announcement_id: int) -> Optional[Announcement]:
        return db.query(Announcement).filter(Announcement.id == announcement_id).first()

    def create_announcement(self, db: Session, data: dict[str, Any]) -> Announcement:
        item = Announcement(**data)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update_announcement(self, db: Session, announcement_id: int, updates: dict[str, Any]) -> Optional[Announcement]:
        item = self.get_announcement(db, announcement_id)
        if not item:
            return None
        for k, v in updates.items():
            if v is not None and hasattr(item, k):
                setattr(item, k, v)
        db.commit()
        db.refresh(item)
        return item

    def delete_announcement(self, db: Session, announcement_id: int) -> bool:
        item = self.get_announcement(db, announcement_id)
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True

    # ------------------------------------------------------------------------
    # Audit Logs
    # ------------------------------------------------------------------------
    def add_audit_log(self, db: Session, admin_username: str, module: str, action: str, details: str = "") -> AuditLog:
        log = AuditLog(
            admin_username=admin_username,
            module=module,
            action=action,
            details=details,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    def list_audit_logs(self, db: Session, limit: int = 20) -> list[AuditLog]:
        return db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()

    # ------------------------------------------------------------------------
    # Overview Statistics
    # ------------------------------------------------------------------------
    # Admin Users
    # ------------------------------------------------------------------------
    def list_admin_users(self, db: Session) -> list[AdminUser]:
        return db.query(AdminUser).order_by(AdminUser.id.asc()).all()

    def get_admin_user_by_id(self, db: Session, user_id: int) -> Optional[AdminUser]:
        return db.query(AdminUser).filter(AdminUser.id == user_id).first()

    def create_admin_user(self, db: Session, data: dict[str, Any]) -> AdminUser:
        item = AdminUser(**data)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def delete_admin_user(self, db: Session, user_id: int) -> bool:
        item = self.get_admin_user_by_id(db, user_id)
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True

    # ------------------------------------------------------------------------
    def get_cms_overview_stats(self, db: Session) -> dict[str, Any]:
        sermons_count = db.query(func.count(Sermon.id)).filter(Sermon.is_published.is_(True)).scalar() or 0
        events_count = db.query(func.count(Event.id)).filter(Event.is_published.is_(True)).scalar() or 0
        announcements_count = db.query(func.count(Announcement.id)).filter(Announcement.is_published.is_(True)).scalar() or 0
        ministries_count = db.query(func.count(Ministry.id)).scalar() or 0
        gallery_count = db.query(func.count(GalleryItem.id)).scalar() or 0
        timings_count = db.query(func.count(ServiceTiming.id)).scalar() or 0
        prayers_count = db.query(func.count(PrayerRequest.id)).scalar() or 0

        total_items = (
            sermons_count
            + events_count
            + announcements_count
            + ministries_count
            + gallery_count
            + timings_count
            + 4  # Home, About, Bible, Contact singleton sections
        )

        recent_logs = self.list_audit_logs(db, limit=10)

        return {
            "total_content_items": total_items,
            "total_prayer_requests": prayers_count,
            "published_sermons": sermons_count,
            "upcoming_events": events_count,
            "active_announcements": announcements_count,
            "total_ministries": ministries_count,
            "gallery_items": gallery_count,
            "service_timings": timings_count,
            "recent_activities": [log.to_dict() for log in recent_logs],
        }

    # ------------------------------------------------------------------------
    # Media Registry Operations
    # ------------------------------------------------------------------------
    def create_media(self, db: Session, media_dict: dict[str, Any]) -> CMSMedia:
        item = CMSMedia(**media_dict)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def get_media(self, db: Session, media_id: int) -> Optional[CMSMedia]:
        return db.query(CMSMedia).filter(CMSMedia.id == media_id).first()

    def get_media_by_path(self, db: Session, file_path: str) -> Optional[CMSMedia]:
        clean_path = file_path.strip().lstrip("/")
        return db.query(CMSMedia).filter(CMSMedia.file_path == clean_path).first()

    def list_media(
        self,
        db: Session,
        content_type: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[CMSMedia], int]:
        query = db.query(CMSMedia)
        if content_type:
            query = query.filter(CMSMedia.content_type == content_type)
        if status:
            query = query.filter(CMSMedia.status == status)
        total = query.count()
        items = query.order_by(CMSMedia.id.desc()).offset(offset).limit(limit).all()
        return items, total

    def delete_media(self, db: Session, media_id: int) -> bool:
        item = self.get_media(db, media_id)
        if not item:
            return False
        db.delete(item)
        db.commit()
        return True

    def is_media_referenced(
        self,
        db: Session,
        file_path: str,
        exclude_table: Optional[str] = None,
        exclude_id: Optional[int] = None,
    ) -> bool:
        """Check if a media file path is referenced by any CMS entities."""
        if not file_path:
            return False

        clean = file_path.strip().lstrip("/")
        variants = {clean, f"/{clean}", clean.replace("admin-data/", ""), file_path}

        # 1. Home Section
        home = db.query(HomeSection).filter(HomeSection.id == 1).first()
        if home and home.hero_bg_image in variants:
            if not (exclude_table == "cms_home_sections" and exclude_id == 1):
                return True

        # 2. About Section
        about = db.query(AboutSection).filter(AboutSection.id == 1).first()
        if about and (about.lead_pastor_image in variants or about.campus_image in variants):
            if not (exclude_table == "cms_about_section" and exclude_id == 1):
                return True

        # 3. Contact Info
        contact = db.query(ContactInfo).filter(ContactInfo.id == 1).first()
        if contact and contact.church_exterior_image in variants:
            if not (exclude_table == "cms_contact_info" and exclude_id == 1):
                return True

        # 4. Announcements
        ann_q = db.query(Announcement)
        if exclude_table == "cms_announcements" and exclude_id:
            ann_q = ann_q.filter(Announcement.id != exclude_id)
        for ann in ann_q.all():
            if ann.image in variants:
                return True

        # 5. Sermons
        serm_q = db.query(Sermon)
        if exclude_table == "cms_sermons" and exclude_id:
            serm_q = serm_q.filter(Sermon.id != exclude_id)
        for serm in serm_q.all():
            if serm.thumbnail in variants or serm.video_url in variants or serm.audio_url in variants:
                return True

        # 6. Events
        ev_q = db.query(Event)
        if exclude_table == "cms_events" and exclude_id:
            ev_q = ev_q.filter(Event.id != exclude_id)
        for ev in ev_q.all():
            if ev.image in variants:
                return True

        # 7. Ministries
        min_q = db.query(Ministry)
        if exclude_table == "cms_ministries" and exclude_id:
            min_q = min_q.filter(Ministry.id != exclude_id)
        for m in min_q.all():
            if m.photo in variants:
                return True

        # 8. Gallery
        gal_q = db.query(GalleryItem)
        if exclude_table == "cms_gallery" and exclude_id:
            gal_q = gal_q.filter(GalleryItem.id != exclude_id)
        for g in gal_q.all():
            if g.media_url in variants or g.thumbnail_url in variants:
                return True

        return False


cms_repository = CMSRepository()

