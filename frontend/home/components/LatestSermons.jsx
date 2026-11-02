/* ==========================================================================
   LatestSermons Component - Grace Fellowship Church
   Sermon video cards with duration badges, speaker info, and audio player
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function LatestSermons({ data }) {
  const [activeSermon, setActiveSermon] = React.useState(null);

  const fallbackSermons = [
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

  const sermons = (Array.isArray(data) && data.length > 0)
    ? data.map((s) => ({
        id: s.id,
        title: s.title,
        speaker: s.speaker || "Ps. John Samuel",
        date: s.date_text ? `• ${s.date_text}` : "",
        duration: s.duration || "45:00",
        thumbnail: s.thumbnail || "home/assets/sermon_pastor.jpg",
        passage: s.passage || "",
        video_url: s.video_url,
        audio_url: s.audio_url,
        description: s.description,
      }))
    : fallbackSermons;

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
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePlaySermon(sermon);
              }
            }}
            aria-label={`Watch sermon: ${sermon.title}`}
          >
            {/* Thumbnail with Overlay & Duration */}
            <div className="sermon-thumb-wrap">
              <img
                src={sermon.thumbnail}
                alt={sermon.title}
                className="sermon-thumb-img"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "home/assets/sermon_pastor.jpg";
                }}
              />
              <div className="sermon-play-pill" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="sermon-duration-tag">{sermon.duration}</span>
            </div>

            {/* Sermon Metadata */}
            <div className="sermon-details">
              <h3 className="sermon-card-title">{sermon.title}</h3>
              <p className="sermon-speaker-line">
                <span className="speaker-name">{sermon.speaker}</span>
                <span className="speaker-date">{sermon.date}</span>
              </p>
              {sermon.passage && (
                <p className="sermon-passage-line" style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "4px" }}>
                  📖 {sermon.passage}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Sermon Player Modal */}
      {activeSermon && (
        <div
          className="sermon-modal-overlay"
          onClick={() => setActiveSermon(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="sermon-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sermon-modal-header">
              <h3 className="sermon-modal-title">{activeSermon.title}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveSermon(null)}
                aria-label="Close sermon video"
              >
                &times;
              </button>
            </div>
            <div className="sermon-modal-player">
              {activeSermon.video_url && activeSermon.video_url.includes("youtube.com") ? (
                <iframe
                  src={activeSermon.video_url.replace("watch?v=", "embed/")}
                  title={activeSermon.title}
                  style={{ width: "100%", height: "360px", border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div style={{ position: "relative", width: "100%", height: "280px", background: "#081220", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={activeSermon.thumbnail}
                    alt={activeSermon.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }}
                  />
                  <div style={{ position: "absolute", textAlign: "center", color: "#fff", padding: "16px" }}>
                    <div style={{ fontSize: "2.5rem", color: "#c59b27" }}>▶</div>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: "8px" }}>{activeSermon.title}</div>
                    <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>Preached by {activeSermon.speaker} {activeSermon.date}</div>
                  </div>
                </div>
              )}
              {activeSermon.description && (
                <div style={{ padding: "16px 20px", background: "#fff", fontSize: "0.875rem", color: "#334155", lineHeight: 1.6 }}>
                  {activeSermon.description}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
