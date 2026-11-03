# Grace Church - Python FastAPI Backend

High-performance REST API backend for Grace Church & Ministries, built with **Python 3.11+** and **FastAPI**. Designed as an independent, decoupled backend service powering the public church website, Master CMS, pastoral prayer portal, and bilingual Holy Bible reader.

---

## Directory Structure

```text
backend/
├── app/
│   ├── __init__.py             # Backend package marker
│   ├── main.py                 # FastAPI application setup, CORS, lifespan, mounts
│   ├── config.py               # Application settings, path resolution, env vars
│   ├── api/
│   │   ├── __init__.py         # API router package
│   │   └── routes.py           # REST endpoints (/books, /chapter, /search, /daily-verse, /health)
│   ├── auth/
│   │   ├── __init__.py
│   │   └── security.py         # JWT tokens, password hashing, admin auth
│   ├── db/
│   │   ├── __init__.py
│   │   └── connection.py       # DB connection re-exports
│   ├── models/
│   │   ├── __init__.py         # Data models package
│   │   └── bible_models.py     # Pydantic validation schemas & response models
│   └── services/
│       ├── __init__.py         # Services package
│       └── bible_service.py    # Business logic: JSON caching, verse search, day-of-year verse
├── cms/                        # Master CMS Feature Module
│   ├── models.py               # SQLAlchemy ORM models for CMS sections
│   ├── repository.py           # Database persistence operations
│   ├── routes.py               # Admin CMS endpoints & public content API
│   ├── schemas.py              # Pydantic schemas for CMS payload validation
│   └── services.py             # Content update & media upload handling
├── database/                   # Database Engine & Local Fallback
│   ├── connection.py           # PostgreSQL pooling with automatic SQLite fallback
│   ├── models.py               # Base declarative models
│   └── prayer_requests.db      # Development & offline SQLite database
├── prayer_requests/            # Pastoral Prayer Requests Feature Module
│   ├── models.py               # Request ticket & attachment ORM models
│   ├── repository.py           # Filtered queries & statistics
│   ├── routes.py               # Submission & pastoral management endpoints
│   ├── schemas.py              # Pydantic request & status update schemas
│   └── services.py             # Business logic, attachments & seeding
├── storage/                    # Private Storage
│   └── prayer_attachments/     # Uploaded voice notes, videos, photos, and PDFs
├── data/                       # Bible datasets & metadata
│   ├── books.json              # 66 Canonical books metadata index
│   ├── daily-verses.json       # 366 Curated daily devotional verses
│   ├── manifest.json           # PWA web application manifest
│   ├── kjv/                    # 66 English King James Version book files
│   └── telugu/                 # 66 Telugu Holy Bible book files
├── scripts/
│   └── generate_daily_verses.py# Script to generate/regenerate 366 daily verses
├── tests/                      # Automated Pytest Test Suite (50 tests)
│   ├── test_admin_integration.py # Admin mounts, redirects & static files
│   ├── test_bible_api.py       # REST API endpoints, CORS, SW headers
│   ├── test_bible_data.py      # 66 books, chapter/verse parity tests
│   ├── test_cms_feature.py     # CMS CRUD operations & asset uploads
│   ├── test_prayer_postgres.py # PostgreSQL connection & fallback tests
│   └── test_prayer_requests_feature.py # Prayer petition submissions & attachments
├── requirements.txt            # Python dependencies
├── run_server.py               # Convenience server startup script
└── README.md                   # This file
```

---

## Prerequisites
- Python 3.10+ (tested with Python 3.11, 3.12, 3.14)
- Packages in `requirements.txt`:
  - `fastapi`
  - `uvicorn[standard]`
  - `pydantic`
  - `sqlalchemy`
  - `psycopg[binary]`
  - `python-multipart`
  - `pyjwt`
  - `passlib[bcrypt]`
  - `httpx`
  - `pytest`

---

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Run the Server**:
   ```bash
   python backend/run_server.py
   ```
   Or using uvicorn directly:
   ```bash
   python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
   ```

3. **Interactive Documentation**:
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Database Architecture

- **Production**: Configured for **PostgreSQL** using SQLAlchemy 2.0 and the Psycopg 3 driver (`postgresql+psycopg://`).
- **Fallback**: If PostgreSQL is not running locally, the database engine automatically falls back to SQLite at `backend/database/prayer_requests.db`.

---

## Running Automated Tests

Run the full automated test suite (50 test cases):
```bash
python -m pytest backend/tests/ -v
```
