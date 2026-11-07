/* ==========================================================================
   ChurchLocation Component - Grace Fellowship Church
   Visit Our Church section with exterior photo, contact details, socials, and map
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function ChurchLocation({ data }) {
  const [zoomLevel, setZoomLevel] = React.useState(14);

  const formatMediaUrl = (url, fallback = "/admin-data/home/banners/church_building.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 1, 18));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 1, 10));

  const exteriorImage = formatMediaUrl(data?.church_exterior_image, "/admin-data/home/banners/church_building.jpg");
  const addressLine1 = data?.address_line1 || "123 Faith Avenue";
  const addressLine2 = data?.address_line2 ? `${data.address_line2}, ` : "";
  const cityStateZip = data?.city_state_zip || "Hyderabad, Telangana 500001";
  const phone = data?.phone || "+91 98765 43210";
  const email = data?.email || "info@gracefellowship.org";
  const facebookUrl = data?.facebook_url || "https://facebook.com";
  const youtubeUrl = data?.youtube_url || "https://youtube.com";
  const instagramUrl = data?.instagram_url || "https://instagram.com";
  const whatsappUrl = data?.whatsapp_number
    ? `https://wa.me/${data.whatsapp_number.replace(/[^0-9]/g, "")}`
    : "https://whatsapp.com";

  return (
    <section id="contact" className="home-container home-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </span>
          <h2 className="section-title-text">Visit Our Church</h2>
        </div>
      </div>

      <div className="visit-church-grid">
        {/* Column 1: Church Exterior Photo */}
        <div className="church-exterior-card">
          <img
            src={exteriorImage}
            alt="Grace Fellowship Church Sanctuary Campus"
            className="church-exterior-img"
            loading="eager"
            onError={(e) => {
              e.target.src = "home/assets/church_building.jpg";
            }}
          />
        </div>

        {/* Column 2: Contact Information & Socials */}
        <div className="church-contact-info">
          <div className="contact-info-row">
            <span className="contact-info-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </span>
            <div>
              <strong>{addressLine1},</strong><br />
              {addressLine2}{cityStateZip}
            </div>
          </div>

          <div className="contact-info-row">
            <span className="contact-info-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </span>
            <div>{phone}</div>
          </div>

          <div className="contact-info-row">
            <span className="contact-info-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <div>{email}</div>
          </div>

          {/* Social Media Circular Buttons */}
          <div className="church-social-icons">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn fb"
              title="Facebook"
              aria-label="Facebook"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn yt"
              title="YouTube"
              aria-label="YouTube"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#ffffff"></polygon>
              </svg>
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn ig"
              title="Instagram"
              aria-label="Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn wa"
              title="WhatsApp"
              aria-label="WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 3: Interactive OpenStreetMap / Leaflet Embed */}
        <div className="church-map-card">
          <div className="map-view-container">
            <iframe
              title="Grace Fellowship Church Map Location"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=78.4700%2C17.3750%2C78.4950%2C17.3950&layer=mapnik&marker=17.3850%2C78.4867`}
              className="map-iframe"
              loading="lazy"
            />
            <div className="map-controls">
              <button
                type="button"
                className="map-zoom-btn"
                onClick={handleZoomIn}
                aria-label="Zoom in map"
              >
                +
              </button>
              <button
                type="button"
                className="map-zoom-btn"
                onClick={handleZoomOut}
                aria-label="Zoom out map"
              >
                &minus;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
