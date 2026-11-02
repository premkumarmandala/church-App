"""Pydantic schemas and data transfer objects for Prayer Request feature."""
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class AdminLoginInput(BaseModel):
    """Administrator credentials payload."""
    username: str = Field(..., description="Administrator username")
    password: str = Field(..., description="Administrator password")


class AdminLoginResponse(BaseModel):
    """JWT bearer token response on successful authentication."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    username: str
    role: str = "admin"


class PrayerAttachmentModel(BaseModel):
    """Metadata representation of an uploaded file attachment."""
    id: str
    request_id: str
    original_filename: str
    file_type: str
    file_size: int
    mime_type: str
    created_at: Optional[str] = None
    download_url: str


class PrayerRequestInput(BaseModel):
    """Payload for submitting a prayer request."""
    name: Optional[str] = Field(None, max_length=120)
    contact: Optional[str] = Field(None, max_length=255)
    category: str = Field("General Need", max_length=80)
    request: str = Field(..., min_length=5)
    is_anonymous: bool = False
    contact_permission: bool = True


class PrayerRequestResponse(BaseModel):
    """Response returned upon prayer request creation."""
    status: str
    message: str
    request_id: str
    timestamp: str


class PrayerRequestDetail(BaseModel):
    """Full detail view of a prayer request for pastoral admin."""
    id: str
    request_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    category: str
    message: str
    is_anonymous: bool
    contact_permission: bool
    status: str
    pastoral_notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    attachments: list[PrayerAttachmentModel] = []


class PrayerRequestListResponse(BaseModel):
    """Paginated list of prayer requests."""
    total: int
    limit: int
    offset: int
    requests: list[dict[str, Any]]


class PrayerStatsResponse(BaseModel):
    """Aggregate statistics for pastoral care metrics."""
    total_requests: int
    pending_requests: int
    prayed_requests: int
    archived_requests: int
    total: Optional[int] = None
    pending: Optional[int] = None
    prayed: Optional[int] = None
    archived: Optional[int] = None
    by_category: dict[str, int] = Field(default_factory=dict)


class PrayerRequestStatusUpdate(BaseModel):
    """Payload to update status or pastoral notes."""
    status: Optional[str] = Field(None, pattern="^(Pending|Prayed|Archived)$")
    pastoral_notes: Optional[str] = None
