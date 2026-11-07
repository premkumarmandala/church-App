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

