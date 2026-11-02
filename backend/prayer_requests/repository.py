"""Repository layer encapsulating database queries for Prayer Requests."""
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from prayer_requests.models import PrayerAttachment, PrayerRequest


class PrayerRequestRepository:
    """Handles all PostgreSQL / SQLAlchemy operations for prayer requests and attachments."""

    def get_by_id(self, db: Session, request_id: str) -> Optional[PrayerRequest]:
        """Fetch a single prayer request by its unique ID."""
        return db.query(PrayerRequest).filter(PrayerRequest.id == request_id).first()

    def list_requests(
        self,
        db: Session,
        category: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        sort_order: str = "newest",
    ) -> tuple[list[PrayerRequest], int]:
        """List prayer requests with category/status filters, keyword search, and pagination."""
        query = db.query(PrayerRequest)

        # Apply category filter
        if category and category.lower() != "all" and category.strip():
            query = query.filter(PrayerRequest.category.ilike(f"%{category.strip()}%"))

        # Apply status filter ('Pending', 'Prayed', 'Archived')
        if status_filter and status_filter.lower() != "all" and status_filter.strip():
            query = query.filter(PrayerRequest.status.ilike(status_filter.strip()))

        # Apply multi-field full-text search
        if search and search.strip():
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    PrayerRequest.id.ilike(s),
                    PrayerRequest.name.ilike(s),
                    PrayerRequest.email.ilike(s),
                    PrayerRequest.phone.ilike(s),
                    PrayerRequest.category.ilike(s),
                    PrayerRequest.message.ilike(s),
                    PrayerRequest.pastoral_notes.ilike(s),
                )
            )

        # Get total count before pagination
        total = query.count()

        # Apply ordering
        if sort_order == "oldest":
            query = query.order_by(PrayerRequest.created_at.asc())
        else:
            query = query.order_by(PrayerRequest.created_at.desc())

        # Apply pagination
        records = query.offset(offset).limit(limit).all()
        return records, total

    def get_stats(self, db: Session) -> dict[str, int]:
        """Calculate prayer request aggregates for the pastoral dashboard."""
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
        by_category = {cat: count for cat, count in cat_counts if cat}

        return {
            "total_requests": total,
            "pending_requests": pending,
            "prayed_requests": prayed,
            "archived_requests": archived,
            "total": total,
            "pending": pending,
            "prayed": prayed,
            "archived": archived,
            "by_category": by_category,
        }

    def save(self, db: Session, record: PrayerRequest) -> PrayerRequest:
        """Persist or update a prayer request in the database."""
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    def update(
        self,
        db: Session,
        request_id: str,
        status_update: Optional[str] = None,
        pastoral_notes: Optional[str] = None,
    ) -> Optional[PrayerRequest]:
        """Update request status and/or pastoral notes."""
        record = self.get_by_id(db, request_id)
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

    def delete(self, db: Session, request_id: str) -> bool:
        """Delete a prayer request from the database."""
        record = self.get_by_id(db, request_id)
        if not record:
            return False

        db.delete(record)
        db.commit()
        return True

    def get_attachment(
        self,
        db: Session,
        request_id: str,
        attachment_id: str,
    ) -> Optional[PrayerAttachment]:
        """Retrieve attachment record by request ID and attachment ID."""
        return (
            db.query(PrayerAttachment)
            .filter(
                PrayerAttachment.id == attachment_id,
                PrayerAttachment.request_id == request_id,
            )
            .first()
        )


prayer_repository = PrayerRequestRepository()
