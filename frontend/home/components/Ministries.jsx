/* ==========================================================================
   Ministries Component - Grace Fellowship Church
   Ministry departments: Children, Youth, Women, Men, Prayer, and Outreach
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function Ministries({ data }) {
  const formatMediaUrl = (url, fallback = "/admin-data/ministries/children_ministry.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const ministryList = (Array.isArray(data) && data.length > 0)
    ? data.map((m) => ({
        id: m.id,
        name: m.name,
        photo: formatMediaUrl(m.photo, "/admin-data/ministries/children_ministry.jpg"),
        description: m.short_description || m.full_description,
      }))
    : [];

  if (!ministryList || ministryList.length === 0) return null;

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
