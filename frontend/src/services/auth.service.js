import api, { getErrorMessage } from './api';

/**
 * Auth Service — handles all authentication API calls.
 * Uses the centralized Axios instance with HttpOnly cookie credentials.
 */

export const authService = {
  /**
   * Register a new user.
   * @param {{ name: string, email: string, password: string, role?: string }} data
   * @returns {{ message: string, user: { id, email, name, role } }}
   */
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  /**
   * Login with email + password.
   * @param {{ email: string, password: string }} data
   * @returns {{ message: string, user: { id, email, name, role } }}
   */
  login: async (data) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  /**
   * Verify email with 6-digit OTP.
   * @param {{ email: string, code: string }} data
   */
  verifyEmail: async (data) => {
    const res = await api.post('/auth/verify-email', data);
    return res.data;
  },

  /**
   * Request a password reset email.
   * @param {{ email: string }} data
   */
  forgotPassword: async (data) => {
    const res = await api.post('/auth/forgot-password', data);
    return res.data;
  },

  /**
   * Reset password using hex token from URL.
   * @param {string} token - The reset token from the email link
   * @param {{ newPassword: string }} data
   */
  resetPassword: async (token, data) => {
    const res = await api.post(`/auth/reset-password/${token}`, data);
    return res.data;
  },

  /**
   * Logout the current user (clears server-side cookie).
   */
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};

export { getErrorMessage };
