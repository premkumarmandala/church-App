# Grace Church - Frontend Web Applications

This directory contains the user-facing web applications for Grace Church & Ministries, organized cleanly in one dedicated frontend folder.

---

## Directory Structure

```
frontend/
├── index.html                  # Grace Church main portal landing page
├── home/                       # Church home assets and resources
│   └── assets/                 # Photography and banner images
├── bible/                      # Online Bible React web application module
│   ├── index.html              # React entry point mounting to #root
│   ├── BibleApp.jsx            # Main React coordinator & state container
│   ├── bible-react.css         # Minimalist responsive design system (Light & Dark themes)
│   ├── mockData.js             # Canonical Bible books metadata, Genesis 1 verses & Daily Verse
│   ├── assets/                 # Bible module assets (hero_cross_sunset.jpg)
│   ├── components/             # Reusable React Functional Components (JSX)
│   │   ├── Sidebar.jsx         # Left navigation sidebar & scripture quote box
│   │   ├── TopBar.jsx          # Language selectors, font controls, theme toggle, Online status
│   │   ├── DailyVerseHero.jsx  # Verse of the Day banner with sunrise cross backdrop
│   │   ├── ViewTabs.jsx        # Read Scripture, Search Bible, Bookmarks & Offline Reading tabs
│   │   ├── PassageNavigation.jsx # Testament filters (All/OT/NT), Book/Chapter/Verse dropdowns
│   │   ├── ScriptureReader.jsx # Scripture chapter reader with circular verse numbers & controls
│   │   ├── SearchPanel.jsx     # Keyword Scripture search interface
│   │   ├── BookmarksPanel.jsx  # Saved local bookmarks panel
│   │   └── OfflinePanel.jsx    # Offline storage management panel
│   └── README.md               # Detailed module documentation
└── README.md                   # This file
```

---

## How It Works

### 1. Standalone or Unified Serving
- When running the FastAPI backend (`python backend/run_server.py`), FastAPI automatically serves this frontend at `http://localhost:8000/`.
- The Church landing page is accessible at `http://localhost:8000/`.
- The Online Bible React application is accessible at `http://localhost:8000/bible/`.

### 2. Multi-Frontend & Future Frontend Compatibility
In the future, if you develop a separate frontend (such as a Next.js, Vite, or mobile app) running on a different port or server (e.g. `http://localhost:5173`):
- The backend has **CORS fully enabled** for all origins (`*`).
- You can configure the API endpoint URL by setting `window.API_BASE_URL`:
  ```html
  <script>
    window.API_BASE_URL = "http://localhost:8000";
  </script>
  ```
- If `window.API_BASE_URL` is omitted or empty, it automatically defaults to relative paths (`/api/bible/...`), ensuring zero-configuration operation when served by FastAPI or a reverse proxy.

---

## Key Features

- **React Functional Architecture**: Pure JavaScript (JSX) components utilizing React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
- **Bilingual Scripture**: English King James Version (KJV) and Telugu Holy Bible (పరిశుద్ధ గ్రంథము).
- **Interactive Controls**: Dynamic font scaling (`A-` / `A+`), light & dark theme switching, bookmarking, and 1-click verse copying.
- **Passage Selector**: Filter by testament (`All`, `OT`, `NT`), select books, chapters, and verses with responsive navigation.
- **Verse of the Day**: Curated daily devotional banner with chapter jump and bilingual citations.
