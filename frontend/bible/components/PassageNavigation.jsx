/**
 * PassageNavigation Component
 * Controls: Testament Filter (All, OT, NT), Book Dropdown, Chapter Dropdown, Verse Dropdown,
 * and Previous/Next Chapter navigation buttons.
 */

function PassageNavigation({
  testamentFilter = "all",
  onSelectTestament,
  booksList = [],
  selectedBook = "genesis",
  onSelectBook,
  selectedChapter = 1,
  onChangeChapter,
  selectedVerse = "all",
  onChangeVerse,
  totalChapters = 50,
  totalVerses = 31,
  onPrevChapter,
  onNextChapter
}) {
  // Filter books list according to testament filter
  const filteredBooks = React.useMemo(() => {
    if (testamentFilter === "all") return booksList;
    return booksList.filter((b) => b.testament === testamentFilter);
  }, [booksList, testamentFilter]);

  // Generate array for chapters
  const chaptersArray = React.useMemo(() => {
    const count = totalChapters || 1;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [totalChapters]);

  // Generate array for verses
  const versesArray = React.useMemo(() => {
    const count = totalVerses || 31;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [totalVerses]);

  return (
    <section className="passage-navigation-bar" aria-label="Scripture Passage Selectors">
      {/* Left Selectors Group */}
      <div className="nav-selectors-cluster">
        {/* Testament Filter Pills */}
        <div className="testament-filter-pills" role="radiogroup" aria-label="Filter testament">
          <button
            type="button"
            className={`btn-testament-pill ${testamentFilter === "all" ? "active" : ""}`}
            onClick={() => onSelectTestament("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`btn-testament-pill ${testamentFilter === "OT" ? "active" : ""}`}
            onClick={() => onSelectTestament("OT")}
          >
            OT (పాత నిబంధన)
          </button>
          <button
            type="button"
            className={`btn-testament-pill ${testamentFilter === "NT" ? "active" : ""}`}
            onClick={() => onSelectTestament("NT")}
          >
            NT (కొత్త నిబంధన)
          </button>
        </div>

        {/* Book Dropdown Selector */}
        <div className="custom-select-container book-select-container">
          <select
            className="passage-select book-dropdown"
            value={selectedBook}
            onChange={(e) => onSelectBook(e.target.value)}
            aria-label="Select Bible Book"
          >
            {filteredBooks.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name} ({b.teluguName})
              </option>
            ))}
          </select>
          <span className="select-arrow-icon">▼</span>
        </div>

        {/* Chapter Dropdown Selector */}
        <div className="custom-select-container chapter-select-container">
          <select
            className="passage-select chapter-dropdown"
            value={selectedChapter}
            onChange={(e) => onChangeChapter(Number(e.target.value))}
            aria-label="Select Chapter Number"
          >
            {chaptersArray.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
          <span className="select-arrow-icon">▼</span>
        </div>

        {/* Verse Dropdown Selector */}
        <div className="custom-select-container verse-select-container">
          <select
            className="passage-select verse-dropdown"
            value={selectedVerse}
            onChange={(e) => onChangeVerse(e.target.value)}
            aria-label="Select Verse"
          >
            <option value="all">All</option>
            {versesArray.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <span className="select-arrow-icon">▼</span>
        </div>
      </div>

      {/* Right Navigation Arrows */}
      <div className="nav-buttons-cluster">
        <button
          type="button"
          className="btn-nav-prev"
          onClick={onPrevChapter}
          disabled={selectedChapter <= 1}
          title="Previous chapter"
        >
          <span className="nav-arrow">&lt;</span>
          <span>Previous</span>
        </button>

        <button
          type="button"
          className="btn-nav-next"
          onClick={onNextChapter}
          title="Next chapter"
        >
          <span>Next</span>
          <span className="nav-arrow">&gt;</span>
        </button>
      </div>
    </section>
  );
}

window.PassageNavigation = PassageNavigation;
