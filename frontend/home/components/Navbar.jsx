/* ==========================================================================
   Navbar Component - Grace Fellowship Church
   Fixed floating navigation bar with mobile responsive drawer
   ========================================================================== */

function Navbar({ activeSection = "home", onNavigate }) {
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

  const navItems = [
    { id: "home", label: "Home", href: "#home" },
    { id: "about", label: "About", href: "#about" },
    { id: "bible", label: "Bible", href: "bible/index.html" },
    { id: "prayer", label: "Prayer", href: "prayer-request/index.html" },
    { id: "contact", label: "Contact", href: "#contact" }
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
            <span className="nav-cross-icon">✝</span>
          </div>
          <div className="nav-brand-text">
            <span className="nav-church-name">Grace Fellowship Church</span>
            <span className="nav-church-tagline">Worship • Grow • Serve • Share</span>
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

          {/* Donate Button */}
          <a
            href="#donate"
            className="btn-nav-donate"
            onClick={(e) => handleLinkClick("donate", "#donate", e)}
          >
            Donate
          </a>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="hamburger-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`} aria-hidden={!mobileMenuOpen}>
        <ul className="mobile-nav-list">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className={activeSection === item.id ? "active" : ""}
                onClick={(e) => handleLinkClick(item.id, item.href, e)}
              >
                {item.label}
              </a>
            </li>
          ))}
          <li style={{ marginTop: "8px" }}>
            <a
              href="#donate"
              className="btn-nav-donate"
              style={{ display: "inline-block", textAlign: "center", width: "100%" }}
              onClick={(e) => handleLinkClick("donate", "#donate", e)}
            >
              Donate Online 💝
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
