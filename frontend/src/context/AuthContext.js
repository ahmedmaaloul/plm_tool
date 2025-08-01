import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 

export const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:5005'; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [userRoles, setUserRoles] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already logged in when the app loads
    const token = localStorage.getItem('token');
    if (token) {
      const userInfo = decodeToken(token);
      if (userInfo) {
        setUser(userInfo);
        fetchUserRoles(userInfo.userId);
      } else {
        // Token is invalid or expired
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Perform login API call and get token
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, { username, password });
      const token = response.data.token;
      localStorage.setItem('token', token);

      // Decode token to get user info
      const userInfo = decodeToken(token);
      setUser(userInfo);

      // Fetch user roles
      console.log(`userInfo : ${JSON.stringify(userInfo)}`);
      console.log(`userInfo id : ${userInfo.userId}`);
      await fetchUserRoles(userInfo.userId);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  // Added register function
  const register = async (name, username, password) => {
    try {
      // Perform register API call
      const response = await axios.post(`${API_BASE_URL}/api/users/register`, {
        name,
        username,
        password,
      });
      // After successful registration, login the user
      return await login(username, password);
    } catch (err) {
      console.error('Registration error:', err);
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
      console.log(userId);
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
    <AuthContext.Provider value={{ user, userRoles, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
