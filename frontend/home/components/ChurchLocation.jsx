/* ==========================================================================
   ChurchLocation Component - Grace Fellowship Church
   Visit Our Church section with exterior photo, contact details, socials, and map
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function ChurchLocation({ data }) {
  const [zoomLevel, setZoomLevel] = React.useState(14);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 1, 18));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 1, 10));

  const exteriorImage = data?.church_exterior_image || "home/assets/church_building.jpg";
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
          <span className="section-title-icon" style={{ color: "#0066cc" }}>📍</span>
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
            <span className="contact-info-icon">📍</span>
            <div>
              <strong>{addressLine1},</strong><br />
              {addressLine2}{cityStateZip}
            </div>
          </div>

          <div className="contact-info-row">
            <span className="contact-info-icon">📞</span>
            <div>{phone}</div>
          </div>

          <div className="contact-info-row">
            <span className="contact-info-icon">✉️</span>
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
              f
            </a>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn yt"
              title="YouTube"
              aria-label="YouTube"
            >
              ▶
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn ig"
              title="Instagram"
              aria-label="Instagram"
            >
              📸
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn wa"
              title="WhatsApp"
              aria-label="WhatsApp"
            >
              💬
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
