import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';

/**
 * Sermons CMS Manager Component
 * Enables uploading, editing, publishing/unpublishing, and deleting church sermons.
 * Standardized to uniform Navy & White design system with SVG icons.
 */
export function SermonsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [sermons, setSermons] = useSafeState([]);
  const [searchTerm, setSearchTerm] = useSafeState('');
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useSafeState(false);
  const [editingSermon, setEditingSermon] = useSafeState(null);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  // Form data
  const initialForm = {
    title: '',
    speaker: 'Pastor John Samuel',
    date_text: '',
    duration: '',
    thumbnail: '',
    video_url: '',
    audio_url: '',
    passage: '',
    description: '',
    is_published: true,
  };
  const [formData, setFormData] = useSafeState(initialForm);

  const fetchSermons = async (query = '') => {
    setIsLoading(true);
    try {
      const api = window.cmsApi || cmsApi;
      const data = await api.getSermons(query);
      setSermons(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load sermons');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchSermons();
  }, []);

  const formatMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    return url.startsWith('/') ? url : '/' + url;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSermons(searchTerm);
  };

  const handleOpenAdd = () => {
    setEditingSermon(null);
    setFormData({
      ...initialForm,
      date_text: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sermon) => {
    setEditingSermon(sermon);
    setFormData({
      title: sermon.title || '',
      speaker: sermon.speaker || '',
      date_text: sermon.date_text || '',
      duration: sermon.duration || '',
      thumbnail: sermon.thumbnail || '',
      video_url: sermon.video_url || '',
      audio_url: sermon.audio_url || '',
      passage: sermon.passage || '',
      description: sermon.description || '',
      is_published: sermon.is_published ?? true,
    });
    setIsFormOpen(true);
  };

  const handleSaveSermon = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Sermon title is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      if (editingSermon) {
        await api.updateSermon(editingSermon.id, formData);
        setSuccessMsg(`Sermon "${formData.title}" updated successfully.`);
      } else {
        await api.createSermon(formData);
        setSuccessMsg(`Sermon "${formData.title}" published successfully.`);
      }
      setIsFormOpen(false);
      fetchSermons(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save sermon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (sermon) => {
    try {
      const api = window.cmsApi || cmsApi;
      await api.updateSermon(sermon.id, { is_published: !sermon.is_published });
      fetchSermons(searchTerm);
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.deleteSermon(deleteTarget.id);
      setSuccessMsg(`Sermon "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchSermons(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete sermon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompStatusBadge = window.StatusBadge || StatusBadge;
  const CompMediaUpload = window.MediaUploadField || MediaUploadField;
  const CompConfirm = window.ConfirmModal || ConfirmModal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Sermons Management"
        subtitle="Upload, edit, publish video & audio recordings, scripture passages, and speaker details."
        actionLabel="Add New Sermon"
        onAction={handleOpenAdd}
      />

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="panel-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search by sermon title, preacher, or scripture passage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px' }}
            />
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <button type="submit" className="btn-secondary">Search</button>
          {searchTerm && (
            <button type="button" className="btn-secondary" onClick={() => { setSearchTerm(''); fetchSermons(''); }}>
              Clear
            </button>
          )}
        </form>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Total Sermons: <strong style={{ color: '#0f172a' }}>{sermons.length}</strong>
        </div>
      </div>

      {/* Sermons Table */}
      <div className="panel-card" style={{ overflowX: 'auto' }}>
        {isLoading ? (
          <div className="empty-state">Loading Sermons...</div>
        ) : sermons.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#64748b' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
            </div>
            <p style={{ fontWeight: 700, color: '#0f172a' }}>No sermons found</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click &quot;Add New Sermon&quot; to publish your first message.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Media</th>
                <th>Sermon Details</th>
                <th>Speaker & Date</th>
                <th>Scripture</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sermons.map((sermon) => (
                <tr key={sermon.id}>
                  <td>
                    <div style={{ width: '64px', height: '42px', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sermon.thumbnail ? (
                        <img src={formatMediaUrl(sermon.thumbnail)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{sermon.title}</div>
                    {sermon.description && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sermon.description}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: '#2563eb' }}>
                      {sermon.video_url && (
                        <a href={sermon.video_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', textDecoration: 'none' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                          <span>Video</span>
                        </a>
                      )}
                      {sermon.audio_url && (
                        <a href={sermon.audio_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', textDecoration: 'none' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
                          <span>Audio</span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{sermon.speaker || 'Pastor John Samuel'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      {sermon.date_text} {sermon.duration && `• ${sermon.duration}`}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.825rem', color: '#0f172a', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {sermon.passage || '—'}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTogglePublish(sermon)}
                      title="Click to toggle published status"
                    >
                      <CompStatusBadge isPublished={sermon.is_published} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-icon-action view"
                        onClick={() => handleOpenEdit(sermon)}
                        title="Edit Sermon"
                        aria-label="Edit Sermon"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action delete"
                        onClick={() => setDeleteTarget(sermon)}
                        title="Delete Sermon"
                        aria-label="Delete Sermon"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Sermon Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingSermon ? 'Edit Sermon Message' : 'Add New Sermon Message'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveSermon}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Sermon Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Walking by Faith, Not by Sight"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Preacher / Speaker</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.speaker}
                      onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                      placeholder="e.g. Pastor John Samuel"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Scripture Passage</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.passage}
                      onChange={(e) => setFormData({ ...formData, passage: e.target.value })}
                      placeholder="e.g. 2 Corinthians 5:7"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Date Delivered</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.date_text}
                      onChange={(e) => setFormData({ ...formData, date_text: e.target.value })}
                      placeholder="e.g. October 26, 2026"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 48 mins"
                    />
                  </div>
                </div>

                <CompMediaUpload
                  label="Sermon Thumbnail Image"
                  value={formData.thumbnail}
                  onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                  placeholder="Upload or enter thumbnail URL (e.g. home/assets/sermon1.jpg)"
                />

                <div className="form-group">
                  <label className="form-label">Video Stream / YouTube Link</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Audio Podcast MP3 Link (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.audio_url}
                    onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                    placeholder="e.g. https://gracefellowship.org/audio/message.mp3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sermon Summary & Notes</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Key sermon outline, message themes, and reflection questions..."
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_published)}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                  />
                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                    Publish immediately to Church Website
                  </span>
                </label>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingSermon ? 'Update Sermon' : 'Create Sermon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Delete Sermon"
          message={`Are you sure you want to permanently delete the sermon "${deleteTarget.title}"? This cannot be undone.`}
          confirmLabel="Delete Sermon"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.SermonsManager = SermonsManager;
}
