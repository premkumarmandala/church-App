/**
 * DailyVerseHero Component
 * Recreates the Verse of the Day banner with sunrise cross mountain backdrop,
 * date pill badge, elegant italic serif quotation, bilingual references, and chapter CTA.
 */

function DailyVerseHero({ dailyVerse, selectedLang, onReadChapter }) {
  if (!dailyVerse) return null;

  const isTelugu = selectedLang === "telugu";
  const quoteText = isTelugu ? dailyVerse.teluguText : dailyVerse.kjvText;
  const primaryRef = isTelugu ? dailyVerse.referenceTe : dailyVerse.referenceEn;
  const secondaryRef = isTelugu ? dailyVerse.referenceEn : dailyVerse.referenceTe;

  return (
    <section className="daily-verse-hero" aria-label="Verse of the Day Banner">
      <div className="daily-hero-card">
        {/* Dark Gradient Overlay for optimal contrast */}
        <div className="daily-hero-overlay" />

        <div className="daily-hero-content">
          {/* Top Pill Badge */}
          <div className="daily-hero-badge">
            <span className="badge-cross-symbol">✝</span>
            <span className="badge-tag-text">VERSE OF THE DAY</span>
            <span className="badge-date-text">{dailyVerse.date || "27 OCT"}</span>
          </div>

          {/* Quotation */}
          <blockquote className={`daily-hero-quote ${isTelugu ? "telugu-font" : ""}`}>
            &ldquo;{quoteText}&rdquo;
          </blockquote>

          {/* Reference & Action Row */}
          <div className="daily-hero-footer">
            <div className="daily-hero-reference-group">
              <span className="daily-primary-ref">{primaryRef}</span>
              <span className="daily-secondary-ref">({secondaryRef})</span>
            </div>

            <button
              type="button"
              className="btn-read-full-chapter"
              onClick={() => onReadChapter && onReadChapter(dailyVerse.bookSlug, dailyVerse.chapter)}
              title="Navigate to full chapter in Scripture reader"
            >
              <svg className="btn-book-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span>Read Full Chapter</span>
              <span className="chevron-right-arrow">&gt;</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

window.DailyVerseHero = DailyVerseHero;
