/**
 * Reusable Confirmation & Deletion Modal Component
 */
export function ConfirmModal({ title = 'Confirm Action', message, onConfirm, onCancel, isProcessing, confirmLabel = 'Delete', isDanger = true }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: isDanger ? '#fef2f2' : '#f8fafc' }}>
          <div className="modal-title-wrap">
            <span style={{ fontSize: '1.3rem' }}>{isDanger ? '⚠️' : 'ℹ️'}</span>
            <h3 className="modal-title" style={{ color: isDanger ? '#dc2626' : '#0f1e36', fontSize: '1.1rem' }}>
              {title}
            </h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body" style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
          {message}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </button>
          <button
            type="button"
            className={isDanger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={isProcessing}
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

