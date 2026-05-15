import axios from 'axios';
import { API_ROUTE } from '../data/env';

// ─────────────────────────────────────────────
// 1. ACCESS TOKEN (in-memory + localStorage sync)
// ─────────────────────────────────────────────
let _accessToken = localStorage.getItem('accessToken') || null;

export const setAccessToken = (token) => {
  _accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
    // Also set common header as fallback
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const getAccessToken = () => _accessToken;

// ─────────────────────────────────────────────
// 2. REFRESH LOCK (prevents parallel refreshes)
// ─────────────────────────────────────────────
let _isRefreshing = false;
let _failedQueue = [];

export const isRefreshing = () => _isRefreshing;

const processQueue = (error, token = null) => {
  _failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  _failedQueue = [];
};

const shouldForceLogout = (error) => {
  const status = error?.response?.status;
  // Only force logout when refresh token is invalid/unauthorized.
  return status === 400 || status === 401 || status === 403;
};

// ─────────────────────────────────────────────
// 3. CORE SILENT REFRESH FUNCTION (single source of truth)
// ─────────────────────────────────────────────
export const silentRefresh = async () => {
  if (_isRefreshing) {
    // Already refreshing – wait for it to finish
    return new Promise((resolve, reject) => _failedQueue.push({ resolve, reject }));
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.warn('[Auth] silentRefresh: No refresh token found. Logging out.');
    handleLogoutRedirect('missing_refresh_token');
    return null;
  }

  _isRefreshing = true;

  try {
    const res = await axios.post(`${API_ROUTE}/auth/refresh`, { refreshToken });
    const resData = res.data;

    const ok = resData?.status === 200 || resData?.status === 'SUCCESS' || resData?.success === true;
    const payload = resData?.data || resData; // Handle different API response shapes
    const newAccessToken = payload?.accessToken || payload?.token;
    const newRefreshToken = payload?.refreshToken || payload?.refresh_token;
    const expiresIn = payload?.expiresIn || payload?.expireIn || 900;

    if (ok && newAccessToken) {
      setAccessToken(newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('expiryTime', Date.now() + expiresIn * 1000);

      processQueue(null, newAccessToken);
      return newAccessToken;
    } else {
      throw new Error('Refresh response did not contain a valid access token.');
    }
  } catch (err) {
    console.error('[Auth] silentRefresh: ❌ Failed –', err.message);
    processQueue(err, null);
    // Force logout only when refresh token is actually invalid/unauthorized.
    if (shouldForceLogout(err)) {
      handleLogoutRedirect('refresh_rejected', {
        status: err?.response?.status,
        message: err?.response?.data?.message || err?.message,
      });
    }
    return null;
  } finally {
    _isRefreshing = false;
  }
};

// ─────────────────────────────────────────────
// 4. GLOBAL REQUEST INTERCEPTOR (attach token)
// ─────────────────────────────────────────────
const PUBLIC_ROUTES = ['/auth/login', '/auth/refresh', '/otp/'];

const isPublic = (url = '') => PUBLIC_ROUTES.some((r) => url.includes(r));

axios.defaults.withCredentials = false;
axios.defaults.timeout = 60000;

axios.interceptors.request.use(
  (config) => {
    // Check if it's our API (relative URL or matches API_ROUTE)
    const isOurApi = !config.url.startsWith('http') || config.url.includes(API_ROUTE);

    if (isOurApi && !isPublic(config.url)) {
      const token = _accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// 5. GLOBAL RESPONSE INTERCEPTOR (handle 401)
// ─────────────────────────────────────────────
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const response = error.response;

    if (response?.status === 401) {
      const msg = response?.data?.message || "";
      
      // Handle Multi-Device Logout (Prioritize over Refresh)
      if (msg.includes("Your session was terminated (Logged in on another device)")) {
        console.warn('[Auth] Multi-device logout detected. Force logging out.');
        handleLogoutRedirect('multi_device_logout', { message: msg });
        return Promise.reject(error);
      }

      // Handle Normal Token Expiry (Silent Refresh)
      if (!originalRequest._retry && !isPublic(originalRequest.url)) {
        originalRequest._retry = true;
        const newToken = await silentRefresh();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Use axios(config) to retry with the same instance settings
          return axios(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────
// 6. LOGOUT HELPER
// ─────────────────────────────────────────────
export const handleLogoutRedirect = (reason = 'unknown', meta = null) => {
  try {
    localStorage.setItem(
      'logoutReason',
      JSON.stringify({
        time: Date.now(),
        reason,
        meta,
      }),
    );
  } catch {
    // ignore
  }
  setAccessToken(null);
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('expiryTime');
  localStorage.setItem('logout', Date.now());
  window.location.href = '/login';
};

export default axios;
