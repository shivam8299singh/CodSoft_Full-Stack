import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('dinedesk_token');
        const storedUser = localStorage.getItem('dinedesk_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Fetch fresh user profile in background
          try {
            const freshUser = await authService.getMe();
            setUser(freshUser);
            localStorage.setItem('dinedesk_user', JSON.stringify(freshUser));
          } catch (err) {
            // Token might be expired
            localStorage.removeItem('dinedesk_token');
            localStorage.removeItem('dinedesk_user');
            setUser(null);
            setToken(null);
          }
        }
      } catch (e) {
        console.error('Failed to initialize auth:', e);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('dinedesk_token', data.token);
    localStorage.setItem('dinedesk_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('dinedesk_token', data.token);
    localStorage.setItem('dinedesk_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('dinedesk_token');
      localStorage.removeItem('dinedesk_user');
    }
  };

  const updateProfile = async (profileData) => {
    const updated = await authService.updateProfile(profileData);
    setUser(updated);
    localStorage.setItem('dinedesk_user', JSON.stringify(updated));
    return updated;
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
      localStorage.setItem('dinedesk_user', JSON.stringify(freshUser));
    } catch (e) {
      // Ignore
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'ADMIN',
    isStaff: user?.role === 'STAFF',
    isKitchen: user?.role === 'KITCHEN',
    isCustomer: user?.role === 'CUSTOMER',
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
