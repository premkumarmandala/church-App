import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';

/**
 * Website Settings CMS Manager Component
 * Enables customizing church branding, logo, footer text, copyright, and global SEO metadata.
 */
export function WebsiteSettingsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [formData, setFormData] = useSafeState({
    church_name: '',
    church_tagline: '',
    logo_url: '',
    primary_color: '#0066cc',
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
        {/* Branding */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Church Identity & Header Logo
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Church Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.church_name || ''}
                onChange={(e) => setFormData({ ...formData, church_name: e.target.value })}
                placeholder="e.g. Grace Fellowship Church"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Motto / Tagline</label>
              <input
                type="text"
                className="form-input"
                value={formData.church_tagline || ''}
                onChange={(e) => setFormData({ ...formData, church_tagline: e.target.value })}
                placeholder="e.g. A Christ-Centered Community of Faith & Love"
              />
            </div>
          </div>

          <CompMediaUpload
            label="Church Crest / Logo Image"
            value={formData.logo_url || ''}
            onChange={(url) => setFormData({ ...formData, logo_url: url })}
            placeholder="Upload or enter logo path (e.g. home/assets/logo.png)"
          />
        </div>

        {/* Footer & Copyright */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Footer Presentation & Legal Copyright
          </h3>

          <div className="form-group">
            <label className="form-label">Footer Mission Summary Text</label>
            <textarea
              rows={3}
              className="form-input"
              value={formData.footer_text || ''}
              onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
              placeholder="Welcoming message displayed in the global website footer across all pages..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Copyright Notice Line</label>
            <input
              type="text"
              className="form-input"
              value={formData.copyright_text || ''}
              onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
              placeholder="e.g. © 2026 Grace Fellowship Church. All rights reserved."
            />
          </div>
        </div>

        {/* SEO Meta Tags */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Search Engine Optimization (SEO)
          </h3>

          <div className="form-group">
            <label className="form-label">Default Browser Tab Title (SEO Title)</label>
            <input
              type="text"
              className="form-input"
              value={formData.seo_title || ''}
              onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
              placeholder="e.g. Grace Fellowship Church - Welcoming, Worshipping & Serving"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Meta Description (Search Snippet)</label>
            <textarea
              rows={2}
              className="form-input"
              value={formData.seo_description || ''}
              onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
              placeholder="150-160 characters summarizing the church for Google and Bing search results..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Keywords (Comma Separated)</label>
            <input
              type="text"
              className="form-input"
              value={formData.seo_keywords || ''}
              onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
              placeholder="e.g. Church, Jesus Christ, Sunday Service, Prayer, Bible Study"
            />
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
            {isSaving ? 'Saving...' : '💾 Save Website Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.WebsiteSettingsManager = WebsiteSettingsManager;
}

