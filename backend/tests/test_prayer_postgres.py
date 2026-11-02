"""Comprehensive automated tests for PostgreSQL Prayer Request feature."""
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
from app.db.connection import get_db, init_db, SessionLocal
from app.db.models import PrayerAttachment, PrayerRequest
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    """Ensure database schema is created before tests, and cleans up mock data after tests."""
    init_db()
    yield
    # Clean up test rows and mock data after each test
    db = SessionLocal()
    try:
        db.query(PrayerAttachment).delete()
        db.query(PrayerRequest).delete()
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

    # Clean up any test upload directories in storage
    if settings.STORAGE_DIR.exists():
        import shutil
        for p in settings.STORAGE_DIR.iterdir():
            if p.is_dir() and p.name.startswith("PR-"):
                shutil.rmtree(p, ignore_errors=True)


@pytest.fixture
def admin_token():
    """Authenticate pastoral admin and return JWT bearer token."""
    response = client.post(
        "/api/admin/login",
        json={
            "username": settings.ADMIN_USERNAME,
            "password": settings.ADMIN_PASSWORD,
        },
    )
    assert response.status_code == 200
    data = response.json()
    return data["access_token"]


def test_db_table_initialization():
    """Verify database connection and prayer tables creation."""
    db = SessionLocal()
    try:
        # Check that querying the table does not error
        count = db.query(PrayerRequest).count()
        assert isinstance(count, int)
    finally:
        db.close()


def test_submit_prayer_request_json():
    """Verify public JSON prayer submission persists into database."""
    payload = {
        "name": "David Grace",
        "contact": "david@grace.org | +1-555-0199",
        "category": "Spiritual Growth",
        "request": "Please pray for strength, wisdom, and spiritual clarity.",
        "is_anonymous": False,
        "contact_permission": True,
    }
    response = client.post("/api/prayer-request", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["request_id"].startswith("PR-")
    assert "David Grace" in data["message"]

    # Verify database persistence
    db = SessionLocal()
    try:
        record = db.query(PrayerRequest).filter(PrayerRequest.id == data["request_id"]).first()
        assert record is not None
        assert record.name == "David Grace"
        assert record.email == "david@grace.org"
        assert record.phone == "+1-555-0199"
        assert record.category == "Spiritual Growth"
        assert record.status == "Pending"
        assert record.contact_permission is True
        assert record.is_anonymous is False
    finally:
        db.close()


def test_submit_prayer_request_anonymous():
    """Verify anonymous submission sets flag and hides requester name."""
    payload = {
        "name": "Secret Person",
        "contact": "hidden@example.com",
        "category": "Healing & Health",
        "request": "Praying for inner healing and peace of mind.",
        "is_anonymous": True,
        "contact_permission": False,
    }
    response = client.post("/api/prayer-request", json=payload)
    assert response.status_code == 200
    data = response.json()
    req_id = data["request_id"]

    db = SessionLocal()
    try:
        record = db.query(PrayerRequest).filter(PrayerRequest.id == req_id).first()
        assert record is not None
        assert record.is_anonymous is True
        assert record.name is None
        assert record.email is None
        assert record.contact_permission is False
        # API representation masks identity
        as_dict = record.to_dict()
        assert as_dict["name"] == "Anonymous"
        assert as_dict["email"] is None
    finally:
        db.close()


def test_submit_prayer_request_multipart_with_attachments():
    """Verify multipart/form-data submission with audio and image attachments."""
    fake_audio = io.BytesIO(b"RIFF....WAVEfmt ....data...fake_audio_content")
    fake_image = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR...fake_png_data")

    form_data = {
        "name": "Hannah Samuel",
        "email": "hannah@example.com",
        "phone": "+1-800-PRAY-NOW",
        "category": "Family & Relationships",
        "message": "Praying for unity and blessing over our children.",
        "is_anonymous": "false",
        "contact_permission": "true",
    }
    files = [
        ("attachments", ("prayer_voice.wav", fake_audio, "audio/wav")),
        ("attachments", ("family_photo.png", fake_image, "image/png")),
    ]

    response = client.post("/api/prayer-request", data=form_data, files=files)
    assert response.status_code == 200
    data = response.json()
    req_id = data["request_id"]
    assert req_id.startswith("PR-")

    # Verify database records and foreign key relationship
    db = SessionLocal()
    try:
        record = db.query(PrayerRequest).filter(PrayerRequest.id == req_id).first()
        assert record is not None
        assert len(record.attachments) == 2

        filenames = [att.original_filename for att in record.attachments]
        assert "prayer_voice.wav" in filenames
        assert "family_photo.png" in filenames

        # Verify physical files exist in private storage
        for att in record.attachments:
            full_path = settings.BACKEND_DIR / att.storage_path
            assert full_path.exists()
            assert full_path.stat().st_size > 0
    finally:
        db.close()


def test_admin_authentication_and_jwt():
    """Verify admin login success and failure conditions."""
    # Invalid password
    bad_resp = client.post(
        "/api/admin/login",
        json={"username": settings.ADMIN_USERNAME, "password": "wrong-password"},
    )
    assert bad_resp.status_code == 401

    # Valid credentials
    good_resp = client.post(
        "/api/admin/login",
        json={
            "username": settings.ADMIN_USERNAME,
            "password": settings.ADMIN_PASSWORD,
        },
    )
    assert good_resp.status_code == 200
    token_data = good_resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["role"] == "admin"


def test_admin_unauthorized_endpoints():
    """Verify protected pastoral endpoints require valid bearer token."""
    # Without token
    resp = client.get("/api/admin/prayer-requests")
    assert resp.status_code == 401

    resp_stats = client.get("/api/admin/prayer-requests/stats")
    assert resp_stats.status_code == 401


def test_admin_list_and_search(admin_token):
    """Verify admin can list, filter by status and category, and search."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Submit sample request for this test
    client.post(
        "/api/prayer-request",
        json={
            "name": "David Grace",
            "contact": "david@grace.org",
            "category": "Spiritual Growth",
            "request": "Please pray for strength and spiritual clarity.",
        },
    )

    # List all requests
    resp = client.get("/api/admin/prayer-requests", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "requests" in data
    assert data["total"] >= 1

    # Filter by category
    resp_cat = client.get(
        "/api/admin/prayer-requests?category=Spiritual Growth",
        headers=headers,
    )
    assert resp_cat.status_code == 200
    cat_data = resp_cat.json()
    for item in cat_data["requests"]:
        assert "Spiritual Growth" in item["category"]

    # Filter by status
    resp_status = client.get(
        "/api/admin/prayer-requests?status=Pending",
        headers=headers,
    )
    assert resp_status.status_code == 200
    for item in resp_status.json()["requests"]:
        assert item["status"] == "Pending"


def test_admin_update_status_and_notes(admin_token):
    """Verify admin can update prayer status to 'Prayed' and append pastoral notes."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    # First submit a request
    submit_resp = client.post(
        "/api/prayer-request",
        json={
            "name": "Sister Mary",
            "contact": "mary@example.org",
            "category": "Guidance & Wisdom",
            "request": "Seeking God's direction for upcoming ministry transition.",
        },
    )
    req_id = submit_resp.json()["request_id"]

    # Update status to 'Prayed'
    update_payload = {
        "status": "Prayed",
        "pastoral_notes": "Pastoral intercessory team prayed during Tuesday night vigil.",
    }
    patch_resp = client.patch(
        f"/api/admin/prayer-requests/{req_id}",
        json=update_payload,
        headers=headers,
    )
    assert patch_resp.status_code == 200
    updated = patch_resp.json()
    assert updated["status"] == "Prayed"
    assert "Tuesday night vigil" in updated["pastoral_notes"]


def test_admin_attachment_streaming(admin_token):
    """Verify streaming private attachments with proper authorization and MIME headers."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create request with a test text document
    fake_doc = io.BytesIO(b"Pastoral prayer letter document content for testing.")
    files = [("attachments", ("prayer_letter.txt", fake_doc, "text/plain"))]
    form_data = {
        "name": "Elder John",
        "contact": "john@elder.org",
        "category": "Church Leadership",
        "message": "Enclosed prayer agenda for the elders meeting.",
    }

    sub_resp = client.post("/api/prayer-request", data=form_data, files=files)
    req_id = sub_resp.json()["request_id"]

    # Retrieve request details to get attachment ID
    detail_resp = client.get(f"/api/admin/prayer-requests/{req_id}", headers=headers)
    assert detail_resp.status_code == 200
    attachments = detail_resp.json()["attachments"]
    assert len(attachments) == 1
    att_id = attachments[0]["id"]

    # Download/stream without token -> must fail 401
    fail_dl = client.get(f"/api/admin/prayer-requests/{req_id}/attachments/{att_id}")
    assert fail_dl.status_code == 401

    # Download/stream with valid token -> must succeed 200
    good_dl = client.get(
        f"/api/admin/prayer-requests/{req_id}/attachments/{att_id}",
        headers=headers,
    )
    assert good_dl.status_code == 200
    assert b"Pastoral prayer letter document content" in good_dl.content


def test_admin_stats(admin_token):
    """Verify summary counts of total, pending, prayed, and category breakdown."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Submit sample request for this test
    client.post(
        "/api/prayer-request",
        json={
            "name": "Sister Faith",
            "contact": "faith@example.org",
            "category": "Praise & Thanksgiving",
            "request": "Thanking God for prayers answered this week.",
        },
    )

    resp = client.get("/api/admin/prayer-requests/stats", headers=headers)
    assert resp.status_code == 200
    stats = resp.json()
    assert "total_requests" in stats
    assert "pending_requests" in stats
    assert "prayed_requests" in stats
    assert "by_category" in stats
    assert stats["total_requests"] >= 1


def test_admin_delete_request(admin_token):
    """Verify deleting a prayer request removes DB records and storage files."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create request with an attachment to delete
    fake_doc = io.BytesIO(b"Delete me soon")
    files = [("attachments", ("to_delete.txt", fake_doc, "text/plain"))]
    form_data = {
        "name": "Temporary Requester",
        "contact": "temp@example.org",
        "category": "Other Needs",
        "message": "Temporary prayer request to be removed.",
    }
    sub_resp = client.post("/api/prayer-request", data=form_data, files=files)
    req_id = sub_resp.json()["request_id"]

    # Confirm storage folder exists
    storage_folder = settings.STORAGE_DIR / req_id
    assert storage_folder.exists()

    # Delete
    del_resp = client.delete(f"/api/admin/prayer-requests/{req_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "deleted"

    # Confirm DB record is gone
    get_resp = client.get(f"/api/admin/prayer-requests/{req_id}", headers=headers)
    assert get_resp.status_code == 404

    # Confirm physical storage files are removed
    assert not storage_folder.exists()


def test_pastoral_admin_html_served():
    """Verify pastoral admin portal HTML page is served correctly."""
    response = client.get("/prayer-request/admin.html")
    assert response.status_code == 200
    assert "Pastoral Prayer Admin Portal" in response.text
