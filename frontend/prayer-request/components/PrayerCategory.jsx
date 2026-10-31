/* ==========================================================================
   PrayerCategory Component
   Prayer Category selection dropdown with purple heart icon,
   alongside the "Submit Anonymously" toggle switch and subtitle.
   ========================================================================== */

function PrayerCategory({
  category = "",
  onChangeCategory,
  isAnonymous = false,
  onToggleAnonymous,
  error = ""
}) {
  const categories = [
    { value: "", label: "Select a category", disabled: true },
    { value: "Healing & Health", label: "Healing & Physical Health" },
    { value: "Family & Marriage", label: "Family, Marriage & Children" },
    { value: "Spiritual Growth", label: "Spiritual Growth & Deliverance" },
    { value: "Guidance & Direction", label: "Guidance, Wisdom & Major Decisions" },
    { value: "Financial & Employment", label: "Financial Provision & Employment" },
    { value: "Comfort & Grief", label: "Comfort, Grief & Loss of Loved One" },
    { value: "Salvation & Faith", label: "Salvation of Family & Loved Ones" },
    { value: "Mental & Emotional Peace", label: "Mental Health, Peace & Anxiety" },
    { value: "Thanksgiving & Praise", label: "Thanksgiving & Answered Prayer" },
    { value: "Other Need", label: "Other Personal Need" }
  ];

  return (
    <div className="prayer-category-anonymous-row">
      {/* Category Dropdown Column */}
      <div className={`prayer-form-group category-group ${error ? "has-error" : ""}`}>
        <label htmlFor="prayer-category-select" className="prayer-field-label">
          Prayer Category <span className="required-star">*</span>
        </label>

        <div className="custom-input-wrap select-wrap">
          {/* Purple Heart Icon */}
          <span className="field-icon-box heart-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>

          <select
            id="prayer-category-select"
            className="prayer-select-input"
            value={category}
            onChange={(e) => onChangeCategory(e.target.value)}
            aria-required="true"
            aria-invalid={!!error}
          >
            {categories.map((c, i) => (
              <option key={i} value={c.value} disabled={c.disabled}>
                {c.label}
              </option>
            ))}
          </select>

          <span className="select-dropdown-chevron" aria-hidden="true">▼</span>
        </div>

        {error && <p className="field-error-message" role="alert">{error}</p>}
      </div>

      {/* Submit Anonymously Toggle Column */}
      <div className="prayer-anonymous-toggle-wrap">
        <div className="anonymous-toggle-header">
          <label className="toggle-switch-control" htmlFor="anonymous-toggle">
            <input
              type="checkbox"
              id="anonymous-toggle"
              checked={isAnonymous}
              onChange={(e) => onToggleAnonymous(e.target.checked)}
              aria-label="Submit prayer request anonymously"
            />
            <span className="toggle-slider-round" />
          </label>
          <span className="anonymous-toggle-label">Submit Anonymously</span>
        </div>
        <p className="anonymous-toggle-subtitle">
          Your name will not be shown to the prayer team.
        </p>
      </div>
    </div>
  );
}

window.PrayerCategory = PrayerCategory;
