/**
 * OfflinePanel Component
 * Demonstrates offline storage management for English KJV and Telugu Holy Bible.
 */

function OfflinePanel() {
  const [cachedKjv, setCachedKjv] = React.useState(true);
  const [cachedTelugu, setCachedTelugu] = React.useState(true);

  return (
    <section className="offline-panel-card" aria-label="Offline Storage Management Panel">
      <div className="offline-panel-header">
        <h2 className="offline-title">Offline Scripture Storage</h2>
        <p className="offline-subtitle">
          Download and cache Bible translations directly in your browser. Once cached, you can read chapters, navigate books, and search verses without internet connection.
        </p>
      </div>

      <div className="offline-cards-container">
        {/* English KJV Card */}
        <div className="offline-status-box">
          <div className="offline-box-row">
            <div className="offline-info-group">
              <h4 className="offline-item-title">English King James Version (KJV)</h4>
              <p className="offline-status-text">
                {cachedKjv ? "✓ Cached and ready for offline reading (3.8 MB)" : "Not downloaded"}
              </p>
            </div>
            <button
              type="button"
              className="btn-offline-download"
              onClick={() => setCachedKjv(!cachedKjv)}
            >
              {cachedKjv ? "✓ Downloaded" : "📥 Cache KJV Offline"}
            </button>
          </div>
          <div className="offline-progress-track">
            <div className="offline-progress-fill" style={{ width: cachedKjv ? "100%" : "0%" }} />
          </div>
        </div>

        {/* Telugu Bible Card */}
        <div className="offline-status-box">
          <div className="offline-box-row">
            <div className="offline-info-group">
              <h4 className="offline-item-title">Telugu Holy Bible (పరిశుద్ధ గ్రంథము)</h4>
              <p className="offline-status-text">
                {cachedTelugu ? "✓ Cached and ready for offline reading (4.2 MB)" : "Not downloaded"}
              </p>
            </div>
            <button
              type="button"
              className="btn-offline-download"
              onClick={() => setCachedTelugu(!cachedTelugu)}
            >
              {cachedTelugu ? "✓ Downloaded" : "📥 Cache Telugu Offline"}
            </button>
          </div>
          <div className="offline-progress-track">
            <div className="offline-progress-fill" style={{ width: cachedTelugu ? "100%" : "0%" }} />
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
