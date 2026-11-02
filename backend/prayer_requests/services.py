"""Service layer for Prayer Requests business logic and private file management."""
import logging
import os
import re
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.config import settings
from prayer_requests.models import PrayerAttachment, PrayerRequest
from prayer_requests.repository import prayer_repository

logger = logging.getLogger("church.prayer_requests")

ALLOWED_EXTENSIONS = {
    # Images
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
    ".webp": "image",
    ".gif": "image",
    # Audio
    ".mp3": "audio",
    ".wav": "audio",
    ".m4a": "audio",
    ".aac": "audio",
    ".ogg": "audio",
    ".webm": "audio",
    # Video
    ".mp4": "video",
    ".mov": "video",
    ".avi": "video",
    ".mkv": "video",
    # Documents
    ".pdf": "pdf",
    ".docx": "docx",
    ".doc": "document",
    ".txt": "document",
}


class PrayerRequestService:
    """Business logic for pastoral care and prayer request management."""

    @staticmethod
    def generate_request_id() -> str:
        """Generate human-friendly reference ID: PR-YYYYMMDD-XXXX."""
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        random_suffix = uuid.uuid4().hex[:6].upper()
        return f"PR-{date_str}-{random_suffix}"

    @staticmethod
    def classify_file(filename: str, content_type: Optional[str] = None) -> str:
        """Determine file category based on extension and MIME type."""
        ext = Path(filename).suffix.lower()
        if ext in ALLOWED_EXTENSIONS:
            return ALLOWED_EXTENSIONS[ext]
        if content_type:
            ct = content_type.lower()
            if ct.startswith("image/"):
                return "image"
            if ct.startswith("audio/"):
                return "audio"
            if ct.startswith("video/"):
                return "video"
            if "pdf" in ct:
                return "pdf"
            if "word" in ct or "officedocument" in ct:
                return "docx"
        return "other"

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Clean filename to prevent path traversal or unsafe characters."""
        base = Path(filename).name
        cleaned = re.sub(r"[^\w\.\- ]", "_", base).strip()
        return cleaned or f"file_{uuid.uuid4().hex[:8]}"

    def create_prayer_request(
        self,
        db: Session,
        name: Optional[str],
        email: Optional[str],
        phone: Optional[str],
        category: str,
        message: str,
        is_anonymous: bool = False,
        contact_permission: bool = True,
        files: Optional[list[UploadFile]] = None,
    ) -> PrayerRequest:
        """Validate input, persist prayer request, and safely save uploaded attachments."""
        req_id = self.generate_request_id()

        record = PrayerRequest(
            id=req_id,
            name=name if not is_anonymous else None,
            email=email if not is_anonymous else None,
            phone=phone if not is_anonymous else None,
            category=category or "General Need",
            message=message.strip(),
            is_anonymous=is_anonymous,
            contact_permission=contact_permission,
            status="Pending",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        # Handle file uploads if any
        if files:
            req_storage_dir = settings.STORAGE_DIR / req_id
            req_storage_dir.mkdir(parents=True, exist_ok=True)

            for upload in files:
                if not upload.filename:
                    continue

                safe_name = self.sanitize_filename(upload.filename)
                ext = Path(safe_name).suffix.lower()
                file_type = self.classify_file(safe_name, upload.content_type)
                unique_stored_name = f"{uuid.uuid4().hex[:12]}_{safe_name}"
                dest_path = req_storage_dir / unique_stored_name

                # Stream and save to disk
                file_size = 0
                with dest_path.open("wb") as buffer:
                    shutil.copyfileobj(upload.file, buffer)
                    file_size = dest_path.stat().st_size

                att = PrayerAttachment(
                    id=f"ATT-{uuid.uuid4().hex[:8].upper()}",
                    request_id=req_id,
                    original_filename=safe_name,
                    stored_filename=unique_stored_name,
                    file_type=file_type,
                    file_size=file_size,
                    mime_type=upload.content_type or "application/octet-stream",
                    storage_path=str(dest_path.relative_to(settings.BACKEND_DIR)),
                    created_at=datetime.now(timezone.utc),
                )
                record.attachments.append(att)

        return prayer_repository.save(db, record)

    def list_prayer_requests(
        self,
        db: Session,
        category: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        sort_order: str = "newest",
    ) -> tuple[list[PrayerRequest], int]:
        """Query filtered and paginated list of prayer requests."""
        return prayer_repository.list_requests(
            db=db,
            category=category,
            status_filter=status_filter,
            search=search,
            limit=limit,
            offset=offset,
            sort_order=sort_order,
        )

    def get_stats(self, db: Session) -> dict[str, int]:
        """Retrieve aggregated request counts for dashboard KPI cards."""
        return prayer_repository.get_stats(db)

    def get_prayer_request(self, db: Session, request_id: str) -> Optional[PrayerRequest]:
        """Fetch a single prayer request by its ID."""
        return prayer_repository.get_by_id(db, request_id)

    def update_prayer_request(
        self,
        db: Session,
        request_id: str,
        status_update: Optional[str] = None,
        pastoral_notes: Optional[str] = None,
    ) -> Optional[PrayerRequest]:
        """Update request status ('Pending', 'Prayed', 'Archived') or pastoral notes."""
        return prayer_repository.update(
            db=db,
            request_id=request_id,
            status_update=status_update,
            pastoral_notes=pastoral_notes,
        )

    def delete_prayer_request(self, db: Session, request_id: str) -> bool:
        """Delete prayer request from database and remove physical files from storage."""
        record = prayer_repository.get_by_id(db, request_id)
        if not record:
            return False

        # Remove physical directory
        req_storage_dir = settings.STORAGE_DIR / request_id
        if req_storage_dir.exists():
            try:
                shutil.rmtree(req_storage_dir, ignore_errors=True)
            except Exception as e:
                logger.warning("Error deleting attachment directory for %s: %s", request_id, str(e))

        return prayer_repository.delete(db, request_id)

    def get_attachment(
        self,
        db: Session,
        request_id: str,
        attachment_id: str,
    ) -> Optional[tuple[PrayerAttachment, Path]]:
        """Verify attachment existence and resolve its local physical file path."""
        att = prayer_repository.get_attachment(db, request_id, attachment_id)
        if not att:
            return None

        file_path = settings.BACKEND_DIR / att.storage_path
        if not file_path.exists():
            return None

        return att, file_path


prayer_service = PrayerRequestService()

