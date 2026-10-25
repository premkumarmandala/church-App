# Grace Church & Ministries - Application Platform

A modern, full-stack Church web portal and Online Holy Bible application with a decoupled architecture. The backend is built with **Python FastAPI**, and the frontend is organized in an independent directory, ready to serve current web interfaces as well as future web or mobile frontends.

---

## Project Structure

The project has been restructured with clear separation of concerns, meaningful folder and file names, and full decoupling between frontend and backend:

```
Church App/
├── backend/                    # Python FastAPI Backend API & Data
│   ├── app/                    # Application source code
│   │   ├── api/                # API route definitions (/books, /chapter, /search, /daily-verse, /health)
│   │   │   ├── __init__.py
│   │   │   └── routes.py
│   │   ├── models/             # Pydantic schemas and data contracts
│   │   │   ├── __init__.py
│   │   │   └── bible_models.py
│   │   ├── services/           # Business logic, in-memory caching & verse search
│   │   │   ├── __init__.py
│   │   │   └── bible_service.py
│   │   ├── config.py           # Configuration settings and directory paths
│   │   └── main.py             # FastAPI entry point, CORS middleware, static mounts
│   ├── data/                   # Canonical Bible datasets (KJV & Telugu)
│   │   ├── books.json          # 66 Canonical books index
│   │   ├── daily-verses.json   # 366 Curated daily verses
│   │   ├── manifest.json       # PWA manifest
│   │   ├── kjv/                # 66 English KJV book JSON files
│   │   └── telugu/             # 66 Telugu Holy Bible book JSON files
│   ├── scripts/                # Backend utility scripts
│   │   └── generate_daily_verses.py # Daily verses generation tool
│   ├── tests/                  # Pytest automated test suites
│   │   ├── test_bible_api.py   # REST API endpoint and CORS tests
│   │   └── test_bible_data.py  # 66 books and 31,102 verses parity tests
│   ├── requirements.txt        # Python package dependencies
│   ├── run_server.py           # Server runner script
│   └── README.md               # Backend documentation
│
├── frontend/                   # Frontend Web Applications
│   ├── bible/                  # Online Bible web application module
│   │   ├── index.html          # Bible reader UI
│   │   ├── bible-app.js        # Main coordinator & state management
│   │   ├── bible-reader.js     # Typography & passage renderer
│   │   ├── bible-navigation.js # Book & chapter picker
│   │   ├── bible-search.js     # Scripture keyword search
│   │   ├── bible-daily-verse.js# Daily verse widget
│   │   ├── bible-bookmarks.js  # Bookmarks & favorites manager
│   │   ├── bible-offline.js    # Offline storage & caching manager
│   │   ├── bible-styles.css    # Responsive styling & themes
│   │   ├── sw.js               # Service Worker for offline PWA
│   │   └── README.md           # Module documentation
│   ├── index.html              # Church website main landing page
│   └── README.md               # Frontend documentation
│
├── docs/                       # Project Documentation & Specifications
│   ├── BIBLE_SOURCES_AND_LICENSING.md
│   ├── User Website Features Report.pdf
│   └── Website Feature Report.pdf
│
└── README.md                   # Workspace documentation (this file)
```

---

## Quick Start Guide

### 1. Run the Python FastAPI Backend

From the project root:
```bash
python backend/run_server.py
```

The server will start at `http://localhost:8000/`.

- **Church Website**: [http://localhost:8000/](http://localhost:8000/)
- **Online Bible**: [http://localhost:8000/bible/](http://localhost:8000/bible/)
- **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 2. Run Automated Tests

The backend includes a comprehensive Pytest test suite covering all REST endpoints, CORS headers, error boundaries, and dataset parity:

```bash
python -m pytest backend/tests/ -v
```

---

## Future Frontend Compatibility

The backend is built as a standalone REST API with:
- **Full CORS Support**: Enabled for all origins (`*`), methods, and headers.
- **Multi-Client Ready**: Easily connects to future frontends (React, Next.js, Vue, Svelte, iOS/Android with Flutter or React Native).
- **Configurable API Endpoint**: The frontend supports `window.API_BASE_URL` (or `.env` in React/Vite) so external apps running on ports such as `http://localhost:5173` or custom domains can connect seamlessly.
