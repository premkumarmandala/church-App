import { useState, useEffect } from 'react';
import { cmsApi } from '../services/api.js';

/**
 * Users & Pastoral Team Management Component
 * Allows viewing and managing administrators, pastoral intercessors, and church leaders.
 * All data persists directly to PostgreSQL / SQLite database.
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

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to remove ${user.name} from the administrative team?`)) {
      return;
    }
    try {
      await api.deleteUser(user.id);
      setSuccessMsg(`Removed team member ${user.name}.`);
      await fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove member');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          ✕ {errorMsg}
        </div>
      )}

      <div className="content-panel-card">
        <div className="panel-header-toolbar">
          <div className="panel-title-and-tabs">
            <h2 className="panel-section-title">Church Administration & Pastoral Team</h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '8px' }}>
              ({users.length} active members)
            </span>
          </div>
          <button
            type="button"
            className="btn-add-primary"
            onClick={() => setIsAddOpen(true)}
          >
            <span>+</span>
            <span>Add Team Member</span>
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
            Loading church administration team...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontWeight: 700, color: '#0f172a' }}>No team members found</p>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Click &quot;Add Team Member&quot; to configure administrators.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table-modern">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
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
                        <div className="avatar-badge-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                          {u.avatar_initials || (u.name ? u.name[0].toUpperCase() : 'A')}
                        </div>
                        <span className="requester-name-strong">{u.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#475569', fontSize: '0.85rem' }}>{u.email}</span>
                    </td>
                    <td>
                      <span style={{ color: '#0b1a30', fontWeight: 600, fontSize: '0.825rem' }}>{u.role}</span>
                    </td>
                    <td>
                      <span className="status-pill-badge prayed">{u.status || 'Active'}</span>
                    </td>
                    <td>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{u.last_login || 'Recently'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons-wrap" style={{ justifyContent: 'flex-end', display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-action-icon danger"
                          onClick={() => handleDeleteUser(u)}
                          title="Remove Team Member"
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
      {isAddOpen && (
        <div className="modal-backdrop-custom" onClick={() => !isSubmitting && setIsAddOpen(false)}>
          <div className="modal-card-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header-custom">
              <h3 className="modal-title-custom">Add Pastoral Team Member</h3>
              <button
                type="button"
                className="modal-close-custom"
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deacon Michael Thomas"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. michael.t@gracefellowship.org"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Role & Responsibilities
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                >
                  <option value="Senior Pastor & Super Admin">Senior Pastor & Super Admin</option>
                  <option value="Associate Pastor">Associate Pastor</option>
                  <option value="Prayer Coordinator">Prayer Coordinator</option>
                  <option value="Intercession Lead">Intercession Lead</option>
                  <option value="Media & Tech Minister">Media & Tech Minister</option>
                  <option value="Staff Administrator">Staff Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
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
                  className="btn-add-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.UsersManager = UsersManager;
}
