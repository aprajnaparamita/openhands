import { api } from './client';

export interface AdminStats {
  users: {
    total: number;
    artists: number;
    requesters: number;
    banned: number;
  };
  commissions: {
    completed: number;
    disputed: number;
    totalVolume: number;
  };
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  banUser: async (userId: string) => {
    const response = await api.post(`/admin/users/${userId}/ban`);
    return response.data;
  },

  unbanUser: async (userId: string) => {
    const response = await api.post(`/admin/users/${userId}/unban`);
    return response.data;
  },

  getDisputes: async () => {
    const response = await api.get('/admin/disputes');
    return response.data;
  },

  resolveDispute: async (commissionId: string, resolution: 'refund' | 'pay_provider', txSignature?: string) => {
    const response = await api.post(`/admin/disputes/${commissionId}/resolve`, { resolution, txSignature });
    return response.data;
  }
};
