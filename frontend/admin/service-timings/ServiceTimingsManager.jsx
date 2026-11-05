import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';

/**
 * Service Timings CMS Manager Component
 * Enables adjusting worship service hours, languages, days of week, and styling themes.
 * Standardized to uniform Navy & White design system with SVG icons.
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
        subtitle="Configure weekly congregation gathering times, prayer meetings, and worship schedules."
        actionLabel="Add Service Timing"
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

      {/* Services Grid */}
      {isLoading ? (
        <div className="empty-state">Loading Service Schedules...</div>
      ) : timings.length === 0 ? (
        <div className="panel-card empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#64748b' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
          <p style={{ fontWeight: 700, color: '#0f172a' }}>No service timings configured</p>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click &quot;Add Service Timing&quot; to create worship schedules.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {timings.map((t) => (
            <div
              key={t.id}
              className="panel-card"
              style={{
                borderTop: '3px solid #0f172a',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                background: '#ffffff',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb' }}>
                    {t.day_of_week || 'Service'}
                  </span>
                  <div onClick={() => handleTogglePublish(t)} style={{ cursor: 'pointer' }}>
                    <CompStatusBadge isPublished={t.is_published} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  {t.title}
                </h3>

                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span>{t.hours}</span>
                </div>

                {t.subtitle && (
                  <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                    {t.subtitle}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Order: #{t.order_index}
                </span>
                <div style={{ display: 'inline-flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => handleOpenEdit(t)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn-icon-action delete"
                    onClick={() => setDeleteTarget(t)}
                    title="Delete Timing"
                    aria-label="Delete Timing"
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

      {/* Add / Edit Service Timing Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTiming ? 'Edit Service Timing' : 'Add Service Timing'}
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
                    placeholder="e.g. Sunday English Worship Service"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Day of Week</label>
                    <select
                      className="form-input"
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    >
                      <option value="Sunday">Sunday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gathering Hours *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      placeholder="e.g. 9:00 AM - 11:00 AM"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subtitle / Language / Note</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Sanctuary & Live Online Stream • Telugu & English"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Card Emphasis</label>
                    <select
                      className="form-input"
                      value={formData.card_class}
                      onChange={(e) => setFormData({ ...formData, card_class: e.target.value })}
                    >
                      <option value="standard">Standard Card</option>
                      <option value="highlight">Featured Service</option>
                    </select>
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
                    Publish on Website Schedule
                  </span>
                </label>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingTiming ? 'Update Timing' : 'Create Timing'}
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
