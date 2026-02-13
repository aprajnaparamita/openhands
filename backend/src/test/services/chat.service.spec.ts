import 'reflect-metadata';
import { ChatService } from '../../services/chat.service';
import { HttpException } from '../../exceptions/httpException';

// Mock PubNub
jest.mock('pubnub', () => {
  return jest.fn().mockImplementation(() => ({
    grantToken: jest.fn().mockResolvedValue('mock-token'),
    publish: jest.fn().mockResolvedValue({ timetoken: '1234567890' }),
  }));
});

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService();
  });

  describe('sendMessage', () => {
    it('should send a valid message', async () => {
      await expect(chatService.sendMessage('user1', 'comm1', { text: 'Hello' })).resolves.not.toThrow();
    });

    it('should throw error for PII (email)', async () => {
      await expect(chatService.sendMessage('user1', 'comm1', { text: 'Contact me at test@example.com' }))
        .rejects.toThrow(HttpException);
    });

    it('should throw error for PII (phone)', async () => {
      await expect(chatService.sendMessage('user1', 'comm1', { text: 'Call me at 123-456-7890' }))
        .rejects.toThrow(HttpException);
    });

    it('should enforce rate limits', async () => {
      // Send 10 messages
      for (let i = 0; i < 10; i++) {
        await chatService.sendMessage('user2', 'comm1', { text: `Message ${i}` });
      }

      // 11th should fail
      await expect(chatService.sendMessage('user2', 'comm1', { text: 'Message 11' }))
        .rejects.toThrow('Rate limit exceeded');
    });

    it('should block unsafe images', async () => {
      await expect(chatService.sendMessage('user1', 'comm1', { imageUrl: 'http://example.com/unsafe.jpg' }))
        .rejects.toThrow('Image detected as unsafe content');
    });
  });
});
