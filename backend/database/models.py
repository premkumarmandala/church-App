"""SQLAlchemy ORM models for PostgreSQL Prayer Request feature."""
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class PrayerRequest(Base):
    """Pastoral prayer request database model."""

    __tablename__ = "prayer_requests"

    # Primary key & unique reference ID (e.g. PR-20261102-A1B2)
    id = Column(String(40), primary_key=True, index=True)

    # Requester contact information (optional or anonymous)
    name = Column(String(120), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)

    # Prayer content & classification
    category = Column(String(80), nullable=False, index=True)
    message = Column(Text, nullable=False)

    # Preferences & permissions
    is_anonymous = Column(Boolean, default=False, nullable=False)
    contact_permission = Column(Boolean, default=True, nullable=False)

    # Pastoral status ('Pending', 'Prayed', 'Archived')
    status = Column(String(20), default="Pending", nullable=False, index=True)
    pastoral_notes = Column(Text, nullable=True)

    # Timestamps (UTC with timezone awareness)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Associated media attachments
    attachments = relationship(
        "PrayerAttachment",
        back_populates="request",
        cascade="all, delete-orphan",
        order_by="PrayerAttachment.created_at",
        lazy="joined",
    )

    def to_dict(self) -> dict:
        """Convert model to dictionary for API response."""
        return {
            "id": self.id,
            "request_id": self.id,
            "name": "Anonymous" if self.is_anonymous else self.name,
            "email": None if self.is_anonymous else self.email,
            "phone": None if self.is_anonymous else self.phone,
            "category": self.category,
            "message": self.message,
            "is_anonymous": self.is_anonymous,
            "contact_permission": self.contact_permission,
            "status": self.status,
            "pastoral_notes": self.pastoral_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "attachments": [att.to_dict() for att in (self.attachments or [])],
        }


class PrayerAttachment(Base):
    """Media and file attachments associated with a prayer request."""

    __tablename__ = "prayer_attachments"

    id = Column(String(40), primary_key=True, index=True)
    request_id = Column(
        String(40),
        ForeignKey("prayer_requests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False, unique=True)
    file_type = Column(String(30), nullable=False)  # 'image', 'audio', 'video', 'pdf', 'docx'
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    storage_path = Column(String(500), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    request = relationship("PrayerRequest", back_populates="attachments")

    def to_dict(self) -> dict:
        """Convert attachment to dictionary for API response."""
        return {
            "id": self.id,
            "request_id": self.request_id,
            "original_filename": self.original_filename,
            "file_type": self.file_type,
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "download_url": f"/api/admin/prayer-requests/{self.request_id}/attachments/{self.id}",
        }
