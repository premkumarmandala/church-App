/**
 * SearchPanel Component
 * Provides full-text keyword search UI, testament filter, and mock search results cards.
 */

function SearchPanel({ onNavigateToVerse, initialQuery = "" }) {
  const [query, setQuery] = React.useState(initialQuery || "beginning");
  const [testament, setTestament] = React.useState("all");
  const [results, setResults] = React.useState(window.MOCK_SEARCH_RESULTS || []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      return;
    }
    // Filter mock results for UI demonstration
    const filtered = (window.MOCK_SEARCH_RESULTS || []).filter((r) =>
      r.text.toLowerCase().includes(query.toLowerCase()) ||
      r.reference.toLowerCase().includes(query.toLowerCase())
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

          <button type="submit" className="btn-search-action">
            <span>Search</span>
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
          {results.map((item, index) => (
            <div key={index} className="search-result-card">
              <div className="search-result-header">
                <span className="result-ref-title">{item.reference}</span>
                <span className="result-telugu-ref">({item.teluguReference})</span>
                <span className="result-trans-badge">{item.translation}</span>
              </div>
              <p className="result-verse-text">&ldquo;{item.text}&rdquo;</p>
              <div className="search-result-actions">
                <button
                  type="button"
                  className="btn-result-navigate"
                  onClick={() => onNavigateToVerse && onNavigateToVerse("genesis", 1, 1)}
                >
                  Read Chapter &gt;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.SearchPanel = SearchPanel;
