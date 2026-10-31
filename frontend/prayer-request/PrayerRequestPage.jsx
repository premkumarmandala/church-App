/* ==========================================================================
   PrayerRequestPage Component
   Main container for Prayer Request feature:
   - Fixed Floating Church Navigation Bar
   - PrayerHero Banner
   - Two-column responsive desktop layout (PrayerForm + PrayerGuidelines)
   - Church Footer
   ========================================================================== */

function PrayerRequestPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

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

  const navLinks = [
    { label: "Home", href: "../index.html" },
    { label: "About", href: "../index.html#about" },
    { label: "Bible", href: "../bible/index.html" },
    { label: "Prayer Request", href: "#", active: true },
    { label: "Contact", href: "../index.html#contact" }
  ];

  return (
    <div className="prayer-request-page-root">
      {/* Top Fixed Church Navigation Bar */}
      <header className={`church-nav-bar ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="church-nav-inner">
          {/* Logo & Church Name */}
          <a href="../index.html" className="church-nav-brand">
            <div className="nav-cross-logo" aria-hidden="true">
              <span className="cross-symbol">✝</span>
            </div>
            <div className="nav-brand-titles">
              <span className="church-title-primary">Grace Fellowship Church</span>
              <span className="church-tagline-secondary">Worship • Grow • Serve • Share</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="church-nav-desktop-menu" aria-label="Main Navigation">
            {navLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className={`church-nav-link ${item.active ? "is-active" : ""}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Nav Right Utilities */}
          <div className="church-nav-right-cluster">
            {/* Donate Button */}
            <a href="../index.html#donate" className="btn-nav-donate-blue">
              Donate
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="btn-nav-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="church-mobile-drawer">
            <nav className="mobile-drawer-nav">
              {navLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  className={`mobile-nav-item ${item.active ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="../index.html#donate"
                className="btn-mobile-drawer-donate"
                onClick={() => setMobileMenuOpen(false)}
              >
                Donate Online
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <window.PrayerHero />

      {/* Main Layout Area */}
      <main className="prayer-page-main-container">
        <div className="prayer-content-grid">
          {/* Left/Center Main Column: Prayer Form */}
          <div className="prayer-form-column">
            <window.PrayerForm />
          </div>

          {/* Right Column: Encouragement, Scripture Promises & Guidelines */}
          <div className="prayer-guidelines-column">
            <window.PrayerGuidelines />
          </div>
        </div>
      </main>

      {/* Church Footer */}
      <footer className="church-page-footer">
        <div className="footer-inner-container">
          <div className="footer-cols-grid">
            {/* Col 1: About */}
            <div className="footer-col">
              <div className="footer-logo-row">
                <span className="footer-cross-icon">✝</span>
                <span className="footer-brand-title">Grace Fellowship Church</span>
              </div>
              <p className="footer-desc">
                A Christ-centered church community committed to worship, spiritual growth, heartfelt prayer, and loving service.
              </p>
            </div>

            {/* Col 2: Visit Our Church */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Visit Our Church</h4>
              <p className="footer-visit-text">
                <strong>Address:</strong><br />
                123 Faith Avenue, Hyderabad, Telangana 500001
              </p>
              <p className="footer-visit-text">
                <strong>Phone:</strong> +91 98765 43210<br />
                <strong>Email:</strong> info@gracefellowship.org
              </p>
              <a href="../index.html#contact" className="footer-visit-link">
                Get Directions &amp; Timings &rarr;
              </a>
            </div>

            {/* Col 3: Service Timings */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Worship Services</h4>
              <ul className="footer-timings-list">
                <li><strong>Sunday Morning:</strong> 9:00 AM &amp; 11:00 AM</li>
                <li><strong>Sunday Evening:</strong> 6:00 PM</li>
                <li><strong>Wednesday Prayer:</strong> 7:00 PM</li>
                <li><strong>Friday Youth Fellowship:</strong> 6:30 PM</li>
              </ul>
            </div>

            {/* Col 4: Prayer Ministry */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Prayer Ministry</h4>
              <p className="footer-prayer-desc">
                Our intercessory prayer team prays daily for all submitted requests. You can submit prayer requests 24/7 online.
              </p>
              <p className="footer-contact-link">
                <strong>Helpline:</strong> (555) 772-9371<br />
                <strong>Email:</strong> prayer@gracefellowship.org
              </p>
            </div>
          </div>

          <div className="footer-bottom-copyright">
            <p>&copy; {new Date().getFullYear()} Grace Fellowship Church. All rights reserved. &bull; Designed with devotion.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

window.PrayerRequestPage = PrayerRequestPage;
