/* ==========================================================================
   UpcomingEvents Component - Grace Fellowship Church
   Upcoming church events, posters, dates, venues, and registration buttons
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function UpcomingEvents({ data }) {
  const formatMediaUrl = (url, fallback = "/admin-data/events/church_picnic.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const events = (Array.isArray(data) && data.length > 0)
    ? data.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date_text,
        location: e.location,
        image: formatMediaUrl(e.image, "/admin-data/events/church_picnic.jpg"),
        actionText: e.action_text || "Register Now",
        registration_link: e.registration_link || "#contact",
      }))
    : [];

  if (!events || events.length === 0) return null;

  return (
    <section id="events" className="home-container home-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
          <h2 className="section-title-text">Upcoming Events</h2>
        </div>
        <a href="#events" className="section-view-all">
          <span>View All</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      </div>

      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="event-item-card">
            <div className="event-thumb-wrapper">
              <img
                src={event.image}
                alt={event.title}
                className="event-thumb-img"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "home/assets/church_picnic.jpg";
                }}
              />
            </div>
            <div className="event-card-details">
              <h3 className="event-heading">{event.title}</h3>
              <p className="event-meta-line" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span className="event-date" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{event.date}</span>
                </span>
                <span className="event-venue" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{event.location}</span>
                </span>
              </p>
              {event.registration_link && event.registration_link.startsWith("http") ? (
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-event-register"
                  style={{ textAlign: "center", textDecoration: "none" }}
                >
                  {event.actionText}
                </a>
              ) : (
                <a
                  href={event.registration_link || "#contact"}
                  className="btn-event-register"
                  style={{ textAlign: "center", textDecoration: "none" }}
                >
                  {event.actionText}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
