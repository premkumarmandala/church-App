import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';

/**
 * Users & Pastoral Team Management Component
 * Allows viewing and managing administrators, pastoral intercessors, and church leaders.
 * All data persists directly to PostgreSQL / SQLite database.
 * Standardized to uniform Navy & White design system with SVG icons.
 */
export function UsersManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : (window.React ? window.React.useEffect : null);

  const api = window.cmsApi || cmsApi;

  const [users, setUsers] = useSafeState([]);
  const [isLoading, setIsLoading] = useSafeState(true);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [successMsg, setSuccessMsg] = useSafeState('');

  // Add user modal state
  const [isAddOpen, setIsAddOpen] = useSafeState(false);
  const [deleteTarget, setDeleteTarget] = useSafeState(null);
  const [newUser, setNewUser] = useSafeState({
    name: '',
    email: '',
    role: 'Staff Administrator',
    status: 'Active',
  });
  const [isSubmitting, setIsSubmitting] = useSafeState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  useSafeEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) {
      alert('Please provide name and email.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await api.createUser(newUser);
      setSuccessMsg(`Added team member ${newUser.name}.`);
      setIsAddOpen(false);
      setNewUser({ name: '', email: '', role: 'Staff Administrator', status: 'Active' });
      await fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await api.deleteUser(deleteTarget.id);
      setSuccessMsg(`Removed team member ${deleteTarget.name}.`);
      setDeleteTarget(null);
      await fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CompHeader = window.PageHeader || PageHeader;
  const CompStatusBadge = window.StatusBadge || StatusBadge;
  const CompConfirm = window.ConfirmModal || ConfirmModal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CompHeader
        title="Administrative & Pastoral Team"
        subtitle="Manage church administrators, pastoral intercessors, elders, and staff account privileges."
        actionLabel="Add Team Member"
        onAction={() => setIsAddOpen(true)}
      />

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="panel-card" style={{ overflowX: 'auto' }}>
        {isLoading ? (
          <div className="empty-state">Loading team members...</div>
        ) : users.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#64748b' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <p style={{ fontWeight: 700, color: '#0f172a' }}>No team members found</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Click &quot;Add Team Member&quot; to configure administrators.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email Address</th>
                <th>Role & Ministry</th>
                <th>Status</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                        {u.avatar_initials || (u.name ? u.name[0].toUpperCase() : 'A')}
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{u.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{u.email}</span>
                  </td>
                  <td>
                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.825rem' }}>{u.role}</span>
                  </td>
                  <td>
                    <CompStatusBadge status={u.status || 'Active'} />
                  </td>
                  <td>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{u.last_login || 'Recently active'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-icon-action delete"
                        onClick={() => setDeleteTarget(u)}
                        title="Remove Team Member"
                        aria-label="Remove Team Member"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Team Member Modal */}
      {isAddOpen && (
        <div className="modal-backdrop" onClick={() => !isSubmitting && setIsAddOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Pastoral Team Member</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="e.g. Pastor John Samuel"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="e.g. pastor.john@church.org"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role & Ministry Access</label>
                  <select
                    className="form-input"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="Senior Pastor">Senior Pastor (Full System Access)</option>
                    <option value="Staff Administrator">Staff Administrator (CMS & Content)</option>
                    <option value="Pastoral Intercessor">Pastoral Intercessor (Prayer Ministry)</option>
                    <option value="Media Coordinator">Media Coordinator (Sermons & Gallery)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select
                    className="form-input"
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <CompConfirm
          title="Remove Team Member"
          message={`Are you sure you want to remove ${deleteTarget.name} from the administrative team? They will no longer have access to manage church data.`}
          confirmLabel="Remove Member"
          isProcessing={isSubmitting}
          onConfirm={handleDeleteUserConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.UsersManager = UsersManager;
}
