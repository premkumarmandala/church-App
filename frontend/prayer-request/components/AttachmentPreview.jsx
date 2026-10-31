/* ==========================================================================
   AttachmentPreview Component
   Displays uploaded and recorded media attachments matching the screenshot:
   - Audio item: purple badge, file name, size/duration, waveform bars, play button, remove X
   - Photo item: thumbnail preview, file name, size, eye view button, remove X
   - Document item: red PDF badge, file name, size, eye view button, remove X
   - Video item: purple video badge, file name, size, play preview button, remove X
   ========================================================================== */

function AttachmentPreview({
  attachments = [],
  onRemoveAttachment,
  onPreviewItem
}) {
  const [playingAudioId, setPlayingAudioId] = React.useState(null);
  const audioElementsRef = React.useRef({});

  const toggleAudioPlay = (id, url) => {
    // If clicking already playing audio
    if (playingAudioId === id) {
      if (audioElementsRef.current[id]) {
        audioElementsRef.current[id].pause();
      }
      setPlayingAudioId(null);
      return;
    }

    // Stop previous audio
    if (playingAudioId && audioElementsRef.current[playingAudioId]) {
      audioElementsRef.current[playingAudioId].pause();
    }

    if (!audioElementsRef.current[id]) {
      const audio = new Audio(url);
      audio.onended = () => setPlayingAudioId(null);
      audioElementsRef.current[id] = audio;
    }

    audioElementsRef.current[id].play().then(() => {
      setPlayingAudioId(id);
    }).catch((err) => {
      console.warn("Audio play prevented:", err);
      setPlayingAudioId(null);
    });
  };

  const handleRemove = (id) => {
    if (playingAudioId === id && audioElementsRef.current[id]) {
      audioElementsRef.current[id].pause();
      setPlayingAudioId(null);
    }
    if (audioElementsRef.current[id]) {
      delete audioElementsRef.current[id];
    }
    if (onRemoveAttachment) {
      onRemoveAttachment(id);
    }
  };

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="prayer-attachments-list-container" aria-label="Attached Media Files">
      {attachments.map((item) => {
        const isAudio = item.type === "audio";
        const isImage = item.type === "image";
        const isDoc = item.type === "document";
        const isVideo = item.type === "video";
        const isPlayingThisAudio = playingAudioId === item.id;

        return (
          <div key={item.id} className={`attachment-card-row type-${item.type}`}>
            {/* Left Icon / Thumbnail */}
            <div className="attachment-leading-col">
              {isAudio && (
                <div className="attachment-icon-box audio-purple-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" opacity="0.9" />
                  </svg>
                </div>
              )}

              {isImage && (
                <div className="attachment-thumb-wrap">
                  {item.url ? (
                    <img src={item.url} alt={item.name} className="attachment-img-thumbnail" />
                  ) : (
                    <div className="attachment-icon-box image-orange-box">🖼️</div>
                  )}
                </div>
              )}

              {isDoc && (
                <div className="attachment-icon-box doc-red-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 13h6" />
                    <path d="M9 17h4" />
                  </svg>
                </div>
              )}

              {isVideo && (
                <div className="attachment-icon-box video-purple-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2.18" ry="2.18" />
                    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info Column (Name & Size/Duration) */}
            <div className="attachment-info-col">
              <span className="attachment-file-name" title={item.name}>
                {item.name}
              </span>
              <span className="attachment-file-meta">
                {item.formattedSize}
                {item.duration && ` • ${item.duration}`}
              </span>
            </div>

            {/* Center Waveform Graphic for Audio */}
            {isAudio && (
              <div className="attachment-waveform-col" aria-hidden="true">
                <div className={`preview-waveform-bars ${isPlayingThisAudio ? "playing-bars" : ""}`}>
                  {[4, 8, 14, 20, 12, 16, 24, 18, 10, 16, 22, 14, 8, 12, 18, 22, 16, 12, 6, 10, 18, 14, 8].map((h, i) => (
                    <span 
                      key={i} 
                      className="wave-tick" 
                      style={{ 
                        height: `${h}px`,
                        animationDelay: `${(i * 0.05).toFixed(2)}s`
                      }} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Spacer for non-audio */}
            {!isAudio && <div className="attachment-spacer-col" />}

            {/* Action Buttons: Preview & Remove */}
            <div className="attachment-actions-col">
              {/* Audio Play/Pause Button */}
              {isAudio && (
                <button
                  type="button"
                  className={`btn-attachment-action btn-play-audio ${isPlayingThisAudio ? "is-playing" : ""}`}
                  onClick={() => toggleAudioPlay(item.id, item.url)}
                  title={isPlayingThisAudio ? "Pause Audio" : "Play Audio"}
                  aria-label={isPlayingThisAudio ? "Pause Audio" : "Play Audio"}
                >
                  {isPlayingThisAudio ? (
                    <span className="play-icon-symbol">⏸</span>
                  ) : (
                    <span className="play-icon-symbol">▶</span>
                  )}
                </button>
              )}

              {/* View Eye Button for Images, Documents, Videos */}
              {(isImage || isDoc || isVideo) && (
                <button
                  type="button"
                  className="btn-attachment-action btn-view-file"
                  onClick={() => onPreviewItem && onPreviewItem(item)}
                  title="View attachment preview"
                  aria-label={`View ${item.name}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              )}

              {/* Remove "X" Button */}
              <button
                type="button"
                className="btn-attachment-action btn-remove-file"
                onClick={() => handleRemove(item.id)}
                title="Remove attachment"
                aria-label={`Remove ${item.name}`}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.AttachmentPreview = AttachmentPreview;
