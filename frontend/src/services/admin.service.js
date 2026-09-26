import api from './api';
import { requestCursorPage } from './cursorPagination';

/**
 * Admin Service — all /api/admin endpoints (requires admin role).
 */
export const adminService = {
  /** Get dashboard analytics (KPIs, charts, recent activity) */
  getAnalytics: async () => {
    const res = await api.get('/admin/analytics');
    return res.data;
  },

  /**
   * Get all users with advanced filtering and pagination.
   * @param {Object} params - search, role, isBlocked, isVerified, isApproved, sort, page, limit
   */
  getUsers: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null),
    );
    return requestCursorPage('/admin/users', cleanParams, async (cursorParams) => {
      const res = await api.get('/admin/users', { params: cursorParams });
      return res.data;
    });
  },

  /** Get pending seller accounts */
  getPendingSellers: async (params = {}) => {
    return requestCursorPage('/admin/users/pending-sellers', params, async (cursorParams) => {
      const res = await api.get('/admin/users/pending-sellers', { params: cursorParams });
      return res.data;
    });
  },

  /** Get all inquiries with filtering and pagination */
  getInquiries: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null),
    );
    return requestCursorPage('/admin/inquiries', cleanParams, async (cursorParams) => {
      const res = await api.get('/admin/inquiries', { params: cursorParams });
      return res.data;
    });
  },

  /** Toggle block/unblock a user */
  toggleBlockUser: async (userId) => {
    const res = await api.put(`/admin/users/${userId}/block`);
    return res.data;
  },

  /** Approve a pending seller */
  approveSeller: async (userId) => {
    const res = await api.put(`/admin/users/${userId}/approve`);
    return res.data;
  },

  /** Delete a user (cascade deletes properties + inquiries) */
  deleteUser: async (userId) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  },

  /**
   * Get all properties (admin view — includes unverified).
   * Uses the admin controller's version with extra filters.
   */
  getProperties: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null),
    );
    return requestCursorPage('/admin/properties', cleanParams, async (cursorParams) => {
      const res = await api.get('/admin/properties', { params: cursorParams });
      return res.data;
    });
  },

  /** Verify a property so it can appear in public listings */
  verifyProperty: async (propertyId) => {
    const res = await api.patch(`/admin/properties/${propertyId}/verify`);
    return res.data;
  },

  /** Admin delete a property */
  deleteProperty: async (propertyId) => {
    const res = await api.delete(`/property/${propertyId}`);
    return res.data;
  },
};
