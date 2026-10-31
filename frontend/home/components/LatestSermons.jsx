/* ==========================================================================
   LatestSermons Component - Grace Fellowship Church
   Sermon video cards with duration badges, speaker info, and audio player
   ========================================================================== */

function LatestSermons() {
  const [activeSermon, setActiveSermon] = React.useState(null);

  const sermons = [
    {
      id: 1,
      title: "Walking in Faith",
      speaker: "Ps. John Samuel",
      date: "• Aug 11, 2024",
      duration: "45:20",
      thumbnail: "home/assets/sermon_pastor.jpg",
      passage: "Hebrews 11:1–6"
    },
    {
      id: 2,
      title: "The Power of Prayer",
      speaker: "Ps. John Samuel",
      date: "• Aug 4, 2024",
      duration: "38:15",
      thumbnail: "home/assets/hero_cross_sunset.jpg",
      passage: "James 5:16"
    },
    {
      id: 3,
      title: "A Heart of Gratitude",
      speaker: "Ps. John Samuel",
      date: "• Jul 28, 2024",
      duration: "42:10",
      thumbnail: "home/assets/prayer_hands.jpg",
      passage: "1 Thessalonians 5:16–18"
    },
    {
      id: 4,
      title: "Growing in God's Word",
      speaker: "Ps. John Samuel",
      date: "• Jul 21, 2024",
      duration: "50:05",
      thumbnail: "home/assets/open_bible_banner.jpg",
      passage: "2 Timothy 3:16–17"
    }
  ];

  const handlePlaySermon = (sermon) => {
    setActiveSermon(sermon);
  };

  return (
    <section id="sermons" className="home-container home-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" style={{ color: "#0066cc" }}>▶</span>
          <h2 className="section-title-text">Latest Sermons</h2>
        </div>
        <a href="#sermons" className="section-view-all">
          <span>View All</span>
          <span>&gt;</span>
        </a>
      </div>

      <div className="sermons-grid">
        {sermons.map((sermon) => (
          <article
            key={sermon.id}
            className="sermon-video-card"
            onClick={() => handlePlaySermon(sermon)}
            title={`Listen to ${sermon.title}`}
          >
            <div className="sermon-thumb-box">
              <img
                src={sermon.thumbnail}
                alt={sermon.title}
                className="sermon-thumb-img"
                loading="lazy"
              />
              <span className="sermon-duration-tag">{sermon.duration}</span>
              <div className="sermon-play-overlay">
                <div className="sermon-play-icon">▶</div>
              </div>
            </div>

            <div className="sermon-info-box">
              <h3 className="sermon-card-title">{sermon.title}</h3>
              <p className="sermon-card-speaker">{sermon.speaker}</p>
              <p className="sermon-card-date">{sermon.date}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Active Sermon Audio Player Modal / Drawer */}
      {activeSermon && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px 20px",
            background: "#0f1e36",
            borderRadius: "12px",
            color: "#ffffff",
            display: "flex",
            alignitems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div>
            <span style={{ fontSize: "0.8rem", color: "#c59b27", fontWeight: 700, textTransform: "uppercase" }}>
              Now Playing
            </span>
            <h4 style={{ margin: "2px 0", fontSize: "1.05rem" }}>
              {activeSermon.title} — {activeSermon.speaker}
            </h4>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Scripture: {activeSermon.passage}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <audio controls autoPlay style={{ height: "36px" }}>
              <source src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=" type="audio/wav" />
              Your browser does not support audio playback.
            </audio>
            <button
              type="button"
              onClick={() => setActiveSermon(null)}
              style={{ color: "#ffffff", fontSize: "1.2rem", padding: "4px 8px" }}
              title="Close player"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
