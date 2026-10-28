# Dedicated Online Bible Module (`frontend/bible/`)

## Module Structure
```
bible/
  ├── index.html             # Main Bible reader, search, bookmarks, and offline UI (with Book, Chapter & Verse selectors)
  ├── bible-styles.css       # Minimalist design system (Warm White, Navy, Antique Gold, Lora & Noto Serif typography)
  ├── bible-app.js           # Main coordinator tying together all sub-modules & verse dropdown population
  ├── bible-navigation.js    # Book, chapter, verse, testament, and translation routing
  ├── bible-reader.js        # Verse renderer (single and parallel dual-column views, copy, bookmarks, golden highlight)
  ├── bible-search.js        # Search controller (online & offline search with keyword highlighting)
  ├── bible-bookmarks.js     # Persistent client-side bookmarks manager (localStorage)
  ├── bible-daily-verse.js   # Daily Scripture component with 1-click chapter jump
  ├── bible-offline.js       # Offline storage manager & Service Worker client
  ├── sw.js                  # Service Worker for offline asset and data caching
  └── README.md              # This module documentation
```

## Features Supported
1. **Translations**:
   - English King James Version (KJV)
   - Telugu Holy Bible (పరిశుద్ధ గ్రంథము)
   - Parallel Dual-Column Bilingual Study Mode with synchronized study headers
2. **Navigation**:
   - 66 Canonical Books (39 Old Testament, 27 New Testament)
   - Testament filtering (`All`, `OT`, `NT`)
   - **Book, Chapter & Verse Selectors**: Direct selection with smooth scroll & golden highlight
   - Cross-book boundary navigation (`◀ Previous` / `Next ▶`)
   - Deep linking with hash routes (e.g. `#telugu/genesis/1`, `#kjv/john/3/16`)
3. **Scripture Search**:
   - Full-text keyword search across 31,102 verses
   - Testament scope filtering
   - Direct reference detection (e.g., "John 3:16", "యోహాను 3:16")
   - Keyword highlighting and clear empty states
   - Seamless offline search across cached books
4. **Persistent Bookmarks**:
   - Saved locally in the browser (`localStorage`) without requiring user accounts or logins
   - Easy 1-click verse bookmarking and removal
   - Direct jump from bookmark card to chapter and verse
5. **Daily Verse**:
   - Date-consistent daily Scripture passage
   - Bilingual display (English KJV & Telugu)
   - 1-click navigation to full chapter
6. **Offline Reading**:
   - Service worker pre-caches application shell
   - 1-click offline caching of entire translations into Cache API
   - Real-time online/offline network indicator

## Setup & Running Locally
From the workspace root:
```bash
# Start the FastAPI backend server (port 8000)
python backend/run_server.py
```

Access the application in your browser:
- **Church Home**: [http://localhost:8000/](http://localhost:8000/)
- **Online Bible**: [http://localhost:8000/bible/](http://localhost:8000/bible/)
- **API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
