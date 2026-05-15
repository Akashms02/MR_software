import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div 
          style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #2563eb', 
            borderTopColor: 'transparent', 
            borderRadius: '50%',
            animation: 'protected-spin 1s linear infinite'
          }} 
        />
        <style>{`
          @keyframes protected-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 2. Not logged in -> redirect to login
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Logged in but role not allowed -> redirect to their own dashboard
  const userRole = user?.role?.toLowerCase();
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
