import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';

/**
 * Contact & Location CMS Manager Component
 * Enables updating church address, pastoral phone numbers, email, maps, and social media handles.
 * Standardized to uniform Navy & White design system with SVG icons.
 */
export function ContactManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [formData, setFormData] = useSafeState({
    address_line1: '',
    address_line2: '',
    city_state_zip: '',
    phone: '',
    email: '',
    google_maps_url: '',
    facebook_url: '',
    youtube_url: '',
    instagram_url: '',
    whatsapp_number: '',
    church_exterior_image: '',
  });

  const [isLoading, setIsLoading] = useSafeState(true);
  const [isSaving, setIsSaving] = useSafeState(false);
  const [saveSuccess, setSaveSuccess] = useSafeState('');
  const [errorMsg, setErrorMsg] = useSafeState('');

  useSafeEffect(() => {
    let mounted = true;
    const fetchContact = async () => {
      try {
        const api = window.cmsApi || cmsApi;
        const data = await api.getContact();
        if (mounted && data) {
          setFormData(data);
        }
      } catch (err) {
        if (mounted) setErrorMsg(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchContact();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setErrorMsg('');
    try {
      const api = window.cmsApi || cmsApi;
      const res = await api.updateContact(formData);
      setFormData(res);
      setSaveSuccess('Church contact coordinates updated successfully! Live on public website.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompMediaUpload = window.MediaUploadField || MediaUploadField;

  if (isLoading) {
    return <div className="empty-state">Loading Contact Information...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Contact & Location Management"
        subtitle="Maintain physical sanctuary address, pastoral phone hotline, official email, Google Maps link, and social channels."
      />

      {saveSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          <span>{saveSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Physical Address Section */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            Sanctuary Location & Inquiries
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Address Line 1</label>
              <input
                type="text"
                className="form-input"
                value={formData.address_line1 || ''}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                placeholder="e.g. 124 Church Street, Faith Colony"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address Line 2 (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={formData.address_line2 || ''}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                placeholder="e.g. Near Community Center, Pillar 42"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">City, State & Postal Zip</label>
              <input
                type="text"
                className="form-input"
                value={formData.city_state_zip || ''}
                onChange={(e) => setFormData({ ...formData, city_state_zip: e.target.value })}
                placeholder="e.g. Hyderabad, Telangana 500034"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pastoral Phone Helpline</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Official Church Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. contact@gracefellowship.org"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Google Maps Embed / Navigation URL</label>
            <input
              type="text"
              className="form-input"
              value={formData.google_maps_url || ''}
              onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
              placeholder="e.g. https://maps.google.com/?q=..."
            />
          </div>
        </div>

        {/* Social & Digital Presence Section */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            Digital Channels & Social Media
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">YouTube Live Channel</label>
              <input
                type="text"
                className="form-input"
                value={formData.youtube_url || ''}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="e.g. https://youtube.com/@gracefellowship"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Facebook Congregation Page</label>
              <input
                type="text"
                className="form-input"
                value={formData.facebook_url || ''}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="e.g. https://facebook.com/gracefellowship"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Instagram Profile</label>
              <input
                type="text"
                className="form-input"
                value={formData.instagram_url || ''}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="e.g. https://instagram.com/gracefellowship"
              />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Prayer Line Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.whatsapp_number || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="e.g. +91 98765 43210"
              />
            </div>
          </div>

          <CompMediaUpload
            label="Sanctuary Exterior / Entrance Photography"
            value={formData.church_exterior_image || ''}
            onChange={(url) => setFormData({ ...formData, church_exterior_image: url })}
            placeholder="Upload or enter church exterior image URL"
          />
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            <span>{isSaving ? 'Saving Changes...' : 'Save Contact Information'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.ContactManager = ContactManager;
}
