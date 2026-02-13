import { api } from './client';

export const chatApi = {
  sendMessage: (commissionId: string, content: { text?: string; imageUrl?: string }) => 
    api.post('/chat/message', { commissionId, content }),
};
