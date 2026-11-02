/* ==========================================================================
   Ministries Component - Grace Fellowship Church
   Ministry departments: Children, Youth, Women, Men, Prayer, and Outreach
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function Ministries({ data }) {
  const fallbackMinistries = [
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

  const ministryList = (Array.isArray(data) && data.length > 0)
    ? data.map((m) => ({
        id: m.id,
        name: m.name,
        photo: m.photo || "home/assets/children_ministry.jpg",
        description: m.short_description || m.full_description,
      }))
    : fallbackMinistries;

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
              alert(m.description || `Learn more about ${m.name} by contacting our pastoral team or joining our fellowship groups.`);
            }}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                alert(m.description || `Learn more about ${m.name}`);
              }
            }}
            aria-label={`View ${m.name} details`}
          >
            <div className="ministry-avatar-wrapper">
              <img
                src={m.photo}
                alt={m.name}
                className="ministry-circle-img"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "home/assets/children_ministry.jpg";
                }}
              />
            </div>
            <h3 className="ministry-card-label">{m.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
