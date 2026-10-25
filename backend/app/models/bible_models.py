"""Pydantic schemas and data contracts for Bible API."""
from typing import Optional
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
    verse: str = Field(..., description="Verse number as string")
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
