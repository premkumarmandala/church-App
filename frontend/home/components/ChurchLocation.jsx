/* ==========================================================================
   ChurchLocation Component - Grace Fellowship Church
   Visit Our Church section with exterior photo, contact details, socials, and map
   ========================================================================== */

function ChurchLocation() {
  const [zoomLevel, setZoomLevel] = React.useState(14);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 1, 18));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 1, 10));

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
            src="home/assets/church_building.jpg"
            alt="Grace Fellowship Church Sanctuary Campus"
            className="church-exterior-img"
            loading="eager"
          />
        </div>

        {/* Column 2: Contact Information & Socials */}
        <div className="church-contact-info">
          <div className="contact-info-row">
            <span className="contact-info-icon">📍</span>
            <div>
              <strong>123 Faith Avenue,</strong><br />
              Hyderabad, Telangana 500001
            </div>
          </div>

          <div className="contact-info-row">
            <span className="contact-info-icon">📞</span>
            <div>+91 98765 43210</div>
          </div>

          <div className="contact-info-row">
            <span className="contact-info-icon">✉️</span>
            <div>info@gracefellowship.org</div>
          </div>

          {/* Social Media Circular Buttons */}
          <div className="church-social-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn fb"
              title="Facebook"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn yt"
              title="YouTube"
              aria-label="YouTube"
            >
              ▶
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn ig"
              title="Instagram"
              aria-label="Instagram"
            >
              📸
            </a>
            <a
              href="https://whatsapp.com"
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

        {/* Column 3: Styled Interactive Map Card */}
        <div className="church-map-card">
          {/* Stylized SVG Map Canvas */}
          <svg
            className="map-svg-canvas"
            viewBox="0 0 360 200"
            preserveAspectRatio="none"
            aria-label="Church Map Location"
          >
            {/* Background land */}
            <rect width="360" height="200" fill="#e8edf2" />

            {/* River / Waterway */}
            <path
              d="M-10,120 C80,100 120,150 220,110 C280,80 340,90 380,75 L380,105 C340,120 280,110 220,140 C120,180 80,130 -10,150 Z"
              fill="#cbe0f4"
            />

            {/* Streets / Roads */}
            <path d="M0,40 L360,60" stroke="#ffffff" strokeWidth="6" />
            <path d="M0,170 L360,150" stroke="#ffffff" strokeWidth="5" />
            <path d="M110,0 L130,200" stroke="#ffffff" strokeWidth="7" />
            <path d="M260,0 L240,200" stroke="#ffffff" strokeWidth="5" />
            <path d="M40,0 L180,200" stroke="#fdfbf7" strokeWidth="3" />
            <path d="M120,70 L360,70" stroke="#ffffff" strokeWidth="4" />

            {/* Minor streets */}
            <path d="M140,40 L160,120" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M220,140 L300,160" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M60,90 L110,90" stroke="#ffffff" strokeWidth="2.5" />

            {/* Compass / Location icon on top left */}
            <circle cx="22" cy="22" r="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M22,14 L25,22 L22,20 L19,22 Z" fill="#64748b" />
            <path d="M22,30 L25,22 L22,24 L19,22 Z" fill="#94a3b8" />

            {/* Red Church Pin Marker */}
            <g transform="translate(195, 80)">
              {/* Pulse circle */}
              <circle cx="0" cy="0" r="14" fill="rgba(225, 29, 72, 0.2)" />
              {/* Pin body */}
              <path
                d="M0,-16 C-8,-16 -12,-10 -12,-2 C-12,8 0,20 0,20 C0,20 12,8 12,-2 C12,-10 8,-16 0,-16 Z"
                fill="#e11d48"
                stroke="#be123c"
                strokeWidth="1.5"
              />
              <circle cx="0" cy="-4" r="4.5" fill="#ffffff" />

              {/* Pin Label Tooltip */}
              <rect x="14" y="-14" width="136" height="24" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
              <text x="22" y="3" fontSize="10" fontWeight="700" fill="#0f1e36" fontFamily="sans-serif">
                Grace Fellowship Church
              </text>
            </g>
          </svg>

          {/* View on Maps Button */}
          <a
            href="https://maps.google.com/?q=Grace+Fellowship+Church+Hyderabad"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-view-maps"
          >
            View on Maps
          </a>

          {/* Zoom Controls (+ / -) */}
          <div className="map-zoom-controls">
            <button
              type="button"
              className="map-zoom-btn"
              onClick={handleZoomIn}
              title="Zoom In"
              aria-label="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              className="map-zoom-btn"
              onClick={handleZoomOut}
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              −
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
