import api from './api';
import { requestCursorPage } from './cursorPagination';

/**
 * Inquiry Service — buyer sends inquiries, seller reads them.
 */
export const inquiryService = {
  /** Send an inquiry on a property (buyer only) */
  send: async ({ propertyId, message }) => {
    const res = await api.post('/inquiry', { propertyId, message });
    return res.data;
  },

  /** Get all inquiries for the logged-in seller's properties */
  getSellerInquiries: async (params = {}) => {
    return requestCursorPage('/inquiry/seller/inquiries', params, async (cursorParams) => {
      const res = await api.get('/inquiry/seller/inquiries', { params: cursorParams });
      return res.data;
    });
  },

  /** Mark an inquiry as read (seller only) */
  markAsRead: async (id) => {
    const res = await api.patch(`/inquiry/${id}/read`);
    return res.data;
  },
};
