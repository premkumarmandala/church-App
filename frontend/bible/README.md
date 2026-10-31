# Dedicated Online Bible React Module (`frontend/bible/`)

## Module Structure

The Bible frontend has been converted into a modular, responsive **React (JSX)** interface matching the design system:

```
frontend/bible/
├── index.html                   # React app entry point (React 18 & Babel Standalone mount to #root)
├── BibleApp.jsx                 # Main React container coordinating state & Hooks
├── bible-react.css              # Responsive styling matching the UI design system (Light & Dark theme)
├── mockData.js                  # Canonical books index, Genesis 1 bilingual verses (1-31), Daily Verse
├── assets/
│   └── hero_cross_sunset.jpg    # Sunset mountain cross background image for hero banner
├── components/
│   ├── Sidebar.jsx              # Left sidebar with logo, navigation links, and scripture citation
│   ├── TopBar.jsx               # Language selectors (KJV & Telugu), font sizing, theme, and Online badge
│   ├── DailyVerseHero.jsx       # Verse of the Day banner with sunrise backdrop & Read Chapter CTA
│   ├── ViewTabs.jsx             # Read Scripture, Search Bible, Bookmarks, and Offline Reading tabs
│   ├── PassageNavigation.jsx    # Testament filters (All, OT, NT), Book, Chapter & Verse dropdowns, Prev/Next
│   ├── ScriptureReader.jsx      # Scripture reader card with verse numbers, search, bookmark & copy actions
│   ├── SearchPanel.jsx          # Full-text Scripture search interface with keyword results
│   ├── BookmarksPanel.jsx       # Saved verses management panel with quick navigation & copy
│   └── OfflinePanel.jsx         # Offline storage status cards for KJV and Telugu Holy Bible
└── README.md                    # This module documentation
```

---

## React Component Architecture

All UI components are built as reusable **React functional components** utilizing modern React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`):

1. **`Sidebar`**: Left navigation sidebar featuring the Grace Church Bible brand header with Latin cross emblem, navigation items with badge counts, and the Psalm 119:105 Scripture citation box.
2. **`TopBar`**: Utility controls header with English (KJV) and Telugu dropdown selectors, font size adjustment buttons (`A-`, `A+`), theme switch (`☀️` / `🌙`), and live Online status pill.
3. **`DailyVerseHero`**: Devotional banner featuring the rustic wooden cross sunset hillside, date badge, italic serif quotation, bilingual references, and 1-click chapter jump button.
4. **`ViewTabs`**: Horizontal navigation tabs with active royal blue pill styling and active indicator underline.
5. **`PassageNavigation`**: Filters for `All`, `OT (పాత నిబంధన)`, and `NT (కొత్త నిబంధన)`, customized dropdown selectors for Bible books, chapters, and verses, plus `< Previous` and `Next >` navigation buttons.
6. **`ScriptureReader`**: Elevated reading card displaying the chapter title, Telugu subtitle, `KJV` and verse total badges, circular verse numbers (`1`, `2`, ...), and per-verse interactive actions (Search `🔍`, Bookmark `★`, and Copy `📋`).
7. **`SearchPanel`**: Scripture search interface with testament scope filtering and highlighted verse result cards.
8. **`BookmarksPanel`**: Saved favorite verses list with 1-click reader jump, copy, and removal.
9. **`OfflinePanel`**: Browser Cache API storage management cards for English KJV and Telugu Holy Bible.

---

## Features & Controls

- **Bilingual Support**: Instant toggle between English King James Version (KJV) and Telugu Holy Bible (పరిశుద్ధ గ్రంథము).
- **Responsive Layout**: Designed for desktop (2-column layout with fixed left sidebar), tablet, and mobile (collapsible slide-out drawer).
- **Dynamic Font Sizing**: Interactive `A-` and `A+` controls scale verse typography dynamically across the reader.
- **Dual Themes**: Supports Minimalist Warm Light mode and Sanctuary Midnight Dark mode (`data-theme="dark"`).
- **Zero-CORS Browser Compatibility**: Runs universally when served via local HTTP server (`http://localhost:8000/bible/`) or directly opened via file URL.

---

## Local Development & Testing

When running the FastAPI server from workspace root:
```bash
python backend/run_server.py
```

Access the Bible module in your browser:
- **Online Bible**: [http://localhost:8000/bible/](http://localhost:8000/bible/)
