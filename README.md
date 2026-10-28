# Grace Church & Ministries - Application Platform

A modern, full-stack Church web portal and Online Holy Bible application with a decoupled architecture. The backend is built with **Python FastAPI**, and the frontend is organized in a modular, independent directory, ready to serve current web interfaces as well as future web or mobile frontends.

---

## Project Structure

The project has been structured with clear separation of concerns, meaningful folder and file names, and full decoupling between frontend and backend:

```
Church App/
├── .agents/                    # Agent customizations, workflows & hooks
│   └── hooks.json              # Agent lifecycle hooks
├── .catalystrc                 # Zoho Catalyst configuration & active project mapping
├── .gitignore                  # Git version control ignore rules
│
├── backend/                    # Python FastAPI Backend API & Data
│   ├── app/                    # Application source code
│   │   ├── api/                # API route definitions (/books, /chapter, /search, /daily-verse, /validate, /health)
│   │   │   ├── __init__.py
│   │   │   └── routes.py       # REST API endpoints & query handlers
│   │   ├── models/             # Pydantic schemas and data contracts
│   │   │   ├── __init__.py
│   │   │   └── bible_models.py # Pydantic response models
│   │   ├── services/           # Business logic, in-memory caching & verse search
│   │   │   ├── __init__.py
│   │   │   └── bible_service.py# In-memory Scripture search & data provider
│   │   ├── config.py           # Configuration settings, paths & CORS options
│   │   └── main.py             # FastAPI entry point, CORS middleware, static mounts & SW headers
│   ├── data/                   # Canonical Bible datasets (KJV & Telugu)
│   │   ├── books.json          # 66 Canonical books index
│   │   ├── daily-verses.json   # 366 Curated daily verses
│   │   ├── manifest.json       # PWA manifest
│   │   ├── kjv/                # 66 English KJV book JSON files
│   │   └── telugu/             # 66 Telugu Holy Bible book JSON files
│   ├── scripts/                # Backend utility scripts
│   │   └── generate_daily_verses.py # Daily verses generation tool
│   ├── tests/                  # Pytest automated test suites (27 tests)
│   │   ├── test_bible_api.py   # REST API endpoint, redirect, CORS & SW tests
│   │   └── test_bible_data.py  # 66 books and 31,102 verses parity tests
│   ├── requirements.txt        # Python package dependencies
│   ├── run_server.py           # Server runner script (Uvicorn)
│   └── README.md               # Backend documentation
│
├── frontend/                   # Frontend Web Applications
│   ├── bible/                  # Online Bible web application module
│   │   ├── index.html          # Bible reader UI (with Book, Chapter & Verse selectors)
│   │   ├── bible-app.js        # Main coordinator, state management & verse selector
│   │   ├── bible-reader.js     # Typography & passage renderer (Single & Parallel views)
│   │   ├── bible-navigation.js # Book, chapter & verse routing with URL hash sync
│   │   ├── bible-search.js     # Scripture keyword search engine (online & offline)
│   │   ├── bible-daily-verse.js# Daily verse devotional widget
│   │   ├── bible-bookmarks.js  # Account-free local bookmarks manager (localStorage)
│   │   ├── bible-offline.js    # Offline storage & caching manager (Cache API)
│   │   ├── bible-styles.css    # Minimalist design system (Warm White, Navy, Antique Gold)
│   │   ├── sw.js               # Service Worker for offline PWA caching
│   │   └── README.md           # Module documentation
│   ├── index.html              # Grace Church website main landing page
│   └── README.md               # Frontend documentation
│
├── docs/                       # Project Documentation & Specifications
│   ├── BIBLE_SOURCES_AND_LICENSING.md # Data provenance & MIT licensing info
│   ├── User Website Features Report.pdf
│   └── Website Feature Report.pdf
│
└── README.md                   # Main workspace documentation (this file)
```

---

## Core Features

- **Minimalist Editorial UI**: Designed with a warm white paper background (`#FBF9F5`), deep royal navy text (`#0F1E36`), and subtle antique gold accents (`#B8860B`).
- **Book Typography**: Editorial serif reading font (`Lora` for English, `Noto Serif Telugu` for Telugu) with comfortable `1.9` line spacing, optimal line measure, and clear verse numbers.
- **Passage Selector**: Seamless navigation across all 66 books with **Book**, **Chapter**, and **Verse** dropdown selectors.
- **Parallel Bilingual Reading**: Side-by-side synchronized dual-column view comparing English KJV and Telugu Holy Bible verse-by-verse.
- **Account-Free Bookmarks**: Save favorite verses directly to your local browser storage (`localStorage`) without requiring account sign-ins.
- **Full-Text Scripture Search**: Instant search across 31,102 verses with testament scoping, direct reference jump (`John 3:16`), and gold keyword highlighting.
- **Verse of the Day**: Curated daily devotional verse in English and Telugu with 1-click chapter jump and clipboard copy.
- **PWA & Offline Capability**: Progressive Web App with Service Worker (`sw.js`) and Cache API support for reading and searching completely offline.
- **Dual-Theme Support**: Effortlessly switch between the default Minimalist Warm White theme and the Sanctuary Midnight Dark theme.
- **Zoho Catalyst Integration**: Configured with `.catalystrc` for seamless deployment and cloud scaling.

---

## Quick Start Guide

### 1. Run the Python FastAPI Backend

From the project root:
```bash
python backend/run_server.py
```

The server will start at `http://localhost:8000/`.

- **Grace Church Website**: [http://localhost:8000/](http://localhost:8000/)
- **Online Bible Portal**: [http://localhost:8000/bible/](http://localhost:8000/bible/)
- **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 2. Run Automated Tests

The backend includes a comprehensive Pytest test suite covering all REST endpoints, CORS headers, URL redirects, Service Worker headers, error boundaries, and dataset parity (27 tests):

```bash
python -m pytest backend/tests/ -v
```

---

## Multi-Frontend Compatibility

The backend is built as a standalone REST API with:
- **Full CORS Support**: Enabled for all origins (`*`), methods, and headers.
- **Multi-Client Ready**: Easily connects to future frontends (React, Next.js, Vue, Svelte, iOS/Android with Flutter or React Native).
- **Configurable API Endpoint**: The frontend supports `window.API_BASE_URL` (or `.env` in modern frameworks) so external applications running on custom ports or domains can connect seamlessly.
