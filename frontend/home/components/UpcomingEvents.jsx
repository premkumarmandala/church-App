/* ==========================================================================
   UpcomingEvents Component - Grace Fellowship Church
   Upcoming church events, posters, dates, venues, and registration buttons
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function UpcomingEvents({ data }) {
  const fallbackEvents = [
    {
      id: 1,
      title: "Church Picnic",
      date: "Sep 14, 2024",
      location: "Riverside Park",
      image: "home/assets/church_picnic.jpg",
      actionText: "Register Now",
      registration_link: "#contact"
    },
    {
      id: 2,
      title: "BIBLE CAMP",
      date: "Oct 5 – 7, 2024",
      location: "Camp Grace",
      image: "home/assets/bible_camp.jpg",
      actionText: "Register Now",
      registration_link: "#contact"
    },
    {
      id: 3,
      title: "Christmas Celebration",
      date: "Dec 25, 2024",
      location: "Church Main Hall",
      image: "home/assets/christmas_celebration.jpg",
      actionText: "Learn More",
      registration_link: "#contact"
    }
  ];

  const events = (Array.isArray(data) && data.length > 0)
    ? data.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date_text,
        location: e.location,
        image: e.image || "home/assets/church_picnic.jpg",
        actionText: e.action_text || "Register Now",
        registration_link: e.registration_link || "#contact",
      }))
    : fallbackEvents;

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
