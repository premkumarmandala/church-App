import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';

/**
 * Gallery CMS Manager Component
 * Upload, categorize, organize, and delete church photos and videos.
 */
export function GalleryManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [items, setItems] = useSafeState([]);
  const [selectedCategory, setSelectedCategory] = useSafeState('All');
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useSafeState(false);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const categories = ['All', 'Worship', 'Fellowship', 'Youth', 'Outreach', 'Celebration', 'Baptism'];

  const initialForm = {
    title: '',
    caption: '',
    media_type: 'photo',
    media_url: '',
    thumbnail_url: '',
    category: 'Worship',
    order_index: 0,
    is_published: true,
  };
  const [formData, setFormData] = useSafeState(initialForm);

  const fetchGallery = async (cat = 'All') => {
    setIsLoading(true);
    try {
      const api = window.cmsApi || cmsApi;
      const data = await api.getGallery(cat === 'All' ? '' : cat);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load gallery items');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchGallery(selectedCategory);
  }, [selectedCategory]);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      category: selectedCategory === 'All' ? 'Worship' : selectedCategory,
      order_index: items.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.media_url) {
      alert('Please upload or provide a media URL.');
      return;
    }
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.createGalleryItem(formData);
      setSuccessMsg('Media uploaded to church gallery successfully.');
      setIsFormOpen(false);
      fetchGallery(selectedCategory);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save media');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.deleteGalleryItem(deleteTarget.id);
      setSuccessMsg('Media removed from gallery.');
      setDeleteTarget(null);
      fetchGallery(selectedCategory);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompMediaUpload = window.MediaUploadField || MediaUploadField;
  const CompConfirm = window.ConfirmModal || ConfirmModal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Photo & Video Gallery Management"
        subtitle="Upload and organize high-resolution photography, baptism captures, youth nights, and worship memories."
        actionLabel="Upload Media"
        onAction={handleOpenAdd}
        actionIcon="📷"
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

      {/* Category Pills Bar */}
      <div className="panel-card" style={{ padding: '12px 16px', display: 'flex', gap: '8px', overflowX: 'auto', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginRight: '6px' }}>Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Items Grid */}
      {isLoading ? (
        <div className="empty-state">Loading Gallery...</div>
      ) : items.length === 0 ? (
        <div className="panel-card empty-state">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🖼️</div>
          <p style={{ fontWeight: 600 }}>No media found in this category</p>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click "Upload Media" to add photos or video highlights.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
          {items.map((item) => (
            <div key={item.id} className="panel-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', position: 'relative', background: '#0f1e36' }}>
                <img
                  src={item.thumbnail_url || item.media_url}
                  alt={item.title || 'Church Media'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(15, 30, 54, 0.85)',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {item.category || 'General'}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: item.media_type === 'video' ? '#dc2626' : '#0066cc',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {item.media_type === 'video' ? '▶ Video' : '📷 Photo'}
                </span>
              </div>

              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f1e36' }}>{item.title || 'Untitled Media'}</div>
                  {item.caption && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                      {item.caption}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', marginTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    className="btn-icon-action delete"
                    onClick={() => setDeleteTarget(item)}
                    title="Delete Media Item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Media Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Upload Gallery Media</h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveItem}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Photo / Video Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Easter Sunday Resurrection Celebration"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Media Type</label>
                    <select
                      className="form-input"
                      value={formData.media_type}
                      onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                    >
                      <option value="photo">Photo Image</option>
                      <option value="video">Video Recording</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Worship">Worship</option>
                      <option value="Fellowship">Fellowship</option>
                      <option value="Youth">Youth</option>
                      <option value="Outreach">Outreach</option>
                      <option value="Celebration">Celebration</option>
                      <option value="Baptism">Baptism</option>
                    </select>
                  </div>
                </div>

                <CompMediaUpload
                  label="Select or Upload Image / Video File *"
                  value={formData.media_url}
                  onChange={(url) => setFormData({ ...formData, media_url: url })}
                  placeholder="Upload file or enter relative path (e.g. home/assets/gallery1.jpg)"
                />

                <div className="form-group">
                  <label className="form-label">Caption / Description</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="Short description or scripture quotation associated with this photo..."
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Save Media Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Delete Gallery Media"
          message={`Are you sure you want to delete this media item "${deleteTarget.title || 'Untitled'}"?`}
          confirmLabel="Delete Media"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.GalleryManager = GalleryManager;
}

