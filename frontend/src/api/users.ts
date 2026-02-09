import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_SERVER_URL || 'http://localhost:3000'}${process.env.REACT_APP_API_PREFIX || '/api/v1'}`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const userApi = {
  getProfile: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
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
