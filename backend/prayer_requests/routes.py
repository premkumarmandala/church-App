"""API route definitions for Prayer Requests feature and Pastoral Admin."""
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
    Response,
    status,
)
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session

from app.auth.security import create_access_token, get_current_admin, verify_admin_credentials
from app.config import settings
from app.db.connection import get_db
from prayer_requests.schemas import (
    AdminLoginInput,
    AdminLoginResponse,
    PrayerRequestDetail,
    PrayerRequestListResponse,
    PrayerRequestResponse,
    PrayerRequestStatusUpdate,
    PrayerStatsResponse,
)
from prayer_requests.services import prayer_service

router = APIRouter()


# ============================================================================
# Public Prayer Request Endpoints
# ============================================================================

@router.post(
    "/api/prayer-request",
    response_model=PrayerRequestResponse,
    tags=["Church Services"],
    summary="Submit a pastoral prayer request",
    description="Submits a prayer request. Supports multipart/form-data with media attachments and JSON payloads.",
)
async def submit_prayer_request(
    request: Request,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Accept and persist a church prayer request."""
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

    # 2. Handle standard JSON payload
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
    prayer_service.seed_default_requests(db)
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
    prayer_service.seed_default_requests(db)
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

