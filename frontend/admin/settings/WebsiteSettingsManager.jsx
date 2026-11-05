import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';

/**
 * Website Settings CMS Manager Component
 * Enables customizing church branding, logo, footer text, copyright, and global SEO metadata.
 * Standardized to uniform Navy & White design system with SVG icons.
 */
export function WebsiteSettingsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [formData, setFormData] = useSafeState({
    church_name: '',
    church_tagline: '',
    logo_url: '',
    primary_color: '#0f172a',
    footer_text: '',
    copyright_text: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  const [isLoading, setIsLoading] = useSafeState(true);
  const [isSaving, setIsSaving] = useSafeState(false);
  const [saveSuccess, setSaveSuccess] = useSafeState('');
  const [errorMsg, setErrorMsg] = useSafeState('');

  useSafeEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      try {
        const api = window.cmsApi || cmsApi;
        const data = await api.getSettings();
        if (mounted && data) {
          setFormData(data);
        }
      } catch (err) {
        if (mounted) setErrorMsg(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchSettings();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setErrorMsg('');
    try {
      const api = window.cmsApi || cmsApi;
      const res = await api.updateSettings(formData);
      setFormData(res);
      setSaveSuccess('Website branding & global settings updated successfully! Live on public website.');
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
    return <div className="empty-state">Loading Site Settings...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Website Settings & Branding"
        subtitle="Manage church identity, official logo, footer disclaimers, copyright notice, and search engine optimization."
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
        {/* Branding */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            Church Identity & Header Logo
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Church Organization Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.church_name || ''}
                onChange={(e) => setFormData({ ...formData, church_name: e.target.value })}
                placeholder="e.g. Grace Fellowship Church"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Church Tagline / Motto</label>
              <input
                type="text"
                className="form-input"
                value={formData.church_tagline || ''}
                onChange={(e) => setFormData({ ...formData, church_tagline: e.target.value })}
                placeholder="e.g. Loving God, Loving People, Serving the World"
              />
            </div>
          </div>

          <CompMediaUpload
            label="Church Header Logo Image"
            value={formData.logo_url || ''}
            onChange={(url) => setFormData({ ...formData, logo_url: url })}
            placeholder="Upload or enter logo URL (e.g. home/assets/church_logo.png)"
          />
        </div>

        {/* Footer & Legal */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            Footer Presentation & Legal Notice
          </h3>

          <div className="form-group">
            <label className="form-label">Footer Summary Paragraph</label>
            <textarea
              rows={3}
              className="form-input"
              value={formData.footer_text || ''}
              onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
              placeholder="Brief paragraph appearing above footer navigation links..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Copyright Notice Line</label>
            <input
              type="text"
              className="form-input"
              value={formData.copyright_text || ''}
              onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
              placeholder="e.g. © 2026 Grace Fellowship Church. All Rights Reserved."
            />
          </div>
        </div>

        {/* SEO Meta Information */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            Search Engine Optimization (SEO)
          </h3>

          <div className="form-group">
            <label className="form-label">Global Meta Page Title</label>
            <input
              type="text"
              className="form-input"
              value={formData.seo_title || ''}
              onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
              placeholder="e.g. Grace Fellowship Church | Sunday Worship, Sermons & Community"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Meta Description</label>
            <textarea
              rows={2}
              className="form-input"
              value={formData.seo_description || ''}
              onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
              placeholder="Concise church description for Google search results (150-160 chars recommended)..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Meta Keywords (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              value={formData.seo_keywords || ''}
              onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
              placeholder="church, worship, sermons, Christian, fellowship, Hyderabad, faith"
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            <span>{isSaving ? 'Saving Changes...' : 'Save Website Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.WebsiteSettingsManager = WebsiteSettingsManager;
}
