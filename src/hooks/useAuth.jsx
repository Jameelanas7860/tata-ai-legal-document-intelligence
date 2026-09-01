import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Restore session from localStorage
    (async () => {
      const user = await authService.getCurrentUser();
      if (mounted) setUser(user);
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await authService.login(email, password);
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const u = await authService.signup(name, email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch, initials: getInitials(patch.name || prev.name) } : prev));
  }, []);

  const value = useMemo(
    () => ({ user, login, signup, logout, updateUser, isAuthenticated: !!user, loading }),
    [user, login, signup, logout, updateUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
