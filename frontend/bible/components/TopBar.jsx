/**
 * TopBar Component
 * Renders language selectors, font-size controls, theme switch, and online status badge.
 */

function TopBar({
  selectedLang,
  onChangeLang,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  theme,
  onToggleTheme,
  onToggleSidebar
}) {
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);

  return (
    <header className="bible-topbar" aria-label="Bible Utility Header">
      {/* Mobile Toggle Button */}
      <button 
        type="button" 
        className="btn-mobile-sidebar-toggle" 
        onClick={onToggleSidebar}
        aria-label="Toggle navigation menu"
      >
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
      </button>

      {/* Right Controls Container */}
      <div className="topbar-actions-group">
        {/* Language Selector 1: English (KJV) */}
        <div className="lang-selector-wrapper">
          <button
            type="button"
            className={`btn-topbar-lang ${selectedLang === "kjv" ? "selected" : ""}`}
            onClick={() => onChangeLang("kjv")}
            title="English King James Version"
          >
            <span className="lang-globe-icon">🌐</span>
            <span className="lang-name-text">English (KJV)</span>
            <svg className="dropdown-chevron-svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Language Selector 2: తెలుగు (Telugu) */}
        <div className="lang-selector-wrapper">
          <button
            type="button"
            className={`btn-topbar-lang ${selectedLang === "telugu" ? "selected" : ""}`}
            onClick={() => onChangeLang("telugu")}
            title="తెలుగు పరిశుద్ధ గ్రంథము (Telugu Holy Bible)"
          >
            <span className="lang-name-text telugu-text">తెలుగు (Telugu)</span>
            <svg className="dropdown-chevron-svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Font Size Adjusters */}
        <div className="font-controls-group" aria-label="Font Size Controls">
          <button
            type="button"
            className="btn-topbar-icon"
            onClick={onDecreaseFontSize}
            title="Decrease scripture text size (A-)"
            aria-label="Decrease scripture text size"
          >
            A-
          </button>
          <button
            type="button"
            className="btn-topbar-icon"
            onClick={onIncreaseFontSize}
            title="Increase scripture text size (A+)"
            aria-label="Increase scripture text size"
          >
            A+
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          className="btn-topbar-icon btn-theme-toggle"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle visual theme"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        {/* Online Status Pill */}
        <div className="topbar-status-pill online" title="Status: Online">
          <span className="status-indicator-dot">●</span>
          <span className="status-label-text">Online</span>
        </div>
      </div>
    </header>
  );
}

window.TopBar = TopBar;
