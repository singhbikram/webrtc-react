const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// In-module memory for the short-lived access token
let inMemoryAccessToken = null;

export const authService = {
  // login returns the server response (accessToken, user, expiresIn)
  login: async (username, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Login failed');
    }

    // Handle both plain string token and JSON response
    const contentType = res.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      // Backend returned plain text (likely a JWT token string)
      const tokenStr = await res.text();
      data = { accessToken: tokenStr.trim().replace(/^"|"$/g, '') };
    }

    // Store access token in memory (safer than localStorage)
    if (data.accessToken) {
      inMemoryAccessToken = data.accessToken;
      console.log('Token stored in memory:', inMemoryAccessToken.substring(0, 20) + '...');
    }

    // Store user info persistently if available
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    else if (data.username) localStorage.setItem('user', JSON.stringify({ username: data.username }));

    return { ...data, accessToken: inMemoryAccessToken };
  },

  // no refresh() - we rely on short-lived access tokens and require re-login when expired

  // Return current in-memory access token (may be null)
  getAccessToken: () => inMemoryAccessToken,

  // Clear tokens and user info
  logout: () => {
    inMemoryAccessToken = null;
    try { localStorage.removeItem('user'); } catch (e) {}
  },

  // Helper to get stored user profile
  getUser: () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },

  isAuthenticated: () => !!inMemoryAccessToken,

  // Convenience: make authenticated fetch with automatic refresh-on-401
  fetchWithAuth: async (input, init = {}) => {
    const token = inMemoryAccessToken;
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const resp = await fetch(input, { ...init, headers });

    if (resp.status !== 401) return resp;

    // try to refresh and retry once
    try {
      const refreshResp = await authService.refresh();
      inMemoryAccessToken = refreshResp.accessToken || inMemoryAccessToken;
      const retryHeaders = new Headers(init.headers || {});
      if (inMemoryAccessToken) retryHeaders.set('Authorization', `Bearer ${inMemoryAccessToken}`);
      return await fetch(input, { ...init, headers: retryHeaders });
    } catch (e) {
      // refresh failed -> propagate original 401
      return resp;
    }
  }
};