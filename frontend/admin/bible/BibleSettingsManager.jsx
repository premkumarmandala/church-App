import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';

/**
 * Bible Settings CMS Manager Component
 * Configures default scripture translation and public reader display settings.
 * Strictly preserves the integrity of raw Bible scripture JSON files.
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
      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.4rem' }}>🛡️</span>
        <div>
          <div style={{ fontWeight: 700, color: '#0f1e36', fontSize: '0.95rem', marginBottom: '2px' }}>
            Sacred Scripture Integrity Protection
          </div>
          <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
            Original Bible text repositories (King James Version and Telugu Holy Bible) are immutable and securely versioned.
            This manager controls presentation preferences and default reader views on the public website.
          </div>
        </div>
      </div>

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

      <form onSubmit={handleSubmit} className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          Reader Defaults & Navigation
        </h3>

        {/* Translation Choice */}
        <div className="form-group" style={{ maxWidth: '480px' }}>
          <label className="form-label">Default Church Bible Translation</label>
          <select
            className="form-input"
            value={formData.default_translation || 'kjv'}
            onChange={(e) => setFormData({ ...formData, default_translation: e.target.value })}
          >
            <option value="kjv">King James Version (KJV) - English</option>
            <option value="telugu">Holy Bible (పరిశుద్ధ గ్రంథము) - Telugu</option>
          </select>
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            Specifies which translation opens initially when members click "Read Bible" on the navigation bar.
          </span>
        </div>

        {/* Display Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
              checked={Boolean(formData.allow_parallel_reading)}
              onChange={(e) => setFormData({ ...formData, allow_parallel_reading: e.target.checked })}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                Enable Parallel Bilingual Reading (English & Telugu)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Permits congregants to view verses side-by-side in both languages simultaneously.
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
              checked={Boolean(formData.show_verse_numbers)}
              onChange={(e) => setFormData({ ...formData, show_verse_numbers: e.target.checked })}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                Show Verse Numbers in Public Reader
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Displays superscript verse numerals alongside Scripture sentences.
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px', accentColor: '#0066cc' }}
              checked={Boolean(formData.daily_verse_enabled)}
              onChange={(e) => setFormData({ ...formData, daily_verse_enabled: e.target.checked })}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#0f1e36', fontSize: '0.9rem' }}>
                Enable "Daily Verse of Inspiration" on Homepage
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Shows the curated daily scripture quote box prominently on the main landing page.
              </div>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {isSaving ? 'Updating...' : '💾 Save Bible Reader Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.BibleSettingsManager = BibleSettingsManager;
}

