import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';

/**
 * Contact & Location CMS Manager Component
 * Enables updating church address, pastoral phone numbers, email, maps, and social media handles.
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
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {saveSuccess}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Physical Address Section */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
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
                placeholder="e.g. 124 Sanctuary Way"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address Line 2 (Building / Suite)</label>
              <input
                type="text"
                className="form-input"
                value={formData.address_line2 || ''}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                placeholder="e.g. Suite 400"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">City, State & ZIP Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.city_state_zip || ''}
                onChange={(e) => setFormData({ ...formData, city_state_zip: e.target.value })}
                placeholder="e.g. Dallas, TX 75201"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Official Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +1 (555) 789-4560"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Official Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. info@gracefellowship.org"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Google Maps Directions / Embed URL</label>
            <input
              type="text"
              className="form-input"
              value={formData.google_maps_url || ''}
              onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
              placeholder="e.g. https://maps.google.com/?q=Grace+Fellowship+Church"
            />
          </div>

          <CompMediaUpload
            label="Sanctuary Exterior Photo"
            value={formData.church_exterior_image || ''}
            onChange={(url) => setFormData({ ...formData, church_exterior_image: url })}
            placeholder="Upload or enter image path (e.g. home/assets/church-exterior.jpg)"
          />
        </div>

        {/* Social Media & Pastoral Hotline */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Online & Social Media Channels
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">YouTube Live Channel URL</label>
              <input
                type="text"
                className="form-input"
                value={formData.youtube_url || ''}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="e.g. https://www.youtube.com/@GraceFellowship"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Facebook Page URL</label>
              <input
                type="text"
                className="form-input"
                value={formData.facebook_url || ''}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="e.g. https://www.facebook.com/GraceFellowship"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Instagram Handle / URL</label>
              <input
                type="text"
                className="form-input"
                value={formData.instagram_url || ''}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="e.g. https://instagram.com/gracefellowship"
              />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Care Hotline Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.whatsapp_number || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="e.g. +1 555-789-4560"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {isSaving ? 'Saving...' : '💾 Save Contact Information'}
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.ContactManager = ContactManager;
}

