import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';

/**
 * Homepage CMS Manager Component
 * Enables editing welcome text, hero image, headline, Scripture, and CTAs.
 * Standardized to uniform Navy & White design system with SVG icons.
 */
export function HomeManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [formData, setFormData] = useSafeState({
    welcome_text: '',
    hero_title: '',
    hero_subtitle: '',
    hero_verse: '',
    hero_bg_image: '',
    cta_primary_text: '',
    cta_primary_link: '',
    cta_secondary_text: '',
    cta_secondary_link: '',
  });

  const [isLoading, setIsLoading] = useSafeState(true);
  const [isSaving, setIsSaving] = useSafeState(false);
  const [saveSuccess, setSaveSuccess] = useSafeState('');
  const [errorMsg, setErrorMsg] = useSafeState('');

  useSafeEffect(() => {
    let mounted = true;
    const fetchHome = async () => {
      try {
        const api = window.cmsApi || cmsApi;
        const data = await api.getHome();
        if (mounted && data) {
          setFormData(data);
        }
      } catch (err) {
        if (mounted) setErrorMsg(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchHome();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setErrorMsg('');
    try {
      const api = window.cmsApi || cmsApi;
      const res = await api.updateHome(formData);
      setFormData(res);
      setSaveSuccess('Homepage hero banner and copy updated successfully! Changes are live on the public site.');
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
    return <div className="empty-state">Loading Home Page Settings...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Home Page Management"
        subtitle="Customize the welcoming hero banner, church motto, Scripture verse, and call to action buttons."
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

      <form onSubmit={handleSubmit} className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          Hero Section Content
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Welcome Prefix</label>
            <input
              type="text"
              className="form-input"
              value={formData.welcome_text || ''}
              onChange={(e) => setFormData({ ...formData, welcome_text: e.target.value })}
              placeholder="e.g. Welcome to"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Title (Main Church Headline)</label>
            <input
              type="text"
              className="form-input"
              value={formData.hero_title || ''}
              onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
              placeholder="e.g. Grace Fellowship Church"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Hero Subtitle</label>
          <textarea
            className="form-input"
            rows="2"
            value={formData.hero_subtitle || ''}
            onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
            placeholder="A family of believers growing together in Christ's love."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Featured Scripture Verse</label>
          <input
            type="text"
            className="form-input"
            value={formData.hero_verse || ''}
            onChange={(e) => setFormData({ ...formData, hero_verse: e.target.value })}
            placeholder='“For where two or three gather in my name, there am I with them.” — Matthew 18:20'
          />
        </div>

        <CompMediaUpload
          label="Hero Background Banner Image"
          value={formData.hero_bg_image}
          onChange={(url) => setFormData({ ...formData, hero_bg_image: url })}
          placeholder="home/assets/hero_cross_sunset.jpg"
        />

        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '12px' }}>
          Action Buttons (Call to Actions)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Primary Button Text</label>
            <input
              type="text"
              className="form-input"
              value={formData.cta_primary_text || ''}
              onChange={(e) => setFormData({ ...formData, cta_primary_text: e.target.value })}
              placeholder="e.g. Join Us This Sunday"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Button Link</label>
            <input
              type="text"
              className="form-input"
              value={formData.cta_primary_link || ''}
              onChange={(e) => setFormData({ ...formData, cta_primary_link: e.target.value })}
              placeholder="e.g. #service-timings"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Secondary Button Text</label>
            <input
              type="text"
              className="form-input"
              value={formData.cta_secondary_text || ''}
              onChange={(e) => setFormData({ ...formData, cta_secondary_text: e.target.value })}
              placeholder="e.g. Watch Sermons"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Secondary Button Link</label>
            <input
              type="text"
              className="form-input"
              value={formData.cta_secondary_link || ''}
              onChange={(e) => setFormData({ ...formData, cta_secondary_link: e.target.value })}
              placeholder="e.g. #sermons"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
          <button type="submit" className="btn-primary" disabled={isSaving} style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Home Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.HomeManager = HomeManager;
}
