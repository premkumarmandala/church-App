/* Church Public Home Website Master Bundle */
(function() {
const { useState, useEffect, useCallback, useMemo, useRef } = React || window.React;


/* === Source: Navbar.jsx === */
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


/* === Source: Hero.jsx === */
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


/* === Source: Announcements.jsx === */
/* ==========================================================================
   Announcements Component - Grace Fellowship Church
   Carousel of announcements, event posters, and conference notices
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function Announcements({ data }) {
  const [startIndex, setStartIndex] = React.useState(0);

  const formatMediaUrl = (url, fallback = "/admin-data/home/announcements/youth_conference.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const announcementsData = (Array.isArray(data) && data.length > 0)
    ? data.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        date: item.date_text,
        time: item.time_text,
        location: item.location,
        image: formatMediaUrl(item.image, "/admin-data/home/announcements/youth_conference.jpg"),
        actionText: item.action_text || "Learn More",
        actionLink: item.action_link || "#contact",
        tag: item.tag || "Announcement",
        tagClass: item.tag_class === "blue" ? "badge-youth" : item.tag_class === "emerald" ? "badge-outreach" : "badge-fellowship",
      }))
    : [];

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? announcementsData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev === announcementsData.length - 1 ? 0 : prev + 1));
  };

  if (!announcementsData || announcementsData.length === 0) return null;

  return (
    <section id="announcements" className="home-container" style={{ marginTop: "24px" }}>
      <div className="announcements-box">
        {/* Header */}
        <div className="announcements-header">
          <div className="section-title-wrap">
            <span className="section-title-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </span>
            <h2 className="section-title-text">Announcements</h2>
          </div>
          <a href="#events" className="section-view-all">
            <span>View All</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </a>
        </div>

        {/* Carousel Grid with Controls */}
        <div className="announcements-carousel-wrapper">
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={handlePrev}
            aria-label="Previous announcement"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="announcements-grid">
            {announcementsData.map((item) => (
              <div key={item.id} className="announcement-card">
                <img
                  src={item.image}
                  alt={item.title}
                  className="announcement-banner-img"
                  loading="lazy"
                />
                <div className="announcement-body">
                  <span className={`announcement-tag ${item.tagClass}`}>{item.tag}</span>
                  <h3 className="announcement-card-title">{item.title}</h3>
                  <div className="announcement-meta">
                    <span>{item.date} {item.time ? `• ${item.time}` : ""}</span>
                    <span>{item.location}</span>
                  </div>
                  {item.actionLink && item.actionLink.startsWith("http") ? (
                    <a
                      href={item.actionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-announcement-action"
                      style={{ textAlign: "center", textDecoration: "none" }}
                    >
                      {item.actionText}
                    </a>
                  ) : (
                    <a
                      href={item.actionLink || "#contact"}
                      className="btn-announcement-action"
                      style={{ textAlign: "center", textDecoration: "none" }}
                    >
                      {item.actionText}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={handleNext}
            aria-label="Next announcement"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}


/* === Source: VerseOfTheDay.jsx === */
/* ==========================================================================
   VerseOfTheDay Component - Grace Fellowship Church
   Displays curated daily scripture banner with API integration and Bible link
   ========================================================================== */

function VerseOfTheDay() {
  const [verse, setVerse] = React.useState({
    text: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1 (KJV)",
    book: "psalms",
    chapter: 23,
    verseNum: 1
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const fetchDailyVerse = async () => {
      try {
        setLoading(true);
        const apiBase = window.API_BASE_URL || (window.location.protocol === "file:" ? "http://localhost:8000" : "");
        const res = await fetch(`${apiBase}/api/bible/daily-verse`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && data.kjvText) {
            setVerse({
              text: data.kjvText,
              reference: `${data.bookName || data.book} ${data.chapter}:${data.verse} (KJV)`,
              book: data.book,
              chapter: data.chapter,
              verseNum: data.verse
            });
          }
        }
      } catch (err) {
        // Fallback to reference verse from screenshot
        console.log("Verse of the day fallback active:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDailyVerse();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="verse-of-the-day" className="home-container" style={{ marginTop: "24px" }}>
      <div className="votd-card">
        {/* Left Visual: Open Bible Photo */}
        <div className="votd-left-visual">
          <img
            src="home/assets/open_bible_banner.jpg"
            alt="Holy Bible Open Scripture"
            className="votd-bible-img"
            loading="lazy"
          />
        </div>

        {/* Center Content */}
        <div className="votd-content">
          <div className="votd-header">
            <span className="votd-header-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </span>
            <span className="votd-header-title">Verse of the Day</span>
          </div>
          <p className="votd-text">
            “{verse.text}”
          </p>
          <p className="votd-reference">{verse.reference}</p>
        </div>

        {/* Right CTA Button */}
        <a
          href="bible/index.html"
          className="btn-votd-read"
          title="Study this verse in the Online Bible reader"
        >
          <span>Read in Bible</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </section>
  );
}


/* === Source: ServiceTimings.jsx === */
/* ==========================================================================
   ServiceTimings Component - Grace Fellowship Church
   Worship schedules, languages, and service timings in clean unified cards
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function ServiceTimings({ data }) {
  const renderTimingIcon = (name) => {
    if (name === "people" || name === "users") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      );
    }
    if (name === "prayer" || name === "pray") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
        </svg>
      );
    }
    if (name === "bible" || name === "book") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20M7 8h10"></path>
      </svg>
    );
  };

  const fallbackSchedules = [
    {
      id: 1,
      iconName: "church",
      title: "Sunday Worship",
      hours: "10:00 AM – 12:00 PM",
      subtitle: "English & Telugu"
    },
    {
      id: 2,
      iconName: "people",
      title: "Sunday School",
      hours: "10:00 AM – 11:00 AM",
      subtitle: "Children & Youth"
    },
    {
      id: 3,
      iconName: "prayer",
      title: "Wednesday Prayer",
      hours: "7:00 PM – 8:00 PM",
      subtitle: "Online & In-Person"
    },
    {
      id: 4,
      iconName: "bible",
      title: "Friday Bible Study",
      hours: "7:00 PM – 8:00 PM",
      subtitle: "English & Telugu"
    }
  ];

  const serviceSchedules = (Array.isArray(data) && data.length > 0)
    ? data.map((schedule) => ({
        id: schedule.id,
        iconName: schedule.icon_name || "church",
        title: schedule.title,
        hours: schedule.hours,
        subtitle: schedule.subtitle,
      }))
    : fallbackSchedules;

  return (
    <section id="service-timings" className="home-container home-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </span>
          <h2 className="section-title-text">Service Timings</h2>
        </div>
        <a href="#contact" className="section-view-all">
          <span>View Details</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      </div>

      <div className="timings-grid">
        {serviceSchedules.map((schedule) => (
          <div key={schedule.id} className="timing-card">
            <div className="timing-icon-badge">
              {renderTimingIcon(schedule.iconName)}
            </div>
            <div className="timing-info">
              <h3 className="timing-title">{schedule.title}</h3>
              <p className="timing-hours">{schedule.hours}</p>
              <p className="timing-subtitle">{schedule.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


/* === Source: About.jsx === */
/* ==========================================================================
   About Component - Grace Fellowship Church
   Church history, doctrinal pillars, core beliefs, and pastoral profile
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function About({ data }) {
  const formatMediaUrl = (url, fallback = "/admin-data/sermons/thumbnails/sermon_pastor.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const history = data?.history_text || data?.church_history || "Founded in faith, Grace Fellowship Church has stood as a beacon of Christ's love and grace in our community for over two decades.";
  const mission = data?.mission_text || "To glorify God by making disciples of Jesus Christ who love God, love people, and transform communities.";
  const vision = data?.vision_text || "A vibrant, Christ-centered, multi-generational church impacting generations with the Gospel.";
  const pastorName = data?.lead_pastor_name || "Pastor John Samuel";
  const pastorTitle = data?.lead_pastor_title || "Senior Pastor";
  const pastorBio = data?.lead_pastor_bio || "Serving with humility and love, Pastor John Samuel has dedicated his life to teaching God's Word with clarity, passion, and pastoral care.";
  const pastorImage = formatMediaUrl(data?.lead_pastor_image, "/admin-data/sermons/thumbnails/sermon_pastor.jpg");

  let beliefs = [
    "Authority of Holy Scripture",
    "The Trinity (Father, Son, Holy Spirit)",
    "Salvation by Grace Through Faith",
    "Water Baptism and Communion",
    "The Power of Prayer & Intercession",
    "Christ-Centered Worship",
    "Loving Christian Fellowship",
    "The Great Commission"
  ];

  if (data?.beliefs_json) {
    try {
      const parsed = typeof data.beliefs_json === "string" ? JSON.parse(data.beliefs_json) : data.beliefs_json;
      if (Array.isArray(parsed) && parsed.length > 0) {
        beliefs = parsed;
      }
    } catch (e) {
      // fallback to default
    }
  }

  return (
    <section id="about" className="home-section-wrap bg-page">
      <div className="home-container home-section">
        <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M7 8h10" />
            </svg>
          </span>
          <h2 className="section-title-text">About Our Church</h2>
        </div>
      </div>

      <div className="about-intro-grid">
        {/* Left Column: History & Core Pillars */}
        <div>
          <div className="about-history-card">
            <h3 className="about-history-title">Our Heritage & Calling</h3>
            <p className="about-history-text">{history}</p>
            {mission && (
              <div style={{ marginTop: "14px", fontSize: "0.925rem", color: "#334155", lineHeight: "1.6" }}>
                <strong style={{ color: "#0f172a" }}>Our Mission: </strong>
                <span>{mission}</span>
              </div>
            )}
            {vision && (
              <div style={{ marginTop: "8px", fontSize: "0.925rem", color: "#334155", lineHeight: "1.6" }}>
                <strong style={{ color: "#0f172a" }}>Our Vision: </strong>
                <span>{vision}</span>
              </div>
            )}
          </div>

          {/* Pillars Grid */}
          <div className="about-pillars-grid">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="about-pillar-box">
                <div className="pillar-icon-wrap">
                  {pillar.icon}
                </div>
                <h4 className="pillar-title">{pillar.title}</h4>
                <p className="pillar-desc">{pillar.desc}</p>
              </div>
            ))}
          </div>

          {/* Core Beliefs Tag List */}
          <div className="beliefs-section-wrap">
            <h4 className="beliefs-title">What We Believe</h4>
            <div className="beliefs-tags-list">
              {beliefs.map((belief, idx) => (
                <span key={idx} className="belief-tag-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{belief}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pastoral Leadership Card */}
        <div>
          <div className="pastor-profile-card">
            <div className="pastor-photo-wrap">
              <img
                src={pastorImage}
                alt={pastorName}
                className="pastor-photo-img"
                loading="eager"
              />
            </div>
            <h3 className="pastor-name-heading">{pastorName}</h3>
            <p className="pastor-role-sub">{pastorTitle}</p>
            <p className="pastor-bio-text">{pastorBio}</p>

            <div style={{ marginTop: "20px", padding: "14px 16px", background: "#f8fafc", borderRadius: "8px", borderLeft: "3px solid var(--color-accent)" }}>
              <p style={{ margin: 0, fontStyle: "italic", fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>
                “Our prayer is that everyone who enters our doors encounters the living Christ, experiences genuine fellowship, and discovers their God-given purpose.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
}



/* === Source: LatestSermons.jsx === */
/* ==========================================================================
   LatestSermons Component - Grace Fellowship Church
   Sermon video cards with duration badges, speaker info, and audio player
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function LatestSermons({ data }) {
  const [activeSermon, setActiveSermon] = React.useState(null);

  const formatMediaUrl = (url, fallback = "/admin-data/sermons/thumbnails/sermon_pastor.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const sermons = (Array.isArray(data) && data.length > 0)
    ? data.map((s) => ({
        id: s.id,
        title: s.title,
        speaker: s.speaker || "Ps. John Samuel",
        date: s.date_text ? `• ${s.date_text}` : "",
        duration: s.duration || "45:00",
        thumbnail: formatMediaUrl(s.thumbnail, "/admin-data/sermons/thumbnails/sermon_pastor.jpg"),
        passage: s.passage || "",
        video_url: s.video_url,
        audio_url: s.audio_url,
        description: s.description,
      }))
    : [];

  const handlePlaySermon = (sermon) => {
    setActiveSermon(sermon);
  };

  if (!sermons || sermons.length === 0) return null;

  return (
    <section id="sermons" className="home-container home-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </span>
          <h2 className="section-title-text">Latest Sermons</h2>
        </div>
        <a href="#sermons" className="section-view-all">
          <span>View All</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      </div>

      <div className="sermons-grid">
        {sermons.map((sermon) => (
          <article
            key={sermon.id}
            className="sermon-video-card"
            onClick={() => handlePlaySermon(sermon)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePlaySermon(sermon);
              }
            }}
            aria-label={`Watch sermon: ${sermon.title}`}
          >
            {/* Thumbnail with Overlay & Duration */}
            <div className="sermon-thumb-wrap">
              <img
                src={sermon.thumbnail}
                alt={sermon.title}
                className="sermon-thumb-img"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "home/assets/sermon_pastor.jpg";
                }}
              />
              <div className="sermon-play-pill" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="sermon-duration-tag">{sermon.duration}</span>
            </div>

            {/* Sermon Metadata */}
            <div className="sermon-details">
              <h3 className="sermon-card-title">{sermon.title}</h3>
              <p className="sermon-speaker-line">
                <span className="speaker-name">{sermon.speaker}</span>
                <span className="speaker-date">{sermon.date}</span>
              </p>
              {sermon.passage && (
                <p className="sermon-passage-line" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  <span>{sermon.passage}</span>
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Sermon Player Modal */}
      {activeSermon && (
        <div
          className="sermon-modal-overlay"
          onClick={() => setActiveSermon(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="sermon-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sermon-modal-header">
              <h3 className="sermon-modal-title">{activeSermon.title}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveSermon(null)}
                aria-label="Close sermon video"
              >
                &times;
              </button>
            </div>
            <div className="sermon-modal-player">
              {activeSermon.video_url && activeSermon.video_url.includes("youtube.com") ? (
                <iframe
                  src={activeSermon.video_url.replace("watch?v=", "embed/")}
                  title={activeSermon.title}
                  style={{ width: "100%", height: "360px", border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div style={{ position: "relative", width: "100%", height: "280px", background: "#081220", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={activeSermon.thumbnail}
                    alt={activeSermon.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }}
                  />
                  <div style={{ position: "absolute", textAlign: "center", color: "#fff", padding: "16px" }}>
                    <div style={{ fontSize: "2.5rem", color: "#c59b27" }}>▶</div>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: "8px" }}>{activeSermon.title}</div>
                    <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>Preached by {activeSermon.speaker} {activeSermon.date}</div>
                  </div>
                </div>
              )}
              {activeSermon.description && (
                <div style={{ padding: "16px 20px", background: "#fff", fontSize: "0.875rem", color: "#334155", lineHeight: 1.6 }}>
                  {activeSermon.description}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


/* === Source: UpcomingEvents.jsx === */
/* ==========================================================================
   UpcomingEvents Component - Grace Fellowship Church
   Upcoming church events, posters, dates, venues, and registration buttons
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function UpcomingEvents({ data }) {
  const formatMediaUrl = (url, fallback = "/admin-data/events/church_picnic.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const events = (Array.isArray(data) && data.length > 0)
    ? data.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date_text,
        location: e.location,
        image: formatMediaUrl(e.image, "/admin-data/events/church_picnic.jpg"),
        actionText: e.action_text || "Register Now",
        registration_link: e.registration_link || "#contact",
      }))
    : [];

  if (!events || events.length === 0) return null;

  return (
    <section id="events" className="home-container home-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
          <h2 className="section-title-text">Upcoming Events</h2>
        </div>
        <a href="#events" className="section-view-all">
          <span>View All</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      </div>

      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="event-item-card">
            <div className="event-thumb-wrapper">
              <img
                src={event.image}
                alt={event.title}
                className="event-thumb-img"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "home/assets/church_picnic.jpg";
                }}
              />
            </div>
            <div className="event-card-details">
              <h3 className="event-heading">{event.title}</h3>
              <p className="event-meta-line" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span className="event-date" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{event.date}</span>
                </span>
                <span className="event-venue" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{event.location}</span>
                </span>
              </p>
              {event.registration_link && event.registration_link.startsWith("http") ? (
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-event-register"
                  style={{ textAlign: "center", textDecoration: "none" }}
                >
                  {event.actionText}
                </a>
              ) : (
                <a
                  href={event.registration_link || "#contact"}
                  className="btn-event-register"
                  style={{ textAlign: "center", textDecoration: "none" }}
                >
                  {event.actionText}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


/* === Source: Ministries.jsx === */
/* ==========================================================================
   Ministries Component - Grace Fellowship Church
   Ministry departments: Children, Youth, Women, Men, Prayer, and Outreach
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function Ministries({ data }) {
  const [selectedMinistry, setSelectedMinistry] = React.useState(null);

  const formatMediaUrl = (url, fallback = "/admin-data/ministries/children_ministry.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const fallbackMinistries = [
    { id: 1, name: "Children's Ministry", photo: "/admin-data/ministries/children_ministry.jpg", description: "Sunday School, biblical foundations, crafts, and songs for children." },
    { id: 2, name: "Youth Ministry", photo: "/admin-data/home/announcements/youth_conference.jpg", description: "Empowering teens and young adults to stand bold for Christ." },
    { id: 3, name: "Women's Ministry", photo: "/admin-data/home/announcements/womens_fellowship.jpg", description: "Encouraging sisters in faith, discipleship, and prayer fellowship." },
    { id: 4, name: "Men's Ministry", photo: "/admin-data/ministries/fellowship_service.jpg", description: "Building strong godly fathers, husbands, and leaders in Christ." },
    { id: 5, name: "Prayer Ministry", photo: "/admin-data/sermons/thumbnails/prayer_hands.jpg", description: "Faithful intercession for our church, community, and global needs." },
    { id: 6, name: "Outreach & Missions", photo: "/admin-data/home/announcements/open_bible_banner.jpg", description: "Sharing the love of Christ through local and regional benevolence." },
  ];

  const ministryList = (Array.isArray(data) && data.length > 0)
    ? data.map((m) => ({
        id: m.id,
        name: m.name,
        photo: formatMediaUrl(m.photo, "/admin-data/ministries/children_ministry.jpg"),
        description: m.short_description || m.full_description || m.description,
        meeting_time: m.meeting_time,
        leader_name: m.leader_name,
      }))
    : fallbackMinistries;

  return (
    <section id="ministries" className="home-container home-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </span>
          <h2 className="section-title-text">Our Ministries</h2>
        </div>
        <a href="#ministries" className="section-view-all">
          <span>View All</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      </div>

      <div className="ministries-row">
        {ministryList.map((m) => (
          <div
            key={m.id}
            className="ministry-unit-card"
            onClick={() => setSelectedMinistry(m)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedMinistry(m);
              }
            }}
            aria-label={`View ${m.name} details`}
          >
            <div className="ministry-avatar-wrapper">
              <img
                src={m.photo}
                alt={m.name}
                className="ministry-circle-img"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "home/assets/children_ministry.jpg";
                }}
              />
            </div>
            <h3 className="ministry-card-label">{m.name}</h3>
          </div>
        ))}
      </div>

      {/* Ministry Detail Modal */}
      {selectedMinistry && (
        <div className="modal-backdrop-church" onClick={() => setSelectedMinistry(null)} role="dialog" aria-modal="true">
          <div className="donate-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="donate-modal-header">
              <div>
                <h3 className="donate-header-title">{selectedMinistry.name}</h3>
                <p className="donate-header-sub">{selectedMinistry.leader_name ? `Led by ${selectedMinistry.leader_name}` : "Church Fellowship Ministry"}</p>
              </div>
              <button
                type="button"
                className="btn-modal-close-icon"
                onClick={() => setSelectedMinistry(null)}
                aria-label="Close modal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="donate-modal-body">
              {selectedMinistry.photo && (
                <img
                  src={selectedMinistry.photo}
                  alt={selectedMinistry.name}
                  style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }}
                />
              )}
              <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>
                {selectedMinistry.description || "A dedicated ministry for discipleship, spiritual growth, and community fellowship."}
              </p>
              {selectedMinistry.meeting_time && (
                <div style={{ padding: "10px 14px", background: "var(--color-surface-subtle)", borderRadius: "8px", fontSize: "0.85rem", color: "var(--color-primary-800)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span><strong>Schedule:</strong> {selectedMinistry.meeting_time}</span>
                </div>
              )}
              <a
                href="#contact"
                className="btn-hero-primary"
                style={{ width: "100%", textAlign: "center", textDecoration: "none", display: "block" }}
                onClick={() => setSelectedMinistry(null)}
              >
                Connect with Ministry Leaders
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


/* === Source: Gallery.jsx === */
/* ==========================================================================
   Gallery Component - Grace Fellowship Church
   Photo & media highlights with category filter and lightbox preview
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function Gallery({ data }) {
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [lightboxItem, setLightboxItem] = React.useState(null);

  const formatMediaUrl = (url, fallback = "/admin-data/gallery/worship_service.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const rawItems = (Array.isArray(data) && data.length > 0) ? data : [];

  const categories = ["All", "Worship", "Youth", "Fellowship", "Special"];

  const filteredItems = React.useMemo(() => {
    if (activeCategory === "All") return rawItems;
    return rawItems.filter((item) => (item.category || "").toLowerCase() === activeCategory.toLowerCase());
  }, [rawItems, activeCategory]);

  if (!rawItems || rawItems.length === 0) return null;

  return (
    <section id="gallery" className="home-section-wrap bg-page">
      <div className="home-container home-section">
        <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </span>
          <h2 className="section-title-text">Church Gallery &amp; Highlights</h2>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="gallery-filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`gallery-filter-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="gallery-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="gallery-media-card"
            onClick={() => setLightboxItem(item)}
          >
            <div className="gallery-thumb-container">
              <img
                src={formatMediaUrl(item.media_url, "/admin-data/gallery/worship_service.jpg")}
                alt={item.title}
                className="gallery-thumb-img"
                loading="lazy"
              />
              <span className="gallery-card-badge">{item.category || "Church"}</span>
              <span className="gallery-card-type">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Photo</span>
              </span>
            </div>
            <div className="gallery-body-box">
              <h3 className="gallery-item-title">{item.title}</h3>
              <p className="gallery-item-caption">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="modal-backdrop-church"
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lightbox-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={formatMediaUrl(lightboxItem.media_url, "/admin-data/gallery/worship_service.jpg")}
              alt={lightboxItem.title}
              className="lightbox-img"
            />
            <div className="lightbox-caption-bar">
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: 700, color: "#ffffff" }}>
                  {lightboxItem.title}
                </h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
                  {lightboxItem.caption} • <span style={{ color: "#c59b27" }}>{lightboxItem.category}</span>
                </p>
              </div>
              <button
                type="button"
                className="btn-modal-close-icon"
                onClick={() => setLightboxItem(null)}
                title="Close preview"
                aria-label="Close image preview"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </section>
);
}



/* === Source: ChurchLocation.jsx === */
/* ==========================================================================
   ChurchLocation Component - Grace Fellowship Church
   Visit Our Church section with exterior photo, contact details, socials, and map
   Dynamically integrated with Church CMS API.
   ========================================================================== */

function ChurchLocation({ data }) {
  const [zoomLevel, setZoomLevel] = React.useState(14);

  const formatMediaUrl = (url, fallback = "/admin-data/home/banners/church_building.jpg") => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    if (url.startsWith("/api/cms/media/")) return url;
    if (url.startsWith("admin-data/")) return `/api/cms/media/${url}`;
    if (url.startsWith("/admin-data/")) return `/api/cms/media${url}`;
    return url.startsWith("/") ? url : "/" + url;
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 1, 18));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 1, 10));

  const exteriorImage = formatMediaUrl(data?.church_exterior_image, "/admin-data/home/banners/church_building.jpg");
  const addressLine1 = data?.address_line1 || "123 Faith Avenue";
  const addressLine2 = data?.address_line2 ? `${data.address_line2}, ` : "";
  const cityStateZip = data?.city_state_zip || "Hyderabad, Telangana 500001";
  const phone = data?.phone || "+91 98765 43210";
  const email = data?.email || "info@gracefellowship.org";
  const facebookUrl = data?.facebook_url || "https://facebook.com";
  const youtubeUrl = data?.youtube_url || "https://youtube.com";
  const instagramUrl = data?.instagram_url || "https://instagram.com";
  const whatsappUrl = data?.whatsapp_number
    ? `https://wa.me/${data.whatsapp_number.replace(/[^0-9]/g, "")}`
    : "https://whatsapp.com";

  return (
    <section id="contact" className="home-container home-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <span className="section-title-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </span>
          <h2 className="section-title-text">Visit Our Church</h2>
        </div>
      </div>

      <div className="visit-church-grid">
        {/* Column 1: Church Exterior Photo */}
        <div className="church-exterior-card">
          <img
            src={exteriorImage}
            alt="Grace Fellowship Church Sanctuary Campus"
            className="church-exterior-img"
            loading="eager"
            onError={(e) => {
              e.target.src = "home/assets/church_building.jpg";
            }}
          />
        </div>

        {/* Column 2: Contact Information & Socials */}
        <div className="church-contact-info">
          <div className="contact-info-row">
            <span className="contact-info-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </span>
            <div>
              <strong>{addressLine1},</strong><br />
              {addressLine2}{cityStateZip}
            </div>
          </div>

          <div className="contact-info-row">
            <span className="contact-info-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </span>
            <div>{phone}</div>
          </div>

          <div className="contact-info-row">
            <span className="contact-info-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <div>{email}</div>
          </div>

          {/* Social Media Circular Buttons */}
          <div className="church-social-icons">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn fb"
              title="Facebook"
              aria-label="Facebook"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn yt"
              title="YouTube"
              aria-label="YouTube"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#ffffff"></polygon>
              </svg>
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn ig"
              title="Instagram"
              aria-label="Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-circle-btn wa"
              title="WhatsApp"
              aria-label="WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 3: Interactive OpenStreetMap / Leaflet Embed */}
        <div className="church-map-card">
          <div className="map-view-container">
            <iframe
              title="Grace Fellowship Church Map Location"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=78.4700%2C17.3750%2C78.4950%2C17.3950&layer=mapnik&marker=17.3850%2C78.4867`}
              className="map-iframe"
              loading="lazy"
            />
            <div className="map-controls">
              <button
                type="button"
                className="map-zoom-btn"
                onClick={handleZoomIn}
                aria-label="Zoom in map"
              >
                +
              </button>
              <button
                type="button"
                className="map-zoom-btn"
                onClick={handleZoomOut}
                aria-label="Zoom out map"
              >
                &minus;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


/* === Source: DonateModal.jsx === */
/* ==========================================================================
   DonateModal Component - Grace Fellowship Church
   Online Giving, Tithes, Missions, and Building Fund Bank/UPI Details
   ========================================================================== */

function DonateModal({ isOpen, onClose }) {
  const [copiedField, setCopiedField] = React.useState(null);
  const [selectedPurpose, setSelectedPurpose] = React.useState("tithe");

  if (!isOpen) return null;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="modal-backdrop-church" onClick={onClose} role="dialog" aria-modal="true">
      <div className="donate-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="donate-modal-header">
          <div>
            <h3 className="donate-header-title">Online Giving &amp; Tithes</h3>
            <p className="donate-header-sub">Support the Ministry of Grace Fellowship Church</p>
          </div>
          <button
            type="button"
            className="btn-modal-close-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="donate-modal-body">
          {/* Scripture Verse */}
          <div className="donate-scripture-box">
            “Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.” — 2 Corinthians 9:7
          </div>

          {/* Giving Purposes */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
              Select Contribution Purpose:
            </label>
            <div className="giving-purposes-grid">
              <div
                className={`giving-purpose-btn ${selectedPurpose === "tithe" ? "active" : ""}`}
                onClick={() => setSelectedPurpose("tithe")}
              >
                <span className="purpose-title">Tithes &amp; Offerings</span>
                <span style={{ fontSize: "0.72rem", opacity: 0.85 }}>General Ministry</span>
              </div>
              <div
                className={`giving-purpose-btn ${selectedPurpose === "missions" ? "active" : ""}`}
                onClick={() => setSelectedPurpose("missions")}
              >
                <span className="purpose-title">Missions &amp; Outreach</span>
                <span style={{ fontSize: "0.72rem", opacity: 0.85 }}>Community Care</span>
              </div>
              <div
                className={`giving-purpose-btn ${selectedPurpose === "building" ? "active" : ""}`}
                onClick={() => setSelectedPurpose("building")}
              >
                <span className="purpose-title">Building Fund</span>
                <span style={{ fontSize: "0.72rem", opacity: 0.85 }}>Sanctuary Expansion</span>
              </div>
            </div>
          </div>

          {/* Bank Transfer Details */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
              Bank Account Transfer (NEFT / IMPS / RTGS):
            </label>
            <div className="bank-details-card">
              <div className="bank-detail-row">
                <span className="bank-label">Account Name</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="bank-value">Grace Fellowship Church Trust</span>
                  <button
                    type="button"
                    className="btn-copy-tag"
                    onClick={() => handleCopy("Grace Fellowship Church Trust", "name")}
                  >
                    {copiedField === "name" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="bank-detail-row">
                <span className="bank-label">Account Number</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="bank-value">987654321098</span>
                  <button
                    type="button"
                    className="btn-copy-tag"
                    onClick={() => handleCopy("987654321098", "account")}
                  >
                    {copiedField === "account" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="bank-detail-row">
                <span className="bank-label">Bank Name</span>
                <span className="bank-value">State Bank of India</span>
              </div>

              <div className="bank-detail-row">
                <span className="bank-label">IFSC Code</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="bank-value">SBIN0001234</span>
                  <button
                    type="button"
                    className="btn-copy-tag"
                    onClick={() => handleCopy("SBIN0001234", "ifsc")}
                  >
                    {copiedField === "ifsc" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="bank-detail-row">
                <span className="bank-label">Branch</span>
                <span className="bank-value">Main Branch, Hyderabad</span>
              </div>
            </div>
          </div>

          {/* UPI Giving */}
          <div style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", display: "block" }}>
                  UPI / QR Code Giving:
                </span>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  UPI ID: <strong style={{ color: "#0f172a", fontFamily: "monospace" }}>gracefellowship@sbi</strong>
                </span>
              </div>
              <button
                type="button"
                className="btn-copy-tag"
                onClick={() => handleCopy("gracefellowship@sbi", "upi")}
              >
                {copiedField === "upi" ? "Copied UPI!" : "Copy UPI ID"}
              </button>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b", textAlign: "center", lineHeight: "1.4" }}>
            For official 80G tax exemption donation receipts, please email your transaction reference to <strong style={{ color: "#0f172a" }}>info@gracefellowship.org</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}



/* === Source: Footer.jsx === */
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


/* === Source: HomePage.jsx === */
/* ==========================================================================
   HomePage Component - Grace Fellowship Church
   Master React component assembling all Home Page sections
   Integrated with Central Church CMS API for dynamic content management.
   ========================================================================== */

function HomePage() {
  const [activeSection, setActiveSection] = React.useState("home");
  const [cmsData, setCmsData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch consolidated CMS content
  React.useEffect(() => {
    let mounted = true;
    const fetchCMS = async () => {
      try {
        setIsLoading(true);
        const apiBase = window.API_BASE_URL || (window.location.protocol === "file:" ? "http://localhost:8000" : "");
        const res = await fetch(`${apiBase}/api/cms/content`);
        if (res.ok && mounted) {
          const data = await res.json();
          setCmsData(data);
          // Dynamically update document title if CMS specifies seo_title
          if (data?.settings?.seo_title) {
            document.title = data.settings.seo_title;
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic CMS content; using static fallback defaults:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchCMS();
    return () => { mounted = false; };
  }, []);

  // Track active section based on scroll position
  React.useEffect(() => {
    const sectionIds = [
      "home",
      "announcements",
      "verse-of-the-day",
      "service-timings",
      "sermons",
      "events",
      "ministries",
      "contact"
    ];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 160;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            if (id === "service-timings") {
              setActiveSection("about");
            } else if (id === "verse-of-the-day") {
              setActiveSection("home");
            } else {
              setActiveSection(id);
            }
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="church-app-root">
      {/* 1. Fixed Top Floating Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={(sec) => setActiveSection(sec)}
        data={cmsData?.settings}
      />

      <main>
        {/* 2. Hero Section */}
        <Hero data={cmsData?.home} />

        {/* 3. Announcements Section */}
        <Announcements data={cmsData?.announcements} />

        {/* 4. Verse of the Day Section */}
        <VerseOfTheDay />

        {/* 5. Service Timings Section */}
        <ServiceTimings data={cmsData?.service_timings} />

        {/* 6. About Us Section */}
        <About data={cmsData?.about} />

        {/* 7. Latest Sermons Section */}
        <LatestSermons data={cmsData?.sermons} />

        {/* 8. Upcoming Events Section */}
        <UpcomingEvents data={cmsData?.events} />

        {/* 9. Our Ministries Section */}
        <Ministries data={cmsData?.ministries} />

        {/* 10. Church Gallery Section */}
        <Gallery data={cmsData?.gallery} />

        {/* 11. Visit Our Church Section */}
        <ChurchLocation data={cmsData?.contact} />
      </main>

      {/* 10. Footer Section */}
      <Footer data={{ settings: cmsData?.settings, contact: cmsData?.contact }} />
    </div>
  );
}


window.HomePage = HomePage;

// Automatically mount HomePage to #root if present
function autoMountHomeApp() {
  if (window.__HOME_MOUNTED__) return;
  const rootElement = document.getElementById("root");
  if (!rootElement) return;

  if (window.ReactDOM && typeof window.ReactDOM.createRoot === "function") {
    window.__HOME_MOUNTED__ = true;
    const reactRoot = ReactDOM.createRoot(rootElement);
    reactRoot.render(React.createElement(HomePage));
  } else if (window.ReactDOM && typeof window.ReactDOM.render === "function") {
    window.__HOME_MOUNTED__ = true;
    ReactDOM.render(React.createElement(HomePage), rootElement);
  } else {
    setTimeout(autoMountHomeApp, 50);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoMountHomeApp);
} else {
  autoMountHomeApp();
}

})();
