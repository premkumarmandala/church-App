/**
 * Standardized Section Action Header Component
 * Provides clean module-level toolbar with section title, subtitle metadata,
 * and primary action button styled in the unified Navy & White corporate design system.
 */
export function PageHeader({ title, subtitle, actionLabel, onAction, actionIcon }) {
  const defaultPlusIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  return (
    <div className="panel-header-toolbar" style={{ marginBottom: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div className="panel-title-and-tabs">
        {title && <h2 className="panel-section-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{title}</h2>}
        {subtitle && (
          <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
            {subtitle}
          </span>
        )}
      </div>
      {actionLabel && onAction && (
        <div className="panel-right-tools">
          <button type="button" className="btn-add-primary" onClick={onAction} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>{actionIcon || defaultPlusIcon}</span>
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
