/* ==========================================================================
   PrayerGuidelines Component
   Right-side encouragement, Bible promise cards, and pastoral care guidelines
   for desktop and tablet layouts (stacks cleanly on mobile).
   ========================================================================== */

function PrayerGuidelines() {
  const scripturePromises = [
    {
      verse: "Philippians 4:6-7",
      text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."
    },
    {
      verse: "Matthew 18:19-20",
      text: "Again, truly I tell you that if two of you on earth agree about anything they ask for, it will be done for them by my Father in heaven. For where two or three gather in my name, there am I with them."
    },
    {
      verse: "1 John 5:14",
      text: "This is the confidence we have in approaching God: that if we ask anything according to his will, he hears us."
    },
    {
      verse: "Jeremiah 29:12",
      text: "Then you will call on me and come and pray to me, and I will listen to you."
    }
  ];

  return (
    <aside className="prayer-guidelines-sidebar" aria-label="Prayer Encouragement and Scripture Promises">
      {/* 1. Scripture Promises Card */}
      <div className="guideline-card promises-card">
        <div className="guideline-card-header">
          <div className="guideline-badge-icon gold-badge">
            <span>📖</span>
          </div>
          <div>
            <h3 className="guideline-card-title">God&rsquo;s Promises on Prayer</h3>
            <p className="guideline-card-subtitle">Anchor your faith in His Word</p>
          </div>
        </div>

        <div className="scripture-promises-list">
          {scripturePromises.map((item, idx) => (
            <div key={idx} className="promise-item">
              <span className="promise-ref-tag">{item.verse}</span>
              <p className="promise-text">&ldquo;{item.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. How We Pray For You Card */}
      <div className="guideline-card pastoral-card">
        <div className="guideline-card-header">
          <div className="guideline-badge-icon blue-badge">
            <span>🙏</span>
          </div>
          <div>
            <h3 className="guideline-card-title">Our Prayer Intercession</h3>
            <p className="guideline-card-subtitle">How our church stands with you</p>
          </div>
        </div>

        <ul className="pastoral-points-list">
          <li className="pastoral-point">
            <span className="point-check">✓</span>
            <div>
              <strong>Dedicated Intercessory Ministry:</strong> Every submitted request is brought before God by our pastoral prayer team during weekly prayer vigils.
            </div>
          </li>
          <li className="pastoral-point">
            <span className="point-check">✓</span>
            <div>
              <strong>Complete Confidentiality:</strong> Your requests and private details remain strictly confidential and are never shared publicly or online.
            </div>
          </li>
          <li className="pastoral-point">
            <span className="point-check">✓</span>
            <div>
              <strong>Optional Pastoral Follow-Up:</strong> If you provide an email or phone number, a pastor will gladly reach out with a personal word of comfort and scripture.
            </div>
          </li>
        </ul>
      </div>

      {/* 3. Urgent Pastoral Care Helpline */}
      <div className="guideline-card crisis-card">
        <div className="guideline-card-header">
          <div className="guideline-badge-icon red-badge">
            <span>📞</span>
          </div>
          <div>
            <h3 className="guideline-card-title">Immediate Pastoral Support</h3>
            <p className="guideline-card-subtitle">If you are facing an urgent crisis</p>
          </div>
        </div>

        <div className="crisis-card-body">
          <p className="crisis-note">
            If you are experiencing a life-threatening emergency, please dial <strong>911</strong> (or your local emergency services) immediately.
          </p>
          <div className="pastoral-phone-box">
            <span className="phone-icon-symbol">⛪</span>
            <div>
              <span className="phone-label">Church Pastoral Helpline</span>
              <a href="tel:+15557729371" className="phone-number-link">(555) 772-9371</a>
              <span className="phone-hours">Mon &ndash; Fri &bull; 9:00 AM &ndash; 5:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

window.PrayerGuidelines = PrayerGuidelines;
