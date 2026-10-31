/**
 * SearchPanel Component
 * Provides full-text keyword search UI, testament filter, and search results cards
 * with backend API integration and graceful fallback.
 */

function SearchPanel({ onNavigateToVerse, initialQuery = "" }) {
  const [query, setQuery] = React.useState(initialQuery || "beginning");
  const [testament, setTestament] = React.useState("all");
  const [results, setResults] = React.useState(window.MOCK_SEARCH_RESULTS || []);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const apiBase = (window.location.origin && window.location.origin.includes(':8000')) ? '' : 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/bible/search?q=${encodeURIComponent(trimmed)}&translation=kjv&testament=${testament}&limit=30`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.results)) {
          setResults(data.results);
          setIsSearching(false);
          return;
        }
      }
    } catch (err) {
      // Fall back gracefully to mock results
    }
    setIsSearching(false);

    const qLower = trimmed.toLowerCase();
    const filtered = (window.MOCK_SEARCH_RESULTS || []).filter((r) =>
      (r.text && r.text.toLowerCase().includes(qLower)) ||
      (r.reference && r.reference.toLowerCase().includes(qLower)) ||
      (r.referenceEn && r.referenceEn.toLowerCase().includes(qLower))
    );
    setResults(filtered.length > 0 ? filtered : window.MOCK_SEARCH_RESULTS || []);
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
              placeholder="Search by keyword, topic, or reference (e.g. light, grace, Genesis 1:1)..."
              aria-label="Scripture search query"
            />
            {query && (
              <button
                type="button"
                className="btn-clear-search-text"
                onClick={() => setQuery("")}
                aria-label="Clear search input"
              >
                ✕
              </button>
            )}
          </div>

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
        <div className="search-meta-bar">
          <span className="search-count-label">
            Found {results.length} passage{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
          </span>
        </div>

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
                  <span className="result-trans-badge">{(item.translation || "KJV").toUpperCase()}</span>
                </div>
                <p className="result-verse-text">&ldquo;{item.text}&rdquo;</p>
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
