import { useState } from 'react';
import { apiService } from '../services/api.js';

/**
 * Detailed Prayer Request Inspection Modal Component
 * Displays complete request text, requester details, embedded audio/video player,
 * photo lightbox, document download links, status changer, and pastoral notes editor.
 */

export function PrayerDetailModal({
  request,
  onClose,
  onStatusUpdated,
}) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const api = window.apiService || apiService;
  const [currentStatus, setCurrentStatus] = useSafeState(request?.status || 'Pending');
  const [pastoralNotes, setPastoralNotes] = useSafeState(request?.pastoral_notes || '');
  const [isSavingNotes, setIsSavingNotes] = useSafeState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useSafeState('');
  const [selectedImage, setSelectedImage] = useSafeState(null);

  if (!request) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    try {
      await apiService.updatePrayerRequest(request.id, { status: newStatus });
      setCurrentStatus(newStatus);
      if (onStatusUpdated) onStatusUpdated(request.id, newStatus, pastoralNotes);
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setSaveSuccessMsg('');
    try {
      await apiService.updatePrayerRequest(request.id, { pastoral_notes: pastoralNotes });
      setSaveSuccessMsg('Pastoral notes saved successfully!');
      if (onStatusUpdated) onStatusUpdated(request.id, currentStatus, pastoralNotes);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert(`Error saving notes: ${err.message}`);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const attachments = request.attachments || [];
  const audioFiles = attachments.filter((a) => (a.file_type || '').includes('audio'));
  const imageFiles = attachments.filter((a) => (a.file_type || '').includes('image'));
  const videoFiles = attachments.filter((a) => (a.file_type || '').includes('video'));
  const docFiles = attachments.filter(
    (a) => !['audio', 'image', 'video'].some((t) => (a.file_type || '').includes(t))
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="id-badge" style={{ fontSize: '0.9rem', padding: '4px 10px' }}>
              {request.id}
            </span>
            <h2 className="modal-title">Prayer Request Details</h2>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Requester Information Card */}
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">Requester Name</span>
              <span className="info-value">
                {request.is_anonymous ? 'Anonymous Believer' : request.name || 'Not provided'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Contact Email</span>
              <span className="info-value">
                {request.is_anonymous ? 'Hidden (Anonymous)' : request.email || 'None'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Phone Number</span>
              <span className="info-value">
                {request.is_anonymous ? 'Hidden (Anonymous)' : request.phone || 'None'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Category</span>
              <span className="info-value">
                <span className="category-tag" data-cat={request.category}>
                  {request.category || 'General Need'}
                </span>
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Submitted On</span>
              <span className="info-value" style={{ fontSize: '0.8rem' }}>
                {formatDate(request.created_at)}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Follow-Up Permission</span>
              <span className="info-value">
                {request.contact_permission ? '✅ Permitted to contact' : '❌ Do not contact'}
              </span>
            </div>
          </div>

          {/* Complete Prayer Message Card */}
          <div className="message-card">
            <div className="message-label">Prayer Petition & Intercession Request</div>
            <div className="message-text">{request.message}</div>
          </div>

          {/* Media Attachments Section */}
          {attachments.length > 0 && (
            <div className="attachments-section">
              <div className="attachments-title">
                <span>📎 Media Attachments ({attachments.length})</span>
              </div>

              {/* Audio Recordings */}
              {audioFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Voice & Audio Recordings
                  </div>
                  {audioFiles.map((att) => {
                    const streamUrl = apiService.getAttachmentUrl(request.id, att.id);
                    return (
                      <div key={att.id} className="audio-player-card">
                        <div className="audio-header">
                          <span>🎵 {att.original_filename}</span>
                          <a
                            href={streamUrl}
                            download={att.original_filename}
                            className="btn-download"
                            style={{ color: '#93c5fd' }}
                          >
                            ⬇ Download
                          </a>
                        </div>
                        <audio controls src={streamUrl} className="audio-native" preload="metadata" />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Image Photos Lightbox Gallery */}
              {imageFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Photos & Image Previews
                  </div>
                  <div className="attachments-grid">
                    {imageFiles.map((att) => {
                      const streamUrl = apiService.getAttachmentUrl(request.id, att.id);
                      return (
                        <div key={att.id} className="attachment-card">
                          <div className="attachment-preview-box">
                            <img
                              src={streamUrl}
                              alt={att.original_filename}
                              loading="lazy"
                              onClick={() => setSelectedImage(streamUrl)}
                              title="Click to view full photo"
                            />
                          </div>
                          <div className="attachment-footer">
                            <span className="attachment-name" title={att.original_filename}>
                              {att.original_filename}
                            </span>
                            <a
                              href={streamUrl}
                              download={att.original_filename}
                              className="btn-download"
                            >
                              ⬇ Save
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Video Attachments */}
              {videoFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Video Attachments
                  </div>
                  <div className="attachments-grid">
                    {videoFiles.map((att) => {
                      const streamUrl = apiService.getAttachmentUrl(request.id, att.id);
                      return (
                        <div key={att.id} className="attachment-card">
                          <video
                            controls
                            src={streamUrl}
                            style={{ width: '100%', maxHeight: '200px', backgroundColor: '#000' }}
                          />
                          <div className="attachment-footer">
                            <span className="attachment-name">{att.original_filename}</span>
                            <a
                              href={streamUrl}
                              download={att.original_filename}
                              className="btn-download"
                            >
                              ⬇ Save
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Documents */}
              {docFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Documents & Files
                  </div>
                  <div className="attachments-grid">
                    {docFiles.map((att) => {
                      const streamUrl = apiService.getAttachmentUrl(request.id, att.id);
                      return (
                        <div key={att.id} className="attachment-card">
                          <div className="attachment-preview-box" style={{ background: '#f8fafc' }}>
                            <span style={{ fontSize: '2.5rem' }}>📄</span>
                          </div>
                          <div className="attachment-footer">
                            <span className="attachment-name">{att.original_filename}</span>
                            <a
                              href={streamUrl}
                              download={att.original_filename}
                              className="btn-download"
                            >
                              ⬇ Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pastoral Intercession Notes Editor */}
          <div className="pastoral-notes-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="info-label" style={{ color: '#854d0e' }}>
                ✍ Pastoral Intercession Notes & Logs
              </span>
              {saveSuccessMsg && (
                <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
                  ✓ {saveSuccessMsg}
                </span>
              )}
            </div>
            <textarea
              className="pastoral-notes-textarea"
              placeholder="Record pastoral care notes, prayer team follow-up, intercessor assignments, or answered prayer testimonies..."
              value={pastoralNotes}
              onChange={(e) => setPastoralNotes(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                style={{ background: '#b0871d', borderColor: '#966f14' }}
              >
                {isSavingNotes ? 'Saving Notes...' : 'Save Pastoral Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="status-change-group">
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginRight: '6px' }}>
              Set Status:
            </span>
            <button
              type="button"
              className={`btn-status-toggle pending ${currentStatus === 'Pending' ? 'active' : ''}`}
              onClick={() => handleStatusChange('Pending')}
            >
              ⏳ Pending
            </button>
            <button
              type="button"
              className={`btn-status-toggle prayed ${currentStatus === 'Prayed' ? 'active' : ''}`}
              onClick={() => handleStatusChange('Prayed')}
            >
              ✓ Prayed
            </button>
            <button
              type="button"
              className={`btn-status-toggle archived ${currentStatus === 'Archived' ? 'active' : ''}`}
              onClick={() => handleStatusChange('Archived')}
            >
              📦 Archived
            </button>
          </div>

          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Image Lightbox Overlay if an image was clicked */}
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
            alt="Full size attachment"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.PrayerDetailModal = PrayerDetailModal;
}
