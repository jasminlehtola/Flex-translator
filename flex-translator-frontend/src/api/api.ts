/**
 * api.ts
 *
 * Axios-based API client with automatic token injection and refresh logic.
 * Handles access token expiration by attempting to refresh the token using a stored refresh token.
 * If refresh fails, user is logged out and redirected accordingly.
 */

import axios from 'axios';
import { setAuthError, logoutFromApp } from '../utils/authErrorHandler';
axios.defaults.withCredentials = true;

/**
 * Create an Axios instance with a base URL.
 * Adds Authorization header automatically if access token exists in localStorage.
 */
export const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

/**
 * Process any queued requests waiting for a new token.
 * If refresh succeeded, retries original requests with new token.
 * If failed, rejects all pending requests.
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response interceptor that handles:
 * - Token expiration (401 errors)
 * - Refreshing tokens transparently
 * - Logging out the user on refresh failure
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If refresh attempt has already failed once, log out the user
    if (error.response?.status === 401 && originalRequest._retry) {
      console.warn('[AUTH] Token refresh failed. Logging out.');
      setAuthError('Session expired. Please log in again.');
      logoutFromApp();
      return Promise.reject(error);
    }

    // Attempt to refresh the token on first 401 response
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log(`[REFRESH] – Requesting new access token`);

        const res = await axios.post(
          'http://localhost:5000/auth/refresh',
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = res.data.access_token;
        localStorage.setItem('access_token', newToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        console.log(`[REFRESH] – Access token refreshed successfully`);

        processQueue(null, newToken);
        return apiClient(originalRequest);
      } catch (err) {
        console.error(`[REFRESH] ${new Date().toISOString()} – Refresh failed`, err);
        processQueue(err, null);
        setAuthError('Session expired. Please log in again.');
        logoutFromApp();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
