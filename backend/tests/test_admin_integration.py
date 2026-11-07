"""Comprehensive end-to-end integration test verifying the entire Admin Dashboard,
FastAPI endpoints, static mounts, redirects, and Bible routes."""
import sys
from pathlib import Path
from fastapi.testclient import TestClient
import pytest

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.db.connection import get_db, init_db, SessionLocal
from app.db.models import PrayerAttachment, PrayerRequest
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_database():
    """Ensure database schema is ready and cleans up test data."""
    init_db()
    yield
    db = SessionLocal()
    try:
        db.query(PrayerAttachment).delete()
        db.query(PrayerRequest).delete()
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


def test_admin_redirect_and_static_serving():
    """Verify /admin redirect and static HTML serving for admin dashboard."""
    # 1. GET /admin without trailing slash redirects to /admin/
    redir = client.get("/admin", follow_redirects=False)
    assert redir.status_code == 307
    assert redir.headers["location"] == "/admin/"

    # 2. GET /admin/ serves the admin dashboard HTML
    res = client.get("/admin/")
    assert res.status_code == 200
    assert "Pastoral Prayer Admin Dashboard" in res.text
    assert "admin-root" in res.text
    assert "prayer-requests.bundle" in res.text

    # 3. Legacy /prayer-request/admin.html redirect
    legacy = client.get("/prayer-request/admin.html")
    assert legacy.status_code == 200
    assert "/admin/" in legacy.text


def test_admin_full_workflow():
    """Verify complete pastoral workflow: submission -> login -> metrics -> inspection -> notes -> delete."""
    # 1. Public submission
    sub = client.post(
        "/api/prayer-request",
        json={
            "name": "Sister Hannah",
            "contact": "hannah@gracechurch.org | 555-0144",
            "category": "Salvation",
            "request": "Praying for salvation and peace for my family.",
            "is_anonymous": False,
            "contact_permission": True,
        },
    )
    assert sub.status_code == 200
    req_id = sub.json()["request_id"]
    assert req_id.startswith("PR-")

    # 2. Unauthorized attempt on admin endpoint must fail (401)
    unauth = client.get("/api/admin/prayer-requests")
    assert unauth.status_code == 401

    # 3. Admin Login
    login = client.post(
        "/api/admin/login",
        json={"username": settings.ADMIN_USERNAME, "password": settings.ADMIN_PASSWORD},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 4. Fetch Stats
    stats = client.get("/api/admin/prayer-requests/stats", headers=headers)
    assert stats.status_code == 200
    data = stats.json()
    assert data["total_requests"] >= 1
    assert data["pending_requests"] >= 1

    # 5. List and search
    req_list = client.get(f"/api/admin/prayer-requests?q=Hannah", headers=headers)
    assert req_list.status_code == 200
    items = req_list.json()["requests"]
    assert len(items) >= 1
    assert items[0]["name"] == "Sister Hannah"

    # 6. Get Detail
    detail = client.get(f"/api/admin/prayer-requests/{req_id}", headers=headers)
    assert detail.status_code == 200
    assert detail.json()["category"] == "Salvation"

    # 7. Update status to Prayed and append pastoral notes
    patch = client.patch(
        f"/api/admin/prayer-requests/{req_id}",
        json={
            "status": "Prayed",
            "pastoral_notes": "Interceded during Tuesday morning pastoral prayer call.",
        },
        headers=headers,
    )
    assert patch.status_code == 200
    assert patch.json()["status"] == "Prayed"
    assert "Tuesday morning" in patch.json()["pastoral_notes"]

    # 8. Delete request
    delete_res = client.delete(f"/api/admin/prayer-requests/{req_id}", headers=headers)
    assert delete_res.status_code == 200

    # 9. Confirm deletion
    not_found = client.get(f"/api/admin/prayer-requests/{req_id}", headers=headers)
    assert not_found.status_code == 404


def test_existing_bible_and_public_features_preserved():
    """Ensure Bible reader and Scripture APIs continue operating without any regression."""
    # 1. Books API
    books = client.get("/api/bible/books")
    assert books.status_code == 200
    assert len(books.json()) == 66

    # 2. Chapter API (Genesis 1 KJV)
    chapter = client.get("/api/bible/chapter?translation=kjv&book=genesis&chapter=1")
    assert chapter.status_code == 200
    assert len(chapter.json()["verses"]) == 31

    # 3. Scripture Search
    search = client.get("/api/bible/search?q=faith")
    assert search.status_code == 200
    assert search.json()["total"] > 0

