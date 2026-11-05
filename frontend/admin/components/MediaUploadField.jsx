import { useState } from 'react';
import { cmsApi } from '../services/api.js';

/**
 * Standardized Media Upload & Asset Selector Field
 * Supports direct file uploading to server/cloud storage and manual URL assignment.
 * Renders thumbnail preview, upload progress spinner, and clear action.
 */
export function MediaUploadField({
  label,
  value,
  onChange,
  placeholder = 'e.g. home/assets/photo.jpg or https://...',
  accept = 'image/*',
  helpText,
}) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const [isUploading, setIsUploading] = useSafeState(false);
  const [uploadError, setUploadError] = useSafeState('');

  const formatMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    return url.startsWith('/') ? url : '/' + url;
  };

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

      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Thumbnail Preview Box */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {value ? (
            <img
              src={formatMediaUrl(value)}
              alt="Media Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          )}
          {isUploading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 255, 255, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg className="login-spinner-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            </div>
          )}
        </div>

        {/* Inputs and Controls */}
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              style={{ flex: 1 }}
            />
            {value && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onChange('')}
                title="Remove Asset"
                style={{ padding: '8px 12px', color: '#dc2626' }}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label
              className="btn-secondary"
              style={{
                cursor: isUploading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                margin: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
              <input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
            </label>

            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              JPG, PNG, WEBP up to 100 MB
            </span>
          </div>

          {helpText && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{helpText}</div>}
          {uploadError && <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>{uploadError}</div>}
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.MediaUploadField = MediaUploadField;
}
