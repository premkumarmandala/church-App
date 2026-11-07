/* Church Public Home Website Master Bundle */
(function () {
  const {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef
  } = React || window.React;

  /* === Source: Navbar.jsx === */
  /* ==========================================================================
     Navbar Component - Grace Fellowship Church
     Fixed floating navigation bar with mobile responsive drawer
     Dynamically integrated with Church CMS API.
     ========================================================================== */

  function Navbar({
    activeSection = "home",
    onNavigate,
    data
  }) {
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
      window.addEventListener("scroll", handleScroll, {
        passive: true
      });
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    const churchName = data?.church_name || "Grace Fellowship Church";
    const churchTagline = data?.church_tagline || "Worship • Grow • Serve • Share";
    const navItems = [{
      id: "home",
      label: "Home",
      href: "#home"
    }, {
      id: "about",
      label: "About",
      href: "#about"
    }, {
      id: "bible",
      label: "Bible",
      href: "bible/index.html"
    }, {
      id: "prayer",
      label: "Prayer",
      href: "prayer-request/index.html"
    }, {
      id: "sermons",
      label: "Sermons",
      href: "#sermons"
    }, {
      id: "events",
      label: "Events",
      href: "#events"
    }, {
      id: "contact",
      label: "Contact",
      href: "#contact"
    }];
    const handleLinkClick = (id, href, e) => {
      if (href.startsWith("#")) {
        e.preventDefault();
        setMobileMenuOpen(false);
        if (onNavigate) onNavigate(id);
        const target = document.getElementById(href.substring(1));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth"
          });
        }
      }
    };
    return /*#__PURE__*/React.createElement("header", {
      className: `church-navbar ${isScrolled ? "scrolled" : ""}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "navbar-inner"
    }, /*#__PURE__*/React.createElement("a", {
      href: "#home",
      className: "nav-brand",
      onClick: e => handleLinkClick("home", "#home", e)
    }, /*#__PURE__*/React.createElement("div", {
      className: "nav-brand-logo"
    }, data?.logo_url ? /*#__PURE__*/React.createElement("img", {
      src: data.logo_url,
      alt: "",
      style: {
        width: "24px",
        height: "24px",
        objectFit: "contain"
      }
    }) : /*#__PURE__*/React.createElement("span", {
      className: "nav-cross-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M10 2h4v6h6v4h-6v10h-4V12H4V8h6V2z"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "nav-brand-text"
    }, /*#__PURE__*/React.createElement("span", {
      className: "nav-church-name"
    }, churchName), /*#__PURE__*/React.createElement("span", {
      className: "nav-church-tagline"
    }, churchTagline))), /*#__PURE__*/React.createElement("nav", {
      className: "nav-links-desktop",
      "aria-label": "Main Navigation"
    }, navItems.map(item => /*#__PURE__*/React.createElement("li", {
      key: item.id,
      className: "nav-link-item"
    }, /*#__PURE__*/React.createElement("a", {
      href: item.href,
      className: `nav-link-btn ${activeSection === item.id ? "active" : ""}`,
      onClick: e => handleLinkClick(item.id, item.href, e)
    }, item.label)))), /*#__PURE__*/React.createElement("div", {
      className: "nav-actions-desktop"
    }, /*#__PURE__*/React.createElement("a", {
      href: "admin/index.html",
      className: "btn-nav-outline",
      title: "Admin Portal & Content Manager"
    }, "Portal"), /*#__PURE__*/React.createElement("a", {
      href: "prayer-request/index.html",
      className: "btn-nav-cta"
    }, "Prayer Request")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "mobile-hamburger",
      onClick: () => setMobileMenuOpen(!mobileMenuOpen),
      "aria-label": "Toggle mobile menu",
      "aria-expanded": mobileMenuOpen
    }, /*#__PURE__*/React.createElement("span", {
      className: "bar"
    }), /*#__PURE__*/React.createElement("span", {
      className: "bar"
    }), /*#__PURE__*/React.createElement("span", {
      className: "bar"
    }))), mobileMenuOpen && /*#__PURE__*/React.createElement("div", {
      className: "mobile-drawer open"
    }, /*#__PURE__*/React.createElement("nav", {
      className: "mobile-nav-list",
      "aria-label": "Mobile Navigation"
    }, navItems.map(item => /*#__PURE__*/React.createElement("a", {
      key: item.id,
      href: item.href,
      className: `mobile-nav-link ${activeSection === item.id ? "active" : ""}`,
      onClick: e => handleLinkClick(item.id, item.href, e)
    }, item.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "admin/index.html",
      className: "btn-nav-outline",
      style: {
        textAlign: "center"
      }
    }, "Admin Portal (CMS)"), /*#__PURE__*/React.createElement("a", {
      href: "prayer-request/index.html",
      className: "btn-nav-cta",
      style: {
        textAlign: "center"
      }
    }, "Submit Prayer Request")))));
  }

  /* === Source: Hero.jsx === */
  /* ==========================================================================
     Hero Component - Grace Fellowship Church
     Hero banner with clean deep navy gradient, Scripture verse, and CTA buttons
     Dynamically integrated with Church CMS API.
     ========================================================================== */

  function Hero({
    data
  }) {
    const handleScrollTo = (sectionId, e) => {
      if (sectionId && sectionId.startsWith("#")) {
        e.preventDefault();
        const elem = document.getElementById(sectionId.substring(1));
        if (elem) {
          elem.scrollIntoView({
            behavior: "smooth"
          });
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
    return /*#__PURE__*/React.createElement("section", {
      id: "home",
      className: "hero-section"
    }, /*#__PURE__*/React.createElement("div", {
      className: "hero-overlay"
    }), /*#__PURE__*/React.createElement("div", {
      className: "home-container",
      style: {
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "hero-content"
    }, /*#__PURE__*/React.createElement("p", {
      className: "hero-welcome"
    }, welcomeText), /*#__PURE__*/React.createElement("h1", {
      className: "hero-title"
    }, heroTitle), /*#__PURE__*/React.createElement("p", {
      className: "hero-subtitle"
    }, heroSubtitle), /*#__PURE__*/React.createElement("p", {
      className: "hero-verse"
    }, heroVerse), /*#__PURE__*/React.createElement("div", {
      className: "hero-actions"
    }, /*#__PURE__*/React.createElement("a", {
      href: ctaPrimaryLink,
      className: "btn-hero-primary",
      onClick: e => handleScrollTo(ctaPrimaryLink, e)
    }, ctaPrimaryText), /*#__PURE__*/React.createElement("a", {
      href: ctaSecondaryLink,
      className: "btn-hero-secondary",
      onClick: e => handleScrollTo(ctaSecondaryLink, e)
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("polygon", {
      points: "5 3 19 12 5 21 5 3"
    })), /*#__PURE__*/React.createElement("span", null, ctaSecondaryText))))));
  }

  /* === Source: Announcements.jsx === */
  /* ==========================================================================
     Announcements Component - Grace Fellowship Church
     Carousel of announcements, event posters, and conference notices
     Dynamically integrated with Church CMS API.
     ========================================================================== */

  function Announcements({
    data
  }) {
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
    const announcementsData = Array.isArray(data) && data.length > 0 ? data.map(item => ({
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
      tagClass: item.tag_class === "blue" ? "badge-youth" : item.tag_class === "emerald" ? "badge-outreach" : "badge-fellowship"
    })) : [];
    const handlePrev = () => {
      setStartIndex(prev => prev === 0 ? announcementsData.length - 1 : prev - 1);
    };
    const handleNext = () => {
      setStartIndex(prev => prev === announcementsData.length - 1 ? 0 : prev + 1);
    };
    if (!announcementsData || announcementsData.length === 0) return null;
    return /*#__PURE__*/React.createElement("section", {
      id: "announcements",
      className: "home-container",
      style: {
        marginTop: "24px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "announcements-box"
    }, /*#__PURE__*/React.createElement("div", {
      className: "announcements-header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-title-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-title-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13.73 21a2 2 0 0 1-3.46 0"
    }))), /*#__PURE__*/React.createElement("h2", {
      className: "section-title-text"
    }, "Announcements")), /*#__PURE__*/React.createElement("a", {
      href: "#events",
      className: "section-view-all"
    }, /*#__PURE__*/React.createElement("span", null, "View All"), /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "announcements-carousel-wrapper"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "carousel-arrow-btn",
      onClick: handlePrev,
      "aria-label": "Previous announcement"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "15 18 9 12 15 6"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "announcements-grid"
    }, announcementsData.map(item => /*#__PURE__*/React.createElement("div", {
      key: item.id,
      className: "announcement-card"
    }, /*#__PURE__*/React.createElement("img", {
      src: item.image,
      alt: item.title,
      className: "announcement-banner-img",
      loading: "lazy"
    }), /*#__PURE__*/React.createElement("div", {
      className: "announcement-body"
    }, /*#__PURE__*/React.createElement("span", {
      className: `announcement-tag ${item.tagClass}`
    }, item.tag), /*#__PURE__*/React.createElement("h3", {
      className: "announcement-card-title"
    }, item.title), /*#__PURE__*/React.createElement("div", {
      className: "announcement-meta"
    }, /*#__PURE__*/React.createElement("span", null, item.date, " ", item.time ? `• ${item.time}` : ""), /*#__PURE__*/React.createElement("span", null, item.location)), item.actionLink && item.actionLink.startsWith("http") ? /*#__PURE__*/React.createElement("a", {
      href: item.actionLink,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "btn-announcement-action",
      style: {
        textAlign: "center",
        textDecoration: "none"
      }
    }, item.actionText) : /*#__PURE__*/React.createElement("a", {
      href: item.actionLink || "#contact",
      className: "btn-announcement-action",
      style: {
        textAlign: "center",
        textDecoration: "none"
      }
    }, item.actionText))))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "carousel-arrow-btn",
      onClick: handleNext,
      "aria-label": "Next announcement"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    }))))));
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
    return /*#__PURE__*/React.createElement("section", {
      id: "verse-of-the-day",
      className: "home-container",
      style: {
        marginTop: "24px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "votd-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "votd-left-visual"
    }, /*#__PURE__*/React.createElement("img", {
      src: "home/assets/open_bible_banner.jpg",
      alt: "Holy Bible Open Scripture",
      className: "votd-bible-img",
      loading: "lazy"
    })), /*#__PURE__*/React.createElement("div", {
      className: "votd-content"
    }, /*#__PURE__*/React.createElement("div", {
      className: "votd-header"
    }, /*#__PURE__*/React.createElement("span", {
      className: "votd-header-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
    }))), /*#__PURE__*/React.createElement("span", {
      className: "votd-header-title"
    }, "Verse of the Day")), /*#__PURE__*/React.createElement("p", {
      className: "votd-text"
    }, "\u201C", verse.text, "\u201D"), /*#__PURE__*/React.createElement("p", {
      className: "votd-reference"
    }, verse.reference)), /*#__PURE__*/React.createElement("a", {
      href: "bible/index.html",
      className: "btn-votd-read",
      title: "Study this verse in the Online Bible reader"
    }, /*#__PURE__*/React.createElement("span", null, "Read in Bible"), /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 5 19 12 12 19"
    })))));
  }

  /* === Source: ServiceTimings.jsx === */
  /* ==========================================================================
     ServiceTimings Component - Grace Fellowship Church
     Worship schedules, languages, and service timings in clean unified cards
     Dynamically integrated with Church CMS API.
     ========================================================================== */

  function ServiceTimings({
    data
  }) {
    const renderTimingIcon = name => {
      if (name === "people" || name === "users") {
        return /*#__PURE__*/React.createElement("svg", {
          width: "20",
          height: "20",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        }), /*#__PURE__*/React.createElement("circle", {
          cx: "9",
          cy: "7",
          r: "4"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M23 21v-2a4 4 0 0 0-3-3.87"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M16 3.13a4 4 0 0 1 0 7.75"
        }));
      }
      if (name === "prayer" || name === "pray") {
        return /*#__PURE__*/React.createElement("svg", {
          width: "20",
          height: "20",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        }));
      }
      if (name === "bible" || name === "book") {
        return /*#__PURE__*/React.createElement("svg", {
          width: "20",
          height: "20",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
        }));
      }
      return /*#__PURE__*/React.createElement("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M12 2v20M7 8h10"
      }));
    };
    const fallbackSchedules = [{
      id: 1,
      iconName: "church",
      title: "Sunday Worship",
      hours: "10:00 AM – 12:00 PM",
      subtitle: "English & Telugu"
    }, {
      id: 2,
      iconName: "people",
      title: "Sunday School",
      hours: "10:00 AM – 11:00 AM",
      subtitle: "Children & Youth"
    }, {
      id: 3,
      iconName: "prayer",
      title: "Wednesday Prayer",
      hours: "7:00 PM – 8:00 PM",
      subtitle: "Online & In-Person"
    }, {
      id: 4,
      iconName: "bible",
      title: "Friday Bible Study",
      hours: "7:00 PM – 8:00 PM",
      subtitle: "English & Telugu"
    }];
    const serviceSchedules = Array.isArray(data) && data.length > 0 ? data.map(schedule => ({
      id: schedule.id,
      iconName: schedule.icon_name || "church",
      title: schedule.title,
      hours: schedule.hours,
      subtitle: schedule.subtitle
    })) : fallbackSchedules;
    return /*#__PURE__*/React.createElement("section", {
      id: "service-timings",
      className: "home-container home-section"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-header-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-title-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-title-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 6 12 12 16 14"
    }))), /*#__PURE__*/React.createElement("h2", {
      className: "section-title-text"
    }, "Service Timings")), /*#__PURE__*/React.createElement("a", {
      href: "#contact",
      className: "section-view-all"
    }, /*#__PURE__*/React.createElement("span", null, "View Details"), /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "timings-grid"
    }, serviceSchedules.map(schedule => /*#__PURE__*/React.createElement("div", {
      key: schedule.id,
      className: "timing-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "timing-icon-badge"
    }, renderTimingIcon(schedule.iconName)), /*#__PURE__*/React.createElement("div", {
      className: "timing-info"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "timing-title"
    }, schedule.title), /*#__PURE__*/React.createElement("p", {
      className: "timing-hours"
    }, schedule.hours), /*#__PURE__*/React.createElement("p", {
      className: "timing-subtitle"
    }, schedule.subtitle))))));
  }

  /* === Source: About.jsx === */
  /* ==========================================================================
     About Component - Grace Fellowship Church
     Church history, doctrinal pillars, core beliefs, and pastoral profile
     Dynamically integrated with Church CMS API.
     ========================================================================== */

  function About({
    data
  }) {
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
    const defaultPillars = [{
      title: "Christ-Centered",
      desc: "Rooted in the gospel of Jesus Christ as our ultimate foundation.",
      icon: /*#__PURE__*/React.createElement("svg", {
        width: "22",
        height: "22",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M12 2v20M7 8h10"
      }))
    }, {
      title: "Biblical Authority",
      desc: "Committed to the inspired, inerrant Word of God for doctrine and daily life.",
      icon: /*#__PURE__*/React.createElement("svg", {
        width: "22",
        height: "22",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
      }))
    }, {
      title: "Loving Community",
      desc: "A warm, caring multi-generational family walking in authentic Christian fellowship.",
      icon: /*#__PURE__*/React.createElement("svg", {
        width: "22",
        height: "22",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "9",
        cy: "7",
        r: "4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M23 21v-2a4 4 0 0 0-3-3.87"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M16 3.13a4 4 0 0 1 0 7.75"
      }))
    }];
    const pillars = Array.isArray(data?.pillars) && data.pillars.length > 0 ? data.pillars : defaultPillars;
    let beliefs = ["Authority of Holy Scripture", "The Trinity (Father, Son, Holy Spirit)", "Salvation by Grace Through Faith", "Water Baptism and Communion", "The Power of Prayer & Intercession", "Christ-Centered Worship", "Loving Christian Fellowship", "The Great Commission"];
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
    return /*#__PURE__*/React.createElement("section", {
      id: "about",
      className: "home-section-wrap bg-page"
    }, /*#__PURE__*/React.createElement("div", {
      className: "home-container home-section"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-header-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-title-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-title-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 2v20M7 8h10"
    }))), /*#__PURE__*/React.createElement("h2", {
      className: "section-title-text"
    }, "About Our Church"))), /*#__PURE__*/React.createElement("div", {
      className: "about-intro-grid"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "about-history-card"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "about-history-title"
    }, "Our Heritage & Calling"), /*#__PURE__*/React.createElement("p", {
      className: "about-history-text"
    }, history), mission && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "14px",
        fontSize: "0.925rem",
        color: "#334155",
        lineHeight: "1.6"
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "#0f172a"
      }
    }, "Our Mission: "), /*#__PURE__*/React.createElement("span", null, mission)), vision && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "8px",
        fontSize: "0.925rem",
        color: "#334155",
        lineHeight: "1.6"
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "#0f172a"
      }
    }, "Our Vision: "), /*#__PURE__*/React.createElement("span", null, vision))), /*#__PURE__*/React.createElement("div", {
      className: "about-pillars-grid"
    }, pillars.map((pillar, idx) => /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "about-pillar-box"
    }, /*#__PURE__*/React.createElement("div", {
      className: "pillar-icon-wrap"
    }, pillar.icon), /*#__PURE__*/React.createElement("h4", {
      className: "pillar-title"
    }, pillar.title), /*#__PURE__*/React.createElement("p", {
      className: "pillar-desc"
    }, pillar.desc)))), /*#__PURE__*/React.createElement("div", {
      className: "beliefs-section-wrap"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "beliefs-title"
    }, "What We Believe"), /*#__PURE__*/React.createElement("div", {
      className: "beliefs-tags-list"
    }, beliefs.map((belief, idx) => /*#__PURE__*/React.createElement("span", {
      key: idx,
      className: "belief-tag-pill"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    })), /*#__PURE__*/React.createElement("span", null, belief)))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "pastor-profile-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "pastor-photo-wrap"
    }, /*#__PURE__*/React.createElement("img", {
      src: pastorImage,
      alt: pastorName,
      className: "pastor-photo-img",
      loading: "eager"
    })), /*#__PURE__*/React.createElement("h3", {
      className: "pastor-name-heading"
    }, pastorName), /*#__PURE__*/React.createElement("p", {
      className: "pastor-role-sub"
    }, pastorTitle), /*#__PURE__*/React.createElement("p", {
      className: "pastor-bio-text"
    }, pastorBio), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "20px",
        padding: "14px 16px",
        background: "#f8fafc",
        borderRadius: "8px",
        borderLeft: "3px solid var(--color-accent)"
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontStyle: "italic",
        fontSize: "0.85rem",
        color: "#475569",
        lineHeight: "1.5"
      }
    }, "\u201COur prayer is that everyone who enters our doors encounters the living Christ, experiences genuine fellowship, and discovers their God-given purpose.\u201D")))))));
  }

  /* === Source: LatestSermons.jsx === */
  /* ==========================================================================
     LatestSermons Component - Grace Fellowship Church
     Sermon video cards with duration badges, speaker info, and audio player
     Dynamically integrated with Church CMS API.
     ========================================================================== */

  function LatestSermons({
    data
  }) {
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
    const sermons = Array.isArray(data) && data.length > 0 ? data.map(s => ({
      id: s.id,
      title: s.title,
      speaker: s.speaker || "Ps. John Samuel",
      date: s.date_text ? `• ${s.date_text}` : "",
      duration: s.duration || "45:00",
      thumbnail: formatMediaUrl(s.thumbnail, "/admin-data/sermons/thumbnails/sermon_pastor.jpg"),
      passage: s.passage || "",
      video_url: s.video_url,
      audio_url: s.audio_url,
      description: s.description
    })) : [];
    const handlePlaySermon = sermon => {
      setActiveSermon(sermon);
    };
    if (!sermons || sermons.length === 0) return null;
    return /*#__PURE__*/React.createElement("section", {
      id: "sermons",
      className: "home-container home-section"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-header-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-title-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-title-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polygon", {
      points: "5 3 19 12 5 21 5 3"
    }))), /*#__PURE__*/React.createElement("h2", {
      className: "section-title-text"
    }, "Latest Sermons")), /*#__PURE__*/React.createElement("a", {
      href: "#sermons",
      className: "section-view-all"
    }, /*#__PURE__*/React.createElement("span", null, "View All"), /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "sermons-grid"
    }, sermons.map(sermon => /*#__PURE__*/React.createElement("article", {
      key: sermon.id,
      className: "sermon-video-card",
      onClick: () => handlePlaySermon(sermon),
      tabIndex: 0,
      role: "button",
      onKeyDown: e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handlePlaySermon(sermon);
        }
      },
      "aria-label": `Watch sermon: ${sermon.title}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "sermon-thumb-wrap"
    }, /*#__PURE__*/React.createElement("img", {
      src: sermon.thumbnail,
      alt: sermon.title,
      className: "sermon-thumb-img",
      loading: "lazy",
      onError: e => {
        e.target.src = "home/assets/sermon_pastor.jpg";
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "sermon-play-pill",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M8 5v14l11-7z"
    }))), /*#__PURE__*/React.createElement("span", {
      className: "sermon-duration-tag"
    }, sermon.duration)), /*#__PURE__*/React.createElement("div", {
      className: "sermon-details"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "sermon-card-title"
    }, sermon.title), /*#__PURE__*/React.createElement("p", {
      className: "sermon-speaker-line"
    }, /*#__PURE__*/React.createElement("span", {
      className: "speaker-name"
    }, sermon.speaker), /*#__PURE__*/React.createElement("span", {
      className: "speaker-date"
    }, sermon.date)), sermon.passage && /*#__PURE__*/React.createElement("p", {
      className: "sermon-passage-line",
      style: {
        fontSize: "0.8rem",
        color: "var(--color-text-muted)",
        marginTop: "6px",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
    })), /*#__PURE__*/React.createElement("span", null, sermon.passage)))))), activeSermon && /*#__PURE__*/React.createElement("div", {
      className: "sermon-modal-overlay",
      onClick: () => setActiveSermon(null),
      role: "dialog",
      "aria-modal": "true"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sermon-modal-box",
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      className: "sermon-modal-header"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "sermon-modal-title"
    }, activeSermon.title), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "modal-close-btn",
      onClick: () => setActiveSermon(null),
      "aria-label": "Close sermon video"
    }, "\xD7")), /*#__PURE__*/React.createElement("div", {
      className: "sermon-modal-player"
    }, activeSermon.video_url && activeSermon.video_url.includes("youtube.com") ? /*#__PURE__*/React.createElement("iframe", {
      src: activeSermon.video_url.replace("watch?v=", "embed/"),
      title: activeSermon.title,
      style: {
        width: "100%",
        height: "360px",
        border: 0
      },
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
      allowFullScreen: true
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        width: "100%",
        height: "280px",
        background: "#081220",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: activeSermon.thumbnail,
      alt: activeSermon.title,
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: 0.6
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        textAlign: "center",
        color: "#fff",
        padding: "16px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "2.5rem",
        color: "#c59b27"
      }
    }, "\u25B6"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "1.1rem",
        marginTop: "8px"
      }
    }, activeSermon.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "0.85rem",
        color: "#cbd5e1"
      }
    }, "Preached by ", activeSermon.speaker, " ", activeSermon.date))), activeSermon.description && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 20px",
        background: "#fff",
        fontSize: "0.875rem",
        color: "#334155",
        lineHeight: 1.6
      }
    }, activeSermon.description)))));
  }

  /* === Source: UpcomingEvents.jsx === */
  /* ==========================================================================
     UpcomingEvents Component - Grace Fellowship Church
     Upcoming church events, posters, dates, venues, and registration buttons
     Dynamically integrated with Church CMS API.
     ========================================================================== */

  function UpcomingEvents({
    data
  }) {
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
    const events = Array.isArray(data) && data.length > 0 ? data.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date_text,
      location: e.location,
      image: formatMediaUrl(e.image, "/admin-data/events/church_picnic.jpg"),
      actionText: e.action_text || "Register Now",
      registration_link: e.registration_link || "#contact"
    })) : [];
    if (!events || events.length === 0) return null;
    return /*#__PURE__*/React.createElement("section", {
      id: "events",
      className: "home-container home-section"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-header-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-title-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-title-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    }))), /*#__PURE__*/React.createElement("h2", {
      className: "section-title-text"
    }, "Upcoming Events")), /*#__PURE__*/React.createElement("a", {
      href: "#events",
      className: "section-view-all"
    }, /*#__PURE__*/React.createElement("span", null, "View All"), /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "events-grid"
    }, events.map(event => /*#__PURE__*/React.createElement("div", {
      key: event.id,
      className: "event-item-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "event-thumb-wrapper"
    }, /*#__PURE__*/React.createElement("img", {
      src: event.image,
      alt: event.title,
      className: "event-thumb-img",
      loading: "lazy",
      onError: e => {
        e.target.src = "home/assets/church_picnic.jpg";
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "event-card-details"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "event-heading"
    }, event.title), /*#__PURE__*/React.createElement("p", {
      className: "event-meta-line",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "event-date",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px"
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    })), /*#__PURE__*/React.createElement("span", null, event.date)), /*#__PURE__*/React.createElement("span", {
      className: "event-venue",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px"
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "10",
      r: "3"
    })), /*#__PURE__*/React.createElement("span", null, event.location))), event.registration_link && event.registration_link.startsWith("http") ? /*#__PURE__*/React.createElement("a", {
      href: event.registration_link,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "btn-event-register",
      style: {
        textAlign: "center",
        textDecoration: "none"
      }
    }, event.actionText) : /*#__PURE__*/React.createElement("a", {
      href: event.registration_link || "#contact",
      className: "btn-event-register",
      style: {
        textAlign: "center",
        textDecoration: "none"
      }
    }, event.actionText))))));
  }

  /* === Source: Ministries.jsx === */
  /* ==========================================================================
     Ministries Component - Grace Fellowship Church
     Ministry departments: Children, Youth, Women, Men, Prayer, and Outreach
     Dynamically integrated with Church CMS API.
     ========================================================================== */

  function Ministries({
    data
  }) {
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
    const fallbackMinistries = [{
      id: 1,
      name: "Children's Ministry",
      photo: "/admin-data/ministries/children_ministry.jpg",
      description: "Sunday School, biblical foundations, crafts, and songs for children."
    }, {
      id: 2,
      name: "Youth Ministry",
      photo: "/admin-data/home/announcements/youth_conference.jpg",
      description: "Empowering teens and young adults to stand bold for Christ."
    }, {
      id: 3,
      name: "Women's Ministry",
      photo: "/admin-data/home/announcements/womens_fellowship.jpg",
      description: "Encouraging sisters in faith, discipleship, and prayer fellowship."
    }, {
      id: 4,
      name: "Men's Ministry",
      photo: "/admin-data/ministries/fellowship_service.jpg",
      description: "Building strong godly fathers, husbands, and leaders in Christ."
    }, {
      id: 5,
      name: "Prayer Ministry",
      photo: "/admin-data/sermons/thumbnails/prayer_hands.jpg",
      description: "Faithful intercession for our church, community, and global needs."
    }, {
      id: 6,
      name: "Outreach & Missions",
      photo: "/admin-data/home/announcements/open_bible_banner.jpg",
      description: "Sharing the love of Christ through local and regional benevolence."
    }];
    const ministryList = Array.isArray(data) && data.length > 0 ? data.map(m => ({
      id: m.id,
      name: m.name,
      photo: formatMediaUrl(m.photo, "/admin-data/ministries/children_ministry.jpg"),
      description: m.short_description || m.full_description || m.description,
      meeting_time: m.meeting_time,
      leader_name: m.leader_name
    })) : fallbackMinistries;
    return /*#__PURE__*/React.createElement("section", {
      id: "ministries",
      className: "home-container home-section"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-header-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-title-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-title-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "9",
      cy: "7",
      r: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M23 21v-2a4 4 0 0 0-3-3.87"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 3.13a4 4 0 0 1 0 7.75"
    }))), /*#__PURE__*/React.createElement("h2", {
      className: "section-title-text"
    }, "Our Ministries")), /*#__PURE__*/React.createElement("a", {
      href: "#ministries",
      className: "section-view-all"
    }, /*#__PURE__*/React.createElement("span", null, "View All"), /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "ministries-row"
    }, ministryList.map(m => /*#__PURE__*/React.createElement("div", {
      key: m.id,
      className: "ministry-unit-card",
      onClick: () => setSelectedMinistry(m),
      tabIndex: 0,
      role: "button",
      onKeyDown: e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSelectedMinistry(m);
        }
      },
      "aria-label": `View ${m.name} details`
    }, /*#__PURE__*/React.createElement("div", {
      className: "ministry-avatar-wrapper"
    }, /*#__PURE__*/React.createElement("img", {
      src: m.photo,
      alt: m.name,
      className: "ministry-circle-img",
      loading: "lazy",
      onError: e => {
        e.target.src = "home/assets/children_ministry.jpg";
      }
    })), /*#__PURE__*/React.createElement("h3", {
      className: "ministry-card-label"
    }, m.name)))), selectedMinistry && /*#__PURE__*/React.createElement("div", {
      className: "modal-backdrop-church",
      onClick: () => setSelectedMinistry(null),
      role: "dialog",
      "aria-modal": "true"
    }, /*#__PURE__*/React.createElement("div", {
      className: "donate-modal-card",
      onClick: e => e.stopPropagation(),
      style: {
        maxWidth: "520px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "donate-modal-header"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "donate-header-title"
    }, selectedMinistry.name), /*#__PURE__*/React.createElement("p", {
      className: "donate-header-sub"
    }, selectedMinistry.leader_name ? `Led by ${selectedMinistry.leader_name}` : "Church Fellowship Ministry")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-modal-close-icon",
      onClick: () => setSelectedMinistry(null),
      "aria-label": "Close modal"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "donate-modal-body"
    }, selectedMinistry.photo && /*#__PURE__*/React.createElement("img", {
      src: selectedMinistry.photo,
      alt: selectedMinistry.name,
      style: {
        width: "100%",
        height: "200px",
        objectFit: "cover",
        borderRadius: "8px",
        marginBottom: "16px"
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "0.95rem",
        color: "var(--color-text-secondary)",
        lineHeight: 1.6,
        marginBottom: "16px"
      }
    }, selectedMinistry.description || "A dedicated ministry for discipleship, spiritual growth, and community fellowship."), selectedMinistry.meeting_time && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: "var(--color-surface-subtle)",
        borderRadius: "8px",
        fontSize: "0.85rem",
        color: "var(--color-primary-800)",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 6 12 12 16 14"
    })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Schedule:"), " ", selectedMinistry.meeting_time)), /*#__PURE__*/React.createElement("a", {
      href: "#contact",
      className: "btn-hero-primary",
      style: {
        width: "100%",
        textAlign: "center",
        textDecoration: "none",
        display: "block"
      },
      onClick: () => setSelectedMinistry(null)
    }, "Connect with Ministry Leaders")))));
  }

  /* === Source: Gallery.jsx === */
  /* ==========================================================================
     Gallery Component - Grace Fellowship Church
     Photo & media highlights with category filter and lightbox preview
     Dynamically integrated with Church CMS API.
     ========================================================================== */

  function Gallery({
    data
  }) {
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
    const rawItems = Array.isArray(data) && data.length > 0 ? data : [];
    const categories = ["All", "Worship", "Youth", "Fellowship", "Special"];
    const filteredItems = React.useMemo(() => {
      if (activeCategory === "All") return rawItems;
      return rawItems.filter(item => (item.category || "").toLowerCase() === activeCategory.toLowerCase());
    }, [rawItems, activeCategory]);
    if (!rawItems || rawItems.length === 0) return null;
    return /*#__PURE__*/React.createElement("section", {
      id: "gallery",
      className: "home-section-wrap bg-page"
    }, /*#__PURE__*/React.createElement("div", {
      className: "home-container home-section"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-header-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-title-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-title-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "13",
      r: "4"
    }))), /*#__PURE__*/React.createElement("h2", {
      className: "section-title-text"
    }, "Church Gallery & Highlights"))), /*#__PURE__*/React.createElement("div", {
      className: "gallery-filter-bar"
    }, categories.map(cat => /*#__PURE__*/React.createElement("button", {
      key: cat,
      type: "button",
      className: `gallery-filter-btn ${activeCategory === cat ? "active" : ""}`,
      onClick: () => setActiveCategory(cat)
    }, cat))), /*#__PURE__*/React.createElement("div", {
      className: "gallery-grid"
    }, filteredItems.map(item => /*#__PURE__*/React.createElement("div", {
      key: item.id,
      className: "gallery-media-card",
      onClick: () => setLightboxItem(item)
    }, /*#__PURE__*/React.createElement("div", {
      className: "gallery-thumb-container"
    }, /*#__PURE__*/React.createElement("img", {
      src: formatMediaUrl(item.media_url, "/admin-data/gallery/worship_service.jpg"),
      alt: item.title,
      className: "gallery-thumb-img",
      loading: "lazy"
    }), /*#__PURE__*/React.createElement("span", {
      className: "gallery-card-badge"
    }, item.category || "Church"), /*#__PURE__*/React.createElement("span", {
      className: "gallery-card-type"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "13",
      r: "4"
    })), /*#__PURE__*/React.createElement("span", null, "Photo"))), /*#__PURE__*/React.createElement("div", {
      className: "gallery-body-box"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "gallery-item-title"
    }, item.title), /*#__PURE__*/React.createElement("p", {
      className: "gallery-item-caption"
    }, item.caption))))), lightboxItem && /*#__PURE__*/React.createElement("div", {
      className: "modal-backdrop-church",
      onClick: () => setLightboxItem(null),
      role: "dialog",
      "aria-modal": "true"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lightbox-modal-content",
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("img", {
      src: formatMediaUrl(lightboxItem.media_url, "/admin-data/gallery/worship_service.jpg"),
      alt: lightboxItem.title,
      className: "lightbox-img"
    }), /*#__PURE__*/React.createElement("div", {
      className: "lightbox-caption-bar"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
      style: {
        margin: "0 0 4px 0",
        fontSize: "1.05rem",
        fontWeight: 700,
        color: "#ffffff"
      }
    }, lightboxItem.title), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: "0.85rem",
        color: "#94a3b8"
      }
    }, lightboxItem.caption, " \u2022 ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#c59b27"
      }
    }, lightboxItem.category))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-modal-close-icon",
      onClick: () => setLightboxItem(null),
      title: "Close preview",
      "aria-label": "Close image preview"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    }))))))));
  }

  /* === Source: ChurchLocation.jsx === */
  /* ==========================================================================
     ChurchLocation Component - Grace Fellowship Church
     Visit Our Church section with exterior photo, contact details, socials, and map
     Dynamically integrated with Church CMS API.
     ========================================================================== */

  function ChurchLocation({
    data
  }) {
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
    const handleZoomIn = () => setZoomLevel(z => Math.min(z + 1, 18));
    const handleZoomOut = () => setZoomLevel(z => Math.max(z - 1, 10));
    const exteriorImage = formatMediaUrl(data?.church_exterior_image, "/admin-data/home/banners/church_building.jpg");
    const addressLine1 = data?.address_line1 || "123 Faith Avenue";
    const addressLine2 = data?.address_line2 ? `${data.address_line2}, ` : "";
    const cityStateZip = data?.city_state_zip || "Hyderabad, Telangana 500001";
    const phone = data?.phone || "+91 98765 43210";
    const email = data?.email || "info@gracefellowship.org";
    const facebookUrl = data?.facebook_url || "https://facebook.com";
    const youtubeUrl = data?.youtube_url || "https://youtube.com";
    const instagramUrl = data?.instagram_url || "https://instagram.com";
    const whatsappUrl = data?.whatsapp_number ? `https://wa.me/${data.whatsapp_number.replace(/[^0-9]/g, "")}` : "https://whatsapp.com";
    return /*#__PURE__*/React.createElement("section", {
      id: "contact",
      className: "home-container home-section"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-header-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "section-title-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-title-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "10",
      r: "3"
    }))), /*#__PURE__*/React.createElement("h2", {
      className: "section-title-text"
    }, "Visit Our Church"))), /*#__PURE__*/React.createElement("div", {
      className: "visit-church-grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "church-exterior-card"
    }, /*#__PURE__*/React.createElement("img", {
      src: exteriorImage,
      alt: "Grace Fellowship Church Sanctuary Campus",
      className: "church-exterior-img",
      loading: "eager",
      onError: e => {
        e.target.src = "home/assets/church_building.jpg";
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "church-contact-info"
    }, /*#__PURE__*/React.createElement("div", {
      className: "contact-info-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "contact-info-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "10",
      r: "3"
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, addressLine1, ","), /*#__PURE__*/React.createElement("br", null), addressLine2, cityStateZip)), /*#__PURE__*/React.createElement("div", {
      className: "contact-info-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "contact-info-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
    }))), /*#__PURE__*/React.createElement("div", null, phone)), /*#__PURE__*/React.createElement("div", {
      className: "contact-info-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "contact-info-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "22,6 12,13 2,6"
    }))), /*#__PURE__*/React.createElement("div", null, email)), /*#__PURE__*/React.createElement("div", {
      className: "church-social-icons"
    }, /*#__PURE__*/React.createElement("a", {
      href: facebookUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "social-circle-btn fb",
      title: "Facebook",
      "aria-label": "Facebook"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
    }))), /*#__PURE__*/React.createElement("a", {
      href: youtubeUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "social-circle-btn yt",
      title: "YouTube",
      "aria-label": "YouTube"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
    }), /*#__PURE__*/React.createElement("polygon", {
      points: "9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02",
      fill: "#ffffff"
    }))), /*#__PURE__*/React.createElement("a", {
      href: instagramUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "social-circle-btn ig",
      title: "Instagram",
      "aria-label": "Instagram"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "2",
      width: "20",
      height: "20",
      rx: "5",
      ry: "5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "17.5",
      y1: "6.5",
      x2: "17.51",
      y2: "6.5"
    }))), /*#__PURE__*/React.createElement("a", {
      href: whatsappUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "social-circle-btn wa",
      title: "WhatsApp",
      "aria-label": "WhatsApp"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "church-map-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "map-view-container"
    }, /*#__PURE__*/React.createElement("iframe", {
      title: "Grace Fellowship Church Map Location",
      src: `https://www.openstreetmap.org/export/embed.html?bbox=78.4700%2C17.3750%2C78.4950%2C17.3950&layer=mapnik&marker=17.3850%2C78.4867`,
      className: "map-iframe",
      loading: "lazy"
    }), /*#__PURE__*/React.createElement("div", {
      className: "map-controls"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "map-zoom-btn",
      onClick: handleZoomIn,
      "aria-label": "Zoom in map"
    }, "+"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "map-zoom-btn",
      onClick: handleZoomOut,
      "aria-label": "Zoom out map"
    }, "\u2212"))))));
  }

  /* === Source: DonateModal.jsx === */
  /* ==========================================================================
     DonateModal Component - Grace Fellowship Church
     Online Giving, Tithes, Missions, and Building Fund Bank/UPI Details
     ========================================================================== */

  function DonateModal({
    isOpen,
    onClose
  }) {
    const [copiedField, setCopiedField] = React.useState(null);
    const [selectedPurpose, setSelectedPurpose] = React.useState("tithe");
    if (!isOpen) return null;
    const handleCopy = (text, fieldName) => {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-backdrop-church",
      onClick: onClose,
      role: "dialog",
      "aria-modal": "true"
    }, /*#__PURE__*/React.createElement("div", {
      className: "donate-modal-card",
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      className: "donate-modal-header"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "donate-header-title"
    }, "Online Giving & Tithes"), /*#__PURE__*/React.createElement("p", {
      className: "donate-header-sub"
    }, "Support the Ministry of Grace Fellowship Church")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-modal-close-icon",
      onClick: onClose,
      "aria-label": "Close modal"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "donate-modal-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "donate-scripture-box"
    }, "\u201CEach of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.\u201D \u2014 2 Corinthians 9:7"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: {
        display: "block",
        fontSize: "0.85rem",
        fontWeight: 700,
        color: "#0f172a",
        marginBottom: "8px"
      }
    }, "Select Contribution Purpose:"), /*#__PURE__*/React.createElement("div", {
      className: "giving-purposes-grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: `giving-purpose-btn ${selectedPurpose === "tithe" ? "active" : ""}`,
      onClick: () => setSelectedPurpose("tithe")
    }, /*#__PURE__*/React.createElement("span", {
      className: "purpose-title"
    }, "Tithes & Offerings"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "0.72rem",
        opacity: 0.85
      }
    }, "General Ministry")), /*#__PURE__*/React.createElement("div", {
      className: `giving-purpose-btn ${selectedPurpose === "missions" ? "active" : ""}`,
      onClick: () => setSelectedPurpose("missions")
    }, /*#__PURE__*/React.createElement("span", {
      className: "purpose-title"
    }, "Missions & Outreach"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "0.72rem",
        opacity: 0.85
      }
    }, "Community Care")), /*#__PURE__*/React.createElement("div", {
      className: `giving-purpose-btn ${selectedPurpose === "building" ? "active" : ""}`,
      onClick: () => setSelectedPurpose("building")
    }, /*#__PURE__*/React.createElement("span", {
      className: "purpose-title"
    }, "Building Fund"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "0.72rem",
        opacity: 0.85
      }
    }, "Sanctuary Expansion")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: {
        display: "block",
        fontSize: "0.85rem",
        fontWeight: 700,
        color: "#0f172a",
        marginBottom: "8px"
      }
    }, "Bank Account Transfer (NEFT / IMPS / RTGS):"), /*#__PURE__*/React.createElement("div", {
      className: "bank-details-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bank-detail-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bank-label"
    }, "Account Name"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "bank-value"
    }, "Grace Fellowship Church Trust"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-copy-tag",
      onClick: () => handleCopy("Grace Fellowship Church Trust", "name")
    }, copiedField === "name" ? "Copied!" : "Copy"))), /*#__PURE__*/React.createElement("div", {
      className: "bank-detail-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bank-label"
    }, "Account Number"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "bank-value"
    }, "987654321098"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-copy-tag",
      onClick: () => handleCopy("987654321098", "account")
    }, copiedField === "account" ? "Copied!" : "Copy"))), /*#__PURE__*/React.createElement("div", {
      className: "bank-detail-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bank-label"
    }, "Bank Name"), /*#__PURE__*/React.createElement("span", {
      className: "bank-value"
    }, "State Bank of India")), /*#__PURE__*/React.createElement("div", {
      className: "bank-detail-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bank-label"
    }, "IFSC Code"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "bank-value"
    }, "SBIN0001234"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-copy-tag",
      onClick: () => handleCopy("SBIN0001234", "ifsc")
    }, copiedField === "ifsc" ? "Copied!" : "Copy"))), /*#__PURE__*/React.createElement("div", {
      className: "bank-detail-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bank-label"
    }, "Branch"), /*#__PURE__*/React.createElement("span", {
      className: "bank-value"
    }, "Main Branch, Hyderabad")))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "14px 16px",
        background: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "0.85rem",
        fontWeight: 700,
        color: "#0f172a",
        display: "block"
      }
    }, "UPI / QR Code Giving:"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "0.8rem",
        color: "#64748b"
      }
    }, "UPI ID: ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "#0f172a",
        fontFamily: "monospace"
      }
    }, "gracefellowship@sbi"))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-copy-tag",
      onClick: () => handleCopy("gracefellowship@sbi", "upi")
    }, copiedField === "upi" ? "Copied UPI!" : "Copy UPI ID"))), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: "0.78rem",
        color: "#64748b",
        textAlign: "center",
        lineHeight: "1.4"
      }
    }, "For official 80G tax exemption donation receipts, please email your transaction reference to ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "#0f172a"
      }
    }, "info@gracefellowship.org"), "."))));
  }

  /* === Source: Footer.jsx === */
  /* ==========================================================================
     Footer Component - Grace Fellowship Church
     Navy footer with church branding, nav links, social media, and copyright
     Dynamically integrated with Church CMS API.
     ========================================================================== */

  function Footer({
    data
  }) {
    const footerLinks = [{
      label: "Home",
      href: "#home"
    }, {
      label: "About",
      href: "#about"
    }, {
      label: "Bible",
      href: "bible/index.html"
    }, {
      label: "Prayer Request",
      href: "prayer-request/index.html"
    }, {
      label: "Sermons",
      href: "#sermons"
    }, {
      label: "Events",
      href: "#events"
    }, {
      label: "Ministries",
      href: "#ministries"
    }, {
      label: "Admin Portal",
      href: "admin/index.html"
    }];
    const handleLinkClick = (href, e) => {
      if (href.startsWith("#")) {
        e.preventDefault();
        const target = document.getElementById(href.substring(1));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth"
          });
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
    const whatsappUrl = data?.contact?.whatsapp_number ? `https://wa.me/${data.contact.whatsapp_number.replace(/[^0-9]/g, "")}` : "https://whatsapp.com";
    return /*#__PURE__*/React.createElement("footer", {
      className: "church-footer"
    }, /*#__PURE__*/React.createElement("div", {
      className: "home-container"
    }, /*#__PURE__*/React.createElement("div", {
      className: "footer-main-grid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "footer-brand-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "footer-brand"
    }, /*#__PURE__*/React.createElement("span", {
      className: "footer-cross",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M10 2h4v6h6v4h-6v10h-4V12H4V8h6V2z"
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "footer-church-name"
    }, churchName), /*#__PURE__*/React.createElement("div", {
      className: "footer-tagline"
    }, tagline))), /*#__PURE__*/React.createElement("p", {
      className: "footer-brand-desc"
    }, footerDesc), /*#__PURE__*/React.createElement("div", {
      className: "footer-social-links"
    }, /*#__PURE__*/React.createElement("a", {
      href: facebookUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "footer-social-icon",
      title: "Facebook",
      "aria-label": "Facebook"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
    }))), /*#__PURE__*/React.createElement("a", {
      href: youtubeUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "footer-social-icon",
      title: "YouTube",
      "aria-label": "YouTube"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
    }), /*#__PURE__*/React.createElement("polygon", {
      points: "9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02",
      fill: "#0f1e36"
    }))), /*#__PURE__*/React.createElement("a", {
      href: instagramUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "footer-social-icon",
      title: "Instagram",
      "aria-label": "Instagram"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "2",
      width: "20",
      height: "20",
      rx: "5",
      ry: "5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "17.5",
      y1: "6.5",
      x2: "17.51",
      y2: "6.5"
    }))), /*#__PURE__*/React.createElement("a", {
      href: whatsappUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "footer-social-icon",
      title: "WhatsApp",
      "aria-label": "WhatsApp"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "footer-visit-col"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "footer-section-title"
    }, "Visit Our Church"), /*#__PURE__*/React.createElement("div", {
      className: "footer-visit-info"
    }, /*#__PURE__*/React.createElement("div", {
      className: "visit-info-item"
    }, /*#__PURE__*/React.createElement("span", {
      className: "visit-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "10",
      r: "3"
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Address:"), /*#__PURE__*/React.createElement("p", null, address))), /*#__PURE__*/React.createElement("div", {
      className: "visit-info-item"
    }, /*#__PURE__*/React.createElement("span", {
      className: "visit-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Phone:"), /*#__PURE__*/React.createElement("p", null, phone))), /*#__PURE__*/React.createElement("div", {
      className: "visit-info-item"
    }, /*#__PURE__*/React.createElement("span", {
      className: "visit-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "22,6 12,13 2,6"
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Email:"), /*#__PURE__*/React.createElement("p", null, email))))), /*#__PURE__*/React.createElement("div", {
      className: "footer-links-col"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "footer-section-title"
    }, "Quick Links"), /*#__PURE__*/React.createElement("ul", {
      className: "footer-nav-list"
    }, footerLinks.map(link => /*#__PURE__*/React.createElement("li", {
      key: link.label
    }, /*#__PURE__*/React.createElement("a", {
      href: link.href,
      onClick: e => handleLinkClick(link.href, e)
    }, link.label)))))), /*#__PURE__*/React.createElement("div", {
      className: "footer-bottom-bar"
    }, /*#__PURE__*/React.createElement("p", {
      className: "footer-copyright-text"
    }, copyright), /*#__PURE__*/React.createElement("div", {
      className: "footer-legal-links"
    }, /*#__PURE__*/React.createElement("a", {
      href: "admin/index.html",
      style: {
        color: "#c59b27",
        fontWeight: 700
      }
    }, "Admin Portal (CMS)"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#475569"
      }
    }, "\u2022"), /*#__PURE__*/React.createElement("a", {
      href: "#home",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem"
      }
    }, "Back to Top", /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "19",
      x2: "12",
      y2: "5"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "5 12 12 5 19 12"
    })))))));
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
      return () => {
        mounted = false;
      };
    }, []);

    // Track active section based on scroll position
    React.useEffect(() => {
      const sectionIds = ["home", "announcements", "verse-of-the-day", "service-timings", "sermons", "events", "ministries", "contact"];
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
      window.addEventListener("scroll", handleScroll, {
        passive: true
      });
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return /*#__PURE__*/React.createElement("div", {
      className: "church-app-root"
    }, /*#__PURE__*/React.createElement(Navbar, {
      activeSection: activeSection,
      onNavigate: sec => setActiveSection(sec),
      data: cmsData?.settings
    }), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(Hero, {
      data: cmsData?.home
    }), /*#__PURE__*/React.createElement(Announcements, {
      data: cmsData?.announcements
    }), /*#__PURE__*/React.createElement(VerseOfTheDay, null), /*#__PURE__*/React.createElement(ServiceTimings, {
      data: cmsData?.service_timings
    }), /*#__PURE__*/React.createElement(About, {
      data: cmsData?.about
    }), /*#__PURE__*/React.createElement(LatestSermons, {
      data: cmsData?.sermons
    }), /*#__PURE__*/React.createElement(UpcomingEvents, {
      data: cmsData?.events
    }), /*#__PURE__*/React.createElement(Ministries, {
      data: cmsData?.ministries
    }), /*#__PURE__*/React.createElement(Gallery, {
      data: cmsData?.gallery
    }), /*#__PURE__*/React.createElement(ChurchLocation, {
      data: cmsData?.contact
    })), /*#__PURE__*/React.createElement(Footer, {
      data: {
        settings: cmsData?.settings,
        contact: cmsData?.contact
      }
    }));
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