import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';

/**
 * Announcements CMS Manager Component
 * Enables creating, scheduling, publishing, and removing church alerts and bulletins.
 * Standardized to uniform Navy & White design system with SVG icons.
 */
export function AnnouncementsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [announcements, setAnnouncements] = useSafeState([]);
  const [searchTerm, setSearchTerm] = useSafeState('');
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useSafeState(false);
  const [editingItem, setEditingItem] = useSafeState(null);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const initialForm = {
    title: '',
    subtitle: '',
    date_text: '',
    time_text: '',
    location: '',
    image: '',
    action_text: 'Learn More',
    action_link: '',
    tag: 'Announcement',
    tag_class: 'standard',
    order_index: 0,
    is_published: true,
  };
  const [formData, setFormData] = useSafeState(initialForm);

  const fetchAnnouncements = async (query = '') => {
    setIsLoading(true);
    try {
      const api = window.cmsApi || cmsApi;
      const data = await api.getAnnouncements(query);
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchAnnouncements();
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
    fetchAnnouncements(searchTerm);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      ...initialForm,
      date_text: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      order_index: announcements.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      subtitle: item.subtitle || '',
      date_text: item.date_text || '',
      time_text: item.time_text || '',
      location: item.location || '',
      image: item.image || '',
      action_text: item.action_text || 'Learn More',
      action_link: item.action_link || '',
      tag: item.tag || 'Announcement',
      tag_class: item.tag_class || 'standard',
      order_index: item.order_index ?? 0,
      is_published: item.is_published ?? true,
    });
    setIsFormOpen(true);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Announcement title is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      if (editingItem) {
        await api.updateAnnouncement(editingItem.id, formData);
        setSuccessMsg(`Announcement "${formData.title}" updated.`);
      } else {
        await api.createAnnouncement(formData);
        setSuccessMsg(`Announcement "${formData.title}" published.`);
      }
      setIsFormOpen(false);
      fetchAnnouncements(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      const api = window.cmsApi || cmsApi;
      await api.updateAnnouncement(item.id, { is_published: !item.is_published });
      fetchAnnouncements(searchTerm);
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.deleteAnnouncement(deleteTarget.id);
      setSuccessMsg(`Announcement "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchAnnouncements(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete announcement');
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
        title="Announcements & Bulletins"
        subtitle="Publish timely church updates, fasting notifications, building project notes, and urgent alerts."
        actionLabel="Create Announcement"
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
              placeholder="Search announcements..."
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
            <button type="button" className="btn-secondary" onClick={() => { setSearchTerm(''); fetchAnnouncements(''); }}>
              Clear
            </button>
          )}
        </form>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Active Bulletins: <strong style={{ color: '#0f172a' }}>{announcements.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="panel-card" style={{ overflowX: 'auto' }}>
        {isLoading ? (
          <div className="empty-state">Loading Announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#64748b' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            </div>
            <p style={{ fontWeight: 700, color: '#0f172a' }}>No announcements found</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click &quot;Create Announcement&quot; to post your first church bulletin.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Banner</th>
                <th>Title & Subtitle</th>
                <th>Schedule & Location</th>
                <th>Badge / Tag</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ width: '56px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image ? (
                        <img src={formatMediaUrl(item.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{item.title}</div>
                    {item.subtitle && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        {item.subtitle}
                      </div>
                    )}
                    {item.action_link && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#2563eb', marginTop: '3px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        <span>{item.action_text || 'Link'} &rarr; {item.action_link}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{item.date_text || 'Ongoing'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      {item.time_text} {item.location && `• ${item.location}`}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                      {item.tag || 'Announcement'}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTogglePublish(item)}
                      title="Click to toggle published status"
                    >
                      <CompStatusBadge isPublished={item.is_published} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-icon-action view"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Announcement"
                        aria-label="Edit Announcement"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action delete"
                        onClick={() => setDeleteTarget(item)}
                        title="Delete Announcement"
                        aria-label="Delete Announcement"
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

      {/* Add / Edit Announcement Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingItem ? 'Edit Church Announcement' : 'Post New Church Bulletin'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveAnnouncement}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Announcement Headline *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 21 Days of Fasting and Prayer"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subtitle / Key Highlight</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Seeking God's guidance, healing, and revival for our church family"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Date String</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.date_text}
                      onChange={(e) => setFormData({ ...formData, date_text: e.target.value })}
                      placeholder="e.g. Jan 1 - Jan 21"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time or Venue Info</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.time_text}
                      onChange={(e) => setFormData({ ...formData, time_text: e.target.value })}
                      placeholder="e.g. Daily 6:00 AM - 7:00 AM"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Badge Label / Category</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="e.g. Urgent, Fasting, Youth, Building"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                </div>

                <CompMediaUpload
                  label="Bulletin Banner Graphic (Optional)"
                  folder="home/announcements"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="admin-data/home/announcements/banner.jpg"
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Action Button Label</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.action_text}
                      onChange={(e) => setFormData({ ...formData, action_text: e.target.value })}
                      placeholder="e.g. Download Guide or Learn More"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Action Target Link / Anchor</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.action_link}
                      onChange={(e) => setFormData({ ...formData, action_link: e.target.value })}
                      placeholder="e.g. #prayer-requests or https://..."
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_published)}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                  />
                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                    Publish to Public Announcement Banner
                  </span>
                </label>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Bulletin' : 'Publish Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Delete Announcement"
          message={`Are you sure you want to delete the bulletin "${deleteTarget.title}"?`}
          confirmLabel="Delete Bulletin"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.AnnouncementsManager = AnnouncementsManager;
}
