/**
 * Delete Confirmation Modal Component
 * Ensures explicit pastoral administrator confirmation before permanently
 * removing a prayer request and its private media attachments from storage.
 */

export function DeleteConfirmModal({ request, onConfirm, onCancel, isDeleting }) {
  if (!request) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-container"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ background: '#fef2f2', borderBottomColor: '#fecaca' }}>
          <div className="modal-title-wrap">
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <h3 className="modal-title" style={{ color: '#dc2626' }}>
              Confirm Deletion
            </h3>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="modal-body" style={{ gap: '14px' }}>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>
            Are you sure you want to permanently delete prayer request{' '}
            <strong className="id-badge">{request.id}</strong>
            {request.name ? ` submitted by ${request.name}` : ''}?
          </p>

          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '0.8rem',
              color: '#991b1b',
              lineHeight: 1.5,
            }}
          >
            <strong>Warning:</strong> This action is irreversible. All uploaded private media files,
            pastoral intercession notes, and database records will be permanently erased.
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={() => onConfirm(request.id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Permanently Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.DeleteConfirmModal = DeleteConfirmModal;
}
