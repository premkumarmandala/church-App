/* ==========================================================================
   Announcements Component - Grace Fellowship Church
   Carousel of announcements, event posters, and conference notices
   ========================================================================== */

function Announcements() {
  const [startIndex, setStartIndex] = React.useState(0);

  const announcementsData = [
    {
      id: 1,
      title: "YOUTH CONFERENCE 2024",
      subtitle: "Rise Up & Shine Forth - Ignite Your Faith",
      date: "Aug 15 – 17, 2024",
      time: "10:00 AM Daily",
      location: "Sanctuary & Youth Hall",
      image: "home/assets/youth_conference.jpg",
      actionText: "Register Now",
      tag: "Youth Ministry",
      tagClass: "badge-youth"
    },
    {
      id: 2,
      title: "WOMEN'S FELLOWSHIP",
      subtitle: "A Time of Prayer, Worship & Sisterhood",
      date: "Sat, Aug 24, 2024",
      time: "10:00 AM – 11:30 AM",
      location: "Church Main Hall",
      image: "home/assets/womens_fellowship.jpg",
      actionText: "Register Now",
      tag: "Fellowship",
      tagClass: "badge-fellowship"
    },
    {
      id: 3,
      title: "Special Prayer Meeting",
      subtitle: "Intercessory Prayer for Families & Nation",
      date: "Aug 30, 2024",
      time: "6:30 PM – 8:00 PM",
      location: "Church Sanctuary",
      image: "home/assets/open_bible_banner.jpg",
      actionText: "Join In-Person",
      tag: "Prayer & Care",
      tagClass: "badge-outreach"
    }
  ];

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? announcementsData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev === announcementsData.length - 1 ? 0 : prev + 1));
  };

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
            <span>&gt;</span>
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
            &#8249;
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
                  <button
                    type="button"
                    className="announcement-btn"
                    onClick={() => {
                      alert(`Thank you for your interest in ${item.title}! Registration is open at church office.`);
                    }}
                  >
                    {item.actionText}
                  </button>
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
            &#8250;
          </button>
        </div>
      </div>
    </section>
  );
}

window.Announcements = Announcements;
