import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('og_token') || null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('og_token') || localStorage.getItem('apex_token');
      const storedUser = localStorage.getItem('og_user') || localStorage.getItem('apex_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (e) {
          localStorage.removeItem('og_token');
          localStorage.removeItem('og_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.login({ email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('og_token', data.token);
      localStorage.setItem('og_user', JSON.stringify(data.user));
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      return data;
    } catch (error) {
      addToast(error.message, 'error');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await api.register(userData);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('og_token', data.token);
      localStorage.setItem('og_user', JSON.stringify(data.user));
      addToast('Account created successfully!', 'success');
      return data;
    } catch (error) {
      addToast(error.message, 'error');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('og_token');
    localStorage.removeItem('og_user');
    localStorage.removeItem('apex_token');
    localStorage.removeItem('apex_user');
    addToast('Logged out successfully', 'info');
  };

  // Quick Demo Login for instant testing
  const demoLogin = async (role = 'admin') => {
    if (role === 'admin') {
      return await login('admin@ogsupplement.com', 'adminpassword123');
    } else {
      return await login('john@example.com', 'customerpassword123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
