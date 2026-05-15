import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { API_ROUTE } from './data/env';

// Components
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/login/LoginPage';
import DashContainer from './pages/DashContainer';
import ProtectedRoute from './components/ProtectedRoute';

// Actions & Utils
import { initializeAuth } from './redux/actions/authActions';
import { isRefreshing, silentRefresh } from './api/axiosInstance';
import { LOGIN_SUCCESS } from './redux/actionType/authActionType';

export default function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // 1. Initial Synchronization on App Boot
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // 2. Proactive Token Refresh Scheduler
  useEffect(() => {
    const REFRESH_AHEAD_MS = 120000; // 2 minutes before expiry
    const MIN_DELAY_MS = 10000;
    let refreshTimer;

    const scheduleNext = () => {
      const expiryTime = localStorage.getItem("expiryTime");
      const refreshToken = localStorage.getItem("refreshToken");
      if (!expiryTime || !refreshToken) return;

      const msToExpiry = Number(expiryTime) - Date.now();
      const delay = Math.max(MIN_DELAY_MS, msToExpiry - REFRESH_AHEAD_MS);

      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(runRefresh, delay);
    };

    const runRefresh = async () => {
      if (!isRefreshing()) {
        const newToken = await silentRefresh();
        if (newToken) {
          const freshUser = JSON.parse(localStorage.getItem("user") || "null");
          dispatch({
            type: LOGIN_SUCCESS,
            payload: { user: freshUser, token: newToken },
          });
        }
      }
      scheduleNext();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        scheduleNext();
      }
    };

    scheduleNext();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(refreshTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [dispatch]);

  // 3. Proactive Session Heartbeat & Cross-Tab Sync
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
        const heartbeatUrl = `${API_ROUTE}/profile`;
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

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
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
