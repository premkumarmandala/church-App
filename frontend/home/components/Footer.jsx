/* ==========================================================================
   Footer Component - Grace Fellowship Church
   Navy footer with church branding, nav links, social media, and copyright
   ========================================================================== */

function Footer() {
  const footerLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Bible", href: "bible/index.html" },
    { label: "Prayer Request", href: "prayer-request/index.html" },
    { label: "Sermons", href: "#sermons" },
    { label: "Events", href: "#events" },
    { label: "Ministries", href: "#ministries" },
    { label: "Contact", href: "#contact" }
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

  return (
    <footer className="church-footer">
      <div className="home-container">
        <div className="footer-main-grid">
          {/* Col 1: Church Brand */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <span className="footer-cross">✝</span>
              <div>
                <div className="footer-church-name">Grace Fellowship Church</div>
                <div className="footer-tagline">Worship • Grow • Serve • Share</div>
              </div>
            </div>
            <p className="footer-brand-desc">
              A loving Christian family united in prayer, worship, and biblical truth. Join us this week as we celebrate God's grace.
            </p>
            <div className="footer-social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="Facebook" aria-label="Facebook">f</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="YouTube" aria-label="YouTube">▶</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="Instagram" aria-label="Instagram">📸</a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="WhatsApp" aria-label="WhatsApp">💬</a>
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
                  <p>123 Faith Avenue, Hyderabad, Telangana 500001</p>
                </div>
              </div>
              <div className="visit-info-item">
                <span className="visit-icon">📞</span>
                <div>
                  <strong>Phone:</strong>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div className="visit-info-item">
                <span className="visit-icon">✉️</span>
                <div>
                  <strong>Email:</strong>
                  <p>info@gracefellowship.org</p>
                </div>
              </div>
              <a href="#contact" className="footer-directions-btn" onClick={(e) => handleLinkClick("#contact", e)}>
                Get Directions &amp; Contact &rarr;
              </a>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="footer-links-col">
            <h4 className="footer-section-title">Quick Links</h4>
            <nav className="footer-nav-links-grid" aria-label="Footer Navigation">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="footer-nav-link"
                  onClick={(e) => handleLinkClick(link.href, e)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Col 4: Worship Hours */}
          <div className="footer-hours-col">
            <h4 className="footer-section-title">Service Timings</h4>
            <ul className="footer-hours-list">
              <li><strong>Sunday Morning:</strong> 9:00 AM &amp; 11:00 AM</li>
              <li><strong>Sunday Evening:</strong> 6:00 PM</li>
              <li><strong>Wednesday Prayer:</strong> 7:00 PM</li>
              <li><strong>Friday Youth:</strong> 6:30 PM</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="footer-bottom-copy">
          &copy; {new Date().getFullYear()} Grace Fellowship Church. All rights reserved. &bull; Designed with devotion.
        </div>
      </div>
    </footer>
  );
}
