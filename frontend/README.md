# Grace Church - Frontend Web Applications

This directory contains the user-facing and administrator web applications for Grace Church & Ministries, organized cleanly in decoupled modules.

---

## Directory Structure

```text
frontend/
├── index.html                  # Grace Church main portal landing page (/)
├── design-tokens.css           # Centralized CSS variables (Colors, Typography, Spacing, Elevation)
├── home/                       # Church home components & assets
│   ├── assets/                 # Photography, logos, and banner assets
│   ├── components/             # Hero, Verse of the Day, Ministries, Events sections
│   └── HomePage.jsx            # Public home container loading dynamic CMS content
├── bible/                      # Online Holy Bible React Web Application (/bible/)
│   ├── index.html              # React entry point mounting to #root
│   ├── BibleApp.jsx            # Main React coordinator & state container
│   ├── bible-react.css         # Minimalist responsive design system (Light & Dark themes)
│   ├── mockData.js             # Canonical Bible books metadata, Genesis 1 verses & Daily Verse
│   ├── sw.js                   # Service Worker for PWA offline caching
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
├── prayer-request/             # Public Prayer Request Portal (/prayer-request/)
│   ├── index.html              # Public petition submission interface
│   ├── prayer-request.css      # Portal styling
│   └── components/             # AudioRecorder, MediaUploader, PrayerForm, Guidelines
├── admin/                      # Master CMS & Pastoral Prayer Admin Dashboard (/admin/)
│   ├── index.html              # Admin mounting point
│   ├── AdminCMSApp.jsx         # Master CMS container & router
│   ├── cms.bundle.jsx          # Compiled CMS application bundle
│   ├── layout/                 # Sidebar, Topbar & Header
│   ├── dashboard/              # Metrics overview & quick actions
│   ├── home/                   # Homepage content manager
│   ├── about/                  # History, mission, and beliefs manager
│   ├── sermons/                # Sermons video archive manager
│   ├── events/                 # Calendar and registration manager
│   ├── ministries/             # Ministry branches manager
│   ├── gallery/                # Photos and albums manager
│   ├── users/                  # Staff & admin accounts manager
│   ├── services/               # CMS API client with JWT authentication
│   └── prayer-requests/        # Dedicated Pastoral Prayer Management feature
│       ├── components/         # StatsOverview, FilterToolbar, PrayerTable, Modals, Pagination
│       ├── pages/              # DashboardPage & PrayerRequestsPage
│       ├── services/           # Prayer requests API client
│       ├── styles/             # admin.css master stylesheet
│       ├── AdminPrayerRequests.jsx # Feature application entry point
│       └── prayer-requests.bundle.jsx # Feature bundle
└── README.md                   # This file
```

---

## How It Works

### 1. Unified Serving via FastAPI
When running the FastAPI backend (`python backend/run_server.py`), FastAPI serves all frontend applications automatically:
- **Church Home Page**: [http://localhost:8000/](http://localhost:8000/)
- **Online Bible Portal**: [http://localhost:8000/bible/](http://localhost:8000/bible/)
- **Prayer Petition Portal**: [http://localhost:8000/prayer-request/](http://localhost:8000/prayer-request/)
- **Pastoral Admin & CMS**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

### 2. Same-Origin & Multi-Frontend Compatibility
- Uses clean same-origin relative URLs (`/api/...`) in production (e.g. Render, Docker, custom domains) with no CORS or mixed content issues.
- Supports external frontend development servers via `window.API_BASE_URL` (e.g. `http://localhost:8000`).

---

## Key Modules

- **Pastoral Admin Dashboard**: Clean corporate design with navy sidebar, soft pastel KPI stat cards, dynamic pagination, and inline filter tabs.
- **Master CMS**: Update all website sections (banners, text, sermons, events, service timings) directly through the admin panel.
- **Public Prayer Submission**: Integrated audio voice notes recorder, photo/video uploader, and medical/prayer document attachment support.
- **Bilingual Holy Bible Reader**: English (KJV) and Telugu (పరిశుద్ధ గ్రంథము) with synchronized bilingual parallel view, PWA offline caching, and keyword search.
