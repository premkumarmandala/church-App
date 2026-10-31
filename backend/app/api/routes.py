"""API route endpoints for Bible study and church services."""
from datetime import datetime, timezone
from typing import Any, Optional
from fastapi import APIRouter, Query, Response
from fastapi.responses import JSONResponse

from app.config import settings
from app.models.bible_models import (
    BookMetadata,
    ChapterResponse,
    DailyVerseResponse,
    ErrorResponse,
    HealthResponse,
    PrayerRequestInput,
    PrayerRequestResponse,
    SearchResponse,
    ValidationResponse,
)
from app.services.bible_service import bible_service

router = APIRouter()


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


@router.post(
    "/api/prayer-request",
    response_model=PrayerRequestResponse,
    tags=["Church Services"],
    summary="Submit a pastoral prayer request",
    description="Submits a prayer request to the pastoral team for intercession.",
)
def submit_prayer_request(payload: PrayerRequestInput) -> dict[str, Any]:
    """Accept and confirm receipt of a church prayer request."""
    # Generate unique reference ID
    ref_id = f"PR-{int(datetime.now(timezone.utc).timestamp())}"
    requester_name = payload.name.strip() if payload.name else ""
    name_display = f", {requester_name}" if requester_name else ""

    return {
        "status": "success",
        "message": f"Thank you{name_display}! Your prayer request has been received by our pastoral prayer team. We will intercede for you.",
        "request_id": ref_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

