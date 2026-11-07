/* ==========================================================================
   Hero Component - Grace Fellowship Church
   Hero banner with clean deep navy gradient, Scripture verse, and CTA buttons
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function Hero({ data }) {
  const handleScrollTo = (sectionId, e) => {
    if (sectionId && sectionId.startsWith("#")) {
      e.preventDefault();
      const elem = document.getElementById(sectionId.substring(1));
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const welcomeText = data?.welcome_text || "Welcome to";
  const heroTitle = data?.hero_title || "Grace Fellowship Church";
  const heroSubtitle = data?.hero_subtitle || "A family of believers growing together in Christ's love.";
  const heroVerse = data?.hero_verse || "“For where two or three gather in my name, there am I with them.” — Matthew 18:20";
  const ctaPrimaryText = data?.cta_primary_text || "Join Us This Sunday";
  const ctaPrimaryLink = data?.cta_primary_link || "#service-timings";
  const ctaSecondaryText = data?.cta_secondary_text || "Watch Sermons";
  const ctaSecondaryLink = data?.cta_secondary_link || "#sermons";

  return (
    <section
      id="home"
      className="hero-section"
    >
      <div className="hero-overlay" />
      <div className="home-container" style={{ width: "100%" }}>
        <div className="hero-content">
          <p className="hero-welcome">{welcomeText}</p>
          <h1 className="hero-title">{heroTitle}</h1>
          <p className="hero-subtitle">{heroSubtitle}</p>
          <p className="hero-verse">{heroVerse}</p>

          <div className="hero-actions">
            <a
              href={ctaPrimaryLink}
              className="btn-hero-primary"
              onClick={(e) => handleScrollTo(ctaPrimaryLink, e)}
            >
              {ctaPrimaryText}
            </a>
            <a
              href={ctaSecondaryLink}
              className="btn-hero-secondary"
              onClick={(e) => handleScrollTo(ctaSecondaryLink, e)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>{ctaSecondaryText}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
