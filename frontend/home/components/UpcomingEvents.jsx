/* ==========================================================================
   UpcomingEvents Component - Grace Fellowship Church
   Upcoming church events, posters, dates, venues, and registration buttons
   ========================================================================== */

function UpcomingEvents() {
  const events = [
    {
      id: 1,
      title: "Church Picnic",
      date: "Sep 14, 2024",
      location: "Riverside Park",
      image: "home/assets/church_picnic.jpg",
      actionText: "Register Now"
    },
    {
      id: 2,
      title: "BIBLE CAMP",
      date: "Oct 5 – 7, 2024",
      location: "Camp Grace",
      image: "home/assets/bible_camp.jpg",
      actionText: "Register Now"
    },
    {
      id: 3,
      title: "Christmas Celebration",
      date: "Dec 25, 2024",
      location: "Church Main Hall",
      image: "home/assets/christmas_celebration.jpg",
      actionText: "Learn More"
    }
  ];

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
              />
            </div>
            <div className="event-card-details">
              <h3 className="event-heading">{event.title}</h3>
              <p className="event-meta-line">
                <span>📅</span>
                <span>{event.date}</span>
              </p>
              <p className="event-meta-line">
                <span>📍</span>
                <span>{event.location}</span>
              </p>
              <button
                type="button"
                className="btn-event-action"
                onClick={() => {
                  alert(`Registration for "${event.title}" is open. Please contact the church office or visit the sanctuary entrance.`);
                }}
              >
                {event.actionText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
