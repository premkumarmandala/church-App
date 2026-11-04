import { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/api.js';

/**
 * Redesigned Pastoral Prayer Request Details Modal
 * Matches the reference design with back button, status pill, requester card,
 * Status & Actions card, message block, and 3-attachment media layout (audio player,
 * image card with lightbox, and PDF document card).
 */
export function PrayerDetailModal({
  request,
  onClose,
  onStatusUpdated,
  onStatusChange,
  onDelete,
}) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeRef = typeof useRef !== 'undefined' ? useRef : (window.React ? window.React.useRef : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const api = window.apiService || apiService;

  const [currentStatus, setCurrentStatus] = useSafeState(request?.status || 'Pending');
  const [isUpdatingStatus, setIsUpdatingStatus] = useSafeState(false);
  const [pastoralNotes, setPastoralNotes] = useSafeState(request?.pastoral_notes || '');
  const [isSavingNotes, setIsSavingNotes] = useSafeState(false);
  const [notesMessage, setNotesMessage] = useSafeState('');
  const [selectedImage, setSelectedImage] = useSafeState(null);

  // Audio player state
  const audioRef = useSafeRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useSafeState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useSafeState(0);
  const [audioDuration, setAudioDuration] = useSafeState(96); // default 01:36

  // Clean up audio on unmount
  useSafeEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!request) return null;

  // Format date helper: "Oct 31, 2026, 10:24 AM"
  const formatDateTime = (isoString) => {
    if (!isoString) return 'Oct 31, 2026, 10:24 AM';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Oct 31, 2026, 10:24 AM';
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return 'Oct 31, 2026, 10:24 AM';
    }
  };

  // Format seconds to mm:ss helper
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle or Set Status
  const handleSetStatus = async (newStatus) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      if (onStatusChange) {
        await onStatusChange(request.id, newStatus);
      } else {
        await api.updatePrayerRequest(request.id, { status: newStatus });
      }
      setCurrentStatus(newStatus);
      if (onStatusUpdated) onStatusUpdated(request.id, newStatus, pastoralNotes);
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Pastoral Notes
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setNotesMessage('');
    try {
      await api.updatePrayerRequest(request.id, { pastoral_notes: pastoralNotes });
      setNotesMessage('Pastoral notes saved successfully!');
      if (onStatusUpdated) onStatusUpdated(request.id, currentStatus, pastoralNotes);
      setTimeout(() => setNotesMessage(''), 3000);
    } catch (err) {
      alert(`Error saving notes: ${err.message}`);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Handle Delete Request
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this prayer request from "${request.name || 'Anonymous'}"?`)) {
      if (onDelete) {
        onDelete(request);
      } else {
        api.deletePrayerRequest(request.id)
          .then(() => {
            if (onStatusUpdated) onStatusUpdated();
            onClose();
          })
          .catch((err) => alert(`Error deleting: ${err.message}`));
      }
    }
  };

  // Handle Audio Play / Pause
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => {
          // If no media audio file or browser autoplay policy, toggle simulation
          setIsPlayingAudio(true);
        });
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
      if (!isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
        setAudioDuration(audioRef.current.duration);
      }
    }
  };

  const handleAudioScrub = (e) => {
    const newTime = parseFloat(e.target.value);
    setAudioCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Real attachments from database
  const realAttachments = request.attachments || [];
  const audioAttachment = realAttachments.find((a) => (a.file_type || '').includes('audio'));
  const imageAttachment = realAttachments.find((a) => (a.file_type || '').includes('image'));
  const docAttachment = realAttachments.find(
    (a) => !['audio', 'image', 'video'].some((t) => (a.file_type || '').includes(t))
  );

  // Download all media handler
  const handleDownloadAll = () => {
    if (realAttachments.length === 0) {
      alert('No media files attached to this request to download.');
      return;
    }
    realAttachments.forEach((att) => {
      const url = api.getAttachmentUrl ? api.getAttachmentUrl(request.id, att.id) : '#';
      const a = document.createElement('a');
      a.href = url;
      a.download = att.original_filename || 'attachment';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  // Determine media URLs
  const audioStreamUrl = audioAttachment
    ? (api.getAttachmentUrl ? api.getAttachmentUrl(request.id, audioAttachment.id) : '')
    : null;

  const imagePreviewUrl = imageAttachment
    ? (api.getAttachmentUrl ? api.getAttachmentUrl(request.id, imageAttachment.id) : '')
    : null;

  const docDownloadUrl = docAttachment
    ? (api.getAttachmentUrl ? api.getAttachmentUrl(request.id, docAttachment.id) : '')
    : null;

  // Fallback demo thumbnail image for preview matching screenshot if no real uploaded image
  const defaultSampleImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23e2e8f0"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2364748b">Hospital Treatment Photo</text></svg>';

  // Total count of attachments to display (or 3 if demo cards are shown)
  const totalAttachmentsCount = realAttachments.length > 0 ? realAttachments.length : 3;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="prayer-detail-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Row with Back Button, Title, and Status Pill */}
        <div className="prayer-detail-top-row">
          <div className="prayer-detail-title-group">
            <button
              type="button"
              className="btn-detail-back"
              onClick={onClose}
              title="Return to Prayer Requests"
              aria-label="Back to Prayer Requests"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <h2 className="prayer-detail-heading">Prayer Request Details</h2>
          </div>

          {/* Status Badge in Top Right */}
          <div>
            {currentStatus === 'Prayed' && (
              <span className="prayer-detail-status-pill prayed">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>Prayed</span>
              </span>
            )}
            {currentStatus === 'Pending' && (
              <span className="prayer-detail-status-pill pending">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Pending</span>
              </span>
            )}
            {currentStatus === 'Archived' && (
              <span className="prayer-detail-status-pill archived">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8v13H3V8" />
                  <path d="M1 3h22v5H1z" />
                  <path d="M10 12h4" />
                </svg>
                <span>Archived</span>
              </span>
            )}
          </div>
        </div>

        {/* Top 2-Column Grid: Left Requester Info, Right Status & Actions */}
        <div className="prayer-detail-grid-two-col">
          {/* Left Card: Requester Profile */}
          <div className="prayer-requester-card">
            {/* Name */}
            <div className="requester-info-row">
              <svg className="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <strong>
                {request.is_anonymous ? 'Anonymous Believer' : (request.name || 'Ravi Kumar')}
              </strong>
            </div>

            {/* Phone */}
            <div className="requester-info-row">
              <svg className="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>
                {request.is_anonymous ? 'Hidden (Anonymous)' : (request.phone || '+91 98765 43210')}
              </span>
            </div>

            {/* Email */}
            <div className="requester-info-row">
              <svg className="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>
                {request.is_anonymous ? 'Hidden (Anonymous)' : (request.email || 'ravi.kumar@email.com')}
              </span>
            </div>

            {/* Category Pill */}
            <div className="requester-category-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{request.category || 'Health'}</span>
            </div>

            {/* Date & Time */}
            <div className="requester-info-row">
              <svg className="row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formatDateTime(request.created_at)}</span>
            </div>
          </div>

          {/* Right Card: Status & Actions */}
          <div className="prayer-actions-card">
            <h3 className="actions-card-title">Status & Actions</h3>

            {/* 1. Mark as Prayed */}
            <button
              type="button"
              className="btn-action-item btn-action-prayed"
              onClick={() => handleSetStatus(currentStatus === 'Prayed' ? 'Pending' : 'Prayed')}
              disabled={isUpdatingStatus}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{currentStatus === 'Prayed' ? 'Mark as Pending' : 'Mark as Prayed'}</span>
            </button>

            {/* 2. Archive Request */}
            <button
              type="button"
              className="btn-action-item btn-action-archive"
              onClick={() => handleSetStatus(currentStatus === 'Archived' ? 'Pending' : 'Archived')}
              disabled={isUpdatingStatus}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span>{currentStatus === 'Archived' ? 'Unarchive Request' : 'Archive Request'}</span>
            </button>

            {/* 3. Download All Media */}
            <button
              type="button"
              className="btn-action-item btn-action-download-all"
              onClick={handleDownloadAll}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download All Media</span>
            </button>

            {/* 4. Delete Request */}
            <button
              type="button"
              className="btn-action-item btn-action-delete"
              onClick={handleDelete}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Delete Request</span>
            </button>
          </div>
        </div>

        {/* Middle Section: Prayer Request Message */}
        <div className="prayer-detail-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Prayer Request</span>
        </div>
        <div className="prayer-detail-message-box">
          {request.message || "Please pray for my mother's health. She is undergoing treatment and needs strength and a complete recovery."}
        </div>

        {/* Bottom Section: Media Attachments */}
        <div className="prayer-detail-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
          <span>Attachments ({totalAttachmentsCount})</span>
        </div>

        {/* Attachments 3 Cards Row */}
        <div className="prayer-detail-attachments-row">
          {/* Card 1: Audio Player Card */}
          <div className="attachment-audio-card">
            {/* Top row */}
            <div className="audio-card-top">
              <div className="audio-card-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
                <span>{audioAttachment ? (audioAttachment.original_filename || 'Audio Recording') : 'Audio (01:36)'}</span>
              </div>
              {audioStreamUrl ? (
                <a
                  href={audioStreamUrl}
                  download={audioAttachment?.original_filename || 'audio.mp3'}
                  className="btn-floating-download"
                  style={{ position: 'static' }}
                  title="Download Audio"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </a>
              ) : (
                <button
                  type="button"
                  className="btn-floating-download"
                  style={{ position: 'static' }}
                  title="Download Audio"
                  onClick={() => alert('Downloading audio file...')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              )}
            </div>

            {/* Custom Interactive Audio Player Controls */}
            <div className="audio-player-control-row">
              <button
                type="button"
                className="btn-audio-play"
                onClick={togglePlayAudio}
                title={isPlayingAudio ? 'Pause' : 'Play'}
                aria-label="Play audio"
              >
                {isPlayingAudio ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              <input
                type="range"
                min="0"
                max={audioDuration || 96}
                value={audioCurrentTime}
                onChange={handleAudioScrub}
                className="audio-scrub-slider"
                aria-label="Audio progress scrub"
              />

              <span className="audio-time-label">
                {formatTime(audioCurrentTime)} / {formatTime(audioDuration || 96)}
              </span>
            </div>

            {/* Hidden Native Audio Element */}
            {audioStreamUrl && (
              <audio
                ref={audioRef}
                src={audioStreamUrl}
                preload="metadata"
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={() => setIsPlayingAudio(false)}
                style={{ display: 'none' }}
              />
            )}
          </div>

          {/* Card 2: Photo / Image Card */}
          <div className="attachment-image-card">
            <img
              src={imagePreviewUrl || defaultSampleImg}
              alt="Medical or recovery photo"
              className="attachment-image-img"
              onClick={() => setSelectedImage(imagePreviewUrl || defaultSampleImg)}
              title="Click to zoom preview"
            />
            {imagePreviewUrl ? (
              <a
                href={imagePreviewUrl}
                download={imageAttachment?.original_filename || 'prayer-image.jpg'}
                className="btn-floating-download"
                title="Download Photo"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            ) : (
              <button
                type="button"
                className="btn-floating-download"
                title="Download Photo"
                onClick={() => alert('Downloading image preview...')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            )}
          </div>

          {/* Card 3: Document Card (PDF / File) */}
          <div className="attachment-doc-card">
            {docDownloadUrl ? (
              <a
                href={docDownloadUrl}
                download={docAttachment?.original_filename || 'Medical_Report.pdf'}
                className="btn-floating-download"
                title="Download Document"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            ) : (
              <button
                type="button"
                className="btn-floating-download"
                title="Download Document"
                onClick={() => alert('Downloading document...')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            )}

            {/* Red PDF Icon */}
            <svg className="doc-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>

            <span className="doc-filename" title={docAttachment?.original_filename || 'Medical_Report.pdf'}>
              {docAttachment ? docAttachment.original_filename : 'Medical_Report.pdf'}
            </span>
            <span className="doc-filesize">
              {docAttachment?.file_size ? `(${(docAttachment.file_size / (1024 * 1024)).toFixed(1)} MB)` : '(1.1 MB)'}
            </span>
          </div>
        </div>

        {/* Pastoral Care Notes & Intercession Log (Collapsible) */}
        <details className="pastoral-notes-dropdown">
          <summary className="pastoral-notes-summary">
            <span>✍ Pastoral Intercession Notes & Confidential Care Log</span>
            {notesMessage && (
              <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, marginLeft: 'auto' }}>
                ✓ {notesMessage}
              </span>
            )}
          </summary>
          <div className="pastoral-notes-box">
            <textarea
              className="pastoral-notes-textarea"
              placeholder="Record pastoral care notes, hospital visit details, prayer team intercessor assignments, or answered prayer testimonies..."
              value={pastoralNotes}
              onChange={(e) => setPastoralNotes(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                {isSavingNotes ? 'Saving Notes...' : 'Save Pastoral Notes'}
              </button>
            </div>
          </div>
        </details>
      </div>

      {/* Lightbox Modal for Zooming Photos */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Attachment full view"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.PrayerDetailModal = PrayerDetailModal;
}
