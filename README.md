# Grace Church & Ministries - Full-Stack Application Platform

A modern, production-grade Church Web Platform, Master Content Management System (CMS), Pastoral Prayer Portal, and Bilingual Online Holy Bible. Built with a decoupled **Python FastAPI** backend, a **PostgreSQL** database (with automatic **SQLite** fallback), and modular **React (JSX)** frontends styled with centralized design tokens.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Architecture Overview](#architecture-overview)
3. [Project Directory Structure](#project-directory-structure)
4. [Database & Storage Architecture](#database--storage-architecture)
5. [Admin CMS & Pastoral Dashboard](#admin-cms--pastoral-dashboard)
6. [Online Bible Application](#online-bible-application)
7. [Pastoral Prayer Request System](#pastoral-prayer-request-system)
8. [Quick Start Guide](#quick-start-guide)
9. [Automated Testing](#automated-testing)
10. [Production Deployment](#production-deployment)
11. [License & Attribution](#license--attribution)

---

## Key Features

### 🏛️ Church Public Website & Portals
- **Homepage & Media Showcase**: Dynamic welcome hero, Verse of the Day, upcoming events, recent sermon archives, ministries showcase, and church bulletin announcements.
- **Bilingual Holy Bible Reader**: English King James Version (KJV) and Telugu పరిశుద్ధ గ్రంథము with verse-by-verse parallel comparison, audio-friendly layout, and instant search across all 31,102 verses.
- **Community Prayer Petition Portal**: Public portal for submitting prayer requests with voice note recording, photo/video media uploads, and confidential medical/prayer document attachments.
- **Responsive Design**: Mobile-first, responsive layouts across desktop, tablet, and smartphone screens.

### 🛡️ Master CMS & Pastoral Admin Dashboard
- **Centralized Content Management**: Update and manage all public website text, images, banners, sermon recordings, event schedules, and service timings without editing source code.
- **Reference UI Design**: Corporate white-and-navy aesthetic, soft pastel KPI stat cards, dynamic windowed pagination, inline filter tabs, category pills, and search toolbar.
- **Pastoral Prayer Management**: Review petitions, stream recorded audio voice notes, preview video/photo attachments, inspect PDF documents, toggle status (`Pending`, `Prayed`, `Archived`), and record pastoral notes.
- **Role-Based Security**: Protected with JWT Bearer authentication, PBKDF2/bcrypt credential hashing, and secure session management.

---

## Architecture Overview

```
                          ┌─────────────────────────────────────┐
                          │     Client Browsers & PWA Cache     │
                          └──────────────────┬──────────────────┘
                                             │ HTTP / HTTPS (JSON & Multipart)
                                             ▼
                          ┌─────────────────────────────────────┐
                          │        FastAPI Unified Server       │
                          │   Port 8000 (Local) / $PORT (Cloud) │
                          └──────┬───────────┬────────────┬─────┘
                                 │           │            │
           ┌─────────────────────┴──┐        │            └─────────────────────┐
           ▼                        ▼        ▼                                  ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  Church Public UI   │  │   Pastoral Admin    │  │  PostgreSQL / DB    │  │  Canonical JSON     │
│  / & /bible/        │  │   /admin/ CMS       │  │  (SQLite Fallback)  │  │  66 Books & Daily   │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## Project Directory Structure

```text
Church App/
├── backend/                             # Python FastAPI Backend & Data Services
│   ├── app/                             # Core Application Package
│   │   ├── api/                         # Scripture & System Routes (/books, /chapter, /search, /health)
│   │   ├── auth/                        # Security utilities, JWT token creation, password hashing
│   │   ├── db/                          # Database connection re-exports and models
│   │   ├── models/                      # Pydantic validation schemas & API contracts
│   │   ├── services/                    # Scripture services, caching, search algorithms
│   │   ├── config.py                    # Environment settings, directory resolution, CORS
│   │   └── main.py                      # FastAPI app entry point, lifespan, static file mounts
│   ├── cms/                             # Master CMS Feature Module
│   │   ├── models.py                    # SQLAlchemy ORM models for all 12 CMS sections
│   │   ├── repository.py                # Database persistence layer for CMS content
│   │   ├── routes.py                    # Admin & public CMS REST endpoints
│   │   ├── schemas.py                   # Pydantic schemas for content creation & editing
│   │   └── services.py                  # CMS business logic and image upload handlers
│   ├── data/                            # Canonical Scripture Datasets (JSON)
│   │   ├── books.json                   # 66 Canonical Bible books metadata
│   │   ├── daily-verses.json            # 366 Curated daily devotional verses
│   │   ├── manifest.json                # PWA web manifest
│   │   ├── kjv/                         # 66 English KJV book JSON files
│   │   └── telugu/                      # 66 Telugu పరిశుద్ధ గ్రంథము book JSON files
│   ├── database/                        # Database Infrastructure & Fallbacks
│   │   ├── connection.py                # PostgreSQL connection pool with transparent SQLite fallback
│   │   ├── models.py                    # Base SQLAlchemy declarative models
│   │   └── prayer_requests.db           # Local SQLite database (development & offline fallback)
│   ├── prayer_requests/                 # Pastoral Prayer Requests Feature Module
│   │   ├── models.py                    # Prayer request & attachment ORM models
│   │   ├── repository.py                # Database query operations and metrics
│   │   ├── routes.py                    # Public submission & protected admin routes
│   │   ├── schemas.py                   # Request validation & response schemas
│   │   └── services.py                  # Prayer request lifecycle, seeders & file cleanup
│   ├── storage/                         # Private Server Storage
│   │   └── prayer_attachments/          # Physical directory for user uploaded media files
│   ├── tests/                           # Automated Pytest Test Suites (50 tests)
│   │   ├── test_admin_integration.py    # End-to-end admin static mounts, redirects & routes
│   │   ├── test_bible_api.py            # Scripture endpoints, CORS, redirects, and SW headers
│   │   ├── test_bible_data.py           # 66 books and 31,102 verses parity verification
│   │   ├── test_cms_feature.py          # CMS CRUD operations & asset uploads
│   │   ├── test_prayer_postgres.py      # Database engine & pooling tests
│   │   └── test_prayer_requests_feature.py # Prayer request submissions, queries & attachments
│   ├── requirements.txt                 # Python package dependencies
│   └── run_server.py                    # Uvicorn server launcher
│
├── frontend/                            # Modular Frontend Applications (React JSX)
│   ├── admin/                           # Master CMS & Pastoral Prayer Admin Dashboard
│   │   ├── components/                  # Reusable CMS form fields, badges, uploaders, modals
│   │   ├── layout/                      # Master Admin Sidebar, Topbar & Header
│   │   ├── dashboard/                   # Dashboard metrics overview & quick actions
│   │   ├── home/                        # Homepage content management module
│   │   ├── about/                       # Church history, mission & vision CMS module
│   │   ├── sermons/                     # Sermons archive & video manager
│   │   ├── events/                      # Church calendar & event registration manager
│   │   ├── ministries/                  # Ministries CMS module
│   │   ├── gallery/                     # Photo & video gallery manager
│   │   ├── users/                       # Staff & administrator account manager
│   │   ├── services/                    # CMS API client with JWT bearer authentication
│   │   ├── prayer-requests/             # Pastoral Prayer Request Dashboard Feature
│   │   │   ├── components/              # KPI cards, filter toolbar, table, modals, pagination
│   │   │   ├── pages/                   # DashboardPage & PrayerRequestsPage
│   │   │   ├── services/                # Dedicated prayer requests API client
│   │   │   ├── styles/                  # admin.css (Admin Master Stylesheet)
│   │   │   ├── AdminPrayerRequests.jsx  # Prayer requests feature root application
│   │   │   └── prayer-requests.bundle.jsx # Standalone prayer requests feature bundle
│   │   ├── AdminCMSApp.jsx              # Master CMS root container & router
│   │   ├── cms.bundle.jsx               # Master CMS compiled application bundle
│   │   └── index.html                   # Admin portal HTML mounting point (/admin/)
│   │
│   ├── bible/                           # Online Holy Bible React Web Application
│   │   ├── components/                  # Reader, PassageNavigation, SearchPanel, Bookmarks
│   │   ├── assets/                      # Hero and banner photography
│   │   ├── BibleApp.jsx                 # Main Bible React application container
│   │   ├── bible-react.css              # Minimalist editorial typography & dual-theme CSS
│   │   ├── mockData.js                  # Standalone offline Bible metadata fallback
│   │   ├── sw.js                        # Progressive Web App offline caching Service Worker
│   │   └── index.html                   # Online Bible HTML mounting point (/bible/)
│   │
│   ├── home/                            # Church Public Landing Page Components
│   │   ├── assets/                      # Photography, logos, and banner assets
│   │   ├── components/                  # Hero, Verse of the Day, Ministries, Events sections
│   │   └── HomePage.jsx                 # Public home container loading dynamic CMS content
│   │
│   ├── prayer-request/                  # Public Prayer Petition Submission Portal
│   │   ├── components/                  # AudioRecorder, MediaUploader, PrayerForm, Guidelines
│   │   ├── prayer-request.css           # Public prayer portal styling
│   │   └── index.html                   # Prayer portal HTML mounting point (/prayer-request/)
│   │
│   ├── design-tokens.css                # Centralized CSS variables (Colors, Typography, Spacing)
│   └── index.html                       # Church website main landing page (/)
│
├── dist/                                # Distribution build directory generated by build.js
├── docs/                                # Project documentation & licensing information
│   └── BIBLE_SOURCES_AND_LICENSING.md   # Canonical Scripture provenance & MIT attribution
├── scripts/
│   └── build.js                         # Bundler & packaging script for CMS and static assets
├── render.yaml                          # Production Render blueprint deployment configuration
└── README.md                            # Main project documentation (this file)
```

---

## Database & Storage Architecture

The application uses a **hybrid, highly resilient data architecture**:

### 1. Primary Production Database: PostgreSQL
- **Driver & ORM**: **SQLAlchemy 2.0** with **Psycopg 3** (`postgresql+psycopg://`).
- **Connection Configuration**: Configured via standard `DATABASE_URL` or discrete parameters (`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`).
- **Connection Pooling**: Configured with `pool_size=10`, `max_overflow=20`, `pool_pre_ping=True`, and automatic connection recycling.
- **Managed Tables**:
  - `cms_sections`: Consolidated CMS records storing section content, attributes, dates, and media links.
  - `prayer_requests`: Prayer petition tickets, requester identity, privacy flags, and status.
  - `prayer_attachments`: File metadata, MIME types, file sizes, and private storage references.
  - `admin_users`: Staff and administrator user accounts, role definitions, and hashed passwords.

### 2. Automatic Development & Offline Fallback: SQLite
- **Location**: `backend/database/prayer_requests.db`.
- **Behavior**: If PostgreSQL is not installed locally or becomes unreachable, the database engine in [`backend/database/connection.py`](file:///c:/my%20projects/Church%20App/backend/database/connection.py) seamlessly falls back to the local SQLite database. All API routes, migrations, and test suites operate without disruption.

### 3. Scripture Dataset: File-Based JSON Store
- **Location**: `backend/data/` (`books.json`, `kjv/*.json`, `telugu/*.json`).
- **Performance**: Pre-warmed and indexed into memory on startup by `BibleService`. Provides instantaneous chapter retrieval and multi-attribute keyword search without querying relational database tables.

### 4. Private Media Storage
- Uploaded prayer voice notes, videos, photos, and medical documents are saved directly to private disk storage at `backend/storage/prayer_attachments/<request_id>/` and served strictly to authenticated administrators via authorization-protected streaming endpoints.

---

## Admin CMS & Pastoral Dashboard

The Admin Portal is accessible at **`/admin/`**.

### Default Pastoral Credentials
| Field | Value |
| :--- | :--- |
| **Username** | `pastor` |
| **Password** | `GraceChurch2026!` |

*(Credentials and JWT secret can be customized via environment variables `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_JWT_SECRET`.)*

### Core Modules
1. **Dashboard Overview**: 4 soft-tinted KPI metric cards (Total Requests, Pending, Prayed, Archived), live prayer request feed, dynamic windowed pagination, and inline status tabs.
2. **Prayer Requests**: Detailed pastoral review, audio player for voice notes, thumbnail preview for photos/videos, secure document viewer for medical PDFs, and status transitions.
3. **Home & Sections**: Manage hero banners, welcome messages, button links, announcements, and Verse of the Day.
4. **Sermons**: Manage video recordings, thumbnails, speaker names, Bible passages, and publication dates.
5. **Events**: Publish upcoming church gatherings, conferences, venue locations, and registration links.
6. **Ministries**: Highlight ministry branches (Youth, Worship, Sunday School, Missions) with descriptions and photos.
7. **Gallery**: Upload, categorize, and organize church photo and video albums.
8. **Users & Team**: Manage pastoral staff, prayer coordinators, and administrator accounts.
9. **Settings**: Church logo, contact details, social media links, service timings, and SEO metadata.

---

## Online Bible Application

The Online Bible reader is accessible at **`/bible/`**.

- **Canonical Parity**: Contains all 66 books of the Old and New Testaments in both English (KJV) and Telugu (పరిశుద్ధ గ్రంథము).
- **Passage Selector**: Filter by Testament (`All`, `Old Testament`, `New Testament`) and select Book, Chapter, and Verse.
- **Synchronized Parallel Reading**: Compare English and Telugu side-by-side with synchronized verse numbering.
- **Account-Free Bookmarks**: Verses can be bookmarked and persisted directly in `localStorage`.
- **Search Engine**: Search across 31,102 verses with testament scoping, direct reference jump (`John 3:16`), and keyword highlighting.
- **PWA & Offline Mode**: Registered Service Worker (`sw.js`) caches read chapters for complete offline reading.

---

## Pastoral Prayer Request System

The public prayer request portal is accessible at **`/prayer-request/`**.

- **Category Selection**: Health & Healing, Family, Employment & Financial, Education, Spiritual Growth, or General Need.
- **Confidentiality & Privacy**: Option to submit anonymously or request pastoral contact.
- **Media Attachments**:
  - Integrated in-browser microphone audio recorder for voice notes.
  - Photo and video uploader with client-side preview.
  - Document uploader supporting PDF and Word files.
- **Submission Confirmation**: Issues a unique reference tracking ID (e.g. `PR-20261102-A1B2C3`).

---

## Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** (tested with Python 3.11 and 3.12)
- **Node.js 18+** (for bundle packaging script)
- Optional: **PostgreSQL 14+** (SQLite fallback is used automatically if omitted)

### 2. Installation

Clone the repository and install backend dependencies:
```bash
# Clone the repository
git clone https://github.com/your-org/church-app.git
cd "Church App"

# Install Python dependencies
pip install -r backend/requirements.txt
```

### 3. Run the Unified Server

Start the application using the launcher script:
```bash
python backend/run_server.py
```

The server starts at **`http://localhost:8000/`**:

| Application Endpoint | URL | Description |
| :--- | :--- | :--- |
| **Church Main Website** | `http://localhost:8000/` | Public homepage and church sections |
| **Online Holy Bible** | `http://localhost:8000/bible/` | Bilingual KJV & Telugu Scripture reader |
| **Prayer Request Portal** | `http://localhost:8000/prayer-request/` | Public prayer submission with media upload |
| **Pastoral Admin & CMS** | `http://localhost:8000/admin/` | Admin Dashboard and website CMS |
| **Interactive API Docs** | `http://localhost:8000/docs` | Swagger UI for exploring REST endpoints |
| **ReDoc Documentation** | `http://localhost:8000/redoc` | Alternative OpenAPI specification view |
| **Health Check** | `http://localhost:8000/api/health` | Service uptime and status endpoint |

### 4. Build Bundles (Optional)

When modifying admin components or preparing for distribution:
```bash
node scripts/build.js
```
This updates `prayer-requests.bundle.jsx`, `cms.bundle.jsx`, and populates the `dist/` directory.

---

## Automated Testing

The backend includes a comprehensive **Pytest** test suite with **50 automated test cases**:

```bash
# Run all tests
python -m pytest backend/tests/ -v
```

### Test Coverage Highlights
- **`test_admin_integration.py`**: Validates static file serving, URL redirects (`/admin` $\rightarrow$ `/admin/`, `/bible` $\rightarrow$ `/bible/`), and HTML mounting.
- **`test_bible_api.py`**: Tests all Scripture REST endpoints, CORS headers, Service Worker caching headers, and validation errors.
- **`test_bible_data.py`**: Verifies exact canonical parity across all 66 books, chapter counts, and 31,102 verses in English and Telugu.
- **`test_cms_feature.py`**: Tests CMS authentication, module updates, media uploads, and publishing workflows.
- **`test_prayer_postgres.py`**: Validates PostgreSQL connection pooling and graceful SQLite fallback.
- **`test_prayer_requests_feature.py`**: Tests prayer petition submission (JSON & multipart/form-data), search filtering, metrics, and attachment retrieval.

---

## Production Deployment

### Deploying to Render.com

The project includes a ready-to-deploy [`render.yaml`](file:///c:/my%20projects/Church%20App/render.yaml) blueprint:

1. Connect your repository to **Render.com**.
2. Create a new **Web Service** or use **Blueprints** with `render.yaml`.
3. Set Environment Configuration:
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python backend/run_server.py`
4. Set Environment Variables in Render:
   - `PYTHON_VERSION`: `3.11.9`
   - `HOST`: `0.0.0.0`
   - `DATABASE_URL`: `postgresql+psycopg://user:password@host:port/dbname` (Optional, defaults to SQLite)
   - `ADMIN_USERNAME`: Your chosen admin username
   - `ADMIN_PASSWORD`: Your chosen strong admin password
   - `ADMIN_JWT_SECRET`: A long random secret key

---

## License & Attribution

- **Scripture Datasets**: English King James Version (KJV) is in the Public Domain. The Telugu Bible (పరిశుద్ధ గ్రంథము) text is provided for church, devotional, and educational use under fair-use guidelines. See [`docs/BIBLE_SOURCES_AND_LICENSING.md`](file:///c:/my%20projects/Church%20App/docs/BIBLE_SOURCES_AND_LICENSING.md) for full attribution.
- **Application Code**: Licensed under the **MIT License**.
