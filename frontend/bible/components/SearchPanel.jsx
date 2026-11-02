/**
 * SearchPanel Component
 * Provides full-text keyword search UI, testament filter, language selector,
 * and search results cards with backend API integration.
 */

function SearchPanel({ onNavigateToVerse, initialQuery = "", selectedLang = "kjv" }) {
  const [query, setQuery] = React.useState(initialQuery || "");
  const [searchLang, setSearchLang] = React.useState(selectedLang || "kjv");
  const [testament, setTestament] = React.useState("all");
  const [results, setResults] = React.useState([]);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);

  // Sync with selectedLang if prop changes
  React.useEffect(() => {
    if (selectedLang) {
      setSearchLang(selectedLang);
    }
  }, [selectedLang]);

  // Execute initial search if initialQuery was provided
  React.useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      executeSearch(initialQuery.trim(), searchLang, testament);
    }
  }, [initialQuery]);

  const executeSearch = async (trimmed, lang, testm) => {
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const apiBase = (window.location.origin && window.location.origin.includes(':8000')) ? '' : 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/bible/search?q=${encodeURIComponent(trimmed)}&translation=${lang}&testament=${testm}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.results)) {
          setResults(data.results);
          setIsSearching(false);
          return;
        }
      }
    } catch (err) {
      // API error or offline
    }
    setIsSearching(false);
    setResults([]);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    executeSearch(query.trim(), searchLang, testament);
  };

  return (
    <section className="search-panel-card" aria-label="Bible Search Panel">
      <div className="search-controls-header">
        <form className="search-form-row" onSubmit={handleSearch}>
          <div className="search-input-field-wrap">
            <span className="search-lens-icon">🔍</span>
            <input
              type="text"
              className="search-text-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword, topic, or reference (e.g. light, grace, దేవుడు)..."
              aria-label="Scripture search query"
            />
            {query && (
              <button
                type="button"
                className="btn-clear-search-text"
                onClick={() => { setQuery(""); setResults([]); setHasSearched(false); }}
                aria-label="Clear search input"
              >
                ✕
              </button>
            )}
          </div>

          {/* Translation Selector */}
          <div className="custom-select-container search-lang-select">
            <select
              value={searchLang}
              onChange={(e) => setSearchLang(e.target.value)}
              aria-label="Search translation language"
            >
              <option value="kjv">English (KJV)</option>
              <option value="telugu">తెలుగు (Telugu)</option>
            </select>
            <span className="select-arrow-icon">▼</span>
          </div>

          {/* Testament Selector */}
          <div className="custom-select-container search-testament-select">
            <select
              value={testament}
              onChange={(e) => setTestament(e.target.value)}
              aria-label="Filter search testament"
            >
              <option value="all">Entire Bible (అన్ని గ్రంథాలు)</option>
              <option value="ot">Old Testament (పాత నిబంధన)</option>
              <option value="nt">New Testament (కొత్త నిబంధన)</option>
            </select>
            <span className="select-arrow-icon">▼</span>
          </div>

          <button type="submit" className="btn-search-action" disabled={isSearching}>
            <span>{isSearching ? "Searching..." : "Search"}</span>
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="search-results-area">
        {hasSearched && (
          <div className="search-meta-bar">
            <span className="search-count-label">
              Found {results.length} passage{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo; ({searchLang.toUpperCase()})
            </span>
          </div>
        )}

        {hasSearched && results.length === 0 && !isSearching && (
          <div className="search-empty-state" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "2.4rem", marginBottom: "12px" }}>🔍</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--navy-900)", marginBottom: "8px" }}>
              No Verses Found
            </h3>
            <p style={{ color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto 14px auto" }}>
              We couldn&apos;t find any verses matching &ldquo;{query}&rdquo; in {searchLang === "kjv" ? "English (KJV)" : "Telugu (పరిశుద్ధ గ్రంథము)"}.
            </p>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
              Tip: Check spelling or try searching in {searchLang === "kjv" ? "Telugu" : "English"}.
            </p>
          </div>
        )}

        {!hasSearched && (
          <div className="search-empty-state" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: "12px", opacity: 0.7 }}>📖</div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "var(--navy-900)", marginBottom: "8px" }}>
              Search the Holy Scriptures
            </h3>
            <p style={{ color: "var(--text-muted)", maxWidth: "440px", margin: "0 auto" }}>
              Type any word, topic, or phrase above to search across all 66 canonical books in English or Telugu.
            </p>
          </div>
        )}

        <div className="search-cards-grid">
          {results.map((item, index) => {
            const refTitle = item.referenceEn || item.reference;
            const teluguRef = item.referenceTe || item.teluguReference || "";
            const bSlug = item.bookSlug || "genesis";
            const chNum = Number(item.chapter) || 1;
            const vNum = Number(item.verse) || 1;

            return (
              <div key={index} className="search-result-card">
                <div className="search-result-header">
                  <span className="result-ref-title">{refTitle}</span>
                  {teluguRef && <span className="result-telugu-ref">({teluguRef})</span>}
                  <span className="result-trans-badge">{(item.translation || searchLang).toUpperCase()}</span>
                </div>
                <p className={`result-verse-text ${searchLang === "telugu" ? "telugu-font" : ""}`}>
                  &ldquo;{item.text}&rdquo;
                </p>
                <div className="search-result-actions">
                  <button
                    type="button"
                    className="btn-result-navigate"
                    onClick={() => onNavigateToVerse && onNavigateToVerse(bSlug, chNum, vNum)}
                  >
                    Read Chapter &gt;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

window.SearchPanel = SearchPanel;
