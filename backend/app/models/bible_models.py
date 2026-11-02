"""Pydantic schemas and data contracts for Bible API."""
from typing import Optional, Union
from pydantic import BaseModel, Field


class BookMetadata(BaseModel):
    """Metadata for a single canonical book of the Bible."""
    id: int = Field(..., description="Canonical sequence number (1-66)")
    name: str = Field(..., description="English canonical name")
    teluguName: str = Field(..., description="Telugu script canonical name")
    slug: str = Field(..., description="URL-friendly book identifier")
    testament: str = Field(..., description="Testament: 'OT' or 'NT'")
    chaptersCount: int = Field(..., description="Total chapters count in this book")
    kjvFile: str = Field(..., description="KJV JSON data file name")
    teluguFile: str = Field(..., description="Telugu JSON data file name")


class BookSummary(BaseModel):
    """Summary of book information for chapter responses."""
    id: int
    slug: str
    name: str
    teluguName: str
    testament: str
    chaptersCount: int


class Verse(BaseModel):
    """A single verse representation."""
    verse: Union[int, str] = Field(..., description="Verse number (integer or string)")
    text: str = Field(..., description="Verse scripture text")


class ChapterResponse(BaseModel):
    """Full response for a requested book chapter."""
    book: BookSummary
    chapter: int
    translation: str
    versesCount: int
    verses: list[Verse]
    parallelTranslation: Optional[str] = None
    parallelVerses: Optional[list[Verse]] = None


class SearchResultItem(BaseModel):
    """A single matched verse in a search query."""
    bookId: int
    bookSlug: str
    bookName: str
    teluguBookName: str
    chapter: int
    verse: int
    referenceEn: str
    referenceTe: str
    text: str
    matchIndex: int
    translation: str


class SearchResponse(BaseModel):
    """Search results response envelope."""
    query: str
    translation: str
    testament: str
    total: int
    hasMore: bool
    results: list[SearchResultItem]


class DailyVerseResponse(BaseModel):
    """Verse of the day for devotional reading."""
    date: str
    dayOfYear: int
    book: str
    bookSlug: str
    teluguBook: str
    chapter: int
    verse: int
    referenceEn: str
    referenceTe: str
    kjvText: str
    teluguText: str


class ValidationResponse(BaseModel):
    """Data integrity and licensing validation status."""
    status: str
    canonicalBooks: int
    kjvVerses: int
    teluguVerses: int
    parity: str
    licensing: str


class HealthResponse(BaseModel):
    """Health check status."""
    status: str
    service: str
    version: str
    timestamp: str


class ErrorResponse(BaseModel):
    """Descriptive error response."""
    error: str
    validRange: Optional[dict[str, int]] = None


class PrayerRequestInput(BaseModel):
    """Payload for submitting a prayer request."""
    name: Optional[str] = Field(None, max_length=100, description="Requester's name (optional)")
    contact: str = Field(..., min_length=3, max_length=150, description="Email or phone number for follow-up")
    request: str = Field(..., min_length=5, max_length=2000, description="Prayer request details")


class PrayerRequestResponse(BaseModel):
    """Confirmation response after prayer request submission."""
    status: str
    message: str
    request_id: str
    timestamp: str


class PrayerAttachmentModel(BaseModel):
    """Attachment metadata model."""
    id: str
    request_id: str
    original_filename: str
    file_type: str
    file_size: int
    mime_type: str
    created_at: Optional[str] = None
    download_url: str


class PrayerRequestDetail(BaseModel):
    """Full prayer request record returned for pastoral review."""
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
    """Paginated list of prayer requests for pastoral care."""
    total: int
    limit: int
    offset: int
    requests: list[PrayerRequestDetail]


class PrayerRequestStatusUpdate(BaseModel):
    """Payload to update prayer request status or add pastoral notes."""
    status: Optional[str] = Field(None, pattern="^(Pending|Prayed|Archived)$")
    pastoral_notes: Optional[str] = None


class PrayerStatsResponse(BaseModel):
    """Summary metrics of church prayer requests."""
    total_requests: int
    pending_requests: int
    prayed_requests: int
    archived_requests: int
    by_category: dict[str, int]


class AdminLoginInput(BaseModel):
    """Pastoral administrator login credentials."""
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class AdminLoginResponse(BaseModel):
    """Response containing JWT access token."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    username: str
    role: str = "admin"

