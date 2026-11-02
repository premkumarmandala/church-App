/**
 * Prayer Requests Data Table Component
 * Displays interactive list with requester information, category badge,
 * message preview, media indicators, status pill, and action buttons.
 */

export function PrayerTable({
  requests = [],
  isLoading,
  onViewRequest,
  onQuickToggleStatus,
  onDeleteRequest,
}) {
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const getMediaSummary = (attachments = []) => {
    if (!attachments || attachments.length === 0) return null;

    const counts = { audio: 0, image: 0, video: 0, doc: 0 };
    attachments.forEach((att) => {
      const type = (att.file_type || '').toLowerCase();
      if (type.includes('audio')) counts.audio++;
      else if (type.includes('image')) counts.image++;
      else if (type.includes('video')) counts.video++;
      else counts.doc++;
    });

    return (
      <div className="media-indicators">
        {counts.audio > 0 && <span className="media-chip audio" title={`${counts.audio} Audio File(s)`}>🎵 {counts.audio}</span>}
        {counts.image > 0 && <span className="media-chip image" title={`${counts.image} Photo(s)`}>🖼️ {counts.image}</span>}
        {counts.video > 0 && <span className="media-chip video" title={`${counts.video} Video(s)`}>🎥 {counts.video}</span>}
        {counts.doc > 0 && <span className="media-chip document" title={`${counts.doc} Document(s)`}>📄 {counts.doc}</span>}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-icon" style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
        <div className="empty-title">Loading Prayer Requests...</div>
        <div className="empty-desc">Fetching intercession records from PostgreSQL database.</div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <div className="empty-title">No Prayer Requests Found</div>
        <div className="empty-desc">
          There are no prayer requests matching your current filter criteria or search query.
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Requester</th>
            <th>Category</th>
            <th>Message Preview</th>
            <th>Media</th>
            <th>Date</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((item) => {
            const isPending = item.status === 'Pending';
            const isPrayed = item.status === 'Prayed';

            return (
              <tr key={item.id}>
                {/* ID Badge */}
                <td>
                  <span
                    className="id-badge"
                    onClick={() => onViewRequest(item)}
                    title="Click to inspect prayer request details"
                  >
                    {item.id}
                  </span>
                </td>

                {/* Requester */}
                <td>
                  <div className="requester-cell">
                    {item.is_anonymous ? (
                      <span className="anonymous-badge">🔒 Anonymous</span>
                    ) : (
                      <>
                        <span className="requester-name">{item.name || 'Anonymous Believer'}</span>
                        {(item.email || item.phone) && (
                          <span className="requester-contact">
                            {[item.email, item.phone].filter(Boolean).join(' • ')}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </td>

                {/* Category */}
                <td>
                  <span className="category-tag" data-cat={item.category || ''}>
                    {item.category || 'General Need'}
                  </span>
                </td>

                {/* Message Preview */}
                <td>
                  <div className="message-preview" title={item.message}>
                    {item.message}
                  </div>
                </td>

                {/* Media */}
                <td>
                  {getMediaSummary(item.attachments) || (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                  )}
                </td>

                {/* Date */}
                <td>
                  <span className="date-cell">{formatDate(item.created_at)}</span>
                </td>

                {/* Status */}
                <td>
                  <span className={`status-pill ${item.status?.toLowerCase() || 'pending'}`}>
                    <span className="status-dot" />
                    <span>{item.status || 'Pending'}</span>
                  </span>
                </td>

                {/* Actions */}
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-icon-action view"
                      onClick={() => onViewRequest(item)}
                      title="View complete request and attachments"
                    >
                      👁️
                    </button>
                    {isPending && (
                      <button
                        type="button"
                        className="btn-icon-action prayed-quick"
                        onClick={() => onQuickToggleStatus(item.id, 'Prayed')}
                        title="Quick mark as Prayed & Interceded"
                      >
                        ✓
                      </button>
                    )}
                    {isPrayed && (
                      <button
                        type="button"
                        className="btn-icon-action"
                        onClick={() => onQuickToggleStatus(item.id, 'Archived')}
                        title="Archive this prayer record"
                      >
                        📦
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-icon-action delete"
                      onClick={() => onDeleteRequest(item)}
                      title="Delete request and private attachments"
                    >
                      🗑️
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
