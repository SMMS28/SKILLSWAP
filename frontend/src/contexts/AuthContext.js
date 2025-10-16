import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          if (response.data.success) {
            setUser(response.data.data);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login with:', { email, password });
      
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      console.log('AuthContext: Login response:', response.data);

      if (response.data.success) {
        const { user: userData, token: newToken } = response.data.data;
        setUser(userData);
        setToken(newToken);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return { success: true };
      } else {
        console.log('AuthContext: Login failed:', response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      console.error('AuthContext: Error response:', error.response?.data);
      console.error('AuthContext: Error status:', error.response?.status);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      } else if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data.message || 'Please check your input'
        };
      } else if (!error.response) {
        return {
          success: false,
          message: 'Unable to connect to server. Please check your connection.'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);

      if (response.data.success) {
        const { user: newUser, token: newToken } = response.data.data;
        setUser(newUser);
        setToken(newToken);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/auth/refresh');
      if (response.data.success) {
        const newToken = response.data.data.token;
        setToken(newToken);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
    return false;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};






