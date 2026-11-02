"""API Route definitions for Church Website CMS."""
from typing import Any, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.auth.security import get_current_admin
from app.db.connection import get_db
from cms.repository import cms_repository
from cms.schemas import (
    AboutSectionUpdate,
    AnnouncementCreateUpdate,
    BibleDisplaySettingsUpdate,
    ContactInfoUpdate,
    EventCreateUpdate,
    GalleryCreateUpdate,
    HomeSectionUpdate,
    MinistryCreateUpdate,
    SermonCreateUpdate,
    ServiceTimingCreateUpdate,
    SiteSettingsUpdate,
)
from cms.services import cms_service

router = APIRouter(tags=["Website CMS"])


# ============================================================================
# Public Website CMS Endpoints
# ============================================================================

@router.get(
    "/api/cms/content",
    summary="Get all published website content",
    description="Returns site settings, home hero, about, service timings, announcements, sermons, events, ministries, and contact.",
)
def get_public_website_content(db: Session = Depends(get_db)) -> dict[str, Any]:
    """Retrieve all published CMS website content."""
    return cms_service.get_public_content(db)


@router.get("/api/cms/sermons", summary="List published sermons")
def get_public_sermons(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [s.to_dict() for s in cms_repository.list_sermons(db, only_published=True)]


@router.get("/api/cms/events", summary="List published events")
def get_public_events(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [e.to_dict() for e in cms_repository.list_events(db, only_published=True)]


@router.get("/api/cms/announcements", summary="List published announcements")
def get_public_announcements(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [a.to_dict() for a in cms_repository.list_announcements(db, only_published=True)]


@router.get("/api/cms/service-timings", summary="List published service timings")
def get_public_service_timings(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [t.to_dict() for t in cms_repository.list_service_timings(db, only_published=True)]


@router.get("/api/cms/ministries", summary="List published ministries")
def get_public_ministries(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [m.to_dict() for m in cms_repository.list_ministries(db, only_published=True)]


@router.get("/api/cms/gallery", summary="List published gallery media")
def get_public_gallery(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [g.to_dict() for g in cms_repository.list_gallery(db, only_published=True)]


# ============================================================================
# Admin CMS Management Endpoints (Protected by JWT)
# ============================================================================

@router.get(
    "/api/admin/cms/overview",
    summary="Get CMS Dashboard overview metrics",
    description="Returns aggregate counts across all website modules and recent admin audit activities.",
)
def get_cms_overview(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    cms_service.seed_default_cms_data(db)
    return cms_repository.get_cms_overview_stats(db)


@router.post(
    "/api/admin/cms/upload",
    summary="Upload media file for CMS modules",
    description="Saves uploaded media (images, posters, thumbnails) and returns public URL.",
)
async def upload_cms_media(
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    result = await cms_service.save_uploaded_media(file)
    cms_repository.add_audit_log(
        db,
        admin_username=admin["username"],
        module="Media",
        action="Upload",
        details=f"Uploaded file: {result['filename']}",
    )
    return result


# ----------------------------------------------------------------------------
# 1. Home Module Endpoints
# ----------------------------------------------------------------------------

@router.get("/api/admin/cms/home", summary="Get Home Section settings")
def get_admin_home_section(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    cms_service.seed_default_cms_data(db)
    return cms_repository.get_home_section(db).to_dict()


@router.put("/api/admin/cms/home", summary="Update Home Section settings")
def update_admin_home_section(
    payload: HomeSectionUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.update_home_section(db, payload.model_dump(exclude_unset=True))
    cms_repository.add_audit_log(db, admin["username"], "Home", "Update", "Updated homepage hero banner & copy")
    return item.to_dict()


# ----------------------------------------------------------------------------
# 2. About Us Module Endpoints
# ----------------------------------------------------------------------------

@router.get("/api/admin/cms/about", summary="Get About Us settings")
def get_admin_about_section(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    cms_service.seed_default_cms_data(db)
    return cms_repository.get_about_section(db).to_dict()


@router.put("/api/admin/cms/about", summary="Update About Us settings")
def update_admin_about_section(
    payload: AboutSectionUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.update_about_section(db, payload.model_dump(exclude_unset=True))
    cms_repository.add_audit_log(db, admin["username"], "About", "Update", "Updated church history, mission, and beliefs")
    return item.to_dict()


# ----------------------------------------------------------------------------
# 3. Bible Settings Module Endpoints
# ----------------------------------------------------------------------------

@router.get("/api/admin/cms/bible-settings", summary="Get Bible display settings")
def get_admin_bible_settings(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    cms_service.seed_default_cms_data(db)
    return cms_repository.get_bible_settings(db).to_dict()


@router.put("/api/admin/cms/bible-settings", summary="Update Bible display settings")
def update_admin_bible_settings(
    payload: BibleDisplaySettingsUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.update_bible_settings(db, payload.model_dump(exclude_unset=True))
    cms_repository.add_audit_log(db, admin["username"], "Bible", "Update", "Updated Bible display preferences")
    return item.to_dict()


# ----------------------------------------------------------------------------
# 4. Sermons Module Endpoints
# ----------------------------------------------------------------------------

@router.get("/api/admin/cms/sermons", summary="List all sermons")
def list_admin_sermons(
    q: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [s.to_dict() for s in cms_repository.list_sermons(db, only_published=False, search=q)]


@router.post("/api/admin/cms/sermons", summary="Create new sermon")
def create_admin_sermon(
    payload: SermonCreateUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.create_sermon(db, payload.model_dump())
    cms_repository.add_audit_log(db, admin["username"], "Sermons", "Create", f"Added sermon: {item.title}")
    return item.to_dict()


@router.get("/api/admin/cms/sermons/{sermon_id}", summary="Get single sermon")
def get_admin_sermon(
    sermon_id: int,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.get_sermon(db, sermon_id)
    if not item:
        raise HTTPException(status_code=404, detail="Sermon not found.")
    return item.to_dict()


@router.put("/api/admin/cms/sermons/{sermon_id}", summary="Update sermon")
def update_admin_sermon(
    sermon_id: int,
    payload: SermonCreateUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.update_sermon(db, sermon_id, payload.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Sermon not found.")
    cms_repository.add_audit_log(db, admin["username"], "Sermons", "Update", f"Updated sermon: {item.title}")
    return item.to_dict()


@router.delete("/api/admin/cms/sermons/{sermon_id}", summary="Delete sermon")
def delete_admin_sermon(
    sermon_id: int,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.get_sermon(db, sermon_id)
    title = item.title if item else str(sermon_id)
    success = cms_repository.delete_sermon(db, sermon_id)
    if not success:
        raise HTTPException(status_code=404, detail="Sermon not found.")
    cms_repository.add_audit_log(db, admin["username"], "Sermons", "Delete", f"Deleted sermon: {title}")
    return {"status": "deleted", "id": sermon_id}


# ----------------------------------------------------------------------------
# 5. Events Module Endpoints
# ----------------------------------------------------------------------------

@router.get("/api/admin/cms/events", summary="List all events")
def list_admin_events(
    q: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [e.to_dict() for e in cms_repository.list_events(db, only_published=False, search=q)]


@router.post("/api/admin/cms/events", summary="Create new event")
def create_admin_event(
    payload: EventCreateUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.create_event(db, payload.model_dump())
    cms_repository.add_audit_log(db, admin["username"], "Events", "Create", f"Added event: {item.title}")
    return item.to_dict()


@router.get("/api/admin/cms/events/{event_id}", summary="Get single event")
def get_admin_event(
    event_id: int,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.get_event(db, event_id)
    if not item:
        raise HTTPException(status_code=404, detail="Event not found.")
    return item.to_dict()


@router.put("/api/admin/cms/events/{event_id}", summary="Update event")
def update_admin_event(
    event_id: int,
    payload: EventCreateUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.update_event(db, event_id, payload.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Event not found.")
    cms_repository.add_audit_log(db, admin["username"], "Events", "Update", f"Updated event: {item.title}")
    return item.to_dict()


@router.delete("/api/admin/cms/events/{event_id}", summary="Delete event")
def delete_admin_event(
    event_id: int,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.get_event(db, event_id)
    title = item.title if item else str(event_id)
    success = cms_repository.delete_event(db, event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found.")
    cms_repository.add_audit_log(db, admin["username"], "Events", "Delete", f"Deleted event: {title}")
    return {"status": "deleted", "id": event_id}


# ----------------------------------------------------------------------------
# 6. Ministries Module Endpoints
# ----------------------------------------------------------------------------

@router.get("/api/admin/cms/ministries", summary="List all ministries")
def list_admin_ministries(
    q: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [m.to_dict() for m in cms_repository.list_ministries(db, only_published=False, search=q)]


@router.post("/api/admin/cms/ministries", summary="Create new ministry")
def create_admin_ministry(
    payload: MinistryCreateUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.create_ministry(db, payload.model_dump())
    cms_repository.add_audit_log(db, admin["username"], "Ministries", "Create", f"Added ministry: {item.name}")
    return item.to_dict()


@router.get("/api/admin/cms/ministries/{ministry_id}", summary="Get single ministry")
def get_admin_ministry(
    ministry_id: int,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.get_ministry(db, ministry_id)
    if not item:
        raise HTTPException(status_code=404, detail="Ministry not found.")
    return item.to_dict()


@router.put("/api/admin/cms/ministries/{ministry_id}", summary="Update ministry")
def update_admin_ministry(
    ministry_id: int,
    payload: MinistryCreateUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.update_ministry(db, ministry_id, payload.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Ministry not found.")
    cms_repository.add_audit_log(db, admin["username"], "Ministries", "Update", f"Updated ministry: {item.name}")
    return item.to_dict()


@router.delete("/api/admin/cms/ministries/{ministry_id}", summary="Delete ministry")
def delete_admin_ministry(
    ministry_id: int,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.get_ministry(db, ministry_id)
    name = item.name if item else str(ministry_id)
    success = cms_repository.delete_ministry(db, ministry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ministry not found.")
    cms_repository.add_audit_log(db, admin["username"], "Ministries", "Delete", f"Deleted ministry: {name}")
    return {"status": "deleted", "id": ministry_id}


# ----------------------------------------------------------------------------
# 7. Gallery Module Endpoints
# ----------------------------------------------------------------------------

@router.get("/api/admin/cms/gallery", summary="List all gallery media items")
def list_admin_gallery(
    category: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [g.to_dict() for g in cms_repository.list_gallery(db, only_published=False, category=category)]


@router.post("/api/admin/cms/gallery", summary="Add media to gallery")
def create_admin_gallery_item(
    payload: GalleryCreateUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.create_gallery_item(db, payload.model_dump())
    cms_repository.add_audit_log(db, admin["username"], "Gallery", "Create", f"Added gallery item: {item.title}")
    return item.to_dict()


@router.delete("/api/admin/cms/gallery/{item_id}", summary="Delete gallery media")
def delete_admin_gallery_item(
    item_id: int,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.get_gallery_item(db, item_id)
    title = item.title if item else str(item_id)
    success = cms_repository.delete_gallery_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Gallery item not found.")
    cms_repository.add_audit_log(db, admin["username"], "Gallery", "Delete", f"Deleted gallery media: {title}")
    return {"status": "deleted", "id": item_id}


# ----------------------------------------------------------------------------
# 8. Service Timings Module Endpoints
# ----------------------------------------------------------------------------

@router.get("/api/admin/cms/service-timings", summary="List all service timings")
def list_admin_service_timings(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [t.to_dict() for t in cms_repository.list_service_timings(db, only_published=False)]


@router.post("/api/admin/cms/service-timings", summary="Create new service schedule")
def create_admin_service_timing(
    payload: ServiceTimingCreateUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.create_service_timing(db, payload.model_dump())
    cms_repository.add_audit_log(db, admin["username"], "Service Timings", "Create", f"Added service timing: {item.title}")
    return item.to_dict()


@router.put("/api/admin/cms/service-timings/{timing_id}", summary="Update service schedule")
def update_admin_service_timing(
    timing_id: int,
    payload: ServiceTimingCreateUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.update_service_timing(db, timing_id, payload.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Service timing not found.")
    cms_repository.add_audit_log(db, admin["username"], "Service Timings", "Update", f"Updated service timing: {item.title}")
    return item.to_dict()


@router.delete("/api/admin/cms/service-timings/{timing_id}", summary="Delete service schedule")
def delete_admin_service_timing(
    timing_id: int,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.get_service_timing(db, timing_id)
    title = item.title if item else str(timing_id)
    success = cms_repository.delete_service_timing(db, timing_id)
    if not success:
        raise HTTPException(status_code=404, detail="Service timing not found.")
    cms_repository.add_audit_log(db, admin["username"], "Service Timings", "Delete", f"Deleted service timing: {title}")
    return {"status": "deleted", "id": timing_id}


# ----------------------------------------------------------------------------
# 9. Announcements Module Endpoints
# ----------------------------------------------------------------------------

@router.get("/api/admin/cms/announcements", summary="List all announcements")
def list_admin_announcements(
    q: Optional[str] = Query(None),
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [a.to_dict() for a in cms_repository.list_announcements(db, only_published=False, search=q)]


@router.post("/api/admin/cms/announcements", summary="Create new announcement")
def create_admin_announcement(
    payload: AnnouncementCreateUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.create_announcement(db, payload.model_dump())
    cms_repository.add_audit_log(db, admin["username"], "Announcements", "Create", f"Added announcement: {item.title}")
    return item.to_dict()


@router.put("/api/admin/cms/announcements/{announcement_id}", summary="Update announcement")
def update_admin_announcement(
    announcement_id: int,
    payload: AnnouncementCreateUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.update_announcement(db, announcement_id, payload.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    cms_repository.add_audit_log(db, admin["username"], "Announcements", "Update", f"Updated announcement: {item.title}")
    return item.to_dict()


@router.delete("/api/admin/cms/announcements/{announcement_id}", summary="Delete announcement")
def delete_admin_announcement(
    announcement_id: int,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.get_announcement(db, announcement_id)
    title = item.title if item else str(announcement_id)
    success = cms_repository.delete_announcement(db, announcement_id)
    if not success:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    cms_repository.add_audit_log(db, admin["username"], "Announcements", "Delete", f"Deleted announcement: {title}")
    return {"status": "deleted", "id": announcement_id}


# ----------------------------------------------------------------------------
# 10. Contact & Location Module Endpoints
# ----------------------------------------------------------------------------

@router.get("/api/admin/cms/contact", summary="Get Contact & Location information")
def get_admin_contact_info(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    cms_service.seed_default_cms_data(db)
    return cms_repository.get_contact_info(db).to_dict()


@router.put("/api/admin/cms/contact", summary="Update Contact & Location information")
def update_admin_contact_info(
    payload: ContactInfoUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.update_contact_info(db, payload.model_dump(exclude_unset=True))
    cms_repository.add_audit_log(db, admin["username"], "Contact", "Update", "Updated church address, phone, email, and social links")
    return item.to_dict()


# ----------------------------------------------------------------------------
# 11. Website Settings Module Endpoints
# ----------------------------------------------------------------------------

@router.get("/api/admin/cms/settings", summary="Get Website Settings")
def get_admin_site_settings(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    cms_service.seed_default_cms_data(db)
    return cms_repository.get_site_settings(db).to_dict()


@router.put("/api/admin/cms/settings", summary="Update Website Settings")
def update_admin_site_settings(
    payload: SiteSettingsUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    item = cms_repository.update_site_settings(db, payload.model_dump(exclude_unset=True))
    cms_repository.add_audit_log(db, admin["username"], "Settings", "Update", "Updated global site branding, SEO, and footer")
    return item.to_dict()


# ----------------------------------------------------------------------------
# 12. Admin & Pastoral Users Module Endpoints
# ----------------------------------------------------------------------------

@router.get("/api/admin/users", summary="List Church Administrators & Pastoral Team")
def get_admin_users(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    cms_service.seed_default_cms_data(db)
    return [u.to_dict() for u in cms_repository.list_admin_users(db)]


@router.post("/api/admin/users", summary="Add Admin or Pastoral Team Member")
def create_admin_user(
    payload: dict[str, Any],
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    name = payload.get("name", "").strip()
    email = payload.get("email", "").strip()
    role = payload.get("role", "Staff Administrator").strip()
    status = payload.get("status", "Active").strip()
    if not name or not email:
        raise HTTPException(status_code=400, detail="Name and email are required.")

    initials = "".join([part[0].upper() for part in name.split()[:2]]) or "A"
    data = {
        "name": name,
        "email": email,
        "role": role,
        "status": status,
        "avatar_initials": initials,
        "last_login": "Just now",
    }
    user = cms_repository.create_admin_user(db, data)
    cms_repository.add_audit_log(db, admin["username"], "Users", "Create", f"Added user: {name} ({role})")
    return user.to_dict()


@router.delete("/api/admin/users/{user_id}", summary="Delete Admin or Pastoral Team Member")
def delete_admin_user(
    user_id: int,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    existing = cms_repository.get_admin_user_by_id(db, user_id)
    if not existing:
        raise HTTPException(status_code=404, detail="User not found.")
    name = existing.name
    cms_repository.delete_admin_user(db, user_id)
    cms_repository.add_audit_log(db, admin["username"], "Users", "Delete", f"Removed user: {name}")
    return {"status": "success", "message": f"User {name} removed."}


