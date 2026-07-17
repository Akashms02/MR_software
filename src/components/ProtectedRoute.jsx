import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isFieldSalesRole, isManagerRole } from '../utils/roleHelpers';

/**
 * ProtectedRoute handles both authentication and authorization.
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading, isInitializing, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  // 1. Handle Initialization / Initial Loading
  if (isInitializing || (loading && !user && token)) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Not logged in -> redirect to login
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Logged in but role not allowed -> redirect to their own dashboard
  const userRole = user?.role?.toLowerCase();
  
  let isAllowed = false;
  if (!allowedRoles) {
    isAllowed = true;
  } else if (allowedRoles.includes(userRole)) {
    isAllowed = true;
  } else if (allowedRoles.includes('mr') && isFieldSalesRole(user?.role)) {
    isAllowed = true;
  } else if (allowedRoles.includes('manager') && isManagerRole(user?.role)) {
    isAllowed = true;
  }

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
