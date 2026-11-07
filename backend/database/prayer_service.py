"""Service layer for PostgreSQL Prayer Request operations and private file storage."""
import os
import re
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.config import settings
from database.models import PrayerAttachment, PrayerRequest

# Allowed file extensions mapping to file_type classification
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


class PrayerService:
    """Encapsulates database persistence and file management for prayer requests."""

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
        return "document"

    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        """Sanitize filename to prevent directory traversal and illegal characters."""
        base = Path(filename).name
        clean = re.sub(r"[^a-zA-Z0-9._-]", "_", base)
        return clean or "unnamed_file"

    @classmethod
    def create_prayer_request(
        cls,
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
        """Create and persist a prayer request with optional multiple media attachments."""
        req_message = (message or "").strip()
        if not req_message:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Prayer message cannot be empty.",
            )

        cat = (category or "General Need").strip()
        req_id = cls.generate_request_id()

        prayer_request = PrayerRequest(
            id=req_id,
            name=None if is_anonymous else (name.strip() if name else None),
            email=None if is_anonymous else (email.strip() if email else None),
            phone=None if is_anonymous else (phone.strip() if phone else None),
            category=cat,
            message=req_message,
            is_anonymous=is_anonymous,
            contact_permission=contact_permission,
            status="Pending",
        )
        db.add(prayer_request)

        # Process file attachments if provided
        if files:
            total_size = 0
            req_storage_dir = settings.STORAGE_DIR / req_id
            req_storage_dir.mkdir(parents=True, exist_ok=True)

            for upload_file in files:
                if not upload_file.filename:
                    continue

                orig_filename = upload_file.filename
                clean_name = cls.sanitize_filename(orig_filename)
                file_type = cls.classify_file(clean_name, upload_file.content_type)

                unique_file_id = f"att-{uuid.uuid4().hex[:12]}"
                stored_filename = f"{unique_file_id}_{clean_name}"
                dest_path = req_storage_dir / stored_filename

                file_size = 0
                with open(dest_path, "wb") as f_out:
                    while chunk := upload_file.file.read(1024 * 64):
                        file_size += len(chunk)
                        total_size += len(chunk)
                        if total_size > settings.MAX_ATTACHMENT_SIZE_BYTES:
                            f_out.close()
                            shutil.rmtree(req_storage_dir, ignore_errors=True)
                            raise HTTPException(
                                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                                detail=f"Total attachments exceed maximum allowed limit of {settings.MAX_ATTACHMENT_SIZE_BYTES // (1024*1024)} MB.",
                            )
                        f_out.write(chunk)

                attachment = PrayerAttachment(
                    id=unique_file_id,
                    request_id=req_id,
                    original_filename=orig_filename,
                    stored_filename=stored_filename,
                    file_type=file_type,
                    file_size=file_size,
                    mime_type=upload_file.content_type or "application/octet-stream",
                    storage_path=str(dest_path.relative_to(settings.BACKEND_DIR)),
                )
                db.add(attachment)

        db.commit()
        db.refresh(prayer_request)
        return prayer_request

    @classmethod
    def list_prayer_requests(
        cls,
        db: Session,
        category: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        sort_order: str = "newest",
    ) -> tuple[list[PrayerRequest], int]:
        """Query prayer requests with pastoral filters and pagination."""
        query = db.query(PrayerRequest)

        if status_filter and status_filter.strip():
            query = query.filter(PrayerRequest.status == status_filter.strip())

        if category and category.strip():
            query = query.filter(PrayerRequest.category.ilike(f"%{category.strip()}%"))

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    PrayerRequest.message.ilike(term),
                    PrayerRequest.name.ilike(term),
                    PrayerRequest.email.ilike(term),
                    PrayerRequest.phone.ilike(term),
                    PrayerRequest.id.ilike(term),
                )
            )

        total = query.count()

        if sort_order == "oldest":
            query = query.order_by(PrayerRequest.created_at.asc())
        else:
            query = query.order_by(PrayerRequest.created_at.desc())

        results = query.offset(offset).limit(max(1, min(limit, 200))).all()
        return results, total

    @classmethod
    def get_prayer_request(cls, db: Session, request_id: str) -> Optional[PrayerRequest]:
        """Retrieve a specific prayer request by its reference ID."""
        return db.query(PrayerRequest).filter(PrayerRequest.id == request_id).first()

    @classmethod
    def update_prayer_request(
        cls,
        db: Session,
        request_id: str,
        status_update: Optional[str] = None,
        pastoral_notes: Optional[str] = None,
    ) -> Optional[PrayerRequest]:
        """Update request status ('Pending', 'Prayed', 'Archived') or pastoral notes."""
        record = cls.get_prayer_request(db, request_id)
        if not record:
            return None

        if status_update:
            record.status = status_update
        if pastoral_notes is not None:
            record.pastoral_notes = pastoral_notes

        record.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(record)
        return record

    @classmethod
    def delete_prayer_request(cls, db: Session, request_id: str) -> bool:
        """Delete prayer request and remove all private attachment files from storage."""
        record = cls.get_prayer_request(db, request_id)
        if not record:
            return False

        req_storage_dir = settings.STORAGE_DIR / request_id
        if req_storage_dir.exists():
            shutil.rmtree(req_storage_dir, ignore_errors=True)

        db.delete(record)
        db.commit()
        return True

    @classmethod
    def get_attachment(
        cls, db: Session, request_id: str, attachment_id: str
    ) -> Optional[tuple[PrayerAttachment, Path]]:
        """Look up an attachment record and verify its physical file exists on disk."""
        attachment = (
            db.query(PrayerAttachment)
            .filter(
                PrayerAttachment.request_id == request_id,
                PrayerAttachment.id == attachment_id,
            )
            .first()
        )
        if not attachment:
            return None

        file_path = settings.BACKEND_DIR / attachment.storage_path
        if not file_path.exists():
            # Fallback check under settings.STORAGE_DIR
            alt_path = settings.STORAGE_DIR / request_id / attachment.stored_filename
            if alt_path.exists():
                file_path = alt_path
            else:
                return None

        return attachment, file_path

    @classmethod
    def get_stats(cls, db: Session) -> dict:
        """Calculate pastoral summary statistics across all requests."""
        total = db.query(func.count(PrayerRequest.id)).scalar() or 0
        pending = (
            db.query(func.count(PrayerRequest.id))
            .filter(PrayerRequest.status == "Pending")
            .scalar()
            or 0
        )
        prayed = (
            db.query(func.count(PrayerRequest.id))
            .filter(PrayerRequest.status == "Prayed")
            .scalar()
            or 0
        )
        archived = (
            db.query(func.count(PrayerRequest.id))
            .filter(PrayerRequest.status == "Archived")
            .scalar()
            or 0
        )

        cat_counts = (
            db.query(PrayerRequest.category, func.count(PrayerRequest.id))
            .group_by(PrayerRequest.category)
            .all()
        )
        by_category = {cat: count for cat, count in cat_counts}

        return {
            "total_requests": total,
            "pending_requests": pending,
            "prayed_requests": prayed,
            "archived_requests": archived,
            "by_category": by_category,
        }


prayer_service = PrayerService()
