import axios from 'axios';
import { CreateCommissionData, Commission } from '../types/commission';

const API_URL = `${process.env.REACT_APP_API_SERVER_URL || 'http://localhost:3000'}${process.env.REACT_APP_API_PREFIX || '/api/v1'}`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const commissionApi = {
  create: async (data: CreateCommissionData): Promise<Commission> => {
    const response = await api.post('/commissions', data);
    return response.data.data;
  },

  getAll: async (): Promise<Commission[]> => {
    const response = await api.get('/commissions');
    return response.data.data;
  },

  getById: async (id: string): Promise<Commission> => {
    const response = await api.get(`/commissions/${id}`);
    return response.data.data;
  },

  accept: async (id: string): Promise<Commission> => {
    const response = await api.post(`/commissions/${id}/accept`);
    return response.data.data;
  },

  deliver: async (id: string, artworkUrl: string, hash: string): Promise<Commission> => {
    const response = await api.post(`/commissions/${id}/deliver`, { artworkUrl, hash });
    return response.data.data;
  },

  complete: async (id: string): Promise<Commission> => {
    const response = await api.post(`/commissions/${id}/complete`);
    return response.data.data;
  },

  getChatToken: async (id: string): Promise<string> => {
    const response = await api.get(`/commissions/${id}/chat-token`);
    return response.data.data.token;
  },
  
  getUploadSignature: async (): Promise<{ signature: string; timestamp: number; cloudName: string; apiKey: string }> => {
    const response = await api.get('/commissions/upload-signature');
    return response.data.data;
  }
};
