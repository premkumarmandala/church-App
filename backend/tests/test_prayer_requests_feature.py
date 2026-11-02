"""Automated tests directly verifying backend/prayer_requests feature package."""
import io
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.db.connection import get_db, init_db, SessionLocal
from prayer_requests.models import PrayerAttachment, PrayerRequest
from prayer_requests.routes import router as prayer_router
from prayer_requests.services import prayer_service
from prayer_requests.repository import prayer_repository

test_app = FastAPI()
test_app.include_router(prayer_router)
client = TestClient(test_app)


@pytest.fixture(autouse=True)
def clean_db():
    """Ensure database schema is created and cleans up rows after each test."""
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

    # Clean up test files in storage
    if settings.STORAGE_DIR.exists():
        import shutil
        for p in settings.STORAGE_DIR.iterdir():
            if p.is_dir() and p.name.startswith("PR-"):
                shutil.rmtree(p, ignore_errors=True)


@pytest.fixture
def admin_token():
    """Obtain pastoral admin JWT token."""
    response = client.post(
        "/api/admin/login",
        json={"username": settings.ADMIN_USERNAME, "password": settings.ADMIN_PASSWORD},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_prayer_requests_package_crud(admin_token):
    """Test full cycle: submit, stats, list, detail, patch status, and delete via feature module."""
    # 1. Submit prayer request
    submit_res = client.post(
        "/api/prayer-request",
        json={
            "name": "Sister Sarah",
            "contact": "sarah@grace.org | +1-555-4321",
            "category": "Family & Children",
            "request": "Please pray for my daughter's college entrance exams.",
            "is_anonymous": False,
            "contact_permission": True,
        },
    )
    assert submit_res.status_code == 200
    req_id = submit_res.json()["request_id"]

    headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Verify Stats
    stats_res = client.get("/api/admin/prayer-requests/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total"] >= 1
    assert stats["pending"] >= 1

    # 3. List and search
    list_res = client.get("/api/admin/prayer-requests?q=Sarah", headers=headers)
    assert list_res.status_code == 200
    data = list_res.json()
    assert data["total"] >= 1
    assert any(r["id"] == req_id for r in data["requests"])

    # 4. Get detail
    detail_res = client.get(f"/api/admin/prayer-requests/{req_id}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["name"] == "Sister Sarah"
    assert detail["status"] == "Pending"

    # 5. Patch status to Prayed with pastoral notes
    patch_res = client.patch(
        f"/api/admin/prayer-requests/{req_id}",
        json={"status": "Prayed", "pastoral_notes": "Interceded during Wednesday evening prayer service."},
        headers=headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Prayed"
    assert "Wednesday" in patch_res.json()["pastoral_notes"]

    # 6. Delete prayer request
    del_res = client.delete(f"/api/admin/prayer-requests/{req_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    # 7. Confirm 404 on deleted
    not_found = client.get(f"/api/admin/prayer-requests/{req_id}", headers=headers)
    assert not_found.status_code == 404


def test_prayer_requests_unauthorized():
    """Verify admin endpoints strictly enforce JWT authentication."""
    # Attempt list without token
    res1 = client.get("/api/admin/prayer-requests")
    assert res1.status_code == 401

    # Attempt stats without token
    res2 = client.get("/api/admin/prayer-requests/stats")
    assert res2.status_code == 401

