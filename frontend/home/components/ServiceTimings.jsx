/* ==========================================================================
   ServiceTimings Component - Grace Fellowship Church
   Worship schedules, languages, and service timings in pastel cards
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function ServiceTimings({ data }) {
  const fallbackSchedules = [
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

  const getStyleClasses = (cls, idx) => {
    if (cls === "highlight") return { card: "card-peach", icon: "timing-icon-peach" };
    if (cls === "gold") return { card: "card-purple", icon: "timing-icon-purple" };
    if (cls === "card-blue" || cls === "standard") return { card: "card-blue", icon: "timing-icon-blue" };
    if (cls === "card-green") return { card: "card-green", icon: "timing-icon-green" };
    const palette = [
      { card: "card-blue", icon: "timing-icon-blue" },
      { card: "card-peach", icon: "timing-icon-peach" },
      { card: "card-purple", icon: "timing-icon-purple" },
      { card: "card-green", icon: "timing-icon-green" },
    ];
    return palette[idx % palette.length];
  };

  const serviceSchedules = (Array.isArray(data) && data.length > 0)
    ? data.map((schedule, idx) => {
        const styles = getStyleClasses(schedule.card_class, idx);
        return {
          id: schedule.id,
          cardClass: styles.card,
          iconClass: styles.icon,
          icon: schedule.icon_name === "people" ? "👥" : schedule.icon_name === "prayer" ? "🙏" : schedule.icon_name === "bible" ? "📖" : "⛪",
          title: schedule.title,
          hours: schedule.hours,
          subtitle: schedule.subtitle,
        };
      })
    : fallbackSchedules;

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
