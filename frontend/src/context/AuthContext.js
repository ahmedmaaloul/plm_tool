// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:5000'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User object including fullAccess
  const [userRoles, setUserRoles] = useState([]); // User's roles with accessRights
  const [loading, setLoading] = useState(true); // Loading state for initial auth check

  useEffect(() => {
    // Check if the user is already logged in when the app loads
    const token = localStorage.getItem('token');
    if (token) {
      const userInfo = decodeToken(token);
      if (userInfo) {
        setUser(userInfo);
        fetchUserRoles(userInfo._id);
      } else {
        // Token is invalid or expired
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Perform login API call and get token
      console.log(credentials)
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, credentials);
      const token = response.data.token;
      localStorage.setItem('token', token);

      // Decode token to get user info
      const userInfo = decodeToken(token);
      setUser(userInfo);

      // Fetch user roles
      console.log(`userInfo : ${userInfo}`)
      console.log(`userInfo id : ${userInfo._id}`)
      await fetchUserRoles(userInfo._id);
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (err) {
      console.error('Token decoding error:', err);
      return null;
    }
  };

  const fetchUserRoles = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/roles/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUserRoles(response.data.roles);
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setUserRoles([]);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setUserRoles([]);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, userRoles, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
