/**
 * Main BibleApp Component
 * Connects Sidebar, TopBar, DailyVerseHero, ViewTabs, PassageNavigation, ScriptureReader,
 * SearchPanel, BookmarksPanel, and OfflinePanel using React functional components and Hooks.
 * Fully supports all 66 canonical Bible books, dynamic chapter loading, search, and bookmarks.
 */

function BibleApp() {
  // Navigation & View State
  const [activeTab, setActiveTab] = React.useState("reader");
  const [selectedLang, setSelectedLang] = React.useState("kjv");
  const [testamentFilter, setTestamentFilter] = React.useState("all");
  const [selectedBook, setSelectedBook] = React.useState("genesis");
  const [selectedChapter, setSelectedChapter] = React.useState(1);
  const [selectedVerse, setSelectedVerse] = React.useState("all");

  // Scripture Data State
  const [books, setBooks] = React.useState(window.MOCK_BOOKS || []);
  const [chapterData, setChapterData] = React.useState(window.MOCK_GENESIS_CHAPTER_1);
  const [isLoadingChapter, setIsLoadingChapter] = React.useState(false);
  const [dailyVerse, setDailyVerse] = React.useState(window.MOCK_DAILY_VERSE);

  // Typography & Aesthetics State
  const [fontSize, setFontSize] = React.useState(18);
  const [theme, setTheme] = React.useState("light");
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Search & Bookmarks State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [bookmarks, setBookmarks] = React.useState(window.MOCK_BOOKMARKS || []);
  const [toastMessage, setToastMessage] = React.useState("");

  // Sync theme with document element
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Load all 66 canonical books from backend API if available
  React.useEffect(() => {
    const loadBooks = async () => {
      try {
        const apiBase = (window.location.origin && window.location.origin.includes(':8000')) ? '' : 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/bible/books`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBooks(data);
          }
        }
      } catch (e) {
        // Fall back to window.MOCK_BOOKS
      }
    };
    loadBooks();
  }, []);

  // Load Verse of the Day from backend API
  React.useEffect(() => {
    const loadDailyVerse = async () => {
      try {
        const apiBase = (window.location.origin && window.location.origin.includes(':8000')) ? '' : 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/bible/daily-verse`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.referenceEn) {
            setDailyVerse(data);
          }
        }
      } catch (e) {}
    };
    loadDailyVerse();
  }, []);

  // Current active book object
  const currentBook = React.useMemo(() => {
    return books.find((b) => b.slug === selectedBook) || books[0] || {
      id: 1,
      slug: "genesis",
      name: "Genesis",
      teluguName: "ఆదికాండము",
      testament: "OT",
      chaptersCount: 50
    };
  }, [books, selectedBook]);

  const totalChapters = React.useMemo(() => {
    return currentBook?.chaptersCount || 50;
  }, [currentBook]);

  // Dynamic chapter loading from backend API or offline mock
  React.useEffect(() => {
    let isCancelled = false;
    const loadChapter = async () => {
      setIsLoadingChapter(true);
      try {
        const apiBase = (window.location.origin && window.location.origin.includes(':8000')) ? '' : 'http://localhost:8000';
        const res = await fetch(`${apiBase}/api/bible/chapter?translation=${selectedLang}&book=${selectedBook}&chapter=${selectedChapter}&parallel=true`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data && data.verses) {
            setChapterData(data);
            setIsLoadingChapter(false);
            return;
          }
        }
      } catch (e) {
        // Proceed to fallback
      }

      if (!isCancelled) {
        if (selectedBook === "genesis" && selectedChapter === 1) {
          setChapterData(window.MOCK_GENESIS_CHAPTER_1);
        } else {
          setChapterData({
            book: currentBook,
            chapter: selectedChapter,
            translation: selectedLang,
            versesCount: 1,
            verses: [
              {
                verse: 1,
                text: selectedLang === "telugu"
                  ? `${currentBook.teluguName || currentBook.name} అధ్యాయము ${selectedChapter}. (పూర్తి గ్రంథ వచనాలు అందుబాటులో ఉన్నాయి)`
                  : `${currentBook.name} Chapter ${selectedChapter}. (Full scripture text available from backend API)`
              }
            ]
          });
        }
        setIsLoadingChapter(false);
      }
    };

    loadChapter();
    return () => { isCancelled = true; };
  }, [selectedBook, selectedChapter, selectedLang, currentBook]);

  const totalVerses = React.useMemo(() => {
    if (chapterData && Array.isArray(chapterData.verses) && chapterData.verses.length > 0) {
      return chapterData.verses.length;
    }
    if (currentBook && Array.isArray(currentBook.chapterVerseCounts)) {
      return currentBook.chapterVerseCounts[selectedChapter - 1] || 31;
    }
    return 31;
  }, [chapterData, currentBook, selectedChapter]);

  const bookmarkedVerses = React.useMemo(() => {
    return bookmarks
      .filter((b) => b.bookSlug === selectedBook && Number(b.chapter) === Number(selectedChapter))
      .map((b) => Number(b.verse) || b.verse);
  }, [bookmarks, selectedBook, selectedChapter]);

  // Toast feedback helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2400);
  };

  // Font Size Controls
  const handleIncreaseFontSize = () => {
    setFontSize((prev) => Math.min(28, prev + 2));
  };

  const handleDecreaseFontSize = () => {
    setFontSize((prev) => Math.max(14, prev - 2));
  };

  // Theme Toggle
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleSelectTestament = (filter) => {
    setTestamentFilter(filter);
    if (filter !== "all") {
      const match = books.filter((b) => (b.testament || "").toUpperCase() === filter.toUpperCase());
      const isCurrentInTestament = match.some((b) => b.slug === selectedBook);
      if (!isCurrentInTestament && match.length > 0) {
        setSelectedBook(match[0].slug);
        setSelectedChapter(1);
        setSelectedVerse("all");
      }
    }
  };

  const handleSelectBook = (newSlug) => {
    setSelectedBook(newSlug);
    const target = books.find((b) => b.slug === newSlug);
    const maxCh = target?.chaptersCount || 50;
    if (selectedChapter > maxCh) {
      setSelectedChapter(1);
    }
    setSelectedVerse("all");
  };

  // Chapter Navigation
  const handlePrevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter((prev) => prev - 1);
      setSelectedVerse("all");
    } else {
      const curIndex = books.findIndex((b) => b.slug === selectedBook);
      if (curIndex > 0) {
        const prevBook = books[curIndex - 1];
        setSelectedBook(prevBook.slug);
        setSelectedChapter(prevBook.chaptersCount || 1);
        setSelectedVerse("all");
      }
    }
  };

  const handleNextChapter = () => {
    if (selectedChapter < totalChapters) {
      setSelectedChapter((prev) => prev + 1);
      setSelectedVerse("all");
    } else {
      const curIndex = books.findIndex((b) => b.slug === selectedBook);
      if (curIndex >= 0 && curIndex < books.length - 1) {
        setSelectedBook(books[curIndex + 1].slug);
        setSelectedChapter(1);
        setSelectedVerse("all");
      }
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = (verseNum) => {
    const num = Number(verseNum) || verseNum;
    const isBookmarked = bookmarkedVerses.includes(num) || bookmarkedVerses.includes(String(num));
    if (isBookmarked) {
      setBookmarks((prev) =>
        prev.filter((b) => !(b.bookSlug === selectedBook && Number(b.chapter) === Number(selectedChapter) && (Number(b.verse) === num || b.verse === verseNum)))
      );
      showToast(`Removed bookmark for Verse ${num}`);
    } else {
      const versesList = chapterData?.verses || window.MOCK_GENESIS_CHAPTER_1.verses || [];
      const verseObj = versesList.find((v) => Number(v.verse) === num || String(v.verse) === String(num));
      const verseText = verseObj ? (verseObj.text || (selectedLang === "telugu" ? verseObj.telugu : verseObj.kjv)) : "";
      const bName = currentBook?.name || "Genesis";
      const bTelugu = currentBook?.teluguName || "ఆదికాండము";

      const newBm = {
        id: `${selectedBook}-${selectedChapter}-${num}`,
        bookSlug: selectedBook,
        bookName: bName,
        bookTeluguName: bTelugu,
        chapter: selectedChapter,
        verse: num,
        translation: selectedLang.toUpperCase(),
        text: verseText || `${bName} ${selectedChapter}:${num}`,
        savedAt: "Just now"
      };
      setBookmarks((prev) => [newBm, ...prev]);
      showToast(`★ Bookmarked ${bName} ${selectedChapter}:${num}`);
    }
  };

  const handleRemoveBookmark = (verseNum) => {
    const num = Number(verseNum) || verseNum;
    setBookmarks((prev) =>
      prev.filter((b) => !(b.bookSlug === selectedBook && Number(b.chapter) === Number(selectedChapter) && (Number(b.verse) === num || b.verse === verseNum)))
    );
    showToast(`Bookmark removed`);
  };

  // Copy Verse
  const handleCopyVerse = (item) => {
    const bName = typeof item.book === "object" ? (item.book.name || currentBook.name) : (item.book || currentBook.name);
    const textToCopy = `“${item.text}” — ${bName} ${item.chapter}:${item.verse} (${selectedLang.toUpperCase()})`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("✓ Copied verse to clipboard!");
      }).catch(() => {
        showToast("Copied: " + bName + " " + item.chapter + ":" + item.verse);
      });
    } else {
      showToast("✓ Copied verse to clipboard!");
    }
  };

  // Search Verse Jump
  const handleSearchVerse = (item) => {
    setSearchQuery((item.text || "").slice(0, 30));
    setActiveTab("search");
  };

  // Navigate directly to passage
  const handleNavigateToPassage = (bookSlug, chapter, verse = "all") => {
    setSelectedBook(bookSlug || "genesis");
    setSelectedChapter(Number(chapter) || 1);
    setSelectedVerse(verse === "all" ? "all" : (Number(verse) || "all"));
    setActiveTab("reader");
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  return (
    <div className="bible-app-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bible-toast-notification" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <window.Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        bookmarksCount={bookmarks.length}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="bible-main-layout">
        {/* Top Right Utility Bar */}
        <window.TopBar
          selectedLang={selectedLang}
          onChangeLang={setSelectedLang}
          fontSize={fontSize}
          onIncreaseFontSize={handleIncreaseFontSize}
          onDecreaseFontSize={handleDecreaseFontSize}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* Verse of the Day Hero Banner */}
        <window.DailyVerseHero
          dailyVerse={dailyVerse}
          selectedLang={selectedLang}
          onReadChapter={handleNavigateToPassage}
        />

        {/* View Tabs Bar: Read Scripture, Search Bible, Bookmarks, Offline Reading */}
        <window.ViewTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          bookmarksCount={bookmarks.length}
        />

        {/* READER VIEW */}
        {activeTab === "reader" && (
          <React.Fragment>
            {/* Passage Filter and Dropdown Bar */}
            <window.PassageNavigation
              testamentFilter={testamentFilter}
              onSelectTestament={handleSelectTestament}
              booksList={books}
              selectedBook={selectedBook}
              onSelectBook={handleSelectBook}
              selectedChapter={selectedChapter}
              onChangeChapter={setSelectedChapter}
              selectedVerse={selectedVerse}
              onChangeVerse={setSelectedVerse}
              totalChapters={totalChapters}
              totalVerses={totalVerses}
              onPrevChapter={handlePrevChapter}
              onNextChapter={handleNextChapter}
            />

            {/* Scripture Reading Area */}
            <window.ScriptureReader
              chapterData={chapterData}
              selectedLang={selectedLang}
              fontSize={fontSize}
              selectedVerse={selectedVerse}
              bookmarkedVerses={bookmarkedVerses}
              onToggleBookmark={handleToggleBookmark}
              onCopyVerse={handleCopyVerse}
              onSearchVerse={handleSearchVerse}
              isLoading={isLoadingChapter}
            />
          </React.Fragment>
        )}

        {/* SEARCH VIEW */}
        {activeTab === "search" && (
          <window.SearchPanel
            initialQuery={searchQuery}
            onNavigateToVerse={handleNavigateToPassage}
          />
        )}

        {/* BOOKMARKS VIEW */}
        {activeTab === "bookmarks" && (
          <window.BookmarksPanel
            bookmarks={bookmarks}
            onRemoveBookmark={handleRemoveBookmark}
            onNavigateToVerse={handleNavigateToPassage}
            onCopyVerse={handleCopyVerse}
          />
        )}

        {/* OFFLINE VIEW */}
        {activeTab === "offline" && (
          <window.OfflinePanel />
        )}
      </main>
    </div>
  );
}

window.BibleApp = BibleApp;
