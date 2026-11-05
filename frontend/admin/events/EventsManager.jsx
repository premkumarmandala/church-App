import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';

/**
 * Events CMS Manager Component
 * Enables creating, editing, publishing, and scheduling church events and registrations.
 * Standardized to uniform Navy & White design system with SVG icons.
 */
export function EventsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [events, setEvents] = useSafeState([]);
  const [searchTerm, setSearchTerm] = useSafeState('');
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useSafeState(false);
  const [editingEvent, setEditingEvent] = useSafeState(null);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const initialForm = {
    title: '',
    subtitle: '',
    date_text: '',
    time_text: '',
    location: 'Main Sanctuary',
    image: '',
    action_text: 'Register Now',
    registration_link: '',
    registration_open: true,
    category_tag: 'Conference',
    description: '',
    is_published: true,
  };
  const [formData, setFormData] = useSafeState(initialForm);

  const fetchEvents = async (query = '') => {
    setIsLoading(true);
    try {
      const api = window.cmsApi || cmsApi;
      const data = await api.getEvents(query);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchEvents();
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
    fetchEvents(searchTerm);
  };

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormData({
      ...initialForm,
      date_text: 'Saturday, November 28, 2026',
      time_text: '6:30 PM - 8:30 PM',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title || '',
      subtitle: evt.subtitle || '',
      date_text: evt.date_text || '',
      time_text: evt.time_text || '',
      location: evt.location || '',
      image: evt.image || '',
      action_text: evt.action_text || 'Register Now',
      registration_link: evt.registration_link || '',
      registration_open: evt.registration_open ?? true,
      category_tag: evt.category_tag || 'Special',
      description: evt.description || '',
      is_published: evt.is_published ?? true,
    });
    setIsFormOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Event title is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, formData);
        setSuccessMsg(`Event "${formData.title}" updated successfully.`);
      } else {
        await api.createEvent(formData);
        setSuccessMsg(`Event "${formData.title}" published successfully.`);
      }
      setIsFormOpen(false);
      fetchEvents(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (evt) => {
    try {
      const api = window.cmsApi || cmsApi;
      await api.updateEvent(evt.id, { is_published: !evt.is_published });
      fetchEvents(searchTerm);
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const api = window.cmsApi || cmsApi;
      await api.deleteEvent(deleteTarget.id);
      setSuccessMsg(`Event "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchEvents(searchTerm);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete event');
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
        title="Events & Calendar Management"
        subtitle="Manage upcoming services, conferences, youth retreats, registrations, and posters."
        actionLabel="Create New Event"
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
              placeholder="Search by event title, location, or tag..."
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
            <button type="button" className="btn-secondary" onClick={() => { setSearchTerm(''); fetchEvents(''); }}>
              Clear
            </button>
          )}
        </form>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Total Scheduled Events: <strong style={{ color: '#0f172a' }}>{events.length}</strong>
        </div>
      </div>

      {/* Events Table */}
      <div className="panel-card" style={{ overflowX: 'auto' }}>
        {isLoading ? (
          <div className="empty-state">Loading Events...</div>
        ) : events.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#64748b' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </div>
            <p style={{ fontWeight: 700, color: '#0f172a' }}>No events scheduled</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click &quot;Create New Event&quot; to publish an upcoming gathering.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Poster</th>
                <th>Event Details</th>
                <th>Date & Schedule</th>
                <th>Location</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => (
                <tr key={evt.id}>
                  <td>
                    <div style={{ width: '64px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {evt.image ? (
                        <img src={formatMediaUrl(evt.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{evt.title}</div>
                    {evt.subtitle && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        {evt.subtitle}
                      </div>
                    )}
                    {evt.registration_link && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#2563eb', marginTop: '3px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        <span>{evt.registration_open ? 'Open RSVP' : 'Registration Closed'}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{evt.date_text}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{evt.time_text}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.825rem', color: '#334155' }}>{evt.location || 'Church Campus'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
                      {evt.category_tag || 'Event'}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTogglePublish(evt)}
                      title="Click to toggle published status"
                    >
                      <CompStatusBadge isPublished={evt.is_published} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-icon-action view"
                        onClick={() => handleOpenEdit(evt)}
                        title="Edit Event"
                        aria-label="Edit Event"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action delete"
                        onClick={() => setDeleteTarget(evt)}
                        title="Delete Event"
                        aria-label="Delete Event"
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

      {/* Add / Edit Event Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingEvent ? 'Edit Church Event' : 'Create New Church Event'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveEvent}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Annual Holy Spirit Revival Conference 2026"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subtitle / Motto</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Experiencing the fullness of God's presence and power"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Date String *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.date_text}
                      onChange={(e) => setFormData({ ...formData, date_text: e.target.value })}
                      placeholder="e.g. November 28, 2026"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time String *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.time_text}
                      onChange={(e) => setFormData({ ...formData, time_text: e.target.value })}
                      placeholder="e.g. 6:30 PM - 8:30 PM"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Location Venue</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Grace Fellowship Sanctuary"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category Tag</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.category_tag}
                      onChange={(e) => setFormData({ ...formData, category_tag: e.target.value })}
                      placeholder="e.g. Conference, Youth, Outreach, Prayer"
                    />
                  </div>
                </div>

                <CompMediaUpload
                  label="Event Poster / Hero Banner"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="Upload or enter poster image URL"
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Action Button Text</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.action_text}
                      onChange={(e) => setFormData({ ...formData, action_text: e.target.value })}
                      placeholder="e.g. Register Now or RSVP"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration URL Link</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.registration_link}
                      onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                      placeholder="e.g. #register or https://forms.gle/..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Event Details & Agenda</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Full event description, guest speakers, parking, childcare details..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.registration_open)}
                      onChange={(e) => setFormData({ ...formData, registration_open: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                    />
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                      Registration Open for Believers
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.is_published)}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                    />
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                      Publish on Website Calendar
                    </span>
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Delete Event"
          message={`Are you sure you want to permanently delete the event "${deleteTarget.title}"? This cannot be undone.`}
          confirmLabel="Delete Event"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.EventsManager = EventsManager;
}
