# Grace Church - Frontend Web Applications

This directory contains the user-facing web applications for Grace Church & Ministries, organized cleanly in one dedicated frontend folder.

---

## Directory Structure

```
frontend/
├── index.html                  # Grace Church main portal landing page
├── bible/                      # Online Bible web application module
│   ├── index.html              # Bible reader user interface
│   ├── bible-app.js            # Main application coordinator & state manager
│   ├── bible-reader.js         # Scripture chapter rendering & typography
│   ├── bible-navigation.js     # Book, chapter, and testament navigation selector
│   ├── bible-search.js         # Scripture full-text search interface
│   ├── bible-daily-verse.js    # Verse of the Day devotional widget
│   ├── bible-bookmarks.js      # Local bookmark & favorite passages manager
│   ├── bible-offline.js        # Offline storage and download progress manager
│   ├── bible-styles.css        # Responsive styling with dark & light themes
│   ├── sw.js                   # Service Worker for PWA and offline caching
│   └── README.md               # Detailed module documentation
└── README.md                   # This file
```

---

## How It Works

### 1. Standalone or Unified Serving
- When running the FastAPI backend (`python backend/run_server.py`), FastAPI automatically serves this frontend at `http://localhost:8000/`.
- The Church landing page is accessible at `http://localhost:8000/`.
- The Online Bible application is accessible at `http://localhost:8000/bible/`.

### 2. Multi-Frontend & Future Frontend Compatibility
In the future, if you develop a separate frontend (such as a React, Next.js, Vue, or Flutter app) running on a different port or server (e.g. `http://localhost:5173`):
- The backend has **CORS fully enabled** for all origins (`*`).
- You can configure the API endpoint URL by setting `window.API_BASE_URL`:
  ```html
  <script>
    window.API_BASE_URL = "http://localhost:8000";
  </script>
  ```
- If `window.API_BASE_URL` is omitted or empty, it automatically defaults to relative paths (`/api/bible/...`), ensuring zero-configuration operation when served by FastAPI or a reverse proxy.

---

## Features
- **Bilingual Scripture**: English King James Version (KJV) and Telugu Holy Bible (పరిశుద్ధ గ్రంథము).
- **Parallel Mode**: Side-by-side or stacked dual-translation reading.
- **Full Offline Capability**: Service Worker and Cache API enable reading without internet.
- **Privacy-First**: Bookmarks and preferences are stored locally in the browser (`localStorage`).
- **Devotional Daily Verses**: Pre-mapped 366 daily verses with automatic day-of-year calculation.
