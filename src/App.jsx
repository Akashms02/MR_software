import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { API_ROUTE } from './data/env';

// Components
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/login/LoginPage';
import ForgotPasswordPage from './pages/forgot-password/ForgotPasswordPage';
import CreatePasswordPage from './pages/create-password/CreatePasswordPage';
import DashContainer from './pages/DashContainer';
import ProtectedRoute from './components/ProtectedRoute';

// Actions & Utils
import { initializeAuth, refreshToken, logout } from './redux/actions/authActions';
import { isRefreshing, silentRefresh } from './api/axiosInstance';
import { LOGIN_SUCCESS } from './redux/actionType/authActionType';

export default function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // 1. Initial Synchronization on App Boot
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // 2. Token Refresh Scheduler (Triggers immediately and then every 5 minutes if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    let refreshTimer;

    const runRefresh = async () => {
      const rToken = localStorage.getItem("refreshToken");
      console.log("[Auth Scheduler] Checking refresh token...", { rToken });
      
      if (rToken) {
        console.log("%c[Auth Scheduler] Hitting refresh token API...", "color: #00ff00; font-weight: bold;");
        const success = await dispatch(refreshToken({ refreshToken: rToken }));
        if (!success) {
          console.warn("[Auth Scheduler] Refresh token failed or was rejected. Logging out...");
          dispatch(logout());
          return;
        }
      } else {
        console.warn("[Auth Scheduler] No refresh token found in localStorage. Logging out...");
        dispatch(logout());
        return;
      }
      // Schedule the next check in 5 minutes (300,000 ms)
      refreshTimer = setTimeout(runRefresh, 300000);
    };

    // Run 2 seconds after mount/login so they can see it instantly on load
    refreshTimer = setTimeout(runRefresh, 2000);

    return () => {
      clearTimeout(refreshTimer);
    };
  }, [dispatch, isAuthenticated]);

  // 3. Proactive Session Heartbeat & Cross-Tab Sync (Commented out until /profile API is stable)
  /*
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleStorageChange = (e) => {
      if (e.key === "logout") {
        window.location.reload();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    const interval = setInterval(async () => {
      try {
        // Adjust heartbeat URL based on role if needed
        const heartbeatUrl = `${API_ROUTE}/auth/me`;
        await axios.get(heartbeatUrl);
      } catch (err) {
        // Errors are handled globally by axiosInstance interceptor
      }
    }, 60000); // Heartbeat every minute

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [isAuthenticated, user]);
  */

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/create-password" element={<CreatePasswordPage />} />
      <Route
        path="/superadmin/*"
        element={
          <ProtectedRoute>
            <DashContainer rolePath="superadmin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <DashContainer rolePath="admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/*"
        element={
          <ProtectedRoute>
            <DashContainer rolePath="employee" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashContainer />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
