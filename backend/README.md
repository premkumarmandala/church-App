# Grace Church - Python FastAPI Backend

High-performance REST API backend for Grace Church & Ministries, built with **Python** and **FastAPI**. Designed as an independent, modular service ready to power web portals, mobile applications (iOS/Android), and future frontends.

---

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py             # Backend package marker
│   ├── main.py                 # FastAPI application setup, CORS, lifespan, mounts
│   ├── config.py               # Application settings, path resolution, env vars
│   ├── api/
│   │   ├── __init__.py         # API router package
│   │   └── routes.py           # REST endpoints (/books, /chapter, /search, /daily-verse, /health)
│   ├── models/
│   │   ├── __init__.py         # Data models package
│   │   └── bible_models.py     # Pydantic validation schemas & response models
│   └── services/
│       ├── __init__.py         # Services package
│       └── bible_service.py    # Business logic: JSON caching, verse search, day-of-year verse
├── data/                       # Bible datasets & metadata
│   ├── books.json              # 66 Canonical books metadata index
│   ├── daily-verses.json       # 366 Curated daily devotional verses
│   ├── manifest.json           # PWA web application manifest
│   ├── kjv/                    # 66 English King James Version book files
│   └── telugu/                 # 66 Telugu Holy Bible book files
├── scripts/
│   └── generate_daily_verses.py# Script to generate/regenerate 366 daily verses
├── tests/
│   ├── __init__.py             # Tests package
│   ├── test_bible_api.py       # Pytest suite for all REST API endpoints & CORS
│   └── test_bible_data.py      # Validation tests for 66 books, chapter/verse parity
├── requirements.txt            # Python dependencies
├── run_server.py               # Convenience server startup script
└── README.md                   # This file
```

---

## Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Packages in `requirements.txt`:
  - `fastapi`
  - `uvicorn[standard]`
  - `pydantic`
  - `pytest`
  - `httpx`

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
   - **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## API Endpoints Reference

### 1. Canonical Books List
- **Method**: `GET`
- **Path**: `/api/bible/books`
- **Description**: Returns all 66 canonical books metadata (English & Telugu names, testament, chapter counts).
- **Example**:
  ```bash
  curl http://localhost:8000/api/bible/books
  ```

### 2. Scripture Chapter Text
- **Method**: `GET`
- **Path**: `/api/bible/chapter`
- **Query Parameters**:
  - `translation` (`kjv` | `telugu`, default: `kjv`)
  - `book` (slug or name, e.g. `genesis` or `john`)
  - `chapter` (integer, e.g. `1` or `3`)
  - `parallel` (boolean `true` | `false`, default: `false`)
- **Example**:
  ```bash
  # Genesis 1 in KJV
  curl "http://localhost:8000/api/bible/chapter?translation=kjv&book=genesis&chapter=1"

  # John 3 in Telugu with parallel KJV
  curl "http://localhost:8000/api/bible/chapter?translation=telugu&book=john&chapter=3&parallel=true"
  ```

### 3. Full-Text Verse Search
- **Method**: `GET`
- **Path**: `/api/bible/search`
- **Query Parameters**:
  - `q` (search term, e.g. `salvation` or `ప్రేమ`)
  - `translation` (`kjv` | `telugu`, default: `kjv`)
  - `testament` (`all` | `ot` | `nt`, default: `all`)
  - `book` (optional book slug filter)
  - `limit` (default: `50`, max: `500`)
- **Example**:
  ```bash
  curl "http://localhost:8000/api/bible/search?q=salvation&translation=kjv&limit=5"
  ```

### 4. Verse of the Day
- **Method**: `GET`
- **Path**: `/api/bible/daily-verse`
- **Description**: Returns curated devotional verse for today in both English and Telugu.
- **Example**:
  ```bash
  curl http://localhost:8000/api/bible/daily-verse
  ```

### 5. Dataset Validation Parity
- **Method**: `GET`
- **Path**: `/api/bible/validate`
- **Description**: Confirms 66 books, 31,102 verses per translation, and 100% parity.

---

## Multi-Frontend Compatibility

This backend is decoupled from any single frontend:
- **CORS Enabled**: Out of the box, `CORSMiddleware` allows any origin, method, and header. Any external frontend (React, Next.js, Vue, mobile apps, Flutter) running on different ports or domains can connect without proxy setup.
- **Strict OpenAPI Contracts**: Standardized Pydantic schemas allow easy generation of TypeScript types, OpenAPI clients, or SDKs using tools like `openapi-typescript` or `openapi-generator`.

---

## Running Automated Tests

Run the full automated test suite (25 tests covering API routes, boundary validation, and dataset integrity):
```bash
python -m pytest backend/tests/ -v
```
