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
