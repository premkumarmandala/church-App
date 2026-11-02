import { useState } from 'react';

/**
 * Users & Pastoral Team Management Component
 * Allows viewing and managing administrators, pastoral intercessors, and church leaders.
 */
export function UsersManager() {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);

  const [users] = useSafeState([
    {
      id: 1,
      name: 'Pastor John Samuel',
      email: 'pastor@gracefellowship.org',
      role: 'Senior Pastor & Super Admin',
      status: 'Active',
      lastLogin: 'Today, 2:30 PM',
      avatar: 'PS',
    },
    {
      id: 2,
      name: 'Deacon David Raj',
      email: 'david.raj@gracefellowship.org',
      role: 'Prayer Coordinator',
      status: 'Active',
      lastLogin: 'Yesterday, 8:15 PM',
      avatar: 'DR',
    },
    {
      id: 3,
      name: 'Sister Sarah Grace',
      email: 'sarah.grace@gracefellowship.org',
      role: 'Intercession Lead',
      status: 'Active',
      lastLogin: 'Oct 30, 2026',
      avatar: 'SG',
    },
    {
      id: 4,
      name: 'Brother Timothy Paul',
      email: 'timothy.paul@gracefellowship.org',
      role: 'Media & Tech Minister',
      status: 'Active',
      lastLogin: 'Oct 28, 2026',
      avatar: 'TP',
    },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="content-panel-card">
        <div className="panel-header-toolbar">
          <div className="panel-title-and-tabs">
            <h2 className="panel-section-title">Church Administration & Pastoral Team</h2>
          </div>
          <button
            type="button"
            className="btn-add-primary"
            onClick={() => alert('New team member invite link generated.')}
          >
            <span>+</span>
            <span>Add Team Member</span>
          </button>
        </div>

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
                        {u.avatar}
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
                    <span className="status-pill-badge prayed">{u.status}</span>
                  </td>
                  <td>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{u.lastLogin}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons-wrap" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => alert(`Editing permissions for ${u.name}`)}
                        title="Edit Permissions"
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.UsersManager = UsersManager;
}

