/* ==========================================================================
   Footer Component - Grace Fellowship Church
   Navy footer with church branding, nav links, social media, and copyright
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function Footer({ data }) {
  const footerLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Bible", href: "bible/index.html" },
    { label: "Prayer Request", href: "prayer-request/index.html" },
    { label: "Sermons", href: "#sermons" },
    { label: "Events", href: "#events" },
    { label: "Ministries", href: "#ministries" },
    { label: "Admin Portal", href: "admin/index.html" }
  ];

  const handleLinkClick = (href, e) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.getElementById(href.substring(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const churchName = data?.settings?.church_name || "Grace Fellowship Church";
  const tagline = data?.settings?.church_tagline || "Worship • Grow • Serve • Share";
  const footerDesc = data?.settings?.footer_text || "A loving Christian family united in prayer, worship, and biblical truth. Join us this week as we celebrate God's grace.";
  const copyright = data?.settings?.copyright_text || "© 2026 Grace Fellowship Church. All rights reserved.";
  const address = `${data?.contact?.address_line1 || "123 Faith Avenue"}, ${data?.contact?.city_state_zip || "Hyderabad, Telangana 500001"}`;
  const phone = data?.contact?.phone || "+91 98765 43210";
  const email = data?.contact?.email || "info@gracefellowship.org";
  const facebookUrl = data?.contact?.facebook_url || "https://facebook.com";
  const youtubeUrl = data?.contact?.youtube_url || "https://youtube.com";
  const instagramUrl = data?.contact?.instagram_url || "https://instagram.com";
  const whatsappUrl = data?.contact?.whatsapp_number
    ? `https://wa.me/${data.contact.whatsapp_number.replace(/[^0-9]/g, "")}`
    : "https://whatsapp.com";

  return (
    <footer className="church-footer">
      <div className="home-container">
        <div className="footer-main-grid">
          {/* Col 1: Church Brand */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <span className="footer-cross">✝</span>
              <div>
                <div className="footer-church-name">{churchName}</div>
                <div className="footer-tagline">{tagline}</div>
              </div>
            </div>
            <p className="footer-brand-desc">{footerDesc}</p>
            <div className="footer-social-links">
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="Facebook" aria-label="Facebook">f</a>
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="YouTube" aria-label="YouTube">▶</a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="Instagram" aria-label="Instagram">📸</a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="WhatsApp" aria-label="WhatsApp">💬</a>
            </div>
          </div>

          {/* Col 2: Visit Our Church */}
          <div className="footer-visit-col">
            <h4 className="footer-section-title">Visit Our Church</h4>
            <div className="footer-visit-info">
              <div className="visit-info-item">
                <span className="visit-icon">📍</span>
                <div>
                  <strong>Address:</strong>
                  <p>{address}</p>
                </div>
              </div>
              <div className="visit-info-item">
                <span className="visit-icon">📞</span>
                <div>
                  <strong>Phone:</strong>
                  <p>{phone}</p>
                </div>
              </div>
              <div className="visit-info-item">
                <span className="visit-icon">✉️</span>
                <div>
                  <strong>Email:</strong>
                  <p>{email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation Links */}
          <div className="footer-links-col">
            <h4 className="footer-section-title">Quick Links</h4>
            <ul className="footer-nav-list">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(link.href, e)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Legal Copyright Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright-text">{copyright}</p>
          <div className="footer-legal-links">
            <a href="admin/index.html" style={{ color: "#c59b27", fontWeight: 700 }}>Admin Portal (CMS)</a>
            <span style={{ color: "#475569" }}>•</span>
            <a href="#home">Back to Top ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
