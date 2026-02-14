import { ChatService } from '../../services/chat.service';

export class MockChatService extends ChatService {
  async grantToken(userId: string, channelId: string): Promise<string> {
    return 'mock-token';
  }
}
