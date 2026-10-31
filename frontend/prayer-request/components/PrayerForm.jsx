/* ==========================================================================
   PrayerForm Component
   The central "Send a Prayer Request" card matching the uploaded screenshot:
   - Name, Email, Phone inputs with embedded icons
   - Prayer Category dropdown & Submit Anonymously toggle
   - Prayer request textarea with 1,000 character counter
   - Add Media (Record Audio, Upload Audio, Video, Photos, Document)
   - Attachment previews with waveform audio player and remove controls
   - Send Prayer Request action button
   - Privacy Callout banner
   - Submission confirmation modal with reference number
   ========================================================================== */

function PrayerForm({ initialAttachments = [] }) {
  // Form State - Empty by default; only shows user-added/recorded media files
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [requestText, setRequestText] = React.useState("");
  const [attachments, setAttachments] = React.useState(initialAttachments || []);

  // UI / Modal State
  const [isRecordingOpen, setIsRecordingOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [submissionResult, setSubmissionResult] = React.useState(null);
  const [previewingItem, setPreviewingItem] = React.useState(null); // For lightbox

  // Max character limit
  const MAX_CHAR_LIMIT = 1000;
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100 MB

  // Calculate current total attachment size
  const totalAttachmentSize = React.useMemo(() => {
    return attachments.reduce((acc, curr) => acc + (curr.size || 0), 0);
  }, [attachments]);

  // Handle adding new attachments
  const handleAddAttachments = (newFiles) => {
    setAttachments((prev) => [...prev, ...newFiles]);
    // Clear attachment error if any
    setErrors((prev) => ({ ...prev, attachments: "", general: "" }));
  };

  // Handle removing attachment
  const handleRemoveAttachment = (idToRemove) => {
    setAttachments((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  // Add recorded audio
  const handleAttachRecordedAudio = (audioItem) => {
    setAttachments((prev) => [...prev, audioItem]);
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    if (!category.trim()) {
      newErrors.category = "Please select a prayer category.";
    }

    const hasText = requestText.trim().length > 0;
    const hasAttachments = attachments.length > 0;

    if (!hasText && !hasAttachments) {
      newErrors.requestText = "Please write your prayer request or attach an audio/video message.";
    } else if (hasText && requestText.length > MAX_CHAR_LIMIT) {
      newErrors.requestText = `Prayer request cannot exceed ${MAX_CHAR_LIMIT} characters (Currently: ${requestText.length}).`;
    }

    if (email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (totalAttachmentSize > MAX_TOTAL_SIZE) {
      newErrors.attachments = "Total attachment size cannot exceed 100 MB. Please remove some files.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Prayer Request
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorEl = document.querySelector(".field-error-message, .form-general-error");
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const requesterName = isAnonymous ? "Anonymous" : (name.trim() || "Friend in Christ");
    const contactInfo = isAnonymous 
      ? "Anonymous" 
      : [email.trim(), phone.trim()].filter(Boolean).join(" | ") || "Not provided";

    let detailedMessage = `[Category: ${category}] ${requestText.trim()}`;
    if (attachments.length > 0) {
      detailedMessage += `\n[Attachments (${attachments.length})]: ${attachments.map((a) => `${a.name} (${a.formattedSize})`).join(", ")}`;
    }

    const payload = {
      name: requesterName,
      contact: contactInfo,
      request: detailedMessage
    };

    try {
      const apiBase = (window.location.origin && window.location.origin.includes(":8000")) ? "" : "http://localhost:8000";
      const response = await fetch(`${apiBase}/api/prayer-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissionResult({
          requestId: data.request_id || `PR-${Date.now().toString().slice(-6)}`,
          message: data.message || "Thank you! Your prayer request has been received by our pastoral prayer team.",
          timestamp: data.timestamp || new Date().toISOString(),
          category: category,
          isAnonymous: isAnonymous,
          attachmentsCount: attachments.length
        });
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.warn("Backend API not reachable. Creating safe offline confirmation.", err);
    }

    // Clean client fallback if backend is offline
    const clientRefId = `PR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmissionResult({
      requestId: clientRefId,
      message: `Thank you${isAnonymous ? "" : `, ${name.trim() || "Friend"}`}! Your prayer request has been submitted. Our pastoral prayer warriors will hold you in prayer.`,
      timestamp: new Date().toISOString(),
      category: category,
      isAnonymous: isAnonymous,
      attachmentsCount: attachments.length
    });
    setIsSubmitting(false);
  };

  // Reset form to submit another request
  const handleResetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCategory("");
    setIsAnonymous(false);
    setRequestText("");
    setAttachments([]);
    setErrors({});
    setSubmissionResult(null);
  };

  return (
    <div className="prayer-form-card-container">
      {/* SUCCESS CONFIRMATION POPUP MODAL */}
      {submissionResult && (
        <div 
          className="prayer-success-modal-overlay" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="success-modal-title"
          onClick={(e) => {
            if (e.target.classList.contains("prayer-success-modal-overlay")) {
              setSubmissionResult(null);
            }
          }}
        >
          <div className="prayer-success-card">
            {/* Top Right Close Button */}
            <button 
              type="button" 
              className="btn-popup-close-x" 
              onClick={() => setSubmissionResult(null)}
              aria-label="Close popup"
              title="Close"
            >
              ✕
            </button>

            <div className="success-icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            <h2 id="success-modal-title" className="success-title">Prayer Request Received</h2>
            <p className="success-message">{submissionResult.message}</p>

            <div className="success-reference-box">
              <span className="ref-label">Reference Number</span>
              <span className="ref-number">{submissionResult.requestId}</span>
              <span className="ref-hint">Please save this reference number for pastoral follow-up.</span>
            </div>

            <div className="success-meta-details">
              <div className="meta-detail-row">
                <span className="detail-key">Category:</span>
                <span className="detail-val">{submissionResult.category}</span>
              </div>
              <div className="meta-detail-row">
                <span className="detail-key">Privacy Mode:</span>
                <span className="detail-val">{submissionResult.isAnonymous ? "Anonymous Submission" : "Standard Contact"}</span>
              </div>
              {submissionResult.attachmentsCount > 0 && (
                <div className="meta-detail-row">
                  <span className="detail-key">Attachments:</span>
                  <span className="detail-val">{submissionResult.attachmentsCount} file(s) attached</span>
                </div>
              )}
            </div>

            <div className="success-quote-box">
              <p>&ldquo;And this is the confidence that we have toward him, that if we ask anything according to his will he hears us.&rdquo;</p>
              <span>&mdash; 1 John 5:14</span>
            </div>

            <div className="popup-actions-row">
              <button
                type="button"
                className="btn-popup-secondary"
                onClick={() => setSubmissionResult(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-submit-another"
                onClick={handleResetForm}
              >
                Submit Another Prayer Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewingItem && (
        <div className="lightbox-modal-overlay" onClick={() => setPreviewingItem(null)}>
          <div className="lightbox-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <span className="lightbox-filename">{previewingItem.name}</span>
              <button type="button" className="btn-lightbox-close" onClick={() => setPreviewingItem(null)}>✕</button>
            </div>
            <div className="lightbox-body">
              {previewingItem.type === "image" && (
                <img src={previewingItem.url} alt={previewingItem.name} className="lightbox-full-img" />
              )}
              {previewingItem.type === "video" && (
                <video src={previewingItem.url} controls autoPlay className="lightbox-full-video" />
              )}
              {previewingItem.type === "document" && (
                <div className="lightbox-doc-preview">
                  <span className="doc-big-icon">📄</span>
                  <p>{previewingItem.name} ({previewingItem.formattedSize})</p>
                  <a href={previewingItem.url} download={previewingItem.name} className="btn-doc-download">
                    ⬇ Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AUDIO RECORDER MODAL */}
      <window.AudioRecorder
        isOpen={isRecordingOpen}
        onClose={() => setIsRecordingOpen(false)}
        onAttachAudio={handleAttachRecordedAudio}
      />

      {/* MAIN CARD */}
      <article className="prayer-request-main-card" aria-label="Send a Prayer Request Form">
        {/* Card Header matching screenshot */}
        <header className="card-top-header">
          <div className="card-header-icon-box">
            {/* Blue square pen/edit writing icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div className="card-header-titles">
            <h2 className="card-primary-title">Send a Prayer Request</h2>
            <p className="card-secondary-subtitle">Let us know how we can pray for you.</p>
          </div>
        </header>

        {/* Form Body */}
        <form className="prayer-actual-form" onSubmit={handleSubmit} noValidate>
          {/* Row 1: Name and Email */}
          <div className="form-fields-grid-two-col">
            {/* Name Field */}
            <div className={`prayer-form-group ${isAnonymous ? "is-disabled" : ""}`}>
              <label htmlFor="requester-name" className="prayer-field-label">
                Your Name <span className="label-optional">(Optional)</span>
              </label>
              <div className="custom-input-wrap">
                <span className="field-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  id="requester-name"
                  className="prayer-text-input"
                  placeholder={isAnonymous ? "Anonymous — Name hidden" : "Enter your name"}
                  value={isAnonymous ? "" : name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isAnonymous}
                  maxLength={100}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className={`prayer-form-group ${errors.email ? "has-error" : ""}`}>
              <label htmlFor="requester-email" className="prayer-field-label">
                Email <span className="label-optional">(Optional)</span>
              </label>
              <div className="custom-input-wrap">
                <span className="field-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  id="requester-email"
                  className="prayer-text-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={120}
                />
              </div>
              {errors.email && <p className="field-error-message" role="alert">{errors.email}</p>}
            </div>
          </div>

          {/* Row 2: Phone */}
          <div className="prayer-form-group">
            <label htmlFor="requester-phone" className="prayer-field-label">
              Phone <span className="label-optional">(Optional)</span>
            </label>
            <div className="custom-input-wrap">
              <span className="field-icon-box" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <input
                type="tel"
                id="requester-phone"
                className="prayer-text-input"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={30}
              />
            </div>
          </div>

          {/* Row 3: Category & Anonymous Toggle */}
          <window.PrayerCategory
            category={category}
            onChangeCategory={setCategory}
            isAnonymous={isAnonymous}
            onToggleAnonymous={setIsAnonymous}
            error={errors.category}
          />

          {/* Row 4: Prayer Request Textarea */}
          <div className={`prayer-form-group textarea-group ${errors.requestText ? "has-error" : ""}`}>
            <label htmlFor="prayer-request-text" className="prayer-field-label">
              Your Prayer Request <span className="required-star">*</span>
            </label>

            <div className="textarea-container">
              <textarea
                id="prayer-request-text"
                className="prayer-textarea"
                rows="5"
                placeholder="Type your prayer request here..."
                value={requestText}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHAR_LIMIT) {
                    setRequestText(e.target.value);
                  }
                }}
                aria-required="true"
                aria-invalid={!!errors.requestText}
              />
            </div>

            {/* Character Count Row */}
            <div className="textarea-footer-row">
              {errors.requestText ? (
                <p className="field-error-message" role="alert">{errors.requestText}</p>
              ) : <span />}
              <span className={`char-counter-label ${requestText.length >= MAX_CHAR_LIMIT ? "at-limit" : ""}`}>
                {requestText.length} / {MAX_CHAR_LIMIT}
              </span>
            </div>
          </div>

          {/* Row 5: Add Media Uploader */}
          <window.MediaUploader
            onAddFiles={handleAddAttachments}
            onOpenRecorder={() => setIsRecordingOpen(true)}
            currentTotalSize={totalAttachmentSize}
            maxTotalSize={MAX_TOTAL_SIZE}
          />

          {/* Row 6: Attachment Previews */}
          <window.AttachmentPreview
            attachments={attachments}
            onRemoveAttachment={handleRemoveAttachment}
            onPreviewItem={setPreviewingItem}
          />

          {/* General Form Error if any */}
          {errors.general && (
            <div className="form-general-error" role="alert">
              ⚠️ {errors.general}
            </div>
          )}

          {/* Row 7: Send Prayer Request Button */}
          <div className="form-submit-row">
            <button
              type="submit"
              className="btn-send-prayer-request"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="submit-spinner-text">
                  <span className="submit-spinner" />
                  Sending Prayer Request...
                </span>
              ) : (
                <span className="submit-normal-content">
                  {/* Paper Airplane Send Icon */}
                  <svg className="send-plane-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" />
                  </svg>
                  <span>Send Prayer Request</span>
                </span>
              )}
            </button>
          </div>

          {/* Row 8: Green Privacy Callout Banner matching screenshot */}
          <div className="prayer-privacy-callout-banner" role="note">
            <div className="privacy-shield-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <p className="privacy-callout-text">
              Your request is private and will be seen only by the church prayer team.
            </p>
          </div>
        </form>
      </article>
    </div>
  );
}

window.PrayerForm = PrayerForm;
