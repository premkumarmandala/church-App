/* ==========================================================================
   Hero Component - Grace Fellowship Church
   Hero banner with sunset cross background, Scripture verse, and CTA buttons
   ========================================================================== */

function Hero() {
  const handleScrollTo = (sectionId, e) => {
    e.preventDefault();
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="hero-section"
      style={{
        backgroundImage: "url('home/assets/hero_cross_sunset.jpg')"
      }}
    >
      <div className="hero-overlay" />
      <div className="home-container" style={{ width: "100%" }}>
        <div className="hero-content">
          <p className="hero-welcome">Welcome to</p>
          <h1 className="hero-title">Grace Fellowship Church</h1>
          <p className="hero-subtitle">
            A family of believers growing together in Christ's love.
          </p>
          <p className="hero-verse">
            “For where two or three gather in my name, there am I with them.” — Matthew 18:20
          </p>

          <div className="hero-actions">
            <a
              href="#service-timings"
              className="btn-hero-primary"
              onClick={(e) => handleScrollTo("service-timings", e)}
            >
              Join Us This Sunday
            </a>
            <a
              href="#sermons"
              className="btn-hero-secondary"
              onClick={(e) => handleScrollTo("sermons", e)}
            >
              <span>▶</span>
              <span>Watch Sermons</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
