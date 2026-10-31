/* ==========================================================================
   Ministries Component - Grace Fellowship Church
   Ministry departments: Children, Youth, Women, Men, Prayer, and Outreach
   ========================================================================== */

function Ministries() {
  const ministryList = [
    {
      id: 1,
      name: "Children's Ministry",
      photo: "home/assets/children_ministry.jpg"
    },
    {
      id: 2,
      name: "Youth Ministry",
      photo: "home/assets/youth_conference.jpg"
    },
    {
      id: 3,
      name: "Women's Ministry",
      photo: "home/assets/womens_fellowship.jpg"
    },
    {
      id: 4,
      name: "Men's Ministry",
      photo: "home/assets/fellowship_service.jpg"
    },
    {
      id: 5,
      name: "Prayer Ministry",
      photo: "home/assets/prayer_hands.jpg"
    },
    {
      id: 6,
      name: "Outreach Ministry",
      photo: "home/assets/worship_service.jpg"
    }
  ];

  return (
    <section id="ministries" className="home-container home-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" style={{ color: "#0066cc" }}>👥</span>
          <h2 className="section-title-text">Our Ministries</h2>
        </div>
        <a href="#ministries" className="section-view-all">
          <span>View All</span>
          <span>&gt;</span>
        </a>
      </div>

      <div className="ministries-row">
        {ministryList.map((m) => (
          <div
            key={m.id}
            className="ministry-unit-card"
            onClick={() => {
              alert(`Learn more about ${m.name} by contacting our pastoral team or joining our fellowship groups.`);
            }}
          >
            <div className="ministry-photo-frame">
              <img
                src={m.photo}
                alt={m.name}
                className="ministry-photo"
                loading="eager"
              />
            </div>
            <h3 className="ministry-label">{m.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
