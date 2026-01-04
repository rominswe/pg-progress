import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from "../../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  const fetchMe = useCallback(async () => {
    try {
      const data = await authService.me();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Login function
  const login = useCallback(async (role, credentials) => {
    const data = await authService.login(role, credentials);
    setUser(data.user);
    return data;
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Named export only
export const useAuth = () => useContext(AuthContext);
