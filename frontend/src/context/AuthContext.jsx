import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = (data) => {
    localStorage.setItem('token', data.access_token);
    const userInfo = {
      id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      avatar_url: data.avatar_url || null
    };
    localStorage.setItem('user', JSON.stringify(userInfo));
    setToken(data.access_token);
    setUser(userInfo);
  };

  const updateUserProfile = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'STAFF':
        return '/staff/dashboard';
      case 'CUSTOMER':
        return '/customer/dashboard';
      default:
        return '/';
    }
  };

  const getProfilePath = (role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin/profile';
      case 'STAFF':
        return '/staff/profile';
      case 'CUSTOMER':
        return '/customer/profile';
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUserProfile, getDashboardPath, getProfilePath }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
