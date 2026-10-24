import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('markethub_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('markethub_token'));
  const [loading, setLoading] = useState(true);

  // Sync / fetch fresh user details on startup
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('markethub_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data?.success) {
          setUser(res.data.user);
          localStorage.setItem('markethub_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        localStorage.removeItem('markethub_token');
        localStorage.removeItem('markethub_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('markethub_token', newToken);
      localStorage.setItem('markethub_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return newUser;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('markethub_token', newToken);
      localStorage.setItem('markethub_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return newUser;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('markethub_token');
    localStorage.removeItem('markethub_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data?.success) {
      setUser(res.data.user);
      localStorage.setItem('markethub_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.data?.message || 'Update failed');
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const isVendor = user?.role === 'VENDOR';
  const isAdmin = user?.role === 'ADMIN';
  const isDelivery = user?.role === 'DELIVERY_PARTNER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isCustomer,
        isVendor,
        isAdmin,
        isDelivery,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
