/**
 * Standardized Status Badge Component
 * Renders consistent, subtle, accessible semantic status pills across all modules.
 * Strict palette: Mint Green (Active/Published/Prayed), Amber (Pending/Draft), Slate (Archived/Inactive).
 */
export function StatusBadge({ isPublished, status, label }) {
  let text = label;
  let theme = 'published';

  if (typeof isPublished === 'boolean') {
    text = text || (isPublished ? 'Published' : 'Draft');
    theme = isPublished ? 'published' : 'draft';
  } else if (status) {
    const s = String(status).toLowerCase();
    text = text || status;
    if (s === 'active' || s === 'prayed' || s === 'published') {
      theme = 'published';
    } else if (s === 'pending' || s === 'draft') {
      theme = 'draft';
    } else if (s === 'archived' || s === 'inactive') {
      theme = 'archived';
    } else if (s === 'danger' || s === 'rejected') {
      theme = 'danger';
    }
  } else {
    text = text || 'Published';
    theme = 'published';
  }

  const styles = {
    published: {
      bg: '#ecfdf5',
      text: '#059669',
      border: '#a7f3d0',
      dot: '#10b981',
    },
    draft: {
      bg: '#fef3c7',
      text: '#b45309',
      border: '#fde68a',
      dot: '#f59e0b',
    },
    archived: {
      bg: '#f1f5f9',
      text: '#475569',
      border: '#e2e8f0',
      dot: '#94a3b8',
    },
    danger: {
      bg: '#fef2f2',
      text: '#dc2626',
      border: '#fee2e2',
      dot: '#ef4444',
    },
  }[theme] || {
    bg: '#f1f5f9',
    text: '#475569',
    border: '#e2e8f0',
    dot: '#94a3b8',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        backgroundColor: styles.bg,
        color: styles.text,
        border: `1px solid ${styles.border}`,
        lineHeight: 1.4,
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: styles.dot,
        }}
      />
      <span>{text}</span>
    </span>
  );
}

if (typeof window !== 'undefined') {
  window.StatusBadge = StatusBadge;
}
