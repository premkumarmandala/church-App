/**
 * Standardized Confirmation & Deletion Modal Component
 * Displays clean accessible prompt with SVG warning indicator and explicit Cancel / Confirm actions.
 */
export function ConfirmModal({
  title = 'Confirm Action',
  message,
  onConfirm,
  onCancel,
  isProcessing = false,
  confirmLabel = 'Delete',
  isDanger = true,
}) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-container"
        style={{ maxWidth: '440px', borderRadius: '16px', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', background: isDanger ? '#fef2f2' : '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: isDanger ? '#dc2626' : '#2563eb', display: 'flex', alignItems: 'center' }}>
              {isDanger ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </span>
            <h3 className="modal-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: isDanger ? '#dc2626' : '#0f172a', margin: 0 }}>
              {title}
            </h3>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onCancel}
            aria-label="Close"
            disabled={isProcessing}
          >
            ×
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 22px', fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
          {message}
        </div>

        <div className="modal-footer" style={{ padding: '14px 22px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isProcessing}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className={isDanger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={isProcessing}
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            {isProcessing ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.ConfirmModal = ConfirmModal;
}
