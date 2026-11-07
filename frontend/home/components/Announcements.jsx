/* ==========================================================================
   Announcements Component - Grace Fellowship Church
   Carousel of announcements, event posters, and conference notices
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function Announcements({ data }) {
  const [startIndex, setStartIndex] = React.useState(0);

  const formatMediaUrl = (url, fallback = "/admin-data/home/announcements/youth_conference.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const announcementsData = (Array.isArray(data) && data.length > 0)
    ? data.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        date: item.date_text,
        time: item.time_text,
        location: item.location,
        image: formatMediaUrl(item.image, "/admin-data/home/announcements/youth_conference.jpg"),
        actionText: item.action_text || "Learn More",
        actionLink: item.action_link || "#contact",
        tag: item.tag || "Announcement",
        tagClass: item.tag_class === "blue" ? "badge-youth" : item.tag_class === "emerald" ? "badge-outreach" : "badge-fellowship",
      }))
    : [];

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? announcementsData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev === announcementsData.length - 1 ? 0 : prev + 1));
  };

  if (!announcementsData || announcementsData.length === 0) return null;

  return (
    <section id="announcements" className="home-container" style={{ marginTop: "24px" }}>
      <div className="announcements-box">
        {/* Header */}
        <div className="announcements-header">
          <div className="section-title-wrap">
            <span className="section-title-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </span>
            <h2 className="section-title-text">Announcements</h2>
          </div>
          <a href="#events" className="section-view-all">
            <span>View All</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </a>
        </div>

        {/* Carousel Grid with Controls */}
        <div className="announcements-carousel-wrapper">
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={handlePrev}
            aria-label="Previous announcement"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="announcements-grid">
            {announcementsData.map((item) => (
              <div key={item.id} className="announcement-card">
                <img
                  src={item.image}
                  alt={item.title}
                  className="announcement-banner-img"
                  loading="lazy"
                />
                <div className="announcement-body">
                  <span className={`announcement-tag ${item.tagClass}`}>{item.tag}</span>
                  <h3 className="announcement-card-title">{item.title}</h3>
                  <div className="announcement-meta">
                    <span>{item.date} {item.time ? `• ${item.time}` : ""}</span>
                    <span>{item.location}</span>
                  </div>
                  {item.actionLink && item.actionLink.startsWith("http") ? (
                    <a
                      href={item.actionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-announcement-action"
                      style={{ textAlign: "center", textDecoration: "none" }}
                    >
                      {item.actionText}
                    </a>
                  ) : (
                    <a
                      href={item.actionLink || "#contact"}
                      className="btn-announcement-action"
                      style={{ textAlign: "center", textDecoration: "none" }}
                    >
                      {item.actionText}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={handleNext}
            aria-label="Next announcement"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
