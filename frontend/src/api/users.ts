import { api } from './client';

export const userApi = {
  getProfile: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data.data;
  },

  getArtists: async () => {
    const response = await api.get('/users?role=artist');
    return response.data.data;
  },

  updateProfile: async (userId: string, data: any) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data.data;
  },

  resetProfile: async (userId: string) => {
    const response = await api.post('/users/reset', { userId });
    return response.data;
  }
};
