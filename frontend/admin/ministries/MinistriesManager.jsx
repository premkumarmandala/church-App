import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';

/**
 * Ministries CMS Manager Component
 * Enables church leadership to manage ministry teams, leaders, meeting times, photos, and descriptions.
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
        actionIcon="👥"
      />

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="panel-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by ministry name or leader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Search</button>
          {searchTerm && (
            <button type="button" className="btn-secondary" onClick={() => { setSearchTerm(''); fetchMinistries(''); }}>
              Clear
            </button>
          )}
        </form>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Active Ministries: <strong>{ministries.length}</strong>
        </div>
      </div>

      {/* Ministries Grid */}
      {isLoading ? (
        <div className="empty-state">Loading Ministries...</div>
      ) : ministries.length === 0 ? (
        <div className="panel-card empty-state">
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
          <p style={{ fontWeight: 600 }}>No ministries found</p>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click "Add New Ministry" to set up church programs.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {ministries.map((min) => (
            <div key={min.id} className="panel-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ height: '160px', position: 'relative', background: '#0f1e36', overflow: 'hidden' }}>
                {min.photo ? (
                  <img src={min.photo} alt={min.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c59b27', fontSize: '2.5rem' }}>
                    👥
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
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f1e36' }}>{min.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>#{min.order_index}</span>
                </div>

                {min.leader_name && (
                  <div style={{ fontSize: '0.825rem', color: '#c59b27', fontWeight: 700 }}>
                    Leader: {min.leader_name}
                  </div>
                )}

                {min.meeting_time && (
                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⏰</span> {min.meeting_time}
                  </div>
                )}

                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, flex: 1 }}>
                  {min.short_description || min.full_description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => handleOpenEdit(min)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="btn-icon-action delete"
                    onClick={() => setDeleteTarget(min)}
                    title="Delete Ministry"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingMinistry ? 'Edit Ministry Department' : 'Add New Ministry'}
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
                    placeholder="e.g. Generation Next Youth Ministry"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Ministry Leader / Pastor</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.leader_name}
                      onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                      placeholder="e.g. Deacon David Raj"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Meeting Schedule & Hours</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.meeting_time}
                    onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
                    placeholder="e.g. Saturdays at 6:00 PM • Youth Hall"
                  />
                </div>

                <CompMediaUpload
                  label="Ministry Photo / Header"
                  value={formData.photo}
                  onChange={(url) => setFormData({ ...formData, photo: url })}
                  placeholder="Upload or enter image path (e.g. home/assets/youth.jpg)"
                />

                <div className="form-group">
                  <label className="form-label">Short Tagline Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Brief 1-line summary for cards on the homepage"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Ministry Details</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={formData.full_description}
                    onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                    placeholder="Mission, age groups, curriculum, activities, and volunteer contacts..."
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_published)}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
                  />
                  <span style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                    Publish immediately on public website
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
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
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

