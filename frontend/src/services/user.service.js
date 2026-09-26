import api from './api';

/**
 * User Service — profile endpoints.
 */
export const userService = {
  /** Get current logged-in user profile */
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },

  /** Get public profile by user ID */
  getPublicProfile: async (id) => {
    const res = await api.get(`/users/public/${id}`);
    return res.data;
  },

  /**
   * Update user profile (supports profile image upload).
   * @param {FormData} formData - name, phone, address, profileImage (file), removeProfileImage
   */
  updateProfile: async (formData) => {
    const res = await api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
