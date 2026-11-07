/* ==========================================================================
   Navbar Component - Grace Fellowship Church
   Fixed floating navigation bar with mobile responsive drawer
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function Navbar({ activeSection = "home", onNavigate, data }) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const churchName = data?.church_name || "Grace Fellowship Church";
  const churchTagline = data?.church_tagline || "Worship • Grow • Serve • Share";

  const navItems = [
    { id: "home", label: "Home", href: "#home" },
    { id: "about", label: "About", href: "#about" },
    { id: "bible", label: "Bible", href: "bible/index.html" },
    { id: "prayer", label: "Prayer", href: "prayer-request/index.html" },
    { id: "sermons", label: "Sermons", href: "#sermons" },
    { id: "events", label: "Events", href: "#events" },
    { id: "contact", label: "Contact", href: "#contact" },
  ];

  const handleLinkClick = (id, href, e) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setMobileMenuOpen(false);
      if (onNavigate) onNavigate(id);
      const target = document.getElementById(href.substring(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className={`church-navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-inner">
        {/* Brand */}
        <a href="#home" className="nav-brand" onClick={(e) => handleLinkClick("home", "#home", e)}>
          <div className="nav-brand-logo">
            {data?.logo_url ? (
              <img src={data.logo_url} alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
            ) : (
              <span className="nav-cross-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6V2z" />
                </svg>
              </span>
            )}
          </div>
          <div className="nav-brand-text">
            <span className="nav-church-name">{churchName}</span>
            <span className="nav-church-tagline">{churchTagline}</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="nav-links-desktop" aria-label="Main Navigation">
          {navItems.map((item) => (
            <li key={item.id} className="nav-link-item">
              <a
                href={item.href}
                className={`nav-link-btn ${activeSection === item.id ? "active" : ""}`}
                onClick={(e) => handleLinkClick(item.id, item.href, e)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions-desktop">
          <a href="admin/index.html" className="btn-nav-outline" title="Admin Portal & Content Manager">
            Portal
          </a>
          <a href="prayer-request/index.html" className="btn-nav-cta">
            Prayer Request
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer open">
          <nav className="mobile-nav-list" aria-label="Mobile Navigation">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`mobile-nav-link ${activeSection === item.id ? "active" : ""}`}
                onClick={(e) => handleLinkClick(item.id, item.href, e)}
              >
                {item.label}
              </a>
            ))}
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <a href="admin/index.html" className="btn-nav-outline" style={{ textAlign: "center" }}>
                Admin Portal (CMS)
              </a>
              <a href="prayer-request/index.html" className="btn-nav-cta" style={{ textAlign: "center" }}>
                Submit Prayer Request
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
