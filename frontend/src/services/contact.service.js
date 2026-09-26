import api from './api';
import { requestCursorPage } from './cursorPagination';

/**
 * Contact Service — public contact form submissions.
 */
export const contactService = {
  /** Submit a contact inquiry (public) */
  submit: async (data) => {
    const res = await api.post('/contact', data);
    return res.data;
  },

  /** Get all contact submissions (admin only) */
  getAll: async (params = {}) => {
    return requestCursorPage('/contact', params, async (cursorParams) => {
      const res = await api.get('/contact', { params: cursorParams });
      return res.data;
    });
  },
};
