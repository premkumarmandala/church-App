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
              <span className="footer-cross" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6V2z" />
                </svg>
              </span>
              <div>
                <div className="footer-church-name">{churchName}</div>
                <div className="footer-tagline">{tagline}</div>
              </div>
            </div>
            <p className="footer-brand-desc">{footerDesc}</p>
            <div className="footer-social-links">
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="Facebook" aria-label="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="YouTube" aria-label="YouTube">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#0f1e36"></polygon>
                </svg>
              </a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="Instagram" aria-label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" title="WhatsApp" aria-label="WhatsApp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Visit Our Church */}
          <div className="footer-visit-col">
            <h4 className="footer-section-title">Visit Our Church</h4>
            <div className="footer-visit-info">
              <div className="visit-info-item">
                <span className="visit-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                <div>
                  <strong>Address:</strong>
                  <p>{address}</p>
                </div>
              </div>
              <div className="visit-info-item">
                <span className="visit-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                <div>
                  <strong>Phone:</strong>
                  <p>{phone}</p>
                </div>
              </div>
              <div className="visit-info-item">
                <span className="visit-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
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
            <a href="#home" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              Back to Top
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
