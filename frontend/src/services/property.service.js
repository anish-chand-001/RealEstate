import api from './api';
import { requestCursorPage } from './cursorPagination';

/**
 * Property Service — all /api/property endpoints.
 */
export const propertyService = {
  /**
   * Get all properties with filters, sort, and pagination.
   * @param {Object} params - Query params matching backend: search, city, state, propertyType, minPrice, maxPrice, bhk, furnished, amenities, sort, page, limit
   */
  getAll: async (params = {}) => {
    // Strip empty values so they don't pollute the query string
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null),
    );
    return requestCursorPage('/property', cleanParams, async (cursorParams) => {
      const res = await api.get('/property', { params: cursorParams });
      return res.data;
    });
  },

  /**
   * Get single property details + similar properties.
   * @param {string} id
   */
  getById: async (id) => {
    const res = await api.get(`/property/${id}`);
    return res.data;
  },

  /**
   * Get property counts by type (for category badges).
   */
  getCountByType: async () => {
    const res = await api.get('/property/count/by-type');
    return res.data;
  },

  /**
   * Get seller dashboard data (stats + their properties).
   */
  getSellerDashboard: async () => {
    const res = await api.get('/property/seller/dashboard');
    return res.data;
  },

  /**
   * Get all properties for the logged-in seller.
   */
  getMyProperties: async (params = {}) => {
    return requestCursorPage('/property/my-properties', params, async (cursorParams) => {
      const res = await api.get('/property/my-properties', { params: cursorParams });
      return res.data;
    });
  },

  /**
   * Add a new property (multipart/form-data with images).
   * @param {FormData} formData
   */
  create: async (formData) => {
    const res = await api.post('/property', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Update a property (multipart/form-data with images).
   * @param {string} id
   * @param {FormData} formData
   */
  update: async (id, formData) => {
    const res = await api.put(`/property/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Delete a property.
   * @param {string} id
   */
  delete: async (id) => {
    const res = await api.delete(`/property/${id}`);
    return res.data;
  },

  /**
   * Update a property's status (Available, Sold, Rented, Pending).
   * @param {string} id
   * @param {string} status
   */
  updateStatus: async (id, status) => {
    const res = await api.patch(`/property/${id}/status`, { status });
    return res.data;
  },
};
