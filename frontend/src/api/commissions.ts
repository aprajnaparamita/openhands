import { api } from './client';
import { CreateCommissionData, Commission } from '../types/commission';

export const commissionApi = {
  create: async (data: CreateCommissionData): Promise<Commission> => {
    const response = await api.post('/commissions', data);
    return response.data.data;
  },

  getAll: async (): Promise<Commission[]> => {
    const response = await api.get('/commissions');
    return response.data.data;
  },

  getAvailable: async (): Promise<Commission[]> => {
    const response = await api.get('/commissions/available');
    return response.data.data;
  },

  getById: async (id: string): Promise<Commission> => {
    const response = await api.get(`/commissions/${id}`);
    return response.data.data;
  },

  fund: async (id: string, txSignature?: string): Promise<Commission> => {
    const response = await api.post(`/commissions/${id}/fund`, { txSignature });
    return response.data.data;
  },

  accept: async (id: string, txSignature?: string): Promise<Commission> => {
    const response = await api.post(`/commissions/${id}/accept`, { txSignature });
    return response.data.data;
  },

  deliver: async (id: string, artworkUrl: string, hash: string, txSignature?: string): Promise<Commission> => {
    const response = await api.post(`/commissions/${id}/deliver`, { artworkUrl, hash, txSignature });
    return response.data.data;
  },

  review: async (id: string, score: number, review: string, txSignature?: string): Promise<Commission> => {
    const response = await api.post(`/commissions/${id}/review`, { score, review, txSignature });
    return response.data.data;
  },

  complete: async (id: string, txSignature?: string): Promise<Commission> => {
    const response = await api.post(`/commissions/${id}/complete`, { txSignature });
    return response.data.data;
  },

  getChatToken: async (id: string): Promise<string> => {
    const response = await api.get(`/commissions/${id}/chat-token`);
    return response.data.data.token;
  },
  
  getUploadSignature: async (): Promise<{ signature: string; timestamp: number; cloudName: string; apiKey: string; folder?: string }> => {
    const response = await api.get('/commissions/upload-signature');
    return response.data.data;
  }
};
