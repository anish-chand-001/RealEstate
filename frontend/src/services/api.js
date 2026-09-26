import axios from 'axios';
import API_URL from '../config.js';

/** Centralized Axios instance using the HttpOnly session cookie. */
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Remove credentials from earlier versions; auth tokens are never read from JS storage.
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.sessionStorage.removeItem('token');
    window.sessionStorage.removeItem('user');
  } catch {
    // Storage can be unavailable in restrictive browser contexts.
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';
    if ((status === 401 || (status === 403 && message.toLowerCase().includes('blocked'))) && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:session-invalid'));
    }
    if (status >= 500) error.userMessage = 'The server is temporarily unavailable. Please try again.';
    else if (!error.response) error.userMessage = 'Network error. Please check your connection.';
    return Promise.reject(error);
  },
);

/** Extract a clean message from Axios errors. */
export const getErrorMessage = (error) => {
  if (error.userMessage) return error.userMessage;
  if (error.response?.status >= 500) return 'The server is temporarily unavailable. Please try again.';
  if (error.response?.data?.message || error.response?.data?.error) {
    return error.response.data.message || error.response.data.error;
  }
  if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  if (!error.response) return 'Network error. Please check your connection.';
  return 'Something went wrong. Please try again.';
};

export default api;
