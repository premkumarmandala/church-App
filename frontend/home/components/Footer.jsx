/* ==========================================================================
   Footer Component - Grace Fellowship Church
   Navy footer with church branding, nav links, social media, and copyright
   ========================================================================== */

function Footer() {
  const footerLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Bible", href: "bible/index.html" },
    { label: "Sermons", href: "#sermons" },
    { label: "Events", href: "#events" },
    { label: "Ministries", href: "#ministries" },
    { label: "Gallery", href: "#gallery" },
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
        <div className="footer-top-row">
          {/* Left: Church Brand */}
          <div className="footer-brand">
            <span className="footer-cross">✝</span>
            <div>
              <div className="footer-church-name">Grace Fellowship Church</div>
              <div className="footer-tagline">Worship • Grow • Serve • Share</div>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="footer-nav-links" aria-label="Footer Navigation">
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

          {/* Right: Social Media Links */}
          <div className="footer-social-links">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-icon"
              title="Facebook"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-icon"
              title="YouTube"
              aria-label="YouTube"
            >
              ▶
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-icon"
              title="Instagram"
              aria-label="Instagram"
            >
              📸
            </a>
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-icon"
              title="WhatsApp"
              aria-label="WhatsApp"
            >
              💬
            </a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="footer-bottom-copy">
          &copy; 2024 Grace Fellowship Church. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
