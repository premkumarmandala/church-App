/**
 * BookmarksPanel Component
 * Displays saved verses in a clean card list with copy, navigation, and remove actions.
 */

function BookmarksPanel({ bookmarks = [], onRemoveBookmark, onNavigateToVerse, onCopyVerse }) {
  return (
    <section className="bookmarks-panel-card" aria-label="Saved Bookmarks Panel">
      <div className="bookmarks-header-row">
        <div>
          <h2 className="bookmarks-title">Saved Bible Verses</h2>
          <p className="bookmarks-subtitle">
            Saved locally in your browser. Read, copy, or jump directly to your favorite passages.
          </p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="bookmarks-empty-state">
          <div className="empty-icon-box">🔖</div>
          <h3>No Bookmarks Saved Yet</h3>
          <p>Click the bookmark icon (★) beside any verse while reading Scripture to save it here.</p>
        </div>
      ) : (
        <div className="bookmarks-list-grid">
          {bookmarks.map((bm) => (
            <div key={bm.id} className="bookmark-item-card">
              <div className="bookmark-card-top">
                <div className="bookmark-ref-names">
                  <span className="bookmark-ref-en">{bm.bookName} {bm.chapter}:{bm.verse}</span>
                  <span className="bookmark-ref-te">({bm.bookTeluguName} {bm.chapter}:{bm.verse})</span>
                </div>
                <span className="bookmark-badge-trans">{bm.translation}</span>
              </div>

              <blockquote className="bookmark-verse-quote">
                &ldquo;{bm.text}&rdquo;
              </blockquote>

              <div className="bookmark-card-actions">
                <button
                  type="button"
                  className="btn-bookmark-action btn-bm-read"
                  onClick={() => onNavigateToVerse && onNavigateToVerse(bm.bookSlug, bm.chapter, bm.verse)}
                >
                  📖 Read Chapter
                </button>
                <button
                  type="button"
                  className="btn-bookmark-action btn-bm-copy"
                  onClick={() => onCopyVerse && onCopyVerse({
                    book: { name: bm.bookName },
                    chapter: bm.chapter,
                    verse: bm.verse,
                    text: bm.text
                  })}
                  title="Copy verse"
                >
                  📋 Copy
                </button>
                <button
                  type="button"
                  className="btn-bookmark-action btn-bm-delete"
                  onClick={() => onRemoveBookmark && onRemoveBookmark(bm.verse)}
                  title="Remove from bookmarks"
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

window.BookmarksPanel = BookmarksPanel;
