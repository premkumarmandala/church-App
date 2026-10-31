/* ==========================================================================
   VerseOfTheDay Component - Grace Fellowship Church
   Displays curated daily scripture banner with API integration and Bible link
   ========================================================================== */

function VerseOfTheDay() {
  const [verse, setVerse] = React.useState({
    text: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1 (KJV)",
    book: "psalms",
    chapter: 23,
    verseNum: 1
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const fetchDailyVerse = async () => {
      try {
        setLoading(true);
        const apiBase = window.API_BASE_URL || (window.location.protocol === "file:" ? "http://localhost:8000" : "");
        const res = await fetch(`${apiBase}/api/bible/daily-verse`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && data.kjvText) {
            setVerse({
              text: data.kjvText,
              reference: `${data.bookName || data.book} ${data.chapter}:${data.verse} (KJV)`,
              book: data.book,
              chapter: data.chapter,
              verseNum: data.verse
            });
          }
        }
      } catch (err) {
        // Fallback to reference verse from screenshot
        console.log("Verse of the day fallback active:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDailyVerse();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="verse-of-the-day" className="home-container" style={{ marginTop: "24px" }}>
      <div className="votd-card">
        {/* Left Visual: Open Bible Photo */}
        <div className="votd-left-visual">
          <img
            src="home/assets/open_bible_banner.jpg"
            alt="Holy Bible Open Scripture"
            className="votd-bible-img"
            loading="lazy"
          />
        </div>

        {/* Center Content */}
        <div className="votd-content">
          <div className="votd-header">
            <span className="votd-header-icon">📖</span>
            <span className="votd-header-title">Verse of the Day</span>
          </div>
          <p className="votd-text">
            “{verse.text}”
          </p>
          <p className="votd-reference">{verse.reference}</p>
        </div>

        {/* Right CTA Button */}
        <a
          href="bible/index.html"
          className="btn-votd-read"
          title="Study this verse in the Online Bible reader"
        >
          <span>Read in Bible</span>
          <span>➔</span>
        </a>
      </div>
    </section>
  );
}
