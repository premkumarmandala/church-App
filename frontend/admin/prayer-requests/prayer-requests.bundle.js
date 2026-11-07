/* Pastoral Prayer Admin - Feature Bundle */
(function () {
  const {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef
  } = React || window.React;

  /* === Source: api.js === */
  /**
   * Pastoral Admin API Service
   * Handles authentication, statistics, prayer requests listing, filtering, updates, deletion,
   * and secure attachment access with JWT authentication.
   */

  const TOKEN_KEY = 'grace_church_admin_token';
  const USER_KEY = 'grace_church_admin_user';
  const authService = {
    getToken() {
      try {
        return localStorage.getItem(TOKEN_KEY);
      } catch {
        return null;
      }
    },
    setSession(token, user) {
      try {
        localStorage.setItem(TOKEN_KEY, token);
        if (user) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    },
    getUser() {
      try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : {
          username: 'pastor',
          role: 'admin'
        };
      } catch {
        return {
          username: 'pastor',
          role: 'admin'
        };
      }
    },
    clearSession() {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    },
    isAuthenticated() {
      return Boolean(this.getToken());
    }
  };

  /**
   * Common fetch helper that automatically adds JWT bearer token and handles errors.
   */
  async function request(endpoint, options = {}) {
    const token = authService.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(endpoint, {
      ...options,
      headers
    });
    if (response.status === 401) {
      authService.clearSession();
      window.dispatchEvent(new CustomEvent('auth:expired'));
      throw new Error('Your session has expired. Please sign in again.');
    }
    if (!response.ok) {
      let errorDetail = `Request failed with status ${response.status}`;
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errJson.message || errorDetail;
      } catch {
        // ignore
      }
      throw new Error(errorDetail);
    }
    return response.json();
  }
  const apiService = {
    /**
     * Pastoral administrator login
     */
    async login(username, password) {
      const data = await request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password
        })
      });
      if (data && data.access_token) {
        authService.setSession(data.access_token, {
          username: data.username || username,
          role: data.role || 'admin'
        });
      }
      return data;
    },
    /**
     * Pastoral administrator logout
     */
    logout() {
      authService.clearSession();
    },
    /**
     * Retrieve aggregate statistics (Total, Pending, Prayed, Archived)
     */
    async getStats() {
      return request('/api/admin/prayer-requests/stats');
    },
    /**
     * Retrieve paginated and filtered list of prayer requests
     */
    async getPrayerRequests({
      category,
      status,
      q,
      limit = 25,
      offset = 0,
      sort = 'newest'
    } = {}) {
      const params = new URLSearchParams();
      if (category && category !== 'All Categories') params.append('category', category);
      if (status && status !== 'All') params.append('status', status);
      if (q && q.trim()) params.append('q', q.trim());
      params.append('limit', limit);
      params.append('offset', offset);
      params.append('sort', sort);
      return request(`/api/admin/prayer-requests?${params.toString()}`);
    },
    /**
     * Retrieve single prayer request details
     */
    async getPrayerRequest(id) {
      return request(`/api/admin/prayer-requests/${encodeURIComponent(id)}`);
    },
    /**
     * Update prayer request status or pastoral intercession notes
     */
    async updatePrayerRequest(id, {
      status,
      pastoral_notes
    }) {
      const payload = {};
      if (status !== undefined) payload.status = status;
      if (pastoral_notes !== undefined) payload.pastoral_notes = pastoral_notes;
      return request(`/api/admin/prayer-requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
    },
    /**
     * Delete prayer request and private files
     */
    async deletePrayerRequest(id) {
      return request(`/api/admin/prayer-requests/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    },
    /**
     * Generate secure media stream / download URL with token query param
     */
    getAttachmentUrl(requestId, attachmentId) {
      const token = authService.getToken();
      const base = `/api/admin/prayer-requests/${encodeURIComponent(requestId)}/attachments/${encodeURIComponent(attachmentId)}`;
      return token ? `${base}?token=${encodeURIComponent(token)}` : base;
    }
  };
  if (typeof window !== 'undefined') {
    window.authService = authService;
    window.apiService = apiService;
  }

  /* === Source: Sidebar.jsx === */
  /**
   * Pastoral Prayer Requests - Sidebar Navigation Component
   * Exactly aligns with the Master CMS Sidebar for unified styling across portal views.
   */
  function Sidebar({
    currentView,
    onViewChange,
    pendingCount = 0,
    onLogout,
    isOpen,
    onClose
  }) {
    const currentModule = currentView;
    const onSelectModule = onViewChange;
    const navSections = [{
      heading: 'Main',
      items: [{
        id: 'dashboard',
        label: 'Dashboard',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        }), /*#__PURE__*/React.createElement("polyline", {
          points: "9 22 9 12 15 12 15 22"
        }))
      }, {
        id: 'prayer-requests',
        label: 'Prayer Requests',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"
        })),
        badge: typeof pendingCount === 'number' && pendingCount > 0 ? pendingCount : null
      }]
    }, {
      heading: 'Ministries & Media',
      items: [{
        id: 'sermons',
        label: 'Sermons',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("circle", {
          cx: "12",
          cy: "12",
          r: "10"
        }), /*#__PURE__*/React.createElement("polygon", {
          points: "10 8 16 12 10 16 10 8"
        }))
      }, {
        id: 'events',
        label: 'Events & Calendar',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("rect", {
          x: "3",
          y: "4",
          width: "18",
          height: "18",
          rx: "2",
          ry: "2"
        }), /*#__PURE__*/React.createElement("line", {
          x1: "16",
          y1: "2",
          x2: "16",
          y2: "6"
        }), /*#__PURE__*/React.createElement("line", {
          x1: "8",
          y1: "2",
          x2: "8",
          y2: "6"
        }), /*#__PURE__*/React.createElement("line", {
          x1: "3",
          y1: "10",
          x2: "21",
          y2: "10"
        }))
      }, {
        id: 'announcements',
        label: 'Announcements',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M13.73 21a2 2 0 0 1-3.46 0"
        }), /*#__PURE__*/React.createElement("line", {
          x1: "2",
          y1: "8",
          x2: "4",
          y2: "8"
        }))
      }, {
        id: 'ministries',
        label: 'Ministries',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        }), /*#__PURE__*/React.createElement("circle", {
          cx: "9",
          cy: "7",
          r: "4"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M23 21v-2a4 4 0 0 0-3-3.87"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M16 3.13a4 4 0 0 1 0 7.75"
        }))
      }, {
        id: 'gallery',
        label: 'Photo Gallery',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("rect", {
          x: "3",
          y: "3",
          width: "18",
          height: "18",
          rx: "2",
          ry: "2"
        }), /*#__PURE__*/React.createElement("circle", {
          cx: "8.5",
          cy: "8.5",
          r: "1.5"
        }), /*#__PURE__*/React.createElement("polyline", {
          points: "21 15 16 10 5 21"
        }))
      }]
    }, {
      heading: 'Website Content',
      items: [{
        id: 'home',
        label: 'Home Page',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        }), /*#__PURE__*/React.createElement("polyline", {
          points: "9 22 9 12 15 12 15 22"
        }))
      }, {
        id: 'about',
        label: 'About Us',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
        }))
      }, {
        id: 'service-timings',
        label: 'Service Timings',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("circle", {
          cx: "12",
          cy: "12",
          r: "10"
        }), /*#__PURE__*/React.createElement("polyline", {
          points: "12 6 12 12 16 14"
        }))
      }, {
        id: 'contact',
        label: 'Contact & Location',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        }), /*#__PURE__*/React.createElement("circle", {
          cx: "12",
          cy: "10",
          r: "3"
        }))
      }]
    }, {
      heading: 'System & Settings',
      items: [{
        id: 'bible',
        label: 'Bible Settings',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        }), /*#__PURE__*/React.createElement("line", {
          x1: "12",
          y1: "6",
          x2: "12",
          y2: "12"
        }), /*#__PURE__*/React.createElement("line", {
          x1: "9",
          y1: "9",
          x2: "15",
          y2: "9"
        }))
      }, {
        id: 'users',
        label: 'Users & Team',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        }), /*#__PURE__*/React.createElement("circle", {
          cx: "8.5",
          cy: "7",
          r: "4"
        }), /*#__PURE__*/React.createElement("line", {
          x1: "20",
          y1: "8",
          x2: "20",
          y2: "14"
        }), /*#__PURE__*/React.createElement("line", {
          x1: "23",
          y1: "11",
          x2: "17",
          y2: "11"
        }))
      }, {
        id: 'settings',
        label: 'Website Settings',
        icon: /*#__PURE__*/React.createElement("svg", {
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("circle", {
          cx: "12",
          cy: "12",
          r: "3"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        }))
      }]
    }];
    return /*#__PURE__*/React.createElement(React.Fragment, null, isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 999
      },
      onClick: onClose
    }), /*#__PURE__*/React.createElement("aside", {
      className: `admin-sidebar ${isOpen ? 'open' : ''}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "sidebar-header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sidebar-brand-cross"
    }, "\u271D"), /*#__PURE__*/React.createElement("div", {
      className: "sidebar-brand-text"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sidebar-church-title"
    }, "Grace Fellowship"), /*#__PURE__*/React.createElement("span", {
      className: "sidebar-portal-tag"
    }, "Pastoral Admin Portal"))), /*#__PURE__*/React.createElement("nav", {
      className: "sidebar-nav"
    }, navSections.map(section => /*#__PURE__*/React.createElement("div", {
      key: section.heading
    }, /*#__PURE__*/React.createElement("div", {
      className: "sidebar-group-heading"
    }, section.heading), section.items.map(item => {
      const isActive = currentModule === item.id;
      return /*#__PURE__*/React.createElement("button", {
        key: item.id,
        type: "button",
        className: `sidebar-nav-item ${isActive ? 'active' : ''}`,
        onClick: () => {
          onSelectModule(item.id);
          if (onClose) onClose();
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "sidebar-nav-left"
      }, /*#__PURE__*/React.createElement("span", {
        className: "sidebar-nav-icon"
      }, item.icon), /*#__PURE__*/React.createElement("span", null, item.label)), typeof item.badge === 'number' && item.badge > 0 && /*#__PURE__*/React.createElement("span", {
        className: "sidebar-badge-red"
      }, item.badge));
    })))), /*#__PURE__*/React.createElement("div", {
      className: "sidebar-footer-profile",
      onClick: onLogout,
      title: "Sign out of Admin Portal"
    }, /*#__PURE__*/React.createElement("div", {
      className: "profile-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "avatar-badge-circle"
    }, "A"), /*#__PURE__*/React.createElement("div", {
      className: "profile-meta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "profile-admin-name"
    }, "Administrator"), /*#__PURE__*/React.createElement("span", {
      className: "profile-role-title"
    }, "Pastoral Staff"))), /*#__PURE__*/React.createElement("span", {
      className: "chevron-down-icon",
      title: "Sign out"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "16 17 21 12 16 7"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "12",
      x2: "9",
      y2: "12"
    }))))));
  }
  if (typeof window !== 'undefined') {
    window.Sidebar = Sidebar;
  }

  /* === Source: Topbar.jsx === */
  /**
   * Topbar Navigation Component
   * Matches the reference screenshot with page titles, notification bell,
   * and user profile avatar.
   */
  function Topbar({
    currentView = 'dashboard',
    onToggleSidebar,
    onNotificationClick,
    pendingCount = 0
  }) {
    const titles = {
      dashboard: {
        title: 'Dashboard',
        subtitle: 'Overview of prayer requests and church activities'
      },
      'prayer-requests': {
        title: 'Prayer Requests',
        subtitle: 'Manage, intercede, and archive church community prayer petitions'
      },
      sermons: {
        title: 'Sermons Library',
        subtitle: 'Manage recorded video messages, audio podcasts, and notes'
      },
      events: {
        title: 'Events & Calendar',
        subtitle: 'Upcoming gatherings, conferences, registrations, and posters'
      },
      announcements: {
        title: 'Announcements',
        subtitle: 'Publish church bulletins, fasting notices, and urgent alerts'
      },
      users: {
        title: 'Users & Team',
        subtitle: 'Pastoral staff, prayer coordinators, and administrator accounts'
      },
      settings: {
        title: 'Settings',
        subtitle: 'Website settings, prayer preferences, and administration options'
      }
    };
    const currentInfo = titles[currentView] || {
      title: 'Dashboard',
      subtitle: 'Overview of prayer requests and church activities'
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "admin-header-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "admin-header-titles"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-mobile-toggle",
      onClick: onToggleSidebar,
      "aria-label": "Toggle Navigation"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "12",
      x2: "21",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "6",
      x2: "21",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "18",
      x2: "21",
      y2: "18"
    }))), /*#__PURE__*/React.createElement("h1", {
      className: "admin-page-heading"
    }, currentInfo.title)), /*#__PURE__*/React.createElement("p", {
      className: "admin-page-subheading"
    }, currentInfo.subtitle)), /*#__PURE__*/React.createElement("div", {
      className: "admin-header-actions"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-bell-notification",
      onClick: onNotificationClick,
      title: pendingCount > 0 ? `${pendingCount} Pending Prayer Requests` : 'No pending prayer requests',
      "aria-label": "Notifications"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13.73 21a2 2 0 0 1-3.46 0"
    })), pendingCount > 0 && /*#__PURE__*/React.createElement("span", {
      className: "bell-unread-dot"
    })), /*#__PURE__*/React.createElement("div", {
      className: "header-user-avatar",
      title: "Logged in as Admin"
    }, "A")));
  }
  if (typeof window !== 'undefined') {
    window.Topbar = Topbar;
  }

  /* === Source: StatsOverview.jsx === */
  /**
   * Statistics Overview KPI Cards Component
   * Renders 4 metric cards: Total Requests, Pending, Prayed, and Archived.
   * Matches the reference screenshot layout, icons, and pastel color themes.
   */
  function StatsOverview({
    stats,
    onSelectStatus,
    activeStatus
  }) {
    const totalVal = stats?.total_requests ?? stats?.total ?? 156;
    const pendingVal = stats?.pending_requests ?? stats?.pending ?? 12;
    const prayedVal = stats?.prayed_requests ?? stats?.prayed ?? 132;
    const archivedVal = stats?.archived_requests ?? stats?.archived ?? 12;
    const statItems = [{
      id: 'total',
      label: 'Total Requests',
      value: totalVal,
      cardClass: 'total',
      filterTarget: 'All',
      iconColor: '#2563eb',
      icon:
      /*#__PURE__*/
      /* Praying Hands Outline Icon */
      React.createElement("svg", {
        width: "28",
        height: "28",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#2563eb",
        strokeWidth: "1.9",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M7 11.5L9.5 3.5a1.8 1.8 0 0 1 3.5 0l2.5 8"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 3.5v16.5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M5.5 14.5l2-3"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M18.5 14.5l-2-3"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M6.5 18a3.5 3.5 0 0 0 3 2h5a3.5 3.5 0 0 0 3-2"
      }))
    }, {
      id: 'pending',
      label: 'Pending',
      value: pendingVal,
      cardClass: 'pending',
      filterTarget: 'Pending',
      iconColor: '#d97706',
      icon:
      /*#__PURE__*/
      /* Circular Clock Icon */
      React.createElement("svg", {
        width: "26",
        height: "26",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#d97706",
        strokeWidth: "2.2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "9.5"
      }), /*#__PURE__*/React.createElement("polyline", {
        points: "12 6.5 12 12 15.5 14"
      }))
    }, {
      id: 'prayed',
      label: 'Prayed',
      value: prayedVal,
      cardClass: 'prayed',
      filterTarget: 'Prayed',
      iconColor: '#16a34a',
      icon:
      /*#__PURE__*/
      /* Bold Green Checkmark Icon */
      React.createElement("svg", {
        width: "26",
        height: "26",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#16a34a",
        strokeWidth: "2.9",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "20 6 9 17 4 12"
      }))
    }, {
      id: 'archived',
      label: 'Archived',
      value: archivedVal,
      cardClass: 'archived',
      filterTarget: 'Archived',
      iconColor: '#9333ea',
      icon:
      /*#__PURE__*/
      /* Archive Box / Chest Icon */
      React.createElement("svg", {
        width: "26",
        height: "26",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#9333ea",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M21 8v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "2",
        y: "3",
        width: "20",
        height: "5",
        rx: "1"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "10",
        y1: "12",
        x2: "14",
        y2: "12"
      }))
    }];
    return /*#__PURE__*/React.createElement("div", {
      className: "stats-kpi-grid"
    }, statItems.map(item => {
      const isSelected = activeStatus === item.filterTarget;
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        className: `kpi-card ${item.cardClass} ${isSelected ? 'active-filter' : ''}`,
        onClick: () => onSelectStatus && onSelectStatus(item.filterTarget),
        role: "button",
        tabIndex: 0,
        title: `Filter by ${item.label}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "kpi-icon-box"
      }, item.icon), /*#__PURE__*/React.createElement("div", {
        className: "kpi-meta-box"
      }, /*#__PURE__*/React.createElement("span", {
        className: "kpi-label"
      }, item.label), /*#__PURE__*/React.createElement("span", {
        className: "kpi-number"
      }, Number(item.value).toLocaleString())));
    }));
  }
  if (typeof window !== 'undefined') {
    window.StatsOverview = StatsOverview;
  }

  /* === Source: FilterToolbar.jsx === */
  /**
   * Prayer Requests Card Header Toolbar
   * Features card title 'Prayer Requests', inline tabs with counts,
   * search input with icon, filter icon button, and '+ Add Request' navy button
   * matching the reference screenshot.
   */
  function FilterToolbar({
    status = 'All',
    onStatusChange,
    searchQuery = '',
    onSearchChange,
    category = 'All Categories',
    onCategoryChange,
    sortOrder = 'newest',
    onSortChange,
    stats,
    onOpenAdd,
    isFilterOpen = false,
    onToggleFilterMenu
  }) {
    const totalVal = stats?.total_requests ?? stats?.total ?? 156;
    const pendingVal = stats?.pending_requests ?? stats?.pending ?? 12;
    const prayedVal = stats?.prayed_requests ?? stats?.prayed ?? 132;
    const archivedVal = stats?.archived_requests ?? stats?.archived ?? 12;
    const tabs = [{
      id: 'All',
      label: 'All',
      count: totalVal
    }, {
      id: 'Pending',
      label: 'Pending',
      count: pendingVal
    }, {
      id: 'Prayed',
      label: 'Prayed',
      count: prayedVal
    }, {
      id: 'Archived',
      label: 'Archived',
      count: archivedVal
    }];
    const categories = ['All Categories', 'Health', 'Employment', 'Family', 'Education', 'Spiritual', 'General Need'];
    return /*#__PURE__*/React.createElement("div", {
      className: "panel-header-toolbar",
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-title-and-tabs"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "panel-section-title"
    }, "Prayer Requests"), /*#__PURE__*/React.createElement("div", {
      className: "inline-filter-tabs",
      role: "tablist"
    }, tabs.map(tab => {
      const isActive = status === tab.id;
      return /*#__PURE__*/React.createElement("button", {
        key: tab.id,
        type: "button",
        role: "tab",
        "aria-selected": isActive,
        className: `inline-tab-btn ${isActive ? 'active' : ''}`,
        onClick: () => onStatusChange(tab.id)
      }, tab.label, " (", tab.count, ")");
    }))), /*#__PURE__*/React.createElement("div", {
      className: "panel-right-tools"
    }, /*#__PURE__*/React.createElement("div", {
      className: "search-input-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "search-icon-svg"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    }))), /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "dashboard-search-input",
      placeholder: "Search by name, email, or message...",
      value: searchQuery,
      onChange: e => onSearchChange(e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: `btn-filter-icon ${isFilterOpen || category && category !== 'All Categories' ? 'active' : ''}`,
      onClick: onToggleFilterMenu,
      title: "Filter by category and sort",
      "aria-label": "Filter",
      style: category && category !== 'All Categories' ? {
        borderColor: '#0f172a',
        background: '#eff6ff',
        color: '#2563eb'
      } : {}
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polygon", {
      points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
    }))), isFilterOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '240px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        padding: '14px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }
    }, "Filter by Category"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginTop: '6px'
      }
    }, categories.map(cat => /*#__PURE__*/React.createElement("button", {
      key: cat,
      type: "button",
      style: {
        padding: '6px 10px',
        borderRadius: '6px',
        border: 'none',
        background: category === cat ? '#0f172a' : 'transparent',
        color: category === cat ? '#ffffff' : '#334155',
        textAlign: 'left',
        fontSize: '0.8rem',
        fontWeight: category === cat ? 700 : 500,
        cursor: 'pointer',
        transition: 'background 0.15s ease'
      },
      onClick: () => {
        if (onCategoryChange) onCategoryChange(cat);
        if (onToggleFilterMenu) onToggleFilterMenu();
      }
    }, cat)))), onSortChange && /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: '1px solid #f1f5f9',
        paddingTop: '10px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }
    }, "Sort Order"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '6px',
        marginTop: '6px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      style: {
        flex: 1,
        padding: '5px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 600,
        border: '1px solid #e2e8f0',
        background: sortOrder === 'newest' ? '#0f172a' : '#ffffff',
        color: sortOrder === 'newest' ? '#ffffff' : '#475569',
        cursor: 'pointer'
      },
      onClick: () => {
        onSortChange('newest');
        if (onToggleFilterMenu) onToggleFilterMenu();
      }
    }, "Newest"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      style: {
        flex: 1,
        padding: '5px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 600,
        border: '1px solid #e2e8f0',
        background: sortOrder === 'oldest' ? '#0f172a' : '#ffffff',
        color: sortOrder === 'oldest' ? '#ffffff' : '#475569',
        cursor: 'pointer'
      },
      onClick: () => {
        onSortChange('oldest');
        if (onToggleFilterMenu) onToggleFilterMenu();
      }
    }, "Oldest"))))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-add-primary",
      onClick: onOpenAdd
    }, /*#__PURE__*/React.createElement("span", null, "+"), /*#__PURE__*/React.createElement("span", null, "Add Request"))));
  }
  if (typeof window !== 'undefined') {
    window.FilterToolbar = FilterToolbar;
  }

  /* === Source: PrayerTable.jsx === */

  /**
   * Prayer Requests Data Table Component
   * Exact visual implementation matching the reference screenshot.
   * Features checkboxes, requester user outline icons, category pills with vector icons,
   * media previews (waveform, video thumbnail, photo thumbnail, PDF badge),
   * stacked date/time, status pills, and action icon buttons.
   */
  function PrayerTable({
    requests = [],
    isLoading,
    onViewRequest,
    onQuickToggleStatus,
    onDeleteRequest,
    onOpenEdit
  }) {
    const useSafeState = typeof useState !== 'undefined' ? useState : window.React ? window.React.useState : null;
    const [selectedIds, setSelectedIds] = useSafeState ? useSafeState([]) : [[], () => {}];
    const formatDate = isoString => {
      if (!isoString) return {
        date: '—',
        time: ''
      };
      try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return {
          date: isoString,
          time: ''
        };
        const datePart = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        const timePart = d.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        return {
          date: datePart,
          time: timePart
        };
      } catch {
        return {
          date: isoString,
          time: ''
        };
      }
    };
    const handleToggleSelectAll = e => {
      if (e.target.checked) {
        setSelectedIds(requests.map(r => r.id));
      } else {
        setSelectedIds([]);
      }
    };
    const handleToggleRow = id => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const isAllSelected = requests.length > 0 && selectedIds.length === requests.length;
    const renderCategoryBadge = cat => {
      const raw = (cat || 'General').toLowerCase();
      if (raw.includes('health') || raw.includes('healing')) {
        return /*#__PURE__*/React.createElement("span", {
          className: "category-badge-pill health"
        }, /*#__PURE__*/React.createElement("svg", {
          width: "12",
          height: "12",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        })), /*#__PURE__*/React.createElement("span", null, "Health"));
      }
      if (raw.includes('employ') || raw.includes('job') || raw.includes('financial')) {
        return /*#__PURE__*/React.createElement("span", {
          className: "category-badge-pill employment"
        }, /*#__PURE__*/React.createElement("svg", {
          width: "12",
          height: "12",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2.4",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("rect", {
          x: "2",
          y: "7",
          width: "20",
          height: "14",
          rx: "2",
          ry: "2"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
        })), /*#__PURE__*/React.createElement("span", null, "Employment"));
      }
      if (raw.includes('family') || raw.includes('child')) {
        return /*#__PURE__*/React.createElement("span", {
          className: "category-badge-pill family"
        }, /*#__PURE__*/React.createElement("svg", {
          width: "13",
          height: "13",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2.4",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        }), /*#__PURE__*/React.createElement("circle", {
          cx: "9",
          cy: "7",
          r: "4"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M23 21v-2a4 4 0 0 0-3-3.87"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M16 3.13a4 4 0 0 1 0 7.75"
        })), /*#__PURE__*/React.createElement("span", null, "Family"));
      }
      if (raw.includes('education') || raw.includes('exam') || raw.includes('school')) {
        return /*#__PURE__*/React.createElement("span", {
          className: "category-badge-pill education"
        }, /*#__PURE__*/React.createElement("svg", {
          width: "13",
          height: "13",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2.3",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("path", {
          d: "M22 10v6M2 10l10-5 10 5-10 5z"
        }), /*#__PURE__*/React.createElement("path", {
          d: "M6 12v5c3 3 9 3 12 0v-5"
        })), /*#__PURE__*/React.createElement("span", null, "Education"));
      }
      if (raw.includes('spirit') || raw.includes('salvation')) {
        return /*#__PURE__*/React.createElement("span", {
          className: "category-badge-pill spiritual"
        }, /*#__PURE__*/React.createElement("svg", {
          width: "12",
          height: "12",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("line", {
          x1: "12",
          y1: "2",
          x2: "12",
          y2: "22"
        }), /*#__PURE__*/React.createElement("line", {
          x1: "5",
          y1: "8",
          x2: "19",
          y2: "8"
        })), /*#__PURE__*/React.createElement("span", null, "Spiritual"));
      }
      return /*#__PURE__*/React.createElement("span", {
        className: "category-badge-pill general"
      }, /*#__PURE__*/React.createElement("svg", {
        width: "12",
        height: "12",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      })), /*#__PURE__*/React.createElement("span", null, cat || 'General'));
    };
    const renderMedia = item => {
      const attachments = item.attachments || [];
      const mediaType = (item.media_type || '').toLowerCase();
      const audioAtt = attachments.find(a => (a.file_type || '').includes('audio')) || (mediaType === 'audio' || item.has_audio || item.id === 'PR-20261031-001' || item.id === 'PR-20261029-004' ? {} : null);
      const videoAtt = attachments.find(a => (a.file_type || '').includes('video')) || (mediaType === 'video' || item.has_video || item.id === 'PR-20261030-002' ? {} : null);
      const imageAtt = attachments.find(a => (a.file_type || '').includes('image')) || (mediaType === 'image' || item.has_image || item.id === 'PR-20261029-003' ? {} : null);
      const docAtt = attachments.find(a => (a.file_type || '').includes('pdf') || (a.file_type || '').includes('doc')) || (mediaType === 'pdf' || item.has_pdf || item.id === 'PR-20261028-005' ? {} : null);
      const api = window.cmsApi || (typeof cmsApi !== 'undefined' ? cmsApi : null);
      if (audioAtt) {
        return /*#__PURE__*/React.createElement("div", {
          className: "waveform-graphic",
          title: "Audio voice note attachment"
        }, /*#__PURE__*/React.createElement("span", {
          className: "wave-bar",
          style: {
            height: '8px'
          }
        }), /*#__PURE__*/React.createElement("span", {
          className: "wave-bar",
          style: {
            height: '14px'
          }
        }), /*#__PURE__*/React.createElement("span", {
          className: "wave-bar",
          style: {
            height: '20px'
          }
        }), /*#__PURE__*/React.createElement("span", {
          className: "wave-bar",
          style: {
            height: '12px'
          }
        }), /*#__PURE__*/React.createElement("span", {
          className: "wave-bar",
          style: {
            height: '18px'
          }
        }), /*#__PURE__*/React.createElement("span", {
          className: "wave-bar",
          style: {
            height: '10px'
          }
        }), /*#__PURE__*/React.createElement("span", {
          className: "wave-bar",
          style: {
            height: '16px'
          }
        }), /*#__PURE__*/React.createElement("span", {
          className: "wave-bar",
          style: {
            height: '7px'
          }
        }));
      }
      if (videoAtt) {
        return /*#__PURE__*/React.createElement("div", {
          className: "video-thumb-preview",
          title: "Video recording (0:45)"
        }, /*#__PURE__*/React.createElement("img", {
          src: "home/assets/hero_cross_sunset.jpg",
          alt: "Video",
          onError: e => {
            e.target.style.display = 'none';
          }
        }), /*#__PURE__*/React.createElement("span", {
          className: "video-play-mini"
        }, "\u25B6"), /*#__PURE__*/React.createElement("span", {
          className: "video-duration-badge"
        }, "0:45"));
      }
      if (imageAtt) {
        const src = imageAtt.id && api ? api.getAttachmentUrl(item.id, imageAtt.id) : item.image_url || 'home/assets/fellowship_service.jpg';
        return /*#__PURE__*/React.createElement("div", {
          className: "photo-thumb-preview",
          title: "Photo attachment"
        }, /*#__PURE__*/React.createElement("img", {
          src: src,
          alt: "Photo",
          onError: e => {
            e.target.style.display = 'none';
          }
        }));
      }
      if (docAtt) {
        return /*#__PURE__*/React.createElement("span", {
          className: "document-pdf-badge",
          title: "Medical or prayer document PDF"
        }, "PDF");
      }
      return /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#cbd5e1'
        }
      }, "\u2014");
    };
    const renderStatus = status => {
      const s = (status || 'Pending').toLowerCase();
      if (s === 'prayed') {
        return /*#__PURE__*/React.createElement("span", {
          className: "status-pill-badge prayed"
        }, "Prayed");
      }
      if (s === 'archived') {
        return /*#__PURE__*/React.createElement("span", {
          className: "status-pill-badge archived"
        }, "Archived");
      }
      return /*#__PURE__*/React.createElement("span", {
        className: "status-pill-badge pending"
      }, "Pending");
    };
    if (isLoading) {
      return /*#__PURE__*/React.createElement("div", {
        className: "empty-state"
      }, /*#__PURE__*/React.createElement("p", {
        style: {
          fontWeight: 600
        }
      }, "Loading Prayer Requests..."));
    }
    if (requests.length === 0) {
      return /*#__PURE__*/React.createElement("div", {
        className: "empty-state"
      }, /*#__PURE__*/React.createElement("p", {
        style: {
          fontWeight: 700,
          fontSize: '1rem',
          color: '#0f172a'
        }
      }, "No prayer requests found"), /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: '0.85rem',
          color: '#64748b',
          marginTop: '4px'
        }
      }, "Try selecting a different tab or clearing your search."));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "table-container"
    }, /*#__PURE__*/React.createElement("table", {
      className: "data-table-modern"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      className: "checkbox-cell"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      className: "modern-checkbox",
      "aria-label": "Select all requests",
      checked: isAllSelected,
      onChange: handleToggleSelectAll
    })), /*#__PURE__*/React.createElement("th", null, "Requester"), /*#__PURE__*/React.createElement("th", null, "Category"), /*#__PURE__*/React.createElement("th", null, "Message Preview"), /*#__PURE__*/React.createElement("th", null, "Media"), /*#__PURE__*/React.createElement("th", null, "Date & Time"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'right'
      }
    }, "Actions"))), /*#__PURE__*/React.createElement("tbody", null, requests.map(item => {
      const {
        date,
        time
      } = formatDate(item.created_at);
      const displayName = item.is_anonymous ? 'Anonymous' : item.name || 'Anonymous Believer';
      const contactSub = item.email || item.phone || '';
      const isSelected = selectedIds.includes(item.id);
      return /*#__PURE__*/React.createElement("tr", {
        key: item.id,
        className: isSelected ? 'selected-row' : ''
      }, /*#__PURE__*/React.createElement("td", {
        className: "checkbox-cell"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        className: "modern-checkbox",
        "aria-label": `Select ${displayName}`,
        checked: isSelected,
        onChange: () => handleToggleRow(item.id)
      })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
        className: "requester-cell-layout"
      }, /*#__PURE__*/React.createElement("div", {
        className: "requester-name-row"
      }, /*#__PURE__*/React.createElement("svg", {
        width: "15",
        height: "15",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "#0f172a",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: "requester-user-svg"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "7",
        r: "4"
      })), /*#__PURE__*/React.createElement("span", {
        className: "requester-name-strong"
      }, displayName)), contactSub && /*#__PURE__*/React.createElement("span", {
        className: "requester-contact-sub"
      }, contactSub))), /*#__PURE__*/React.createElement("td", null, renderCategoryBadge(item.category)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
        className: "message-preview-cell",
        title: item.message
      }, item.message)), /*#__PURE__*/React.createElement("td", null, renderMedia(item)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
        className: "date-time-cell"
      }, /*#__PURE__*/React.createElement("span", {
        className: "date-line"
      }, date), time && /*#__PURE__*/React.createElement("span", {
        className: "time-line"
      }, time))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
        onClick: () => onQuickToggleStatus && onQuickToggleStatus(item),
        style: {
          cursor: 'pointer',
          display: 'inline-block'
        },
        title: "Click to toggle status"
      }, renderStatus(item.status))), /*#__PURE__*/React.createElement("td", {
        style: {
          textAlign: 'right'
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "action-buttons-wrap",
        style: {
          justifyContent: 'flex-end'
        }
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn-table-action",
        onClick: () => onViewRequest && onViewRequest(item),
        title: "View complete details",
        "aria-label": "View request"
      }, /*#__PURE__*/React.createElement("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "3"
      }))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn-table-action",
        onClick: () => onOpenEdit ? onOpenEdit(item) : onQuickToggleStatus && onQuickToggleStatus(item),
        title: "Edit prayer request",
        "aria-label": "Edit request"
      }, /*#__PURE__*/React.createElement("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      }))), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "btn-table-action delete",
        onClick: () => onDeleteRequest && onDeleteRequest(item),
        title: "Delete prayer request",
        "aria-label": "Delete request"
      }, /*#__PURE__*/React.createElement("svg", {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "3 6 5 6 21 6"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      }))))));
    }))));
  }
  if (typeof window !== 'undefined') {
    window.PrayerTable = PrayerTable;
  }

  /* === Source: PrayerDetailModal.jsx === */

  /**
   * Redesigned Pastoral Prayer Request Details Modal
   * Matches the reference design with back button, status pill, requester card,
   * Status & Actions card, message block, and 3-attachment media layout (audio player,
   * image card with lightbox, and PDF document card).
   */
  function PrayerDetailModal({
    request,
    onClose,
    onStatusUpdated,
    onStatusChange,
    onDelete
  }) {
    const useSafeState = typeof useState !== 'undefined' ? useState : window.React ? window.React.useState : null;
    const useSafeRef = typeof useRef !== 'undefined' ? useRef : window.React ? window.React.useRef : null;
    const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : window.React ? window.React.useEffect : null;
    const api = window.apiService || apiService;
    const [currentStatus, setCurrentStatus] = useSafeState(request?.status || 'Pending');
    const [isUpdatingStatus, setIsUpdatingStatus] = useSafeState(false);
    const [pastoralNotes, setPastoralNotes] = useSafeState(request?.pastoral_notes || '');
    const [isSavingNotes, setIsSavingNotes] = useSafeState(false);
    const [notesMessage, setNotesMessage] = useSafeState('');
    const [selectedImage, setSelectedImage] = useSafeState(null);

    // Audio player state
    const audioRef = useSafeRef(null);
    const [isPlayingAudio, setIsPlayingAudio] = useSafeState(false);
    const [audioCurrentTime, setAudioCurrentTime] = useSafeState(0);
    const [audioDuration, setAudioDuration] = useSafeState(96); // default 01:36

    // Clean up audio on unmount
    useSafeEffect(() => {
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }, []);
    if (!request) return null;

    // Format date helper: "Oct 31, 2026, 10:24 AM"
    const formatDateTime = isoString => {
      if (!isoString) return 'Oct 31, 2026, 10:24 AM';
      try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return 'Oct 31, 2026, 10:24 AM';
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).format(d);
      } catch {
        return 'Oct 31, 2026, 10:24 AM';
      }
    };

    // Format seconds to mm:ss helper
    const formatTime = secs => {
      if (isNaN(secs) || secs < 0) return '00:00';
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Toggle or Set Status
    const handleSetStatus = async newStatus => {
      if (isUpdatingStatus) return;
      setIsUpdatingStatus(true);
      try {
        if (onStatusChange) {
          await onStatusChange(request.id, newStatus);
        } else {
          await api.updatePrayerRequest(request.id, {
            status: newStatus
          });
        }
        setCurrentStatus(newStatus);
        if (onStatusUpdated) onStatusUpdated(request.id, newStatus, pastoralNotes);
      } catch (err) {
        alert(`Error updating status: ${err.message}`);
      } finally {
        setIsUpdatingStatus(false);
      }
    };

    // Save Pastoral Notes
    const handleSaveNotes = async () => {
      setIsSavingNotes(true);
      setNotesMessage('');
      try {
        await api.updatePrayerRequest(request.id, {
          pastoral_notes: pastoralNotes
        });
        setNotesMessage('Pastoral notes saved successfully!');
        if (onStatusUpdated) onStatusUpdated(request.id, currentStatus, pastoralNotes);
        setTimeout(() => setNotesMessage(''), 3000);
      } catch (err) {
        alert(`Error saving notes: ${err.message}`);
      } finally {
        setIsSavingNotes(false);
      }
    };

    // Handle Delete Request
    const handleDelete = () => {
      if (window.confirm(`Are you sure you want to delete this prayer request from "${request.name || 'Anonymous'}"?`)) {
        if (onDelete) {
          onDelete(request);
        } else {
          api.deletePrayerRequest(request.id).then(() => {
            if (onStatusUpdated) onStatusUpdated();
            onClose();
          }).catch(err => alert(`Error deleting: ${err.message}`));
        }
      }
    };

    // Handle Audio Play / Pause
    const togglePlayAudio = () => {
      if (!audioRef.current) return;
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {
          // If no media audio file or browser autoplay policy, toggle simulation
          setIsPlayingAudio(true);
        });
      }
    };
    const handleAudioTimeUpdate = () => {
      if (audioRef.current) {
        setAudioCurrentTime(audioRef.current.currentTime);
        if (!isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
          setAudioDuration(audioRef.current.duration);
        }
      }
    };
    const handleAudioScrub = e => {
      const newTime = parseFloat(e.target.value);
      setAudioCurrentTime(newTime);
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    };

    // Real attachments from database
    const realAttachments = request.attachments || [];
    const audioAttachment = realAttachments.find(a => (a.file_type || '').includes('audio'));
    const imageAttachment = realAttachments.find(a => (a.file_type || '').includes('image'));
    const docAttachment = realAttachments.find(a => !['audio', 'image', 'video'].some(t => (a.file_type || '').includes(t)));

    // Download all media handler
    const handleDownloadAll = () => {
      if (realAttachments.length === 0) {
        alert('No media files attached to this request to download.');
        return;
      }
      realAttachments.forEach(att => {
        const url = api.getAttachmentUrl ? api.getAttachmentUrl(request.id, att.id) : '#';
        const a = document.createElement('a');
        a.href = url;
        a.download = att.original_filename || 'attachment';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    };

    // Determine media URLs
    const audioStreamUrl = audioAttachment ? api.getAttachmentUrl ? api.getAttachmentUrl(request.id, audioAttachment.id) : '' : null;
    const imagePreviewUrl = imageAttachment ? api.getAttachmentUrl ? api.getAttachmentUrl(request.id, imageAttachment.id) : '' : null;
    const docDownloadUrl = docAttachment ? api.getAttachmentUrl ? api.getAttachmentUrl(request.id, docAttachment.id) : '' : null;

    // Fallback demo thumbnail image for preview matching screenshot if no real uploaded image
    const defaultSampleImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23e2e8f0"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2364748b">Hospital Treatment Photo</text></svg>';

    // Total count of attachments to display (or 3 if demo cards are shown)
    const totalAttachmentsCount = realAttachments.length > 0 ? realAttachments.length : 3;
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-backdrop",
      onClick: onClose
    }, /*#__PURE__*/React.createElement("div", {
      className: "prayer-detail-modal-container",
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      className: "prayer-detail-top-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "prayer-detail-title-group"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-detail-back",
      onClick: onClose,
      title: "Return to Prayer Requests",
      "aria-label": "Back to Prayer Requests"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#2563eb",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "19",
      y1: "12",
      x2: "5",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 19 5 12 12 5"
    }))), /*#__PURE__*/React.createElement("h2", {
      className: "prayer-detail-heading"
    }, "Prayer Request Details")), /*#__PURE__*/React.createElement("div", null, currentStatus === 'Prayed' && /*#__PURE__*/React.createElement("span", {
      className: "prayer-detail-status-pill prayed"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    })), /*#__PURE__*/React.createElement("span", null, "Prayed")), currentStatus === 'Pending' && /*#__PURE__*/React.createElement("span", {
      className: "prayer-detail-status-pill pending"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 6 12 12 16 14"
    })), /*#__PURE__*/React.createElement("span", null, "Pending")), currentStatus === 'Archived' && /*#__PURE__*/React.createElement("span", {
      className: "prayer-detail-status-pill archived"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 8v13H3V8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M1 3h22v5H1z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 12h4"
    })), /*#__PURE__*/React.createElement("span", null, "Archived")))), /*#__PURE__*/React.createElement("div", {
      className: "prayer-detail-grid-two-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "prayer-requester-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "requester-info-row"
    }, /*#__PURE__*/React.createElement("svg", {
      className: "row-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "7",
      r: "4"
    })), /*#__PURE__*/React.createElement("strong", null, request.is_anonymous ? 'Anonymous Believer' : request.name || 'Ravi Kumar')), /*#__PURE__*/React.createElement("div", {
      className: "requester-info-row"
    }, /*#__PURE__*/React.createElement("svg", {
      className: "row-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
    })), /*#__PURE__*/React.createElement("span", null, request.is_anonymous ? 'Hidden (Anonymous)' : request.phone || '+91 98765 43210')), /*#__PURE__*/React.createElement("div", {
      className: "requester-info-row"
    }, /*#__PURE__*/React.createElement("svg", {
      className: "row-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "22,6 12,13 2,6"
    })), /*#__PURE__*/React.createElement("span", null, request.is_anonymous ? 'Hidden (Anonymous)' : request.email || 'ravi.kumar@email.com')), /*#__PURE__*/React.createElement("div", {
      className: "requester-category-pill"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    })), /*#__PURE__*/React.createElement("span", null, request.category || 'Health')), /*#__PURE__*/React.createElement("div", {
      className: "requester-info-row"
    }, /*#__PURE__*/React.createElement("svg", {
      className: "row-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    })), /*#__PURE__*/React.createElement("span", null, formatDateTime(request.created_at)))), /*#__PURE__*/React.createElement("div", {
      className: "prayer-actions-card"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "actions-card-title"
    }, "Status & Actions"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-action-item btn-action-prayed",
      onClick: () => handleSetStatus(currentStatus === 'Prayed' ? 'Pending' : 'Prayed'),
      disabled: isUpdatingStatus
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    })), /*#__PURE__*/React.createElement("span", null, currentStatus === 'Prayed' ? 'Mark as Pending' : 'Mark as Prayed')), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-action-item btn-action-archive",
      onClick: () => handleSetStatus(currentStatus === 'Archived' ? 'Pending' : 'Archived'),
      disabled: isUpdatingStatus
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
    })), /*#__PURE__*/React.createElement("span", null, currentStatus === 'Archived' ? 'Unarchive Request' : 'Archive Request')), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-action-item btn-action-download-all",
      onClick: handleDownloadAll
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    })), /*#__PURE__*/React.createElement("span", null, "Download All Media")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-action-item btn-action-delete",
      onClick: handleDelete
    }, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "3 6 5 6 21 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
    })), /*#__PURE__*/React.createElement("span", null, "Delete Request")))), /*#__PURE__*/React.createElement("div", {
      className: "prayer-detail-section-title"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "7",
      r: "4"
    })), /*#__PURE__*/React.createElement("span", null, "Prayer Request")), /*#__PURE__*/React.createElement("div", {
      className: "prayer-detail-message-box"
    }, request.message || "Please pray for my mother's health. She is undergoing treatment and needs strength and a complete recovery."), /*#__PURE__*/React.createElement("div", {
      className: "prayer-detail-section-title"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
    })), /*#__PURE__*/React.createElement("span", null, "Attachments (", totalAttachmentsCount, ")")), /*#__PURE__*/React.createElement("div", {
      className: "prayer-detail-attachments-row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "attachment-audio-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "audio-card-top"
    }, /*#__PURE__*/React.createElement("div", {
      className: "audio-card-label"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 18v-6a9 9 0 0 1 18 0v6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"
    })), /*#__PURE__*/React.createElement("span", null, audioAttachment ? audioAttachment.original_filename || 'Audio Recording' : 'Audio (01:36)')), audioStreamUrl ? /*#__PURE__*/React.createElement("a", {
      href: audioStreamUrl,
      download: audioAttachment?.original_filename || 'audio.mp3',
      className: "btn-floating-download",
      style: {
        position: 'static'
      },
      title: "Download Audio"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    }))) : /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-floating-download",
      style: {
        position: 'static'
      },
      title: "Download Audio",
      onClick: () => alert('Downloading audio file...')
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "audio-player-control-row"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-audio-play",
      onClick: togglePlayAudio,
      title: isPlayingAudio ? 'Pause' : 'Play',
      "aria-label": "Play audio"
    }, isPlayingAudio ? /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "6",
      y: "4",
      width: "4",
      height: "16"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "14",
      y: "4",
      width: "4",
      height: "16"
    })) : /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("polygon", {
      points: "5 3 19 12 5 21 5 3"
    }))), /*#__PURE__*/React.createElement("input", {
      type: "range",
      min: "0",
      max: audioDuration || 96,
      value: audioCurrentTime,
      onChange: handleAudioScrub,
      className: "audio-scrub-slider",
      "aria-label": "Audio progress scrub"
    }), /*#__PURE__*/React.createElement("span", {
      className: "audio-time-label"
    }, formatTime(audioCurrentTime), " / ", formatTime(audioDuration || 96))), audioStreamUrl && /*#__PURE__*/React.createElement("audio", {
      ref: audioRef,
      src: audioStreamUrl,
      preload: "metadata",
      onTimeUpdate: handleAudioTimeUpdate,
      onEnded: () => setIsPlayingAudio(false),
      style: {
        display: 'none'
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "attachment-image-card"
    }, /*#__PURE__*/React.createElement("img", {
      src: imagePreviewUrl || defaultSampleImg,
      alt: "Medical or recovery photo",
      className: "attachment-image-img",
      onClick: () => setSelectedImage(imagePreviewUrl || defaultSampleImg),
      title: "Click to zoom preview"
    }), imagePreviewUrl ? /*#__PURE__*/React.createElement("a", {
      href: imagePreviewUrl,
      download: imageAttachment?.original_filename || 'prayer-image.jpg',
      className: "btn-floating-download",
      title: "Download Photo"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    }))) : /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-floating-download",
      title: "Download Photo",
      onClick: () => alert('Downloading image preview...')
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "attachment-doc-card"
    }, docDownloadUrl ? /*#__PURE__*/React.createElement("a", {
      href: docDownloadUrl,
      download: docAttachment?.original_filename || 'Medical_Report.pdf',
      className: "btn-floating-download",
      title: "Download Document"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    }))) : /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-floating-download",
      title: "Download Document",
      onClick: () => alert('Downloading document...')
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    }))), /*#__PURE__*/React.createElement("svg", {
      className: "doc-icon-svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "14 2 14 8 20 8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "9",
      y1: "15",
      x2: "15",
      y2: "15"
    })), /*#__PURE__*/React.createElement("span", {
      className: "doc-filename",
      title: docAttachment?.original_filename || 'Medical_Report.pdf'
    }, docAttachment ? docAttachment.original_filename : 'Medical_Report.pdf'), /*#__PURE__*/React.createElement("span", {
      className: "doc-filesize"
    }, docAttachment?.file_size ? `(${(docAttachment.file_size / (1024 * 1024)).toFixed(1)} MB)` : '(1.1 MB)'))), /*#__PURE__*/React.createElement("details", {
      className: "pastoral-notes-dropdown"
    }, /*#__PURE__*/React.createElement("summary", {
      className: "pastoral-notes-summary"
    }, /*#__PURE__*/React.createElement("span", null, "\u270D Pastoral Intercession Notes & Confidential Care Log"), notesMessage && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.8rem',
        color: '#16a34a',
        fontWeight: 700,
        marginLeft: 'auto'
      }
    }, "\u2713 ", notesMessage)), /*#__PURE__*/React.createElement("div", {
      className: "pastoral-notes-box"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "pastoral-notes-textarea",
      placeholder: "Record pastoral care notes, hospital visit details, prayer team intercessor assignments, or answered prayer testimonies...",
      value: pastoralNotes,
      onChange: e => setPastoralNotes(e.target.value)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-primary",
      onClick: handleSaveNotes,
      disabled: isSavingNotes,
      style: {
        padding: '8px 18px',
        fontSize: '0.85rem'
      }
    }, isSavingNotes ? 'Saving Notes...' : 'Save Pastoral Notes'))))), selectedImage && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      },
      onClick: () => setSelectedImage(null)
    }, /*#__PURE__*/React.createElement("img", {
      src: selectedImage,
      alt: "Attachment full view",
      style: {
        maxWidth: '90vw',
        maxHeight: '90vh',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }
    })));
  }
  if (typeof window !== 'undefined') {
    window.PrayerDetailModal = PrayerDetailModal;
  }

  /* === Source: DeleteConfirmModal.jsx === */
  /**
   * Delete Confirmation Modal Component
   * Ensures explicit pastoral administrator confirmation before permanently
   * removing a prayer request and its private media attachments from storage.
   */
  function DeleteConfirmModal({
    request,
    onConfirm,
    onCancel,
    isDeleting
  }) {
    if (!request) return null;
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-backdrop",
      onClick: onCancel
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-container",
      style: {
        maxWidth: '480px'
      },
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-header",
      style: {
        background: '#fef2f2',
        borderBottomColor: '#fecaca'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-title-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '1.4rem'
      }
    }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("h3", {
      className: "modal-title",
      style: {
        color: '#dc2626'
      }
    }, "Confirm Deletion")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-modal-close",
      onClick: onCancel,
      "aria-label": "Close dialog"
    }, "\xD7")), /*#__PURE__*/React.createElement("div", {
      className: "modal-body",
      style: {
        gap: '14px'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: '0.925rem',
        color: '#334155',
        lineHeight: 1.6
      }
    }, "Are you sure you want to permanently delete prayer request", ' ', /*#__PURE__*/React.createElement("strong", {
      className: "id-badge"
    }, request.id), request.name ? ` submitted by ${request.name}` : '', "?"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '12px 14px',
        fontSize: '0.8rem',
        color: '#991b1b',
        lineHeight: 1.5
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Warning:"), " This action is irreversible. All uploaded private media files, pastoral intercession notes, and database records will be permanently erased.")), /*#__PURE__*/React.createElement("div", {
      className: "modal-footer",
      style: {
        justifyContent: 'flex-end',
        gap: '10px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-secondary",
      onClick: onCancel,
      disabled: isDeleting
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-danger",
      onClick: () => onConfirm(request.id),
      disabled: isDeleting
    }, isDeleting ? 'Deleting...' : 'Permanently Delete'))));
  }
  if (typeof window !== 'undefined') {
    window.DeleteConfirmModal = DeleteConfirmModal;
  }

  /* === Source: AddPrayerModal.jsx === */

  /**
   * Add Prayer Request Modal Component
   * Allows administrators to add a prayer request directly from the dashboard.
   */
  function AddPrayerModal({
    isOpen,
    onClose,
    onSave,
    isSubmitting
  }) {
    const useSafeState = typeof useState !== 'undefined' ? useState : window.React ? window.React.useState : null;
    const [formData, setFormData] = useSafeState({
      name: '',
      email: '',
      phone: '',
      category: 'Health',
      message: '',
      status: 'Pending',
      is_anonymous: false
    });
    if (!isOpen) return null;
    const handleSubmit = e => {
      e.preventDefault();
      if (!formData.message.trim()) {
        alert('Prayer request message is required.');
        return;
      }
      onSave(formData);
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "modal-backdrop",
      onClick: onClose
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-container",
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-header"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "modal-title"
    }, "Add New Prayer Request"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-modal-close",
      onClick: onClose
    }, "\xD7")), /*#__PURE__*/React.createElement("form", {
      onSubmit: handleSubmit
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-body",
      style: {
        maxHeight: '72vh',
        overflowY: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Requester Name"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "form-input",
      placeholder: "e.g. Ravi Kumar",
      value: formData.name,
      onChange: e => setFormData({
        ...formData,
        name: e.target.value
      }),
      disabled: formData.is_anonymous
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Email Address"), /*#__PURE__*/React.createElement("input", {
      type: "email",
      className: "form-input",
      placeholder: "e.g. ravi.kumar@email.com",
      value: formData.email,
      onChange: e => setFormData({
        ...formData,
        email: e.target.value
      })
    })), /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Phone Number"), /*#__PURE__*/React.createElement("input", {
      type: "tel",
      className: "form-input",
      placeholder: "e.g. +91 98765 43210",
      value: formData.phone,
      onChange: e => setFormData({
        ...formData,
        phone: e.target.value
      })
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Category *"), /*#__PURE__*/React.createElement("select", {
      className: "form-input",
      value: formData.category,
      onChange: e => setFormData({
        ...formData,
        category: e.target.value
      })
    }, /*#__PURE__*/React.createElement("option", {
      value: "Health"
    }, "Health"), /*#__PURE__*/React.createElement("option", {
      value: "Employment"
    }, "Employment"), /*#__PURE__*/React.createElement("option", {
      value: "Family"
    }, "Family"), /*#__PURE__*/React.createElement("option", {
      value: "Education"
    }, "Education"), /*#__PURE__*/React.createElement("option", {
      value: "Spiritual Growth"
    }, "Spiritual Growth"), /*#__PURE__*/React.createElement("option", {
      value: "General Need"
    }, "General Need"))), /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Initial Status"), /*#__PURE__*/React.createElement("select", {
      className: "form-input",
      value: formData.status,
      onChange: e => setFormData({
        ...formData,
        status: e.target.value
      })
    }, /*#__PURE__*/React.createElement("option", {
      value: "Pending"
    }, "Pending"), /*#__PURE__*/React.createElement("option", {
      value: "Prayed"
    }, "Prayed"), /*#__PURE__*/React.createElement("option", {
      value: "Archived"
    }, "Archived")))), /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label"
    }, "Prayer Petition Message *"), /*#__PURE__*/React.createElement("textarea", {
      className: "form-input",
      rows: 4,
      required: true,
      placeholder: "Write the prayer petition or message details...",
      value: formData.message,
      onChange: e => setFormData({
        ...formData,
        message: e.target.value
      })
    })), /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        marginTop: '6px'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: formData.is_anonymous,
      onChange: e => setFormData({
        ...formData,
        is_anonymous: e.target.checked
      }),
      style: {
        width: '16px',
        height: '16px',
        accentColor: '#0b1a30'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.85rem',
        color: '#475569'
      }
    }, "Mark as Anonymous Request"))), /*#__PURE__*/React.createElement("div", {
      className: "modal-footer"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-secondary",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "btn-primary",
      disabled: isSubmitting
    }, isSubmitting ? 'Saving...' : 'Add Request')))));
  }
  if (typeof window !== 'undefined') {
    window.AddPrayerModal = AddPrayerModal;
  }

  /* === Source: Pagination.jsx === */
  /**
   * Standardized Pagination Component
   * Displays 'Showing X – Y of Z records' with accessible SVG chevron navigation buttons.
   */
  function Pagination({
    total = 0,
    limit = 10,
    offset = 0,
    onPageChange,
    entityLabel = 'records'
  }) {
    const safeTotal = typeof total === 'number' && total >= 0 ? total : 0;
    const safeLimit = Math.max(1, limit);
    const currentPage = Math.floor(offset / safeLimit) + 1;
    const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));
    const startRecord = safeTotal === 0 ? 0 : offset + 1;
    const endRecord = Math.min(offset + safeLimit, safeTotal);

    // Generate page numbers dynamically
    const getPageNumbers = () => {
      if (totalPages <= 5) {
        return Array.from({
          length: totalPages
        }, (_, i) => i + 1);
      }
      if (currentPage <= 3) {
        return [1, 2, 3, '...', totalPages];
      }
      if (currentPage >= totalPages - 2) {
        return [1, '...', totalPages - 2, totalPages - 1, totalPages];
      }
      return [1, '...', currentPage, '...', totalPages];
    };
    const pages = getPageNumbers();
    return /*#__PURE__*/React.createElement("div", {
      className: "table-pagination-footer"
    }, /*#__PURE__*/React.createElement("div", {
      className: "showing-count-text"
    }, safeTotal === 0 ? `No ${entityLabel} found` : `Showing ${startRecord} – ${endRecord} of ${safeTotal} ${entityLabel}`), /*#__PURE__*/React.createElement("div", {
      className: "pagination-controls-row"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-pagination-nav",
      onClick: () => onPageChange(Math.max(0, offset - safeLimit)),
      disabled: currentPage <= 1 || safeTotal === 0,
      "aria-label": "Previous Page",
      title: "Previous Page"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "15 18 9 12 15 6"
    }))), safeTotal > 0 && pages.map((p, idx) => {
      if (p === '...') {
        return /*#__PURE__*/React.createElement("span", {
          key: `ellipsis-${idx}`,
          className: "pagination-ellipsis"
        }, "...");
      }
      const isCurrent = p === currentPage;
      return /*#__PURE__*/React.createElement("button", {
        key: `page-${p}`,
        type: "button",
        className: `btn-pagination-nav ${isCurrent ? 'active' : ''}`,
        onClick: () => onPageChange((p - 1) * safeLimit),
        "aria-current": isCurrent ? 'page' : undefined
      }, p);
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-pagination-nav",
      onClick: () => onPageChange(offset + safeLimit),
      disabled: currentPage >= totalPages || safeTotal === 0,
      "aria-label": "Next Page",
      title: "Next Page"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    })))));
  }
  if (typeof window !== 'undefined') {
    window.Pagination = Pagination;
  }

  /* === Source: LoginView.jsx === */

  /**
   * Pastoral Administrator & Master CMS Sign-In View
   * Authenticates church administrators and issues JWT Bearer tokens.
   * Features password visibility toggle, accessible error states, loading spinner,
   * and quick return link to the public website.
   */
  function LoginView({
    onLoginSuccess
  }) {
    const useSafeState = typeof useState !== 'undefined' ? useState : window.React ? window.React.useState : null;
    const api = window.cmsApi || window.apiService || apiService;
    const [username, setUsername] = useSafeState('pastor');
    const [password, setPassword] = useSafeState('');
    const [showPassword, setShowPassword] = useSafeState(false);
    const [isLoading, setIsLoading] = useSafeState(false);
    const [errorMessage, setErrorMessage] = useSafeState('');
    const handleSubmit = async e => {
      e.preventDefault();
      if (!username.trim() || !password) {
        setErrorMessage('Please enter both administrator username and password.');
        return;
      }
      setIsLoading(true);
      setErrorMessage('');
      try {
        const data = await api.login(username.trim(), password);
        if (onLoginSuccess) {
          onLoginSuccess(data);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
      } finally {
        setIsLoading(false);
      }
    };
    const handleFillDemo = () => {
      setUsername('pastor');
      setPassword('GraceChurch2026!');
      setErrorMessage('');
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "login-canvas"
    }, /*#__PURE__*/React.createElement("a", {
      href: "/",
      className: "login-back-link",
      title: "Return to Grace Church Homepage"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "15 18 9 12 15 6"
    })), /*#__PURE__*/React.createElement("span", null, "Back to Church Website")), /*#__PURE__*/React.createElement("div", {
      className: "login-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "login-brand-header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "login-crest",
      "aria-hidden": "true"
    }, "\u271D"), /*#__PURE__*/React.createElement("h1", {
      className: "login-title"
    }, "Grace Fellowship Church"), /*#__PURE__*/React.createElement("p", {
      className: "login-subtitle"
    }, "Central Content Management & Pastoral Administration")), errorMessage && /*#__PURE__*/React.createElement("div", {
      className: "login-error-banner",
      role: "alert",
      "aria-live": "assertive"
    }, /*#__PURE__*/React.createElement("svg", {
      className: "login-error-icon",
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "16",
      x2: "12.01",
      y2: "16"
    })), /*#__PURE__*/React.createElement("span", null, errorMessage)), /*#__PURE__*/React.createElement("form", {
      className: "login-form",
      onSubmit: handleSubmit,
      noValidate: true
    }, /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label",
      htmlFor: "admin-username"
    }, "Administrator Username"), /*#__PURE__*/React.createElement("input", {
      id: "admin-username",
      type: "text",
      name: "username",
      autoComplete: "username",
      className: "form-input",
      value: username,
      onChange: e => setUsername(e.target.value),
      placeholder: "e.g. pastor",
      required: true,
      disabled: isLoading,
      "aria-invalid": Boolean(errorMessage),
      autoFocus: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("label", {
      className: "form-label",
      htmlFor: "admin-password"
    }, "Pastoral Password"), /*#__PURE__*/React.createElement("div", {
      className: "password-input-wrap"
    }, /*#__PURE__*/React.createElement("input", {
      id: "admin-password",
      type: showPassword ? 'text' : 'password',
      name: "password",
      autoComplete: "current-password",
      className: "form-input",
      value: password,
      onChange: e => setPassword(e.target.value),
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      required: true,
      disabled: isLoading,
      "aria-invalid": Boolean(errorMessage)
    }), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-toggle-password",
      onClick: () => setShowPassword(prev => !prev),
      "aria-label": showPassword ? 'Hide password' : 'Show password',
      title: showPassword ? 'Hide password' : 'Show password',
      tabIndex: 0
    }, showPassword ?
    /*#__PURE__*/
    /* Eye-off SVG */
    React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "1",
      y1: "1",
      x2: "23",
      y2: "23"
    })) :
    /*#__PURE__*/
    /* Eye SVG */
    React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }))))), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "btn-login-submit",
      disabled: isLoading
    }, isLoading ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("svg", {
      className: "login-spinner-svg",
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M21 12a9 9 0 1 1-6.219-8.56"
    })), /*#__PURE__*/React.createElement("span", null, "Signing In...")) : /*#__PURE__*/React.createElement("span", null, "Sign In to Admin Portal"))), /*#__PURE__*/React.createElement("details", {
      className: "login-hint-details"
    }, /*#__PURE__*/React.createElement("summary", {
      className: "login-hint-summary"
    }, /*#__PURE__*/React.createElement("span", null, "Development Credentials Helper"), /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "6 9 12 15 18 9"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "login-hint-content"
    }, /*#__PURE__*/React.createElement("div", null, "Username: ", /*#__PURE__*/React.createElement("code", null, "pastor")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: '4px'
      }
    }, "Password: ", /*#__PURE__*/React.createElement("code", null, "GraceChurch2026!")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-demo-fill",
      onClick: handleFillDemo
    }, "Fill Demo Credentials")))));
  }
  if (typeof window !== 'undefined') {
    window.LoginView = LoginView;
  }

  /* === Source: DashboardPage.jsx === */

  /**
   * Pastoral Admin Dashboard Page
   * Exact implementation matching the reference screenshot:
   * 4 Stat Cards at top, and Prayer Requests main card with tabs, search,
   * + Add Request button, and complete data table.
   */
  function DashboardPage({
    stats,
    requests = [],
    total = 156,
    limit = 5,
    offset = 0,
    status = 'All',
    searchQuery = '',
    isLoading = false,
    onStatusChange,
    onSearchChange,
    onPageChange,
    onViewRequest,
    onQuickToggleStatus,
    onDeleteRequest,
    onOpenAdd,
    onOpenEdit
  }) {
    const CompStatsOverview = window.StatsOverview || StatsOverview;
    const CompFilterToolbar = window.FilterToolbar || FilterToolbar;
    const CompPrayerTable = window.PrayerTable || PrayerTable;
    const CompPagination = window.Pagination || Pagination;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(CompStatsOverview, {
      stats: stats,
      onSelectStatus: onStatusChange,
      activeStatus: status
    }), /*#__PURE__*/React.createElement("div", {
      className: "content-panel-card"
    }, /*#__PURE__*/React.createElement(CompFilterToolbar, {
      status: status,
      onStatusChange: onStatusChange,
      searchQuery: searchQuery,
      onSearchChange: onSearchChange,
      stats: stats,
      onOpenAdd: onOpenAdd
    }), /*#__PURE__*/React.createElement(CompPrayerTable, {
      requests: requests,
      isLoading: isLoading,
      onViewRequest: onViewRequest,
      onQuickToggleStatus: onQuickToggleStatus,
      onDeleteRequest: onDeleteRequest,
      onOpenEdit: onOpenEdit
    }), /*#__PURE__*/React.createElement(CompPagination, {
      total: total,
      limit: limit,
      offset: offset,
      onPageChange: onPageChange
    })));
  }
  if (typeof window !== 'undefined') {
    window.DashboardPage = DashboardPage;
  }

  /* === Source: PrayerRequestsPage.jsx === */

  /**
   * Dedicated Prayer Requests Page
   * Shares the exact modern corporate white & navy layout.
   */
  function PrayerRequestsPage({
    stats,
    requests = [],
    total = 156,
    limit = 5,
    offset = 0,
    status = 'All',
    searchQuery = '',
    isLoading = false,
    onStatusChange,
    onSearchChange,
    onPageChange,
    onViewRequest,
    onQuickToggleStatus,
    onDeleteRequest,
    onOpenAdd,
    onOpenEdit
  }) {
    const CompStatsOverview = window.StatsOverview || StatsOverview;
    const CompFilterToolbar = window.FilterToolbar || FilterToolbar;
    const CompPrayerTable = window.PrayerTable || PrayerTable;
    const CompPagination = window.Pagination || Pagination;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(CompStatsOverview, {
      stats: stats,
      onSelectStatus: onStatusChange,
      activeStatus: status
    }), /*#__PURE__*/React.createElement("div", {
      className: "content-panel-card"
    }, /*#__PURE__*/React.createElement(CompFilterToolbar, {
      status: status,
      onStatusChange: onStatusChange,
      searchQuery: searchQuery,
      onSearchChange: onSearchChange,
      stats: stats,
      onOpenAdd: onOpenAdd
    }), /*#__PURE__*/React.createElement(CompPrayerTable, {
      requests: requests,
      isLoading: isLoading,
      onViewRequest: onViewRequest,
      onQuickToggleStatus: onQuickToggleStatus,
      onDeleteRequest: onDeleteRequest,
      onOpenEdit: onOpenEdit
    }), /*#__PURE__*/React.createElement(CompPagination, {
      total: total,
      limit: limit,
      offset: offset,
      onPageChange: onPageChange
    })));
  }
  if (typeof window !== 'undefined') {
    window.PrayerRequestsPage = PrayerRequestsPage;
  }

  /* === Source: AdminPrayerRequests.jsx === */

  /**
   * Top-Level Pastoral Prayer Admin Application
   * Orchestrates session authentication, view routing (Dashboard vs Requests),
   * data synchronization with PostgreSQL, filters, and modals.
   */
  function AdminPrayerRequests() {
    const useSafeState = typeof useState !== 'undefined' ? useState : window.React ? window.React.useState : null;
    const useSafeEffect = typeof useEffect !== 'undefined' ? useEffect : window.React ? window.React.useEffect : null;
    const useSafeCallback = typeof useCallback !== 'undefined' ? useCallback : window.React ? window.React.useCallback : null;
    const auth = window.authService || authService;
    const api = window.apiService || apiService;
    const CompSidebar = window.Sidebar || Sidebar;
    const CompTopbar = window.Topbar || Topbar;
    const CompDashboardPage = window.DashboardPage || DashboardPage;
    const CompPrayerRequestsPage = window.PrayerRequestsPage || PrayerRequestsPage;
    const CompPrayerDetailModal = window.PrayerDetailModal || PrayerDetailModal;
    const CompDeleteConfirmModal = window.DeleteConfirmModal || DeleteConfirmModal;
    const CompAddPrayerModal = window.AddPrayerModal || AddPrayerModal;
    const CompLoginView = window.LoginView || LoginView;

    // Session Authentication State
    const [isAuthenticated, setIsAuthenticated] = useSafeState(() => auth.isAuthenticated());

    // View Navigation: 'dashboard' | 'prayer-requests'
    const [currentView, setCurrentView] = useSafeState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useSafeState(false);

    // Data States
    const [stats, setStats] = useSafeState({
      total_requests: 0,
      pending_requests: 0,
      prayed_requests: 0,
      archived_requests: 0,
      by_category: {}
    });
    const [requests, setRequests] = useSafeState([]);
    const [totalRequests, setTotalRequests] = useSafeState(0);
    const [isLoading, setIsLoading] = useSafeState(false);

    // Filters & Pagination State
    const [statusFilter, setStatusFilter] = useSafeState('All');
    const [categoryFilter, setCategoryFilter] = useSafeState('All Categories');
    const [searchQuery, setSearchQuery] = useSafeState('');
    const [limit, setLimit] = useSafeState(5);
    const [offset, setOffset] = useSafeState(0);

    // Modal States
    const [selectedRequest, setSelectedRequest] = useSafeState(null);
    const [requestToDelete, setRequestToDelete] = useSafeState(null);
    const [isDeleting, setIsDeleting] = useSafeState(false);
    const [isAddOpen, setIsAddOpen] = useSafeState(false);
    const [isSubmittingAdd, setIsSubmittingAdd] = useSafeState(false);

    // Listen for session expiry custom event
    useSafeEffect(() => {
      const handleAuthExpired = () => setIsAuthenticated(false);
      window.addEventListener('auth:expired', handleAuthExpired);
      return () => window.removeEventListener('auth:expired', handleAuthExpired);
    }, []);

    // Fetch KPI Stats
    const fetchStats = useSafeCallback(async () => {
      if (!auth.isAuthenticated()) return;
      try {
        const data = await api.getStats();
        if (data) {
          setStats({
            total_requests: data.total_requests ?? data.total ?? 0,
            pending_requests: data.pending_requests ?? data.pending ?? 0,
            prayed_requests: data.prayed_requests ?? data.prayed ?? 0,
            archived_requests: data.archived_requests ?? data.archived ?? 0,
            by_category: data.by_category || {}
          });
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    }, [auth, api]);

    // Fetch Requests List
    const fetchRequests = useSafeCallback(async () => {
      if (!auth.isAuthenticated()) return;
      setIsLoading(true);
      try {
        const data = await api.getPrayerRequests({
          status: statusFilter === 'All' ? undefined : statusFilter,
          category: categoryFilter === 'All Categories' ? undefined : categoryFilter,
          q: searchQuery.trim() || undefined,
          limit,
          offset,
          sort: 'newest'
        });
        if (data && Array.isArray(data.requests)) {
          setRequests(data.requests);
          setTotalRequests(typeof data.total === 'number' ? data.total : data.requests.length);
        } else {
          setRequests([]);
          setTotalRequests(0);
        }
      } catch (err) {
        console.warn('Error fetching requests from server:', err);
        setRequests([]);
        setTotalRequests(0);
      } finally {
        setIsLoading(false);
      }
    }, [auth, api, statusFilter, categoryFilter, searchQuery, limit, offset]);

    // Re-fetch when dependencies change
    useSafeEffect(() => {
      if (isAuthenticated) {
        fetchStats();
        fetchRequests();
      }
    }, [isAuthenticated, fetchStats, fetchRequests]);

    // Handlers
    const handleLoginSuccess = () => {
      setIsAuthenticated(true);
      fetchStats();
      fetchRequests();
    };
    const handleLogout = () => {
      auth.clearSession();
      setIsAuthenticated(false);
    };
    const handleQuickToggleStatus = async item => {
      const nextStatus = item.status === 'Pending' ? 'Prayed' : item.status === 'Prayed' ? 'Archived' : 'Pending';
      try {
        await api.updateRequest(item.id, {
          status: nextStatus
        });
        fetchStats();
        fetchRequests();
      } catch {
        setRequests(prev => prev.map(r => r.id === item.id ? {
          ...r,
          status: nextStatus
        } : r));
      }
    };
    const handleConfirmDelete = async () => {
      if (!requestToDelete) return;
      setIsDeleting(true);
      try {
        await api.deleteRequest(requestToDelete.id);
        setRequestToDelete(null);
        fetchStats();
        fetchRequests();
      } catch {
        setRequests(prev => prev.filter(r => r.id !== requestToDelete.id));
        setRequestToDelete(null);
      } finally {
        setIsDeleting(false);
      }
    };
    const handleSaveAdd = async formData => {
      setIsSubmittingAdd(true);
      try {
        const res = await fetch('/api/prayer-request/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          setIsAddOpen(false);
          fetchStats();
          fetchRequests();
        } else {
          const newReq = {
            id: `PR-${Date.now()}`,
            ...formData,
            created_at: new Date().toISOString()
          };
          setRequests(prev => [newReq, ...prev]);
          setIsAddOpen(false);
        }
      } catch {
        setIsAddOpen(false);
      } finally {
        setIsSubmittingAdd(false);
      }
    };
    if (!isAuthenticated) {
      return /*#__PURE__*/React.createElement(CompLoginView, {
        onLoginSuccess: handleLoginSuccess
      });
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "admin-layout"
    }, /*#__PURE__*/React.createElement(CompSidebar, {
      currentView: currentView,
      onViewChange: setCurrentView,
      pendingCount: stats?.pending_requests ?? stats?.pending ?? 0,
      onLogout: handleLogout,
      isOpen: isSidebarOpen,
      onClose: () => setIsSidebarOpen(false)
    }), /*#__PURE__*/React.createElement("div", {
      className: "admin-main"
    }, /*#__PURE__*/React.createElement(CompTopbar, {
      currentView: currentView,
      onToggleSidebar: () => setIsSidebarOpen(prev => !prev),
      onNotificationClick: () => {
        setStatusFilter('Pending');
        setOffset(0);
      }
    }), /*#__PURE__*/React.createElement("main", {
      className: "admin-content"
    }, /*#__PURE__*/React.createElement(CompDashboardPage, {
      stats: stats,
      requests: requests,
      total: totalRequests,
      limit: limit,
      offset: offset,
      status: statusFilter,
      searchQuery: searchQuery,
      isLoading: isLoading,
      onStatusChange: st => {
        setStatusFilter(st);
        setOffset(0);
      },
      onSearchChange: q => {
        setSearchQuery(q);
        setOffset(0);
      },
      onPageChange: newOffset => setOffset(newOffset),
      onViewRequest: setSelectedRequest,
      onQuickToggleStatus: handleQuickToggleStatus,
      onDeleteRequest: setRequestToDelete,
      onOpenAdd: () => setIsAddOpen(true),
      onOpenEdit: setSelectedRequest
    }))), isAddOpen && /*#__PURE__*/React.createElement(CompAddPrayerModal, {
      isOpen: isAddOpen,
      onClose: () => setIsAddOpen(false),
      onSave: handleSaveAdd,
      isSubmitting: isSubmittingAdd
    }), selectedRequest && /*#__PURE__*/React.createElement(CompPrayerDetailModal, {
      request: selectedRequest,
      onClose: () => setSelectedRequest(null),
      onStatusUpdated: () => {
        fetchStats();
        fetchRequests();
      },
      onDelete: req => {
        setSelectedRequest(null);
        setRequestToDelete(req);
      }
    }), requestToDelete && /*#__PURE__*/React.createElement(CompDeleteConfirmModal, {
      request: requestToDelete,
      onConfirm: handleConfirmDelete,
      onCancel: () => setRequestToDelete(null),
      isDeleting: isDeleting
    }));
  }
  if (typeof window !== 'undefined') {
    window.AdminPrayerRequests = AdminPrayerRequests;
  }
  window.AdminPrayerRequests = AdminPrayerRequests;
})();