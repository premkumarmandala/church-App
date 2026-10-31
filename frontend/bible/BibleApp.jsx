/**
 * Main BibleApp Component
 * Connects Sidebar, TopBar, DailyVerseHero, ViewTabs, PassageNavigation, ScriptureReader,
 * SearchPanel, BookmarksPanel, and OfflinePanel using React functional components and Hooks.
 */

function BibleApp() {
  // Navigation & View State
  const [activeTab, setActiveTab] = React.useState("reader");
  const [selectedLang, setSelectedLang] = React.useState("kjv");
  const [testamentFilter, setTestamentFilter] = React.useState("all");
  const [selectedBook, setSelectedBook] = React.useState("genesis");
  const [selectedChapter, setSelectedChapter] = React.useState(1);
  const [selectedVerse, setSelectedVerse] = React.useState("all");

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

  // Derived bookmarked verse numbers for Genesis 1
  const bookmarkedVerses = React.useMemo(() => {
    return bookmarks
      .filter((b) => b.bookSlug === selectedBook && b.chapter === selectedChapter)
      .map((b) => b.verse);
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

  // Chapter Navigation
  const handlePrevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter((prev) => prev - 1);
      setSelectedVerse("all");
    }
  };

  const handleNextChapter = () => {
    setSelectedChapter((prev) => prev + 1);
    setSelectedVerse("all");
  };

  // Bookmark Toggle
  const handleToggleBookmark = (verseNum) => {
    const isBookmarked = bookmarkedVerses.includes(verseNum);
    if (isBookmarked) {
      setBookmarks((prev) =>
        prev.filter((b) => !(b.bookSlug === selectedBook && b.chapter === selectedChapter && b.verse === verseNum))
      );
      showToast(`Removed bookmark for Verse ${verseNum}`);
    } else {
      const verseObj = (window.MOCK_GENESIS_CHAPTER_1.verses || []).find((v) => v.verse === verseNum);
      const newBm = {
        id: `${selectedBook}-${selectedChapter}-${verseNum}`,
        bookSlug: selectedBook,
        bookName: "Genesis",
        bookTeluguName: "ఆదికాండము",
        chapter: selectedChapter,
        verse: verseNum,
        translation: selectedLang.toUpperCase(),
        text: selectedLang === "telugu" ? (verseObj?.telugu || "") : (verseObj?.kjv || ""),
        savedAt: "Just now"
      };
      setBookmarks((prev) => [newBm, ...prev]);
      showToast(`★ Bookmarked Genesis ${selectedChapter}:${verseNum}`);
    }
  };

  const handleRemoveBookmark = (verseNum) => {
    setBookmarks((prev) =>
      prev.filter((b) => !(b.bookSlug === selectedBook && b.chapter === selectedChapter && b.verse === verseNum))
    );
    showToast(`Bookmark removed`);
  };

  // Copy Verse
  const handleCopyVerse = (item) => {
    const textToCopy = `“${item.text}” — ${item.book.name} ${item.chapter}:${item.verse} (${selectedLang.toUpperCase()})`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("✓ Copied verse to clipboard!");
      }).catch(() => {
        showToast("Copied: " + item.book.name + " " + item.chapter + ":" + item.verse);
      });
    } else {
      showToast("✓ Copied verse to clipboard!");
    }
  };

  // Search Verse Jump
  const handleSearchVerse = (item) => {
    setSearchQuery(item.text.slice(0, 30));
    setActiveTab("search");
  };

  // Navigate directly to passage
  const handleNavigateToPassage = (bookSlug, chapter, verse = "all") => {
    setSelectedBook(bookSlug || "genesis");
    setSelectedChapter(chapter || 1);
    setSelectedVerse(verse || "all");
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
          dailyVerse={window.MOCK_DAILY_VERSE}
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
          <>
            {/* Passage Filter and Dropdown Bar */}
            <window.PassageNavigation
              testamentFilter={testamentFilter}
              onSelectTestament={setTestamentFilter}
              booksList={window.MOCK_BOOKS || []}
              selectedBook={selectedBook}
              onSelectBook={setSelectedBook}
              selectedChapter={selectedChapter}
              onChangeChapter={setSelectedChapter}
              selectedVerse={selectedVerse}
              onChangeVerse={setSelectedVerse}
              totalChapters={50}
              totalVerses={31}
              onPrevChapter={handlePrevChapter}
              onNextChapter={handleNextChapter}
            />

            {/* Scripture Reading Area */}
            <window.ScriptureReader
              chapterData={window.MOCK_GENESIS_CHAPTER_1}
              selectedLang={selectedLang}
              fontSize={fontSize}
              selectedVerse={selectedVerse}
              bookmarkedVerses={bookmarkedVerses}
              onToggleBookmark={handleToggleBookmark}
              onCopyVerse={handleCopyVerse}
              onSearchVerse={handleSearchVerse}
            />
          </>
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
