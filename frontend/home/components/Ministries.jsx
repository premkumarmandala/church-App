/* ==========================================================================
   Ministries Component - Grace Fellowship Church
   Ministry departments: Children, Youth, Women, Men, Prayer, and Outreach
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function Ministries({ data }) {
  const [selectedMinistry, setSelectedMinistry] = React.useState(null);

  const formatMediaUrl = (url, fallback = "/admin-data/ministries/children_ministry.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const fallbackMinistries = [
    { id: 1, name: "Children's Ministry", photo: "/admin-data/ministries/children_ministry.jpg", description: "Sunday School, biblical foundations, crafts, and songs for children." },
    { id: 2, name: "Youth Ministry", photo: "/admin-data/home/announcements/youth_conference.jpg", description: "Empowering teens and young adults to stand bold for Christ." },
    { id: 3, name: "Women's Ministry", photo: "/admin-data/home/announcements/womens_fellowship.jpg", description: "Encouraging sisters in faith, discipleship, and prayer fellowship." },
    { id: 4, name: "Men's Ministry", photo: "/admin-data/ministries/fellowship_service.jpg", description: "Building strong godly fathers, husbands, and leaders in Christ." },
    { id: 5, name: "Prayer Ministry", photo: "/admin-data/sermons/thumbnails/prayer_hands.jpg", description: "Faithful intercession for our church, community, and global needs." },
    { id: 6, name: "Outreach & Missions", photo: "/admin-data/home/announcements/open_bible_banner.jpg", description: "Sharing the love of Christ through local and regional benevolence." },
  ];

  const ministryList = (Array.isArray(data) && data.length > 0)
    ? data.map((m) => ({
        id: m.id,
        name: m.name,
        photo: formatMediaUrl(m.photo, "/admin-data/ministries/children_ministry.jpg"),
        description: m.short_description || m.full_description || m.description,
        meeting_time: m.meeting_time,
        leader_name: m.leader_name,
      }))
    : fallbackMinistries;

  return (
    <section id="ministries" className="home-container home-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </span>
          <h2 className="section-title-text">Our Ministries</h2>
        </div>
        <a href="#ministries" className="section-view-all">
          <span>View All</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      </div>

      <div className="ministries-row">
        {ministryList.map((m) => (
          <div
            key={m.id}
            className="ministry-unit-card"
            onClick={() => setSelectedMinistry(m)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedMinistry(m);
              }
            }}
            aria-label={`View ${m.name} details`}
          >
            <div className="ministry-avatar-wrapper">
              <img
                src={m.photo}
                alt={m.name}
                className="ministry-circle-img"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "home/assets/children_ministry.jpg";
                }}
              />
            </div>
            <h3 className="ministry-card-label">{m.name}</h3>
          </div>
        ))}
      </div>

      {/* Ministry Detail Modal */}
      {selectedMinistry && (
        <div className="modal-backdrop-church" onClick={() => setSelectedMinistry(null)} role="dialog" aria-modal="true">
          <div className="donate-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="donate-modal-header">
              <div>
                <h3 className="donate-header-title">{selectedMinistry.name}</h3>
                <p className="donate-header-sub">{selectedMinistry.leader_name ? `Led by ${selectedMinistry.leader_name}` : "Church Fellowship Ministry"}</p>
              </div>
              <button
                type="button"
                className="btn-modal-close-icon"
                onClick={() => setSelectedMinistry(null)}
                aria-label="Close modal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="donate-modal-body">
              {selectedMinistry.photo && (
                <img
                  src={selectedMinistry.photo}
                  alt={selectedMinistry.name}
                  style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }}
                />
              )}
              <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>
                {selectedMinistry.description || "A dedicated ministry for discipleship, spiritual growth, and community fellowship."}
              </p>
              {selectedMinistry.meeting_time && (
                <div style={{ padding: "10px 14px", background: "var(--color-surface-subtle)", borderRadius: "8px", fontSize: "0.85rem", color: "var(--color-primary-800)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span><strong>Schedule:</strong> {selectedMinistry.meeting_time}</span>
                </div>
              )}
              <a
                href="#contact"
                className="btn-hero-primary"
                style={{ width: "100%", textAlign: "center", textDecoration: "none", display: "block" }}
                onClick={() => setSelectedMinistry(null)}
              >
                Connect with Ministry Leaders
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
