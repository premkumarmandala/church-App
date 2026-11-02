/**
 * Reusable Status Pill Badge Component
 */
export function StatusBadge({ isPublished, label }) {
  const published = isPublished ?? true;
  const text = label || (published ? 'Published' : 'Draft');
  const badgeClass = published ? 'prayed' : 'pending';

  return (
    <span className={`status-pill ${badgeClass}`}>
      <span className="status-dot" />
      <span>{text}</span>
    </span>
  );
}

if (typeof window !== 'undefined') {
  window.StatusBadge = StatusBadge;
}

