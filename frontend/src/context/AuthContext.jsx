import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initUser() {
      try {
        const current = await api.auth.getCurrentUser();
        setUser(current);
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    }
    initUser();
  }, []);

  const switchRole = async (role) => {
    try {
      const updated = await api.auth.setCurrentUserRole(role);
      setUser(updated);
      return updated;
    } catch (err) {
      console.error("Failed to switch role:", err);
      throw err;
    }
  };

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    setUser(res.user);
    return res;
  };

  const register = async (data) => {
    const res = await api.auth.register(data);
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, switchRole, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

