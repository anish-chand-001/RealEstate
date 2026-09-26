import api from './api';
import { requestCursorPage } from './cursorPagination';

/**
 * Wishlist Service — add/remove/list wishlist items.
 */
export const wishlistService = {
  /** Get all wishlist items for the current user */
  getAll: async (params = {}) => {
    return requestCursorPage('/wishlist', params, async (cursorParams) => {
      const res = await api.get('/wishlist', { params: cursorParams });
      return res.data;
    });
  },

  /** Add a property to the wishlist */
  add: async (propertyId) => {
    const res = await api.post(`/wishlist/${propertyId}`);
    return res.data;
  },

  /** Remove a property from the wishlist */
  remove: async (propertyId) => {
    const res = await api.delete(`/wishlist/${propertyId}`);
    return res.data;
  },
};
