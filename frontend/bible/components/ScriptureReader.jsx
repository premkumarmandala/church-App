/**
 * ScriptureReader Component
 * Renders Scripture reading area matching the design:
 * Header with open-book badge, Book title, Telugu name, KJV & verses badges,
 * and individual verses with circular numbers and search/bookmark/copy controls.
 */

function ScriptureReader({
  chapterData,
  selectedLang = "kjv",
  fontSize = 18,
  selectedVerse = "all",
  bookmarkedVerses = [],
  onToggleBookmark,
  onCopyVerse,
  onSearchVerse,
  isLoading = false
}) {
  if (isLoading) {
    return (
      <div className="scripture-reader-card reader-loading-card" style={{ padding: "48px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "1.1rem", color: "var(--navy-600)" }}>Loading Scripture passage...</p>
      </div>
    );
  }

  if (!chapterData) {
    return null;
  }

  const { book = {}, chapter = 1, verses = [], totalVerses: dataTotalVerses, versesCount } = chapterData;
  const totalVerses = dataTotalVerses || versesCount || verses.length || 0;
  const isTelugu = selectedLang === "telugu";

  // Filter verses if a specific verse is selected in dropdown
  const displayedVerses = React.useMemo(() => {
    if (selectedVerse === "all" || !selectedVerse) return verses;
    return verses.filter((v) => String(v.verse) === String(selectedVerse));
  }, [verses, selectedVerse]);

  const bookName = typeof book === "object" ? (book.name || "Bible") : book;
  const bookTelugu = typeof book === "object" ? (book.teluguName || "") : "";

  return (
    <article 
      className="scripture-reader-card" 
      aria-label="Scripture Chapter Reading Area"
      style={{ "--verse-font-size": `${fontSize}px` }}
    >
      {/* Chapter Card Header */}
      <header className="reader-card-header">
        <div className="chapter-title-cluster">
          {/* Circular Open Book Badge */}
          <div className="reader-book-circle-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>

          <div className="chapter-names-meta">
            <h1 className="chapter-primary-heading">
              {bookName} {chapter}
            </h1>
            <p className="chapter-secondary-subheading">
              {bookTelugu && <span className="telugu-subname">{bookTelugu}</span>}
              {bookTelugu && <span className="subheading-bullet">•</span>}
              <span className="subheading-chapter-label">Chapter {chapter}</span>
            </p>
          </div>
        </div>

        {/* Translation & Count Badges */}
        <div className="reader-meta-badges">
          <span className="badge-navy-translation">
            {selectedLang.toUpperCase()}
          </span>
          <span className="badge-verse-total">
            {totalVerses} verses
          </span>
        </div>
      </header>

      {/* Verses List */}
      <div className="reader-verses-list">
        {displayedVerses.map((v) => {
          const verseNumber = Number(v.verse) || v.verse;
          const isBookmarked = bookmarkedVerses.includes(verseNumber) || bookmarkedVerses.includes(String(verseNumber));
          const verseText = v.text || (isTelugu ? (v.telugu || v.kjv) : (v.kjv || v.telugu)) || "";

          return (
            <div 
              key={verseNumber} 
              id={`verse-${verseNumber}`}
              className={`verse-row-container ${isBookmarked ? "bookmarked-row" : ""}`}
            >
              {/* Circular Verse Number Badge */}
              <div className="verse-badge-col">
                <span className="verse-number-circle">{verseNumber}</span>
              </div>

              {/* Verse Text */}
              <div className="verse-text-col">
                <p className={`verse-text-content ${isTelugu ? "telugu-font" : ""}`}>
                  {verseText}
                </p>
              </div>

              {/* Action Controls: Search, Bookmark, Copy */}
              <div className="verse-controls-col" aria-label={`Controls for verse ${verseNumber}`}>
                {/* Search Button */}
                <button
                  type="button"
                  className="btn-verse-control btn-verse-search"
                  onClick={() => onSearchVerse && onSearchVerse({
                    book,
                    chapter,
                    verse: verseNumber,
                    text: verseText
                  })}
                  title="Search related verses"
                  aria-label={`Search related verses for verse ${verseNumber}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>

                {/* Bookmark Button */}
                <button
                  type="button"
                  className={`btn-verse-control btn-verse-bookmark ${isBookmarked ? "bookmarked" : ""}`}
                  onClick={() => onToggleBookmark && onToggleBookmark(verseNumber)}
                  title={isBookmarked ? "Remove bookmark" : "Bookmark this verse"}
                  aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this verse"}
                >
                  <svg viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>

                {/* Copy Button */}
                <button
                  type="button"
                  className="btn-verse-control btn-verse-copy"
                  onClick={() => onCopyVerse && onCopyVerse({
                    book,
                    chapter,
                    verse: verseNumber,
                    text: verseText
                  })}
                  title="Copy verse to clipboard"
                  aria-label={`Copy verse ${verseNumber} to clipboard`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

window.ScriptureReader = ScriptureReader;
