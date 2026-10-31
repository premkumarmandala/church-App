/* ==========================================================================
   ServiceTimings Component - Grace Fellowship Church
   Worship schedules, languages, and service timings in pastel cards
   ========================================================================== */

function ServiceTimings() {
  const serviceSchedules = [
    {
      id: 1,
      cardClass: "card-blue",
      iconClass: "timing-icon-blue",
      icon: "⛪",
      title: "Sunday Worship",
      hours: "10:00 AM – 12:00 PM",
      subtitle: "English & Telugu"
    },
    {
      id: 2,
      cardClass: "card-peach",
      iconClass: "timing-icon-peach",
      icon: "👥",
      title: "Sunday School",
      hours: "10:00 AM – 11:00 AM",
      subtitle: "Children & Youth"
    },
    {
      id: 3,
      cardClass: "card-purple",
      iconClass: "timing-icon-purple",
      icon: "🙏",
      title: "Wednesday Prayer",
      hours: "7:00 PM – 8:00 PM",
      subtitle: "Online & In-Person"
    },
    {
      id: 4,
      cardClass: "card-green",
      iconClass: "timing-icon-green",
      icon: "📖",
      title: "Friday Bible Study",
      hours: "7:00 PM – 8:00 PM",
      subtitle: "English & Telugu"
    }
  ];

  return (
    <section id="service-timings" className="home-container home-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" style={{ color: "#0066cc" }}>🕒</span>
          <h2 className="section-title-text">Service Timings</h2>
        </div>
        <a href="#contact" className="section-view-all">
          <span>View Details</span>
          <span>&gt;</span>
        </a>
      </div>

      <div className="timings-grid">
        {serviceSchedules.map((schedule) => (
          <div key={schedule.id} className={`timing-card ${schedule.cardClass}`}>
            <div className={`timing-icon-badge ${schedule.iconClass}`}>
              {schedule.icon}
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
