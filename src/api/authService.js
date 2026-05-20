import apiClient from './client.js';

/**
 * Login with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise} Axios response with token data.
 */
export const login = (email, password) =>
  apiClient.post('/api/v1/auth/login', { email, password });

/**
 * First login password change (temporary password).
 */
export const firstLogin = (email, temporaryPassword, newPassword, confirmPassword) =>
  apiClient.post('/api/v1/auth/first-login', {
    email,
    temporaryPassword,
    newPassword,
    confirmPassword,
  });

/**
 * Request password reset link.
 */
export const forgotPassword = (email) =>
  apiClient.post('/api/v1/auth/forgot-password', { email });

/**
 * Refresh JWT token.
 */
export const refreshToken = (refreshToken) =>
  apiClient.post('/api/v1/auth/refresh-token', { refreshToken });

/**
 * Get current user's profile (requires bearer token).
 */
export const getProfile = () => apiClient.get('/api/v1/auth/me');
