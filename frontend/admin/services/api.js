/**
 * Church Website Admin CMS - API Client Service
 * Centralizes authentication, media uploads, and full CRUD operations across all modules.
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
 * Common fetch helper with JWT bearer authentication and error handling
 */
async function request(endpoint, options = {}) {
  const token = authService.getToken();
  const headers = {
    ...(options.headers || {}),
  };

  // Only add json header if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

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
    let errorDetail = `Request failed (${response.status})`;
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

export const cmsApi = {
  // Auth
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

  logout() {
    authService.clearSession();
  },

  // Overview
  async getOverview() {
    return request('/api/admin/cms/overview');
  },

  // Media Upload
  async uploadMedia(file) {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/admin/cms/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // 1. Home
  async getHome() {
    return request('/api/admin/cms/home');
  },
  async updateHome(data) {
    return request('/api/admin/cms/home', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 2. About Us
  async getAbout() {
    return request('/api/admin/cms/about');
  },
  async updateAbout(data) {
    return request('/api/admin/cms/about', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 3. Bible Settings
  async getBibleSettings() {
    return request('/api/admin/cms/bible-settings');
  },
  async updateBibleSettings(data) {
    return request('/api/admin/cms/bible-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 4. Sermons
  async getSermons(q = '') {
    const url = q ? `/api/admin/cms/sermons?q=${encodeURIComponent(q)}` : '/api/admin/cms/sermons';
    return request(url);
  },
  async createSermon(data) {
    return request('/api/admin/cms/sermons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateSermon(id, data) {
    return request(`/api/admin/cms/sermons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteSermon(id) {
    return request(`/api/admin/cms/sermons/${id}`, {
      method: 'DELETE',
    });
  },

  // 5. Events
  async getEvents(q = '') {
    const url = q ? `/api/admin/cms/events?q=${encodeURIComponent(q)}` : '/api/admin/cms/events';
    return request(url);
  },
  async createEvent(data) {
    return request('/api/admin/cms/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateEvent(id, data) {
    return request(`/api/admin/cms/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteEvent(id) {
    return request(`/api/admin/cms/events/${id}`, {
      method: 'DELETE',
    });
  },

  // 6. Ministries
  async getMinistries(q = '') {
    const url = q ? `/api/admin/cms/ministries?q=${encodeURIComponent(q)}` : '/api/admin/cms/ministries';
    return request(url);
  },
  async createMinistry(data) {
    return request('/api/admin/cms/ministries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateMinistry(id, data) {
    return request(`/api/admin/cms/ministries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteMinistry(id) {
    return request(`/api/admin/cms/ministries/${id}`, {
      method: 'DELETE',
    });
  },

  // 7. Gallery
  async getGallery(category = '') {
    const url = category && category !== 'All' ? `/api/admin/cms/gallery?category=${encodeURIComponent(category)}` : '/api/admin/cms/gallery';
    return request(url);
  },
  async createGalleryItem(data) {
    return request('/api/admin/cms/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async deleteGalleryItem(id) {
    return request(`/api/admin/cms/gallery/${id}`, {
      method: 'DELETE',
    });
  },

  // 8. Service Timings
  async getServiceTimings() {
    return request('/api/admin/cms/service-timings');
  },
  async createServiceTiming(data) {
    return request('/api/admin/cms/service-timings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateServiceTiming(id, data) {
    return request(`/api/admin/cms/service-timings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteServiceTiming(id) {
    return request(`/api/admin/cms/service-timings/${id}`, {
      method: 'DELETE',
    });
  },

  // 9. Announcements
  async getAnnouncements(q = '') {
    const url = q ? `/api/admin/cms/announcements?q=${encodeURIComponent(q)}` : '/api/admin/cms/announcements';
    return request(url);
  },
  async createAnnouncement(data) {
    return request('/api/admin/cms/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAnnouncement(id, data) {
    return request(`/api/admin/cms/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAnnouncement(id) {
    return request(`/api/admin/cms/announcements/${id}`, {
      method: 'DELETE',
    });
  },

  // 10. Contact
  async getContact() {
    return request('/api/admin/cms/contact');
  },
  async updateContact(data) {
    return request('/api/admin/cms/contact', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 11. Website Settings
  async getSettings() {
    return request('/api/admin/cms/settings');
  },
  async updateSettings(data) {
    return request('/api/admin/cms/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 12. Prayer Requests (Integrated)
  async getPrayerStats() {
    return request('/api/admin/prayer-requests/stats');
  },
  async getPrayerRequests(params = {}) {
    const p = new URLSearchParams();
    if (params.category && params.category !== 'All Categories') p.append('category', params.category);
    if (params.status && params.status !== 'All') p.append('status', params.status);
    if (params.q) p.append('q', params.q);
    p.append('limit', params.limit || 25);
    p.append('offset', params.offset || 0);
    return request(`/api/admin/prayer-requests?${p.toString()}`);
  },
  async updatePrayerRequest(id, data) {
    return request(`/api/admin/prayer-requests/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async deletePrayerRequest(id) {
    return request(`/api/admin/prayer-requests/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
  getAttachmentUrl(requestId, attachmentId) {
    const token = authService.getToken();
    const base = `/api/admin/prayer-requests/${encodeURIComponent(requestId)}/attachments/${encodeURIComponent(attachmentId)}`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
  },

  // 13. Users & Pastoral Team Management
  async getUsers() {
    return request('/api/admin/users');
  },
  async createUser(data) {
    return request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async deleteUser(id) {
    return request(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

if (typeof window !== 'undefined') {
  window.authService = authService;
  window.cmsApi = cmsApi;
}

