import { useState } from 'react';
import { cmsApi } from '../services/api.js';

/**
 * Reusable Media Upload & URL Selector Field
 */
export function MediaUploadField({ label, value, onChange, placeholder = 'e.g. home/assets/photo.jpg', accept = 'image/*' }) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const [isUploading, setIsUploading] = useSafeState(false);
  const [uploadError, setUploadError] = useSafeState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    try {
      const api = window.cmsApi || cmsApi;
      const res = await api.uploadMedia(file);
      if (res && res.url) {
        onChange(res.url);
      }
    } catch (err) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="form-group" style={{ marginBottom: '16px' }}>
      {label && <label className="form-label">{label}</label>}

      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {/* Preview Frame */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#f1f5f9',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {value ? (
            <img
              src={value}
              alt="Media Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>🖼️</span>
          )}
        </div>

        {/* Input Controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            className="form-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label className="btn-secondary" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem' }}>
              <span>📁 {isUploading ? 'Uploading...' : 'Choose File to Upload'}</span>
              <input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
            </label>
            {value && (
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#dc2626' }}
                onClick={() => onChange('')}
              >
                Clear
              </button>
            )}
          </div>
          {uploadError && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{uploadError}</span>}
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.MediaUploadField = MediaUploadField;
}

