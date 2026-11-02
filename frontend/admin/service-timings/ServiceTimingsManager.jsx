import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';

/**
 * Service Timings CMS Manager Component
 * Enables adjusting worship service hours, languages, days of week, and styling themes.
 */
export function ServiceTimingsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [timings, setTimings] = useSafeState([]);
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useSafeState(false);
  const [editingTiming, setEditingTiming] = useSafeState(null);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const initialForm = {
    title: '',
    hours: '',
    subtitle: '',
    card_class: 'standard',
    icon_name: 'church',
    day_of_week: 'Sunday',
    order_index: 0,
    is_published: true,
  };
  const [formData, setFormData] = useSafeState(initialForm);

  const fetchTimings = async () => {
    setIsLoading(true);
    try {
      const api = window.cmsApi || cmsApi;
      const data = await api.getServiceTimings();
      setTimings(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load service timings');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchTimings();
  }, []);

  const handleOpenAdd = () => {
    setEditingTiming(null);
    setFormData({
      ...initialForm,
      order_index: timings.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (timing) => {
    setEditingTiming(timing);
    setFormData({
      title: timing.title || '',
      hours: timing.hours || '',
      subtitle: timing.subtitle || '',
      card_class: timing.card_class || 'standard',
      icon_name: timing.icon_name || 'church',
      day_of_week: timing.day_of_week || 'Sunday',
      order_index: timing.order_index ?? 0,
      is_published: timing.is_published ?? true,
    });
    setIsFormOpen(true);
  };

  const handleSaveTiming = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.hours.trim()) {
      alert('Service title and hours are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      if (editingTiming) {
        await api.updateServiceTiming(editingTiming.id, formData);
        setSuccessMsg(`Service timing "${formData.title}" updated.`);
      } else {
        await api.createServiceTiming(formData);
        setSuccessMsg(`Service timing "${formData.title}" created.`);
      }
      setIsFormOpen(false);
      fetchTimings();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save timing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (timing) => {
    try {
      const api = window.cmsApi || cmsApi;
      await api.updateServiceTiming(timing.id, { is_published: !timing.is_published });
      fetchTimings();
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.deleteServiceTiming(deleteTarget.id);
      setSuccessMsg(`Service timing "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchTimings();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete timing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompStatusBadge = window.StatusBadge || StatusBadge;
  const CompConfirm = window.ConfirmModal || ConfirmModal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Service Timings Management"
        subtitle="Configure weekly congregation gathering times, prayer meetings, and card highlights."
        actionLabel="Add Service Timing"
        onAction={handleOpenAdd}
        actionIcon="⏰"
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

      {/* Services Grid */}
      {isLoading ? (
        <div className="empty-state">Loading Service Schedules...</div>
      ) : timings.length === 0 ? (
        <div className="panel-card empty-state">
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⏰</div>
          <p style={{ fontWeight: 600 }}>No service timings configured</p>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click "Add Service Timing" to create worship schedules.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {timings.map((t) => {
            const isHighlight = t.card_class === 'highlight' || t.card_class === 'gold';
            return (
              <div
                key={t.id}
                className="panel-card"
                style={{
                  borderTop: isHighlight ? '4px solid #c59b27' : '4px solid #0066cc',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  background: isHighlight ? '#fffdf7' : '#ffffff',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: isHighlight ? '#c59b27' : '#0066cc' }}>
                      {t.day_of_week || 'Service'}
                    </span>
                    <div onClick={() => handleTogglePublish(t)} style={{ cursor: 'pointer' }}>
                      <CompStatusBadge isPublished={t.is_published} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f1e36', marginBottom: '4px' }}>
                    {t.title}
                  </h3>

                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f1e36', letterSpacing: '-0.02em', margin: '8px 0' }}>
                    🕒 {t.hours}
                  </div>

                  {t.subtitle && (
                    <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                      {t.subtitle}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                    Order: #{t.order_index} ({t.card_class})
                  </span>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => handleOpenEdit(t)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="btn-icon-action delete"
                      onClick={() => setDeleteTarget(t)}
                      title="Delete Service Timing"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Timing Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTiming ? 'Edit Service Schedule' : 'Add New Service Timing'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveTiming}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Service Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Sunday Morning Worship"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Day of Week</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                      placeholder="e.g. Sunday / Wednesday"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Hours *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      placeholder="e.g. 9:30 AM - 11:30 AM"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subtitle / Language / Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Bilingual Service (Telugu & English) with Sunday School"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Card Style Theme</label>
                    <select
                      className="form-input"
                      value={formData.card_class}
                      onChange={(e) => setFormData({ ...formData, card_class: e.target.value })}
                    >
                      <option value="standard">Standard Navy Accent</option>
                      <option value="highlight">Prominent Highlight</option>
                      <option value="gold">Warm Gold Border</option>
                    </select>
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

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_published)}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
                  />
                  <span style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                    Publish to Public Website
                  </span>
                </label>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingTiming ? 'Update Schedule' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Delete Service Timing"
          message={`Are you sure you want to delete "${deleteTarget.title}"?`}
          confirmLabel="Delete Timing"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.ServiceTimingsManager = ServiceTimingsManager;
}

