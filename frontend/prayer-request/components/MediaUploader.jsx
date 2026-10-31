/* ==========================================================================
   MediaUploader Component
   The 5 Media Action Cards matching the screenshot:
   1. Record Audio
   2. Upload Audio
   3. Upload Video
   4. Upload Photos
   5. Upload Document
   Handles multi-file selection, format validation, and 100 MB size limit.
   ========================================================================== */

function MediaUploader({
  onAddFiles,
  onOpenRecorder,
  currentTotalSize = 0,
  maxTotalSize = 100 * 1024 * 1024 // 100 MB
}) {
  const audioInputRef = React.useRef(null);
  const videoInputRef = React.useRef(null);
  const imageInputRef = React.useRef(null);
  const docInputRef = React.useRef(null);

  const [validationError, setValidationError] = React.useState("");

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFilesSelected = (event, expectedType) => {
    setValidationError("");
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);
    let newTotal = currentTotalSize;
    const validProcessedFiles = [];
    const errors = [];

    // Allowed extensions & mime categories
    const allowedExtensions = {
      audio: [".mp3", ".m4a", ".wav", ".aac", ".ogg", ".flac", ".wma"],
      video: [".mp4", ".mov", ".avi", ".webm", ".mkv", ".wmv", ".m4v"],
      image: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"],
      document: [".pdf", ".docx", ".doc", ".txt", ".rtf"]
    };

    for (const file of filesArray) {
      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
      let matchedType = expectedType;

      // Validate extension
      const isValidExt = allowedExtensions[expectedType] && allowedExtensions[expectedType].includes(ext);
      if (!isValidExt) {
        errors.push(`"${file.name}" is not a supported ${expectedType} format.`);
        continue;
      }

      // Check cumulative size
      if (newTotal + file.size > maxTotalSize) {
        const remaining = Math.max(0, maxTotalSize - newTotal);
        errors.push(`Cannot add "${file.name}" (${formatBytes(file.size)}). Exceeds 100 MB total limit. Space remaining: ${formatBytes(remaining)}.`);
        continue;
      }

      newTotal += file.size;

      // Generate preview URL
      const url = URL.createObjectURL(file);

      validProcessedFiles.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: file,
        name: file.name,
        size: file.size,
        formattedSize: formatBytes(file.size),
        type: expectedType,
        url: url,
        duration: expectedType === "audio" ? "01:36" : undefined
      });
    }

    if (errors.length > 0) {
      setValidationError(errors.join(" "));
    }

    if (validProcessedFiles.length > 0 && onAddFiles) {
      onAddFiles(validProcessedFiles);
    }

    // Reset input so same file can be re-selected if removed
    event.target.value = "";
  };

  return (
    <div className="prayer-media-uploader-section">
      {/* Header Row */}
      <div className="media-uploader-header-row">
        <label className="prayer-field-label media-label">
          Add Media <span className="label-optional">(Optional)</span>
        </label>
        <span className="media-limit-hint">
          You can add multiple files (Max total: 100 MB)
        </span>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="media-validation-alert" role="alert">
          <span className="alert-icon">⚠️</span>
          <span>{validationError}</span>
          <button type="button" className="btn-dismiss-alert" onClick={() => setValidationError("")}>✕</button>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={audioInputRef}
        type="file"
        multiple
        accept="audio/*, .mp3, .m4a, .wav, .aac, .ogg, .flac"
        style={{ display: "none" }}
        onChange={(e) => handleFilesSelected(e, "audio")}
      />
      <input
        ref={videoInputRef}
        type="file"
        multiple
        accept="video/*, .mp4, .mov, .avi, .webm, .mkv"
        style={{ display: "none" }}
        onChange={(e) => handleFilesSelected(e, "video")}
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*, .jpg, .jpeg, .png, .webp, .gif"
        style={{ display: "none" }}
        onChange={(e) => handleFilesSelected(e, "image")}
      />
      <input
        ref={docInputRef}
        type="file"
        multiple
        accept=".pdf, .docx, .doc, .txt"
        style={{ display: "none" }}
        onChange={(e) => handleFilesSelected(e, "document")}
      />

      {/* 5 Action Cards Grid Matching Screenshot */}
      <div className="media-action-buttons-grid">
        {/* 1. Record Audio */}
        <button
          type="button"
          className="btn-media-pill btn-record-audio-pill active-blue"
          onClick={onOpenRecorder}
          title="Record your voice prayer request"
        >
          <div className="media-pill-icon-box mic-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <span className="media-pill-label">Record Audio</span>
        </button>

        {/* 2. Upload Audio */}
        <button
          type="button"
          className="btn-media-pill"
          onClick={() => audioInputRef.current && audioInputRef.current.click()}
          title="Upload audio files (mp3, m4a, wav)"
        >
          <div className="media-pill-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
          <span className="media-pill-label">Upload Audio</span>
        </button>

        {/* 3. Upload Video */}
        <button
          type="button"
          className="btn-media-pill"
          onClick={() => videoInputRef.current && videoInputRef.current.click()}
          title="Upload video files (mp4, mov, webm)"
        >
          <div className="media-pill-icon-box purple-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2.18" ry="2.18" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
            </svg>
          </div>
          <span className="media-pill-label">Upload Video</span>
        </button>

        {/* 4. Upload Photos */}
        <button
          type="button"
          className="btn-media-pill"
          onClick={() => imageInputRef.current && imageInputRef.current.click()}
          title="Upload photos (jpg, png, webp)"
        >
          <div className="media-pill-icon-box magenta-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <span className="media-pill-label">Upload Photos</span>
        </button>

        {/* 5. Upload Document */}
        <button
          type="button"
          className="btn-media-pill"
          onClick={() => docInputRef.current && docInputRef.current.click()}
          title="Upload documents (pdf, docx, txt)"
        >
          <div className="media-pill-icon-box blue-doc-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <span className="media-pill-label">Upload Document</span>
        </button>
      </div>
    </div>
  );
}

window.MediaUploader = MediaUploader;
