import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { MediaUploadField } from '../components/MediaUploadField.jsx';

/**
 * About Us CMS Manager Component
 * Allows pastors and administrators to customize church history, mission, vision,
 * core doctrinal beliefs, leadership profile, and church campus images.
 */
export function AboutManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const [formData, setFormData] = useSafeState({
    history_text: '',
    mission_text: '',
    vision_text: '',
    beliefs_json: '[]',
    lead_pastor_name: '',
    lead_pastor_title: '',
    lead_pastor_bio: '',
    lead_pastor_image: '',
    campus_image: '',
  });

  const [beliefsList, setBeliefsList] = useSafeState([]);
  const [newBelief, setNewBelief] = useSafeState('');
  const [isLoading, setIsLoading] = useSafeState(true);
  const [isSaving, setIsSaving] = useSafeState(false);
  const [saveSuccess, setSaveSuccess] = useSafeState('');
  const [errorMsg, setErrorMsg] = useSafeState('');

  useSafeEffect(() => {
    let mounted = true;
    const fetchAbout = async () => {
      try {
        const api = window.cmsApi || cmsApi;
        const data = await api.getAbout();
        if (mounted && data) {
          setFormData(data);
          try {
            const parsed = JSON.parse(data.beliefs_json || '[]');
            setBeliefsList(Array.isArray(parsed) ? parsed : []);
          } catch {
            setBeliefsList([]);
          }
        }
      } catch (err) {
        if (mounted) setErrorMsg(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchAbout();
    return () => { mounted = false; };
  }, []);

  const handleAddBelief = () => {
    if (!newBelief.trim()) return;
    const updated = [...beliefsList, newBelief.trim()];
    setBeliefsList(updated);
    setFormData((prev) => ({ ...prev, beliefs_json: JSON.stringify(updated) }));
    setNewBelief('');
  };

  const handleRemoveBelief = (index) => {
    const updated = beliefsList.filter((_, i) => i !== index);
    setBeliefsList(updated);
    setFormData((prev) => ({ ...prev, beliefs_json: JSON.stringify(updated) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setErrorMsg('');
    try {
      const api = window.cmsApi || cmsApi;
      const payload = {
        ...formData,
        beliefs_json: JSON.stringify(beliefsList),
      };
      const res = await api.updateAbout(payload);
      setFormData(res);
      setSaveSuccess('About Us information updated successfully! Live on public website.');
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
    return <div className="empty-state">Loading About Us information...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="About Us Management"
        subtitle="Manage church history, pastoral vision, core beliefs, leadership bio, and campus photography."
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
        {/* Section 1: Vision & Mission */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Mission, Vision & History
          </h3>

          <div className="form-group">
            <label className="form-label">Church History & Legacy</label>
            <textarea
              className="form-input"
              rows={4}
              value={formData.history_text || ''}
              onChange={(e) => setFormData({ ...formData, history_text: e.target.value })}
              placeholder="Tell the founding story and testimony of Grace Fellowship..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Mission Statement</label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.mission_text || ''}
                onChange={(e) => setFormData({ ...formData, mission_text: e.target.value })}
                placeholder="What is the active mission of the church?"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vision Statement</label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.vision_text || ''}
                onChange={(e) => setFormData({ ...formData, vision_text: e.target.value })}
                placeholder="What is God calling Grace Fellowship to accomplish?"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Core Doctrinal Beliefs */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Core Doctrinal Beliefs
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Add key doctrinal statements displayed on the public About page.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Authority of Scripture: We believe the Holy Bible is inspired..."
              value={newBelief}
              onChange={(e) => setNewBelief(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBelief(); } }}
            />
            <button type="button" className="btn-secondary" onClick={handleAddBelief}>
              Add Statement
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {beliefsList.map((belief, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 700, color: '#c59b27' }}>#{idx + 1}</span>
                  <span>{belief}</span>
                </div>
                <button
                  type="button"
                  className="btn-icon-action delete"
                  onClick={() => handleRemoveBelief(idx)}
                  title="Remove belief"
                >
                  ✕
                </button>
              </div>
            ))}
            {beliefsList.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                No beliefs added yet. Add doctrinal bullet points above.
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Leadership Profile & Campus */}
        <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f1e36', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Pastoral Leadership & Campus Media
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Lead Pastor Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.lead_pastor_name || ''}
                onChange={(e) => setFormData({ ...formData, lead_pastor_name: e.target.value })}
                placeholder="e.g. Pastor John Samuel"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pastoral Title / Position</label>
              <input
                type="text"
                className="form-input"
                value={formData.lead_pastor_title || ''}
                onChange={(e) => setFormData({ ...formData, lead_pastor_title: e.target.value })}
                placeholder="e.g. Senior Pastor & Founder"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pastor Biography / Message</label>
            <textarea
              className="form-input"
              rows={4}
              value={formData.lead_pastor_bio || ''}
              onChange={(e) => setFormData({ ...formData, lead_pastor_bio: e.target.value })}
              placeholder="Biography, ordination background, and welcoming heart..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <CompMediaUpload
              label="Pastor Portrait Photo"
              value={formData.lead_pastor_image || ''}
              onChange={(url) => setFormData({ ...formData, lead_pastor_image: url })}
              placeholder="Upload or enter image path (e.g. home/assets/pastor.jpg)"
            />
            <CompMediaUpload
              label="Church Campus / Sanctuary Exterior"
              value={formData.campus_image || ''}
              onChange={(url) => setFormData({ ...formData, campus_image: url })}
              placeholder="Upload or enter image path (e.g. home/assets/campus.jpg)"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {isSaving ? 'Saving Changes...' : '💾 Save About Us Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.AboutManager = AboutManager;
}

