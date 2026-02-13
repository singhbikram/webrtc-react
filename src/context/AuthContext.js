import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getUser());
  const [accessToken, setAccessToken] = useState(() => authService.getAccessToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // login stores access token in-memory and user in localStorage
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await authService.login(username, password);
      if (resp.user) setUser(resp.user);
      if (resp.accessToken) setAccessToken(resp.accessToken);
      return resp;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setAccessToken(null);
  }, []);

  // helper to make authenticated requests (no automatic refresh)
  const fetchWithAuth = async (input, init = {}) => {
    const resp = await authService.fetchWithAuth(input, init);
    // if 401, token is invalid/expired — force logout
    if (resp.status === 401) {
      logout();
    }
    return resp;
  };

  useEffect(() => {
    // nothing to initialize beyond reading stored user; keep access token only in memory
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, error, login, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
};