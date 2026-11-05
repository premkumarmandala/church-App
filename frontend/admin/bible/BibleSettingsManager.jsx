import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';

/**
 * Bible Settings CMS Manager Component
 * Configures default scripture translation and public reader display settings.
 * Strictly preserves the integrity of raw Bible scripture JSON files.
 * Standardized to uniform Navy & White design system with SVG icons.
 */
export function BibleSettingsManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [formData, setFormData] = useSafeState({
    default_translation: 'kjv',
    allow_parallel_reading: true,
    show_verse_numbers: true,
    daily_verse_enabled: true,
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
        const data = await api.getBibleSettings();
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
      const res = await api.updateBibleSettings(formData);
      setFormData(res);
      setSaveSuccess('Bible reader preferences updated successfully.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;

  if (isLoading) {
    return <div className="empty-state">Loading Bible settings...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Bible Reader Settings"
        subtitle="Manage default Bible translation, display preferences, and parallel reading options."
      />

      {/* Advisory notice regarding Scripture integrity */}
      <div className="panel-card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', marginBottom: '2px' }}>
            Sacred Scripture Integrity Protection
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            Original Bible text repositories (King James Version and Telugu Holy Bible) are immutable and securely versioned.
            This manager controls presentation preferences and default reader views on the public website.
          </div>
        </div>
      </div>

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
          Reader Defaults & Translation Selection
        </h3>

        <div className="form-group" style={{ maxWidth: '420px' }}>
          <label className="form-label">Default Scripture Translation</label>
          <select
            className="form-input"
            value={formData.default_translation}
            onChange={(e) => setFormData({ ...formData, default_translation: e.target.value })}
          >
            <option value="kjv">King James Version (KJV) - English</option>
            <option value="telugu">Telugu Holy Bible (పరిశుద్ధ గ్రంథము)</option>
          </select>
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
            Specifies which translation visitors see when opening the Bible reader.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={Boolean(formData.allow_parallel_reading)}
              onChange={(e) => setFormData({ ...formData, allow_parallel_reading: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                Allow Parallel Dual-Translation Reading
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Enables readers to view English and Telugu passages side-by-side.
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={Boolean(formData.show_verse_numbers)}
              onChange={(e) => setFormData({ ...formData, show_verse_numbers: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                Display Scripture Verse Numbers
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Shows superscript numbers preceding each biblical verse.
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={Boolean(formData.daily_verse_enabled)}
              onChange={(e) => setFormData({ ...formData, daily_verse_enabled: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                Enable Daily Verse Feature
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Displays an inspirational daily Scripture passage on the reader banner.
              </div>
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            <span>{isSaving ? 'Saving Changes...' : 'Save Reader Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.BibleSettingsManager = BibleSettingsManager;
}
