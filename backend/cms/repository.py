"""Database repository operations for Church Website CMS."""
from typing import Any, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from cms.models import (
    AboutSection,
    Announcement,
    AuditLog,
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


cms_repository = CMSRepository()

