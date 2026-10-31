/* ==========================================================================
   HomePage Component - Grace Fellowship Church
   Master React component assembling all Home Page sections
   ========================================================================== */

function HomePage() {
  const [activeSection, setActiveSection] = React.useState("home");

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
      />

      <main>
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Announcements Section */}
        <Announcements />

        {/* 4. Verse of the Day Section */}
        <VerseOfTheDay />

        {/* 5. Service Timings Section */}
        <ServiceTimings />

        {/* 6. Latest Sermons Section */}
        <LatestSermons />

        {/* 7. Upcoming Events Section */}
        <UpcomingEvents />

        {/* 8. Our Ministries Section */}
        <Ministries />

        {/* 9. Visit Our Church Section */}
        <ChurchLocation />
      </main>

      {/* 10. Footer Section */}
      <Footer />
    </div>
  );
}
