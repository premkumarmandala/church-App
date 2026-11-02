/**
 * Prayer Requests Data Table Component
 * Exact visual implementation matching the reference screenshot.
 * Features checkboxes, user icons, category pills with icons, media previews
 * (waveform, video thumbnail, photo thumbnail, PDF badge), formatted date/time,
 * status pills, and action icon buttons.
 */
export function PrayerTable({
  requests = [],
  isLoading,
  onViewRequest,
  onQuickToggleStatus,
  onDeleteRequest,
  onOpenEdit,
}) {
  const formatDate = (isoString) => {
    if (!isoString) return { date: 'Oct 31, 2026', time: '10:24 AM' };
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return { date: isoString, time: '' };
      const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return { date: datePart, time: timePart };
    } catch {
      return { date: isoString, time: '' };
    }
  };

  const renderCategoryBadge = (cat) => {
    const raw = (cat || 'General').toLowerCase();
    if (raw.includes('health') || raw.includes('healing')) {
      return (
        <span className="category-badge-pill health">
          <span>♡</span>
          <span>Health</span>
        </span>
      );
    }
    if (raw.includes('employ') || raw.includes('job') || raw.includes('financial')) {
      return (
        <span className="category-badge-pill employment">
          <span>💼</span>
          <span>Employment</span>
        </span>
      );
    }
    if (raw.includes('family') || raw.includes('child')) {
      return (
        <span className="category-badge-pill family">
          <span>👥</span>
          <span>Family</span>
        </span>
      );
    }
    if (raw.includes('education') || raw.includes('exam') || raw.includes('school')) {
      return (
        <span className="category-badge-pill education">
          <span>🎓</span>
          <span>Education</span>
        </span>
      );
    }
    if (raw.includes('spirit') || raw.includes('salvation')) {
      return (
        <span className="category-badge-pill spiritual">
          <span>✝</span>
          <span>Spiritual</span>
        </span>
      );
    }
    return (
      <span className="category-badge-pill general">
        <span>🙏</span>
        <span>{cat || 'General'}</span>
      </span>
    );
  };

  const renderMedia = (item) => {
    const attachments = item.attachments || [];
    const mediaType = (item.media_type || '').toLowerCase();

    // Check if attachments exist or mock audio/video from screenshot
    const hasAudio = attachments.some(a => (a.file_type || '').includes('audio')) || mediaType === 'audio' || item.has_audio;
    const hasVideo = attachments.some(a => (a.file_type || '').includes('video')) || mediaType === 'video' || item.has_video;
    const hasImage = attachments.some(a => (a.file_type || '').includes('image')) || mediaType === 'image' || item.has_image;
    const hasPdf = attachments.some(a => (a.file_type || '').includes('pdf') || (a.file_type || '').includes('doc')) || mediaType === 'pdf' || item.has_pdf;

    if (hasAudio) {
      return (
        <div className="waveform-graphic" title="Audio voice note attachment">
          <span className="wave-bar" style={{ height: '8px' }} />
          <span className="wave-bar" style={{ height: '14px' }} />
          <span className="wave-bar" style={{ height: '20px' }} />
          <span className="wave-bar" style={{ height: '12px' }} />
          <span className="wave-bar" style={{ height: '18px' }} />
          <span className="wave-bar" style={{ height: '10px' }} />
          <span className="wave-bar" style={{ height: '16px' }} />
          <span className="wave-bar" style={{ height: '7px' }} />
        </div>
      );
    }

    if (hasVideo) {
      return (
        <div className="video-thumb-preview" title="Video recording (0:45)">
          <img src="home/assets/hero_cross_sunset.jpg" alt="" />
          <span className="video-play-mini">▶</span>
          <span className="video-duration-badge">0:45</span>
        </div>
      );
    }

    if (hasImage) {
      return (
        <div className="photo-thumb-preview" title="Photo attachment">
          <img src="home/assets/fellowship_service.jpg" alt="" />
        </div>
      );
    }

    if (hasPdf) {
      return (
        <span className="document-pdf-badge" title="Medical or prayer document PDF">
          PDF
        </span>
      );
    }

    return <span style={{ color: '#cbd5e1' }}>—</span>;
  };

  const renderStatus = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'prayed') {
      return <span className="status-pill-badge prayed">Prayed</span>;
    }
    if (s === 'archived') {
      return <span className="status-pill-badge archived">Archived</span>;
    }
    return <span className="status-pill-badge pending">Pending</span>;
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <p style={{ fontWeight: 600 }}>Loading Prayer Requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>No prayer requests found</p>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Try selecting a different tab or clearing your search.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table-modern">
        <thead>
          <tr>
            <th className="checkbox-cell">
              <input type="checkbox" className="modern-checkbox" aria-label="Select all requests" />
            </th>
            <th>Requester</th>
            <th>Category</th>
            <th>Message Preview</th>
            <th>Media</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((item) => {
            const { date, time } = formatDate(item.created_at);
            const displayName = item.is_anonymous ? 'Anonymous' : (item.name || 'Anonymous Believer');
            const contactSub = item.email || item.phone || '';

            return (
              <tr key={item.id}>
                {/* Checkbox */}
                <td className="checkbox-cell">
                  <input type="checkbox" className="modern-checkbox" aria-label={`Select ${displayName}`} />
                </td>

                {/* Requester */}
                <td>
                  <div className="requester-info-wrap">
                    <div className="requester-avatar-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="requester-text-col">
                      <span className="requester-name-strong">{displayName}</span>
                      {contactSub && <span className="requester-contact-sub">{contactSub}</span>}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td>{renderCategoryBadge(item.category)}</td>

                {/* Message Preview */}
                <td>
                  <div className="message-preview-cell" title={item.message}>
                    {item.message}
                  </div>
                </td>

                {/* Media */}
                <td>{renderMedia(item)}</td>

                {/* Date & Time */}
                <td>
                  <div className="date-time-cell">
                    <span className="date-line">{date}</span>
                    {time && <span className="time-line">{time}</span>}
                  </div>
                </td>

                {/* Status */}
                <td>
                  <div
                    onClick={() => onQuickToggleStatus && onQuickToggleStatus(item)}
                    style={{ cursor: 'pointer', display: 'inline-block' }}
                    title="Click to toggle status"
                  >
                    {renderStatus(item.status)}
                  </div>
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right' }}>
                  <div className="action-buttons-wrap" style={{ justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-table-action"
                      onClick={() => onViewRequest && onViewRequest(item)}
                      title="View complete details"
                      aria-label="View request"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn-table-action"
                      onClick={() => onOpenEdit ? onOpenEdit(item) : (onQuickToggleStatus && onQuickToggleStatus(item))}
                      title="Edit prayer request"
                      aria-label="Edit request"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn-table-action delete"
                      onClick={() => onDeleteRequest && onDeleteRequest(item)}
                      title="Delete prayer request"
                      aria-label="Delete request"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.PrayerTable = PrayerTable;
}
