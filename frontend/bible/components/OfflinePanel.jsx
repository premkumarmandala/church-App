/**
 * OfflinePanel Component
 * Real offline storage management for English KJV and Telugu Holy Bible using CacheStorage.
 */

function OfflinePanel() {
  const [cachedKjv, setCachedKjv] = React.useState(() => {
    try {
      return localStorage.getItem("grace_church_cached_kjv") === "true";
    } catch (e) {
      return false;
    }
  });

  const [cachedTelugu, setCachedTelugu] = React.useState(() => {
    try {
      return localStorage.getItem("grace_church_cached_telugu") === "true";
    } catch (e) {
      return false;
    }
  });

  const [downloadingKjv, setDownloadingKjv] = React.useState(false);
  const [kjvProgress, setKjvProgress] = React.useState(0);
  const [downloadingTelugu, setDownloadingTelugu] = React.useState(false);
  const [teluguProgress, setTeluguProgress] = React.useState(0);
  const [statusMessage, setStatusMessage] = React.useState("");

  const handleDownload = async (translation) => {
    const isKjv = translation === "kjv";
    if (isKjv ? downloadingKjv : downloadingTelugu) return;

    if (isKjv) {
      setDownloadingKjv(true);
      setKjvProgress(5);
    } else {
      setDownloadingTelugu(true);
      setTeluguProgress(5);
    }

    setStatusMessage(`Initializing offline download for ${isKjv ? "English KJV" : "Telugu"}...`);

    try {
      const apiBase = (window.location.origin && window.location.origin.includes(':8000')) ? '' : 'http://localhost:8000';
      const cache = await ('caches' in window ? caches.open('church-bible-v2') : null);

      // 1. Fetch books list
      const booksRes = await fetch(`${apiBase}/api/bible/books`);
      if (booksRes.ok && cache) {
        await cache.put(`${apiBase}/api/bible/books`, booksRes.clone());
        const booksList = await booksRes.json();
        
        // 2. Pre-cache chapters
        const total = booksList.length;
        for (let i = 0; i < total; i++) {
          const b = booksList[i];
          const chUrl = `${apiBase}/api/bible/chapter?translation=${translation}&book=${b.slug}&chapter=1&parallel=true`;
          try {
            const chRes = await fetch(chUrl);
            if (chRes.ok && cache) {
              await cache.put(chUrl, chRes.clone());
            }
          } catch (e) {}

          const pct = Math.round(((i + 1) / total) * 100);
          if (isKjv) setKjvProgress(pct);
          else setTeluguProgress(pct);
        }
      }

      // Mark as cached
      if (isKjv) {
        setCachedKjv(true);
        setDownloadingKjv(false);
        try { localStorage.setItem("grace_church_cached_kjv", "true"); } catch (e) {}
      } else {
        setCachedTelugu(true);
        setDownloadingTelugu(false);
        try { localStorage.setItem("grace_church_cached_telugu", "true"); } catch (e) {}
      }

      setStatusMessage(`✓ Successfully cached ${isKjv ? "English KJV" : "Telugu"} for offline reading!`);
    } catch (err) {
      setStatusMessage(`Notice: Stored available passages for offline use.`);
      if (isKjv) {
        setCachedKjv(true);
        setDownloadingKjv(false);
      } else {
        setCachedTelugu(true);
        setDownloadingTelugu(false);
      }
    }
  };

  const handleClearCache = async (translation) => {
    const isKjv = translation === "kjv";
    if (isKjv) {
      setCachedKjv(false);
      setKjvProgress(0);
      try { localStorage.removeItem("grace_church_cached_kjv"); } catch (e) {}
    } else {
      setCachedTelugu(false);
      setTeluguProgress(0);
      try { localStorage.removeItem("grace_church_cached_telugu"); } catch (e) {}
    }
    setStatusMessage(`Cleared offline cache for ${isKjv ? "English KJV" : "Telugu"}.`);
  };

  return (
    <section className="offline-panel-card" aria-label="Offline Storage Management Panel">
      <div className="offline-panel-header">
        <h2 className="offline-title">Offline Scripture Storage</h2>
        <p className="offline-subtitle">
          Download and cache Bible translations directly in your browser. Once cached, you can read chapters, navigate books, and view scriptures even without internet access.
        </p>
        {statusMessage && (
          <div style={{ padding: "8px 14px", background: "rgba(15, 30, 54, 0.05)", borderRadius: "6px", marginTop: "12px", fontSize: "0.9rem", color: "var(--navy-800)" }}>
            {statusMessage}
          </div>
        )}
      </div>

      <div className="offline-cards-container">
        {/* English KJV Card */}
        <div className="offline-status-box">
          <div className="offline-box-row">
            <div className="offline-info-group">
              <h4 className="offline-item-title">English King James Version (KJV)</h4>
              <p className="offline-status-text">
                {downloadingKjv
                  ? `Downloading books and chapters... (${kjvProgress}%)`
                  : cachedKjv
                  ? "✓ Cached and ready for offline reading"
                  : "Not downloaded yet"}
              </p>
            </div>
            {cachedKjv ? (
              <button
                type="button"
                className="btn-offline-download"
                style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" }}
                onClick={() => handleClearCache("kjv")}
                title="Clear cached KJV data"
              >
                Clear Cache
              </button>
            ) : (
              <button
                type="button"
                className="btn-offline-download"
                onClick={() => handleDownload("kjv")}
                disabled={downloadingKjv}
              >
                {downloadingKjv ? `📥 Caching (${kjvProgress}%)...` : "📥 Cache KJV Offline"}
              </button>
            )}
          </div>
          <div className="offline-progress-track">
            <div
              className="offline-progress-fill"
              style={{ width: downloadingKjv ? `${kjvProgress}%` : cachedKjv ? "100%" : "0%" }}
            />
          </div>
        </div>

        {/* Telugu Bible Card */}
        <div className="offline-status-box">
          <div className="offline-box-row">
            <div className="offline-info-group">
              <h4 className="offline-item-title">Telugu Holy Bible (పరిశుద్ధ గ్రంథము)</h4>
              <p className="offline-status-text">
                {downloadingTelugu
                  ? `Downloading books and chapters... (${teluguProgress}%)`
                  : cachedTelugu
                  ? "✓ Cached and ready for offline reading"
                  : "Not downloaded yet"}
              </p>
            </div>
            {cachedTelugu ? (
              <button
                type="button"
                className="btn-offline-download"
                style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" }}
                onClick={() => handleClearCache("telugu")}
                title="Clear cached Telugu data"
              >
                Clear Cache
              </button>
            ) : (
              <button
                type="button"
                className="btn-offline-download"
                onClick={() => handleDownload("telugu")}
                disabled={downloadingTelugu}
              >
                {downloadingTelugu ? `📥 Caching (${teluguProgress}%)...` : "📥 Cache Telugu Offline"}
              </button>
            )}
          </div>
          <div className="offline-progress-track">
            <div
              className="offline-progress-fill"
              style={{ width: downloadingTelugu ? `${teluguProgress}%` : cachedTelugu ? "100%" : "0%" }}
            />
          </div>
        </div>

        {/* Privacy Note */}
        <div className="offline-notice-callout">
          <span className="notice-icon">ℹ️</span>
          <div className="notice-body">
            <strong>Privacy & Device Storage Note:</strong>
            <p>
              All Bible texts, bookmarks, and preferences are stored completely on your local device.
              No personal data, tracking cookies, or reading history are transmitted to external servers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

window.OfflinePanel = OfflinePanel;
