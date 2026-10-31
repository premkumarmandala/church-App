"""Automated test suite for FastAPI Bible REST API endpoints."""
import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.services.bible_service import bible_service

# Pre-load data for tests
bible_service.load_data()
client = TestClient(app)


def test_get_books():
    """Verify GET /api/bible/books returns all 66 canonical books."""
    response = client.get("/api/bible/books")
    assert response.status_code == 200
    books = response.json()
    assert isinstance(books, list)
    assert len(books) == 66
    assert books[0]["slug"] == "genesis"
    assert books[65]["slug"] == "revelation"


def test_genesis_1_kjv():
    """Verify Genesis chapter 1 in English KJV."""
    response = client.get("/api/bible/chapter?translation=kjv&book=genesis&chapter=1")
    assert response.status_code == 200
    data = response.json()
    assert data["versesCount"] == 31
    assert len(data["verses"]) == 31
    assert data["verses"][0]["text"] == "In the beginning God created the heaven and the earth."


def test_genesis_1_telugu():
    """Verify Genesis chapter 1 in Telugu."""
    response = client.get("/api/bible/chapter?translation=telugu&book=genesis&chapter=1")
    assert response.status_code == 200
    data = response.json()
    assert data["versesCount"] == 31
    assert len(data["verses"]) == 31
    assert data["verses"][0]["text"] == "ఆదియందు దేవుడు భూమ్యాకాశములను సృజించెను."


def test_john_3_16_kjv():
    """Verify John 3:16 in English KJV."""
    response = client.get("/api/bible/chapter?translation=kjv&book=john&chapter=3")
    assert response.status_code == 200
    data = response.json()
    v16 = next((v for v in data["verses"] if str(v["verse"]) == "16"), None)
    assert v16 is not None
    assert "For God so loved the world" in v16["text"]


def test_john_3_16_telugu():
    """Verify John 3:16 in Telugu."""
    response = client.get("/api/bible/chapter?translation=telugu&book=john&chapter=3")
    assert response.status_code == 200
    data = response.json()
    v16 = next((v for v in data["verses"] if str(v["verse"]) == "16"), None)
    assert v16 is not None
    assert "దేవుడు లోకమును ఎంతో ప్రేమించెను" in v16["text"]


def test_parallel_chapter():
    """Verify parallel translation retrieval."""
    response = client.get("/api/bible/chapter?translation=kjv&book=genesis&chapter=1&parallel=true")
    assert response.status_code == 200
    data = response.json()
    assert data["parallelTranslation"] == "telugu"
    assert data["parallelVerses"] is not None
    assert len(data["parallelVerses"]) == 31


def test_invalid_book_returns_404():
    """Verify invalid book query returns 404 with descriptive error."""
    response = client.get("/api/bible/chapter?translation=kjv&book=NonExistent&chapter=1")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["error"].lower()


def test_invalid_chapter_returns_400():
    """Verify invalid chapter returns 400 with validRange min and max."""
    response = client.get("/api/bible/chapter?translation=kjv&book=genesis&chapter=51")
    assert response.status_code == 400
    data = response.json()
    assert "validRange" in data
    assert data["validRange"]["max"] == 50


def test_invalid_translation_returns_400():
    """Verify unsupported translation returns 400."""
    response = client.get("/api/bible/chapter?translation=latin&book=genesis&chapter=1")
    assert response.status_code == 400
    data = response.json()
    assert "unsupported translation" in data["error"].lower()


def test_search_english_salvation():
    """Verify search for English term 'salvation'."""
    response = client.get("/api/bible/search?q=salvation&translation=kjv&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) > 0
    assert "salvation" in data["results"][0]["text"].lower()


def test_search_telugu_love():
    """Verify search for Telugu term 'ప్రేమ'."""
    response = client.get("/api/bible/search?q=ప్రేమ&translation=telugu&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) > 0
    assert "ప్రేమ" in data["results"][0]["text"]


def test_search_nonexistent_term():
    """Verify search for non-existent term returns empty results cleanly."""
    response = client.get("/api/bible/search?q=xyznonexistentterm999&translation=kjv")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert len(data["results"]) == 0


def test_search_empty_query():
    """Verify empty query returns 0 results cleanly."""
    response = client.get("/api/bible/search?q=&translation=kjv")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0


def test_search_testament_filter():
    """Verify testament filter restricts results to NT."""
    response = client.get("/api/bible/search?q=grace&translation=kjv&testament=nt&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["testament"] == "nt"
    for r in data["results"]:
        assert r["bookId"] >= 40  # NT books start at 40 (Matthew)


def test_daily_verse():
    """Verify GET /api/bible/daily-verse returns bilingual devotional verse."""
    response = client.get("/api/bible/daily-verse")
    assert response.status_code == 200
    data = response.json()
    assert data["referenceEn"] != ""
    assert data["kjvText"] != ""
    assert data["referenceTe"] != ""
    assert data["teluguText"] != ""
    assert 1 <= data["dayOfYear"] <= 366


def test_validation_endpoint():
    """Verify GET /api/bible/validate returns valid status and 31,102 verses."""
    response = client.get("/api/bible/validate")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "VALIDATED"
    assert data["canonicalBooks"] == 66
    assert data["kjvVerses"] == 31102
    assert data["teluguVerses"] == 31102


def test_health_check():
    """Verify GET /api/health endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "church-bible-api"


def test_cors_headers():
    """Verify CORS headers are returned for cross-origin frontend requests."""
    response = client.options(
        "/api/bible/books",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") in ("*", "http://localhost:5173")


def test_static_church_home():
    """Verify GET / serves Church landing page HTML."""
    response = client.get("/")
    assert response.status_code == 200
    assert "Grace Church" in response.text


def test_static_bible_app():
    """Verify GET /bible/ serves Online Bible application HTML."""
    response = client.get("/bible/")
    assert response.status_code == 200
    assert "Online Bible" in response.text


def test_licensing_doc_endpoint():
    """Verify GET /BIBLE_SOURCES_AND_LICENSING.md serves documentation."""
    response = client.get("/BIBLE_SOURCES_AND_LICENSING.md")
    assert response.status_code == 200
    assert "Bible" in response.text


def test_bible_data_static_mount():
    """Verify GET /bible-data/books.json is accessible for PWA/offline caching."""
    response = client.get("/bible-data/books.json")
    assert response.status_code == 200
    books = response.json()
    assert len(books) == 66


def test_bible_slash_redirect():
    """Verify GET /bible cleanly redirects to /bible/."""
    response = client.get("/bible", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers.get("location") == "/bible/"


def test_service_worker_headers():
    """Verify GET /bible/sw.js serves Service-Worker-Allowed header."""
    response = client.get("/bible/sw.js")
    assert response.status_code == 200
    assert response.headers.get("service-worker-allowed") == "/"


def test_submit_prayer_request():
    """Verify POST /api/prayer-request accepts valid prayer request."""
    payload = {
        "name": "Sarah Matthew",
        "contact": "sarah@example.com",
        "request": "Please pray for healing and peace for my family.",
    }
    response = client.post("/api/prayer-request", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Sarah Matthew" in data["message"]
    assert "request_id" in data
    assert data["request_id"].startswith("PR-")


def test_submit_prayer_request_validation():
    """Verify POST /api/prayer-request validates missing required fields."""
    response = client.post("/api/prayer-request", json={"name": "Only Name"})
    assert response.status_code == 422



