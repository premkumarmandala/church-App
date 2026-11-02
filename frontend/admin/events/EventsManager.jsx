import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';

/**
 * Events CMS Manager Component
 * Enables creating, editing, publishing, and scheduling church events and registrations.
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
        actionIcon="📅"
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
            placeholder="Search by event title, location, or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Search</button>
          {searchTerm && (
            <button type="button" className="btn-secondary" onClick={() => { setSearchTerm(''); fetchEvents(''); }}>
              Clear
            </button>
          )}
        </form>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Total Scheduled Events: <strong>{events.length}</strong>
        </div>
      </div>

      {/* Events Table */}
      <div className="panel-card" style={{ overflowX: 'auto' }}>
        {isLoading ? (
          <div className="empty-state">Loading Events...</div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📅</div>
            <p style={{ fontWeight: 600 }}>No events scheduled</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click "Create New Event" to publish an upcoming gathering.</p>
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
                    <div style={{ width: '64px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#0f1e36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {evt.image ? (
                        <img src={evt.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#c59b27', fontSize: '1.2rem' }}>📅</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f1e36', fontSize: '0.92rem' }}>{evt.title}</div>
                    {evt.subtitle && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        {evt.subtitle}
                      </div>
                    )}
                    {evt.registration_link && (
                      <div style={{ fontSize: '0.72rem', color: '#0066cc', marginTop: '3px' }}>
                        🔗 {evt.registration_open ? 'Open RSVP' : 'Registration Closed'}
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
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f1e36', background: '#e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
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
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action delete"
                        onClick={() => setDeleteTarget(evt)}
                        title="Delete Event"
                      >
                        🗑️
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
                {editingEvent ? 'Edit Event Details' : 'Create New Event'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveEvent}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Event Headline Title *</label>
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
                  <label className="form-label">Event Subtitle / Theme</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Empowered for Kingdom Impact"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.date_text}
                      onChange={(e) => setFormData({ ...formData, date_text: e.target.value })}
                      placeholder="e.g. Saturday, November 28, 2026"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time & Schedule</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.time_text}
                      onChange={(e) => setFormData({ ...formData, time_text: e.target.value })}
                      placeholder="e.g. 6:00 PM - 9:00 PM"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Location / Room</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Main Sanctuary"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category Tag</label>
                    <select
                      className="form-input"
                      value={formData.category_tag}
                      onChange={(e) => setFormData({ ...formData, category_tag: e.target.value })}
                    >
                      <option value="Conference">Conference</option>
                      <option value="Fellowship">Fellowship</option>
                      <option value="Youth">Youth Gathering</option>
                      <option value="Worship">Night of Worship</option>
                      <option value="Outreach">Community Outreach</option>
                      <option value="Prayer">Prayer & Fasting</option>
                      <option value="Special">Special Service</option>
                    </select>
                  </div>
                </div>

                <CompMediaUpload
                  label="Event Poster / Promotional Banner"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="Upload or enter image path (e.g. home/assets/event1.jpg)"
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Action Button Text</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.action_text}
                      onChange={(e) => setFormData({ ...formData, action_text: e.target.value })}
                      placeholder="e.g. Register Online"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration / Info URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.registration_link}
                      onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                      placeholder="e.g. /events/register or https://forms.gle/..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Event Description</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Guest ministers, schedule details, meal arrangements, childcare notes..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.registration_open)}
                      onChange={(e) => setFormData({ ...formData, registration_open: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
                    />
                    <span style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                      Registration is Open
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.is_published)}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
                    />
                    <span style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                      Publish Immediately to Website
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
          message={`Are you sure you want to remove the event "${deleteTarget.title}"? This cannot be undone.`}
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

