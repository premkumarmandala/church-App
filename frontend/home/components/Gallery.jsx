/* ==========================================================================
   Gallery Component - Grace Fellowship Church
   Photo & media highlights with category filter and lightbox preview
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function Gallery({ data }) {
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [lightboxItem, setLightboxItem] = React.useState(null);

  const formatMediaUrl = (url, fallback = "/admin-data/gallery/worship_service.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const rawItems = (Array.isArray(data) && data.length > 0) ? data : [];

  const categories = ["All", "Worship", "Youth", "Fellowship", "Special"];

  const filteredItems = React.useMemo(() => {
    if (activeCategory === "All") return rawItems;
    return rawItems.filter((item) => (item.category || "").toLowerCase() === activeCategory.toLowerCase());
  }, [rawItems, activeCategory]);

  if (!rawItems || rawItems.length === 0) return null;

  return (
    <section id="gallery" className="home-section-wrap bg-page">
      <div className="home-container home-section">
        <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </span>
          <h2 className="section-title-text">Church Gallery &amp; Highlights</h2>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="gallery-filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`gallery-filter-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="gallery-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="gallery-media-card"
            onClick={() => setLightboxItem(item)}
          >
            <div className="gallery-thumb-container">
              <img
                src={formatMediaUrl(item.media_url, "/admin-data/gallery/worship_service.jpg")}
                alt={item.title}
                className="gallery-thumb-img"
                loading="lazy"
              />
              <span className="gallery-card-badge">{item.category || "Church"}</span>
              <span className="gallery-card-type">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Photo</span>
              </span>
            </div>
            <div className="gallery-body-box">
              <h3 className="gallery-item-title">{item.title}</h3>
              <p className="gallery-item-caption">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="modal-backdrop-church"
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lightbox-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={formatMediaUrl(lightboxItem.media_url, "/admin-data/gallery/worship_service.jpg")}
              alt={lightboxItem.title}
              className="lightbox-img"
            />
            <div className="lightbox-caption-bar">
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: 700, color: "#ffffff" }}>
                  {lightboxItem.title}
                </h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
                  {lightboxItem.caption} • <span style={{ color: "#c59b27" }}>{lightboxItem.category}</span>
                </p>
              </div>
              <button
                type="button"
                className="btn-modal-close-icon"
                onClick={() => setLightboxItem(null)}
                title="Close preview"
                aria-label="Close image preview"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </section>
);
}

