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
          <span className="section-title-icon" style={{ color: "#0066cc" }}>📅</span>
          <h2 className="section-title-text">Upcoming Events</h2>
        </div>
        <a href="#events" className="section-view-all">
          <span>View All</span>
          <span>&gt;</span>
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
              <p className="event-meta-line">
                <span className="event-date">📅 {event.date}</span>
                <span className="event-venue">📍 {event.location}</span>
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
