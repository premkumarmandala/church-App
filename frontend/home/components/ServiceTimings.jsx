/* ==========================================================================
   ServiceTimings Component - Grace Fellowship Church
   Worship schedules, languages, and service timings in clean unified cards
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function ServiceTimings({ data }) {
  const renderTimingIcon = (name) => {
    if (name === "people" || name === "users") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      );
    }
    if (name === "prayer" || name === "pray") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
        </svg>
      );
    }
    if (name === "bible" || name === "book") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20M7 8h10"></path>
      </svg>
    );
  };

  const fallbackSchedules = [
    {
      id: 1,
      iconName: "church",
      title: "Sunday Worship",
      hours: "10:00 AM – 12:00 PM",
      subtitle: "English & Telugu"
    },
    {
      id: 2,
      iconName: "people",
      title: "Sunday School",
      hours: "10:00 AM – 11:00 AM",
      subtitle: "Children & Youth"
    },
    {
      id: 3,
      iconName: "prayer",
      title: "Wednesday Prayer",
      hours: "7:00 PM – 8:00 PM",
      subtitle: "Online & In-Person"
    },
    {
      id: 4,
      iconName: "bible",
      title: "Friday Bible Study",
      hours: "7:00 PM – 8:00 PM",
      subtitle: "English & Telugu"
    }
  ];

  const serviceSchedules = (Array.isArray(data) && data.length > 0)
    ? data.map((schedule) => ({
        id: schedule.id,
        iconName: schedule.icon_name || "church",
        title: schedule.title,
        hours: schedule.hours,
        subtitle: schedule.subtitle,
      }))
    : fallbackSchedules;

  return (
    <section id="service-timings" className="home-container home-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </span>
          <h2 className="section-title-text">Service Timings</h2>
        </div>
        <a href="#contact" className="section-view-all">
          <span>View Details</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      </div>

      <div className="timings-grid">
        {serviceSchedules.map((schedule) => (
          <div key={schedule.id} className="timing-card">
            <div className="timing-icon-badge">
              {renderTimingIcon(schedule.iconName)}
            </div>
            <div className="timing-info">
              <h3 className="timing-title">{schedule.title}</h3>
              <p className="timing-hours">{schedule.hours}</p>
              <p className="timing-subtitle">{schedule.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
