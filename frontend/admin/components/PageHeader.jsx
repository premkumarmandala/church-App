/**
 * Reusable Page Header Component
 */
export function PageHeader({ title, subtitle, actionLabel, onAction, actionIcon = '➕' }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <button type="button" className="btn-primary" onClick={onAction}>
          <span>{actionIcon}</span>
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.PageHeader = PageHeader;
}

