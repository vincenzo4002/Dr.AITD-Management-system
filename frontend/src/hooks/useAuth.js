import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import sessionManager from '../utils/sessionManager';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = sessionManager.getToken();
      if (token && sessionManager.isSessionValid()) {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.id,
          role: decoded.role,
          token: token
        });
        sessionManager.startActivityMonitoring();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem('userId', decoded.id);
      localStorage.setItem('userRole', decoded.role);
      
      sessionManager.setSession(token);
      
      setUser({
        id: decoded.id,
        role: decoded.role,
        token: token
      });

      return decoded;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    sessionManager.logout();
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = () => {
    return !!user && sessionManager.isSessionValid();
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    checkAuth
  };
};