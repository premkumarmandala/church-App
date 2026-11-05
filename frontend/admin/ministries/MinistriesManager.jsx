import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';

/**
 * Ministries CMS Manager Component
 * Enables church leadership to manage ministry teams, leaders, meeting times, photos, and descriptions.
 * Standardized to uniform Navy & White design system with SVG icons.
 */
export function MinistriesManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [ministries, setMinistries] = useSafeState([]);
  const [searchTerm, setSearchTerm] = useSafeState('');
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useSafeState(false);
  const [editingMinistry, setEditingMinistry] = useSafeState(null);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const initialForm = {
    name: '',
    short_description: '',
    full_description: '',
    photo: '',
    leader_name: '',
    meeting_time: 'Weekly on Saturdays at 5:00 PM',
    order_index: 0,
    is_published: true,
  };
  const [formData, setFormData] = useSafeState(initialForm);

  const fetchMinistries = async (query = '') => {
    setIsLoading(true);
    try {
      const api = window.cmsApi || cmsApi;
      const data = await api.getMinistries(query);
      setMinistries(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load ministries');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchMinistries();
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
    fetchMinistries(searchTerm);
  };

  const handleOpenAdd = () => {
    setEditingMinistry(null);
    setFormData({
      ...initialForm,
      order_index: ministries.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (min) => {
    setEditingMinistry(min);
    setFormData({
      name: min.name || '',
      short_description: min.short_description || '',
      full_description: min.full_description || '',
      photo: min.photo || '',
      leader_name: min.leader_name || '',
      meeting_time: min.meeting_time || '',
      order_index: min.order_index ?? 0,
      is_published: min.is_published ?? true,
    });
    setIsFormOpen(true);
  };

  const handleSaveMinistry = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Ministry name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      if (editingMinistry) {
        await api.updateMinistry(editingMinistry.id, formData);
        setSuccessMsg(`Ministry "${formData.name}" updated successfully.`);
      } else {
        await api.createMinistry(formData);
        setSuccessMsg(`Ministry "${formData.name}" created successfully.`);
      }
      setIsFormOpen(false);
      fetchMinistries(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save ministry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (min) => {
    try {
      const api = window.cmsApi || cmsApi;
      await api.updateMinistry(min.id, { is_published: !min.is_published });
      fetchMinistries(searchTerm);
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.deleteMinistry(deleteTarget.id);
      setSuccessMsg(`Ministry "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchMinistries(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete ministry');
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
        title="Ministries Management"
        subtitle="Manage church departments, youth fellowship, Sunday school, outreach teams, and meeting hours."
        actionLabel="Add New Ministry"
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
              placeholder="Search by ministry name or leader..."
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
            <button type="button" className="btn-secondary" onClick={() => { setSearchTerm(''); fetchMinistries(''); }}>
              Clear
            </button>
          )}
        </form>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Active Ministries: <strong style={{ color: '#0f172a' }}>{ministries.length}</strong>
        </div>
      </div>

      {/* Ministries Grid */}
      {isLoading ? (
        <div className="empty-state">Loading Ministries...</div>
      ) : ministries.length === 0 ? (
        <div className="panel-card empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#64748b' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <p style={{ fontWeight: 700, color: '#0f172a' }}>No ministries found</p>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click &quot;Add New Ministry&quot; to set up church programs.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {ministries.map((min) => (
            <div key={min.id} className="panel-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <div style={{ height: '160px', position: 'relative', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {min.photo ? (
                  <img src={formatMediaUrl(min.photo)} alt={min.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                )}
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <div onClick={() => handleTogglePublish(min)} style={{ cursor: 'pointer' }}>
                    <CompStatusBadge isPublished={min.is_published} />
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{min.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>#{min.order_index}</span>
                </div>

                {min.leader_name && (
                  <div style={{ fontSize: '0.825rem', color: '#2563eb', fontWeight: 600 }}>
                    Leader: {min.leader_name}
                  </div>
                )}

                {min.meeting_time && (
                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <span>{min.meeting_time}</span>
                  </div>
                )}

                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, flex: 1, marginTop: '4px' }}>
                  {min.short_description || min.full_description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => handleOpenEdit(min)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn-icon-action delete"
                    onClick={() => setDeleteTarget(min)}
                    title="Delete Ministry"
                    aria-label="Delete Ministry"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Ministry Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingMinistry ? 'Edit Church Ministry' : 'Add New Ministry'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveMinistry}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Ministry Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Youth & Young Adults Fellowship"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Ministry Leader</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.leader_name}
                      onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                      placeholder="e.g. Deacon David Paul"
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

                <div className="form-group">
                  <label className="form-label">Regular Gathering Time & Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.meeting_time}
                    onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
                    placeholder="e.g. Every Saturday at 6:00 PM in the Fellowship Hall"
                  />
                </div>

                <CompMediaUpload
                  label="Ministry Group Photo"
                  value={formData.photo}
                  onChange={(url) => setFormData({ ...formData, photo: url })}
                  placeholder="Upload or enter ministry photo URL"
                />

                <div className="form-group">
                  <label className="form-label">Short Summary (Preview Card)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="e.g. Inspiring the next generation to follow Christ passionately."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Ministry Mission & Activities</label>
                  <textarea
                    rows={4}
                    className="form-input"
                    value={formData.full_description}
                    onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                    placeholder="Detailed description of activities, spiritual goals, and who can join..."
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
                    Publish to Public Ministries Directory
                  </span>
                </label>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingMinistry ? 'Update Ministry' : 'Create Ministry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Delete Ministry"
          message={`Are you sure you want to permanently delete the ministry "${deleteTarget.name}"?`}
          confirmLabel="Delete Ministry"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.MinistriesManager = MinistriesManager;
}
