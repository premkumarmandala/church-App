/**
 * Section Action Header Component
 * Provides clean module-level toolbar with section title and primary action button,
 * aligning with the unified white & navy corporate dashboard theme.
 */
export function PageHeader({ title, subtitle, actionLabel, onAction, actionIcon = '+' }) {
  return (
    <div className="panel-header-toolbar" style={{ marginBottom: '8px' }}>
      <div className="panel-title-and-tabs">
        {title && <h2 className="panel-section-title">{title}</h2>}
        {subtitle && (
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '6px' }}>
            — {subtitle}
          </span>
        )}
      </div>
      {actionLabel && onAction && (
        <div className="panel-right-tools">
          <button type="button" className="btn-add-primary" onClick={onAction}>
            <span>{actionIcon}</span>
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.PageHeader = PageHeader;
}

