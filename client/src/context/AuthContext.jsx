import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem('smarttask_auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch (error) {
        window.localStorage.removeItem('smarttask_auth');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  const persist = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    if (nextToken) {
      api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
    }
    window.localStorage.setItem(
      'smarttask_auth',
      JSON.stringify({ token: nextToken, user: nextUser })
    );
  };

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    persist(data.token, data.user);
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    persist(data.token, data.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common.Authorization;
    window.localStorage.removeItem('smarttask_auth');
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      setUser
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}

