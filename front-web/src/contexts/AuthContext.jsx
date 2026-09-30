/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth.js';
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from './authStorage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(() => !!getStoredToken());

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    authApi
      .me()
      .then(({ user: me }) => {
        if (!active) return;
        setUser(me);
        setStoredUser(me);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setToken(null);
        clearStoredAuth();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const applySession = useCallback(({ token: t, user: u }) => {
    setStoredToken(t);
    setStoredUser(u);
    setToken(t);
    setUser(u);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login({ email, password });
      applySession(data);
      return data.user;
    },
    [applySession]
  );

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload);
      applySession(data);
      return data.user;
    },
    [applySession]
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { user: updated } = await authApi.updateMe(payload);
    setStoredUser(updated);
    setUser(updated);
    return updated;
  }, []);

  const refresh = useCallback(() => {
    if (!token) return Promise.resolve(null);
    return authApi
      .me()
      .then(({ user: me }) => {
        setStoredUser(me);
        setUser(me);
        return me;
      })
      .catch(() => null);
  }, [token]);

  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('portfolio:unauthorized', onUnauthorized);
    return () => window.removeEventListener('portfolio:unauthorized', onUnauthorized);
  }, []);

  const can = useCallback(
    (resource, action) => {
      if (!user) return false;
      if (user.role === 'owner') return true;
      return user.permissions?.[resource]?.includes(action) ?? false;
    },
    [user]
  );

  const hasRole = useCallback(
    (roles) => (Array.isArray(roles) ? roles.includes(user?.role) : user?.role === roles),
    [user?.role]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      refresh,
      updateProfile,
      can,
      hasRole,
    }),
    [user, token, loading, login, register, logout, refresh, updateProfile, can, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}