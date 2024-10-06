// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create Context
export const AuthContext = createContext();

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:5000'; // Adjust the port if necessary

// Create Provider
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on component mount
  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token with backend and fetch user data
          const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setIsAuthenticated(true);
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth verification failed:', error);
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          localStorage.removeItem('token');
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);


  const login = async (username, password) => {
    try {
      // Send login request to backend
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        username,
        password,
      });

      // Save token and user data
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.error || 'Login failed' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
  };

  const register = async (name, username, password) => {
    try {
      // Send registration request to backend
      const response = await axios.post(`${API_BASE_URL}/api/users/register`, {
        name,
        username,
        password,
      });

      // Save token and user data
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.response?.data?.error || 'Registration failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
