import api from './api';
import { requestCursorPage } from './cursorPagination';

/**
 * Chat Service — all /api/chat endpoints.
 */
export const chatService = {
  /** Start or resume a chat between buyer and seller for a property */
  startChat: async ({ propertyId, sellerId, buyerId }) => {
    const res = await api.post('/chat/start', { propertyId, sellerId, buyerId });
    return res.data;
  },

  /** Send a message in a chat */
  sendMessage: async ({ chatId, text, image }) => {
    const res = await api.post('/chat/send', { chatId, text, image });
    return res.data;
  },

  /** Get all chats for the current user */
  getUserChats: async (params = {}) => {
    return requestCursorPage('/chat/user', params, async (cursorParams) => {
      const res = await api.get('/chat/user', { params: cursorParams });
      return res.data;
    });
  },

  /** Get a specific chat with all messages */
  getChatById: async (chatId, params = {}) => {
    const res = await api.get(`/chat/${chatId}`, { params });
    return res.data;
  },

  /** Delete an entire chat */
  deleteChat: async (chatId) => {
    const res = await api.delete(`/chat/${chatId}`);
    return res.data;
  },

  /** Delete a specific message from a chat */
  deleteMessage: async (chatId, messageId) => {
    const res = await api.delete(`/chat/${chatId}/messages/${messageId}`);
    return res.data;
  },
};
