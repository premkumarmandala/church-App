/* ==========================================================================
   PrayerHero Component
   Recreates the exact Hero Section from the screenshot:
   Sunrise cross over mountains, Praying Hands icon, "Prayer Request" heading,
   and James 5:16 Scripture quote.
   ========================================================================== */

function PrayerHero() {
  return (
    <section className="prayer-hero-section" aria-label="Prayer Request Banner">
      {/* Background with Dark Warm Gradient Overlay */}
      <div className="prayer-hero-bg-container">
        <div className="prayer-hero-gradient-overlay" />
      </div>

      <div className="prayer-hero-content-wrapper">
        <div className="prayer-hero-row">
          {/* Left Text & Icon Block */}
          <div className="prayer-hero-left">
            {/* Praying Hands Icon */}
            <div className="prayer-hands-icon-wrap" aria-hidden="true">
              <svg 
                className="prayer-hands-svg" 
                viewBox="0 0 64 64" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Stylized praying hands silhouette */}
                <path d="M26 14c0-3.3 2.7-6 6-6s6 2.7 6 6v18h-12V14z" />
                <path d="M20 22c-2.2 0-4 1.8-4 4v10c0 4.4 3.6 8 8 8h2V32h-6v-6c0-2.2 1.8-4 4-4h-4z" />
                <path d="M44 22c2.2 0 4 1.8 4 4v10c0 4.4-3.6 8-8 8h-2V32h6v-6c0-2.2-1.8-4-4-4h4z" />
                <path d="M24 44l-8 12h32l-8-12" />
                <path d="M28 32v12h8V32" />
                <path d="M22 28l-6 2c-1.7.6-2.5 2.5-1.9 4.2l3.9 11.8" />
                <path d="M42 28l6 2c1.7.6 2.5 2.5 1.9 4.2l-3.9 11.8" />
              </svg>
            </div>

            <div className="prayer-hero-text-block">
              <h1 className="prayer-hero-title">Prayer Request</h1>
              <p className="prayer-hero-subtitle">
                Share your prayer need with us. We will pray for you.
              </p>
              <blockquote className="prayer-hero-quote">
                &ldquo;The prayer of a righteous person is powerful and effective.&rdquo;
                <span className="quote-author"> &mdash; James 5:16</span>
              </blockquote>
            </div>
          </div>

          {/* Right Silhouette Cross on Hill Graphic */}
          <div className="prayer-hero-right-silhouette" aria-hidden="true">
            <div className="cross-silhouette-wrap">
              <svg className="cross-svg" viewBox="0 0 100 120" fill="none">
                {/* Sun rays glow */}
                <circle cx="50" cy="50" r="35" fill="url(#sunGlow)" opacity="0.45" />
                {/* Wooden Cross */}
                <rect x="46" y="10" width="8" height="100" rx="1.5" fill="#2d1d14" />
                <rect x="25" y="32" width="50" height="8" rx="1.5" fill="#2d1d14" />
                {/* Highlights */}
                <line x1="47" y1="12" x2="47" y2="108" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />
                <line x1="26" y1="33" x2="74" y2="33" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />
                {/* Hill base */}
                <path d="M0 120 Q 50 90 100 120 L 100 120 L 0 120 Z" fill="#1e1610" />
                <defs>
                  <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffedd5" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.PrayerHero = PrayerHero;
