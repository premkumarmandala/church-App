"""API route endpoints for Bible study and church services."""
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    Response,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session

from app.auth.security import create_access_token, get_current_admin, verify_admin_credentials
from app.config import settings
from app.db.connection import get_db
from app.models.bible_models import (
    AdminLoginInput,
    AdminLoginResponse,
    BookMetadata,
    ChapterResponse,
    DailyVerseResponse,
    ErrorResponse,
    HealthResponse,
    PrayerAttachmentModel,
    PrayerRequestDetail,
    PrayerRequestInput,
    PrayerRequestListResponse,
    PrayerRequestResponse,
    PrayerRequestStatusUpdate,
    PrayerStatsResponse,
    SearchResponse,
    ValidationResponse,
)
from app.services.bible_service import bible_service
from app.services.prayer_service import prayer_service

router = APIRouter()


# ============================================================================
# Bible Scripture Endpoints
# ============================================================================

@router.get(
    "/api/bible/books",
    response_model=list[BookMetadata],
    tags=["Bible Scripture"],
    summary="List all canonical Bible books",
    description="Returns metadata for all 66 books of the Old and New Testaments.",
)
def get_books() -> list[dict[str, Any]]:
    """Return list of all 66 canonical Bible books."""
    return bible_service.get_books()


@router.get(
    "/api/bible/chapter",
    response_model=ChapterResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid chapter or unsupported translation"},
        404: {"model": ErrorResponse, "description": "Book or chapter not found"},
    },
    tags=["Bible Scripture"],
    summary="Retrieve chapter Scripture text",
    description="Fetches all verses for a given book and chapter in English (KJV) or Telugu. Supports parallel bilingual comparison.",
)
def get_chapter(
    translation: str = Query("kjv", description="Translation: 'kjv' or 'telugu'"),
    book: str = Query("genesis", description="Book slug, name in English, Telugu name, or ID"),
    chapter: str = Query("1", description="Chapter number"),
    parallel: bool = Query(False, description="Include parallel verses from the other translation"),
) -> Response:
    """Retrieve verses for a specific chapter."""
    status_code, response_data = bible_service.get_chapter(
        translation=translation,
        book_query=book,
        chapter_query=chapter,
        parallel=parallel,
    )
    return JSONResponse(status_code=status_code, content=response_data)


@router.get(
    "/api/bible/search",
    response_model=SearchResponse,
    tags=["Bible Scripture"],
    summary="Search Bible verses by keyword",
    description="Full-text search across Scripture text with filters for translation, testament, and book.",
)
def search_verses(
    q: str = Query("", description="Keyword or phrase to search"),
    translation: str = Query("kjv", description="Translation: 'kjv' or 'telugu'"),
    testament: str = Query("all", description="Testament filter: 'all', 'ot', or 'nt'"),
    book: Optional[str] = Query(None, description="Optional book slug or name filter"),
    limit: int = Query(50, description="Maximum number of matched verses to return", ge=1, le=500),
) -> dict[str, Any]:
    """Execute keyword search over Bible text."""
    return bible_service.search_verses(
        query=q,
        translation=translation,
        testament=testament,
        book_slug=book,
        limit=limit,
    )


@router.get(
    "/api/bible/daily-verse",
    response_model=DailyVerseResponse,
    tags=["Bible Scripture"],
    summary="Get Verse of the Day",
    description="Returns the curated daily devotional scripture verse for today in both English and Telugu.",
)
def get_daily_verse() -> dict[str, Any]:
    """Return the verse of the day based on day of the year."""
    return bible_service.get_daily_verse()


@router.get(
    "/api/bible/validate",
    response_model=ValidationResponse,
    tags=["System & Data"],
    summary="Validate Bible dataset parity and completeness",
    description="Returns validation status of all 66 books, total verses, and licensing attribution.",
)
def validate_bible_data() -> dict[str, Any]:
    """Return data validation parity statistics."""
    return bible_service.get_validation_status()


@router.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["System & Data"],
    summary="Service Health Check",
    description="Returns service status, application name, version, and server timestamp.",
)
def health_check() -> dict[str, Any]:
    """Return service health status."""
    return {
        "status": "healthy",
        "service": "church-bible-api",
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ============================================================================
# Pastoral Prayer Request Endpoints (Public)
# ============================================================================

@router.post(
    "/api/prayer-request",
    response_model=PrayerRequestResponse,
    tags=["Church Services"],
    summary="Submit a pastoral prayer request",
    description="Submits a prayer request to the pastoral team. Supports both multipart/form-data with media attachments and JSON payloads.",
)
async def submit_prayer_request(
    request: Request,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Accept and persist a church prayer request in PostgreSQL."""
    content_type = request.headers.get("content-type", "")

    # 1. Handle multipart/form-data with uploaded media files
    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        name = form.get("name")
        email = form.get("email")
        phone = form.get("phone")
        category = form.get("category") or "General Need"
        msg = form.get("message") or form.get("request") or ""

        is_anonymous_val = form.get("is_anonymous")
        is_anonymous = str(is_anonymous_val).lower() in ("true", "1", "yes", "on")

        contact_perm_val = form.get("contact_permission", "true")
        contact_permission = str(contact_perm_val).lower() in ("true", "1", "yes", "on")

        # Collect any uploaded attachments
        files = []
        for key in form:
            val = form.getlist(key)
            for item in val:
                if hasattr(item, "filename") and bool(item.filename):
                    files.append(item)

        record = prayer_service.create_prayer_request(
            db=db,
            name=str(name) if name else None,
            email=str(email) if email else None,
            phone=str(phone) if phone else None,
            category=str(category),
            message=str(msg),
            is_anonymous=is_anonymous,
            contact_permission=contact_permission,
            files=files if files else None,
        )

        requester_name = record.name or ""
        name_display = f", {requester_name}" if requester_name else ""
        return {
            "status": "success",
            "message": f"Thank you{name_display}! Your prayer request has been received by our pastoral prayer team. We will intercede for you.",
            "request_id": record.id,
            "timestamp": record.created_at.isoformat(),
        }

    # 2. Handle standard JSON payload (backward-compatible)
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request body. Expected JSON or multipart/form-data.",
        )

    name = body.get("name")
    contact = body.get("contact", "")
    req_text = body.get("request") or body.get("message") or ""
    category = body.get("category", "General Need")
    is_anonymous = bool(body.get("is_anonymous", False))
    contact_permission = bool(body.get("contact_permission", True))

    if not req_text or len(str(req_text).strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Prayer request details must be at least 5 characters.",
        )

    # Parse email and phone from contact string if present
    email = None
    phone = None
    if contact and "@" in contact:
        parts = [p.strip() for p in contact.split("|")]
        for p in parts:
            if "@" in p and not email:
                email = p
            elif any(c.isdigit() for c in p) and not phone:
                phone = p
    elif contact:
        if any(c.isdigit() for c in contact):
            phone = contact
        else:
            email = contact

    record = prayer_service.create_prayer_request(
        db=db,
        name=name,
        email=email,
        phone=phone,
        category=category,
        message=req_text,
        is_anonymous=is_anonymous,
        contact_permission=contact_permission,
        files=None,
    )

    requester_name = record.name or ""
    name_display = f", {requester_name}" if requester_name else ""
    return {
        "status": "success",
        "message": f"Thank you{name_display}! Your prayer request has been received by our pastoral prayer team. We will intercede for you.",
        "request_id": record.id,
        "timestamp": record.created_at.isoformat(),
    }


# ============================================================================
# Pastoral Admin Authentication & Management Endpoints
# ============================================================================

@router.post(
    "/api/admin/login",
    response_model=AdminLoginResponse,
    tags=["Pastoral Admin"],
    summary="Pastoral administrator login",
    description="Authenticates church administrators and returns a JWT bearer token.",
)
def admin_login(payload: AdminLoginInput) -> dict[str, Any]:
    """Authenticate pastoral administrator and issue JWT token."""
    if not verify_admin_credentials(payload.username, payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid pastoral credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(data={"sub": payload.username, "role": "admin"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.ADMIN_TOKEN_EXPIRE_MINUTES * 60,
        "username": payload.username,
        "role": "admin",
    }


@router.get(
    "/api/admin/prayer-requests",
    response_model=PrayerRequestListResponse,
    tags=["Pastoral Admin"],
    summary="List, search, and filter prayer requests",
    description="Retrieve paginated list of prayer requests with filters for status, category, and keyword search.",
)
def list_prayer_requests(
    category: Optional[str] = Query(None, description="Category filter"),
    status: Optional[str] = Query(None, description="Status filter: 'Pending', 'Prayed', 'Archived'"),
    q: Optional[str] = Query(None, description="Search keyword across requests, names, contact"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    sort: str = Query("newest", pattern="^(newest|oldest)$"),
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve filtered list of prayer requests for pastoral care."""
    records, total = prayer_service.list_prayer_requests(
        db=db,
        category=category,
        status_filter=status,
        search=q,
        limit=limit,
        offset=offset,
        sort_order=sort,
    )
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "requests": [r.to_dict() for r in records],
    }


@router.get(
    "/api/admin/prayer-requests/stats",
    response_model=PrayerStatsResponse,
    tags=["Pastoral Admin"],
    summary="Get prayer request metrics",
    description="Returns aggregate counts of pending, prayed, and archived prayer requests.",
)
def get_prayer_stats(
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve summary statistics of church prayer requests."""
    return prayer_service.get_stats(db)


@router.get(
    "/api/admin/prayer-requests/{request_id}",
    response_model=PrayerRequestDetail,
    tags=["Pastoral Admin"],
    summary="Get single prayer request details",
    description="Returns complete details and attachment metadata for a prayer request.",
)
def get_prayer_request(
    request_id: str,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve detailed record and attachment list of a prayer request."""
    record = prayer_service.get_prayer_request(db, request_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prayer request not found.",
        )
    return record.to_dict()


@router.patch(
    "/api/admin/prayer-requests/{request_id}",
    response_model=PrayerRequestDetail,
    tags=["Pastoral Admin"],
    summary="Update prayer request status or pastoral notes",
    description="Updates the prayer request status ('Pending', 'Prayed', 'Archived') or appends pastoral notes.",
)
def update_prayer_request(
    request_id: str,
    payload: PrayerRequestStatusUpdate,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Update prayer request status or pastoral notes."""
    record = prayer_service.update_prayer_request(
        db,
        request_id=request_id,
        status_update=payload.status,
        pastoral_notes=payload.pastoral_notes,
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prayer request not found.",
        )
    return record.to_dict()


@router.delete(
    "/api/admin/prayer-requests/{request_id}",
    tags=["Pastoral Admin"],
    summary="Delete a prayer request and its private attachments",
    description="Removes prayer request from database and cleans up physical media files in storage.",
)
def delete_prayer_request(
    request_id: str,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Delete a prayer request and its physical files."""
    success = prayer_service.delete_prayer_request(db, request_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prayer request not found.",
        )
    return {"status": "deleted", "request_id": request_id}


@router.get(
    "/api/admin/prayer-requests/{request_id}/attachments/{attachment_id}",
    tags=["Pastoral Admin"],
    summary="Securely stream or download a private attachment",
    description="Streams or downloads an uploaded prayer media file with authorization check.",
)
def stream_attachment(
    request_id: str,
    attachment_id: str,
    admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Response:
    """Stream or download a private prayer media file with authorization check."""
    result = prayer_service.get_attachment(db, request_id, attachment_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found or physical file missing.",
        )

    attachment, file_path = result
    return FileResponse(
        path=file_path,
        media_type=attachment.mime_type,
        filename=attachment.original_filename,
    )
