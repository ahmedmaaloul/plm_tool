// src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ accessRight, children }) => {
  const { user, userRoles } = useContext(AuthContext);

  const hasAccess = (accessRight) => {
    if (user && user.fullAccess) return true;
    return userRoles.some((role) => role.accessRights.includes(accessRight));
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (accessRight && !hasAccess(accessRight)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
