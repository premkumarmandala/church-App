# Dedicated Online Bible Module (`bible/`)

## Module Structure
```
bible/
  ├── index.html             # Main Bible reader, search, bookmarks, and offline UI
  ├── bible-styles.css       # Complete vanilla CSS design system with Telugu typography
  ├── bible-app.js           # Main coordinator tying together all sub-modules
  ├── bible-navigation.js    # Book, chapter, testament, and translation routing
  ├── bible-reader.js        # Verse renderer (single and parallel views, copy, bookmarks)
  ├── bible-search.js        # Search controller (online & offline search with highlighting)
  ├── bible-bookmarks.js     # Persistent client-side bookmarks manager (localStorage)
  ├── bible-daily-verse.js   # Daily Scripture component
  ├── bible-offline.js       # Offline storage manager & Service Worker client
  ├── sw.js                  # Service Worker for offline asset and data caching
  └── README.md              # This module documentation
```

## Features Supported
1. **Translations**:
   - English King James Version (KJV)
   - Telugu Holy Bible (పరిశుద్ధ గ్రంథము)
   - Parallel Dual-Column Bilingual Study Mode
2. **Navigation**:
   - 66 Canonical Books (39 Old Testament, 27 New Testament)
   - Testament filtering (All, OT, NT)
   - Chapter switching with cross-book boundary preservation
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
```bash
# Start the server (port 3000 by default)
node server.js
# Or via npm:
npm start

# Run validation and test suite
npm test
```
Access the application:
- Church Home: `http://localhost:3000/`
- Online Bible Module: `http://localhost:3000/bible/`
