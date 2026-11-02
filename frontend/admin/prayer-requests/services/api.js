/**
 * Pastoral Admin API Service
 * Handles authentication, statistics, prayer requests listing, filtering, updates, deletion,
 * and secure attachment access with JWT authentication.
 */

const TOKEN_KEY = 'grace_church_admin_token';
const USER_KEY = 'grace_church_admin_user';

export const authService = {
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
      return raw ? JSON.parse(raw) : { username: 'pastor', role: 'admin' };
    } catch {
      return { username: 'pastor', role: 'admin' };
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
  },
};

/**
 * Common fetch helper that automatically adds JWT bearer token and handles errors.
 */
async function request(endpoint, options = {}) {
  const token = authService.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
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

export const apiService = {
  /**
   * Pastoral administrator login
   */
  async login(username, password) {
    const data = await request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (data && data.access_token) {
      authService.setSession(data.access_token, {
        username: data.username || username,
        role: data.role || 'admin',
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
  async getPrayerRequests({ category, status, q, limit = 25, offset = 0, sort = 'newest' } = {}) {
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
  async updatePrayerRequest(id, { status, pastoral_notes }) {
    const payload = {};
    if (status !== undefined) payload.status = status;
    if (pastoral_notes !== undefined) payload.pastoral_notes = pastoral_notes;

    return request(`/api/admin/prayer-requests/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete prayer request and private files
   */
  async deletePrayerRequest(id) {
    return request(`/api/admin/prayer-requests/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  /**
   * Generate secure media stream / download URL with token query param
   */
  getAttachmentUrl(requestId, attachmentId) {
    const token = authService.getToken();
    const base = `/api/admin/prayer-requests/${encodeURIComponent(requestId)}/attachments/${encodeURIComponent(attachmentId)}`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
  },
};

if (typeof window !== 'undefined') {
  window.authService = authService;
  window.apiService = apiService;
}
