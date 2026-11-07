/* ==========================================================================
   About Component - Grace Fellowship Church
   Church history, doctrinal pillars, core beliefs, and pastoral profile
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function About({ data }) {
  const formatMediaUrl = (url, fallback = "/admin-data/sermons/thumbnails/sermon_pastor.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const history = data?.history_text || data?.church_history || "Founded in faith, Grace Fellowship Church has stood as a beacon of Christ's love and grace in our community for over two decades.";
  const mission = data?.mission_text || "To glorify God by making disciples of Jesus Christ who love God, love people, and transform communities.";
  const vision = data?.vision_text || "A vibrant, Christ-centered, multi-generational church impacting generations with the Gospel.";
  const pastorName = data?.lead_pastor_name || "Pastor John Samuel";
  const pastorTitle = data?.lead_pastor_title || "Senior Pastor";
  const pastorBio = data?.lead_pastor_bio || "Serving with humility and love, Pastor John Samuel has dedicated his life to teaching God's Word with clarity, passion, and pastoral care.";
  const pastorImage = formatMediaUrl(data?.lead_pastor_image, "/admin-data/sermons/thumbnails/sermon_pastor.jpg");

  let beliefs = [
    "Authority of Holy Scripture",
    "The Trinity (Father, Son, Holy Spirit)",
    "Salvation by Grace Through Faith",
    "Water Baptism and Communion",
    "The Power of Prayer & Intercession",
    "Christ-Centered Worship",
    "Loving Christian Fellowship",
    "The Great Commission"
  ];

  if (data?.beliefs_json) {
    try {
      const parsed = typeof data.beliefs_json === "string" ? JSON.parse(data.beliefs_json) : data.beliefs_json;
      if (Array.isArray(parsed) && parsed.length > 0) {
        beliefs = parsed;
      }
    } catch (e) {
      // fallback to default
    }
  }

  return (
    <section id="about" className="home-section-wrap bg-page">
      <div className="home-container home-section">
        <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M7 8h10" />
            </svg>
          </span>
          <h2 className="section-title-text">About Our Church</h2>
        </div>
      </div>

      <div className="about-intro-grid">
        {/* Left Column: History & Core Pillars */}
        <div>
          <div className="about-history-card">
            <h3 className="about-history-title">Our Heritage & Calling</h3>
            <p className="about-history-text">{history}</p>
            {mission && (
              <div style={{ marginTop: "14px", fontSize: "0.925rem", color: "#334155", lineHeight: "1.6" }}>
                <strong style={{ color: "#0f172a" }}>Our Mission: </strong>
                <span>{mission}</span>
              </div>
            )}
            {vision && (
              <div style={{ marginTop: "8px", fontSize: "0.925rem", color: "#334155", lineHeight: "1.6" }}>
                <strong style={{ color: "#0f172a" }}>Our Vision: </strong>
                <span>{vision}</span>
              </div>
            )}
          </div>

          {/* Pillars Grid */}
          <div className="about-pillars-grid">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="about-pillar-box">
                <div className="pillar-icon-wrap">
                  {pillar.icon}
                </div>
                <h4 className="pillar-title">{pillar.title}</h4>
                <p className="pillar-desc">{pillar.desc}</p>
              </div>
            ))}
          </div>

          {/* Core Beliefs Tag List */}
          <div className="beliefs-section-wrap">
            <h4 className="beliefs-title">What We Believe</h4>
            <div className="beliefs-tags-list">
              {beliefs.map((belief, idx) => (
                <span key={idx} className="belief-tag-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{belief}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pastoral Leadership Card */}
        <div>
          <div className="pastor-profile-card">
            <div className="pastor-photo-wrap">
              <img
                src={pastorImage}
                alt={pastorName}
                className="pastor-photo-img"
                loading="eager"
              />
            </div>
            <h3 className="pastor-name-heading">{pastorName}</h3>
            <p className="pastor-role-sub">{pastorTitle}</p>
            <p className="pastor-bio-text">{pastorBio}</p>

            <div style={{ marginTop: "20px", padding: "14px 16px", background: "#f8fafc", borderRadius: "8px", borderLeft: "3px solid var(--color-accent)" }}>
              <p style={{ margin: 0, fontStyle: "italic", fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>
                “Our prayer is that everyone who enters our doors encounters the living Christ, experiences genuine fellowship, and discovers their God-given purpose.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
}

