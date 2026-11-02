"""Automated tests for Church Website CMS backend feature and APIs."""
import io
import sys
from pathlib import Path
from fastapi.testclient import TestClient
import pytest

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.db.connection import init_db, SessionLocal
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Ensure database schema is ready for tests."""
    init_db()
    yield


@pytest.fixture
def admin_token():
    """Authenticate pastoral admin and return JWT token."""
    response = client.post(
        "/api/admin/login",
        json={"username": settings.ADMIN_USERNAME, "password": settings.ADMIN_PASSWORD},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_public_cms_content_endpoint():
    """Verify public website content bundle loads with all modules seeded."""
    response = client.get("/api/cms/content")
    assert response.status_code == 200
    data = response.json()
    assert "settings" in data
    assert "home" in data
    assert "about" in data
    assert "bible_settings" in data
    assert "contact" in data
    assert "service_timings" in data
    assert "announcements" in data
    assert "sermons" in data
    assert "events" in data
    assert "ministries" in data
    assert "gallery" in data

    assert len(data["service_timings"]) >= 4
    assert len(data["sermons"]) >= 4
    assert len(data["events"]) >= 3
    assert len(data["ministries"]) >= 6


def test_admin_cms_overview_and_unauthorized():
    """Verify admin CMS overview requires authentication and returns full metrics."""
    # 1. Unauthenticated request must return 401
    unauth = client.get("/api/admin/cms/overview")
    assert unauth.status_code == 401

    # 2. Authenticated request
    login = client.post(
        "/api/admin/login",
        json={"username": settings.ADMIN_USERNAME, "password": settings.ADMIN_PASSWORD},
    )
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/admin/cms/overview", headers=headers)
    assert res.status_code == 200
    overview = res.json()
    assert overview["total_content_items"] > 0
    assert overview["published_sermons"] >= 4
    assert overview["upcoming_events"] >= 3
    assert "recent_activities" in overview


def test_admin_cms_crud_workflow(admin_token):
    """Verify full administrative CRUD operations across CMS modules."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Update Home Section
    home_res = client.put(
        "/api/admin/cms/home",
        json={"welcome_text": "A Warm Welcome to", "hero_title": "Grace Fellowship Church Family"},
        headers=headers,
    )
    assert home_res.status_code == 200
    assert home_res.json()["welcome_text"] == "A Warm Welcome to"

    # 2. Update About Us Section
    about_res = client.put(
        "/api/admin/cms/about",
        json={"lead_pastor_title": "Founding & Senior Pastor"},
        headers=headers,
    )
    assert about_res.status_code == 200
    assert about_res.json()["lead_pastor_title"] == "Founding & Senior Pastor"

    # 3. Create, Update, Delete a Sermon
    sermon_payload = {
        "title": "Grace and Truth in Christ",
        "speaker": "Ps. John Samuel",
        "date_text": "• Sep 1, 2026",
        "duration": "48:10",
        "thumbnail": "home/assets/sermon_pastor.jpg",
        "passage": "John 1:14–17",
        "description": "Reflecting on the fullness of God's grace and truth.",
        "is_published": True,
        "order_index": 0,
    }
    create_sermon = client.post("/api/admin/cms/sermons", json=sermon_payload, headers=headers)
    assert create_sermon.status_code == 200
    s_id = create_sermon.json()["id"]

    # Update sermon
    up_sermon = client.put(
        f"/api/admin/cms/sermons/{s_id}",
        json={"title": "Grace and Truth Revealed"},
        headers=headers,
    )
    assert up_sermon.status_code == 200
    assert up_sermon.json()["title"] == "Grace and Truth Revealed"

    # Delete sermon
    del_sermon = client.delete(f"/api/admin/cms/sermons/{s_id}", headers=headers)
    assert del_sermon.status_code == 200
    assert del_sermon.json()["status"] == "deleted"

    # 4. Create, Update, Delete an Event
    event_payload = {
        "title": "Community Thanksgiving Banquet",
        "subtitle": "Celebrating God's Faithfulness",
        "date_text": "Nov 28, 2026",
        "time_text": "5:30 PM",
        "location": "Fellowship Hall",
        "image": "home/assets/church_picnic.jpg",
        "action_text": "RSVP Now",
        "registration_open": True,
        "category_tag": "Community",
        "is_published": True,
    }
    create_event = client.post("/api/admin/cms/events", json=event_payload, headers=headers)
    assert create_event.status_code == 200
    e_id = create_event.json()["id"]

    del_event = client.delete(f"/api/admin/cms/events/{e_id}", headers=headers)
    assert del_event.status_code == 200

    # 5. Create, Update, Delete Service Timing
    timing_payload = {
        "title": "Dawn Prayer Watch",
        "hours": "5:30 AM – 6:30 AM",
        "subtitle": "Telugu & English",
        "card_class": "card-purple",
        "icon_name": "pray",
        "day_of_week": "Saturday",
        "is_published": True,
        "order_index": 5,
    }
    create_timing = client.post("/api/admin/cms/service-timings", json=timing_payload, headers=headers)
    assert create_timing.status_code == 200
    t_id = create_timing.json()["id"]

    del_timing = client.delete(f"/api/admin/cms/service-timings/{t_id}", headers=headers)
    assert del_timing.status_code == 200

    # 6. Upload media
    fake_img = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01")
    upload_res = client.post(
        "/api/admin/cms/upload",
        files={"file": ("poster_test.png", fake_img, "image/png")},
        headers=headers,
    )
    assert upload_res.status_code == 200
    assert "url" in upload_res.json()

