import { injectable } from 'tsyringe';
import PubNub from 'pubnub';
import { 
  PUBNUB_PUBLISH_KEY, 
  PUBNUB_SUBSCRIBE_KEY, 
  PUBNUB_SECRET_KEY 
} from '@config/env';
import { HttpException } from '@exceptions/httpException';

@injectable()
export class ChatService {
  private pubnub: PubNub;
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly MAX_MESSAGES_PER_MINUTE = 10;
  private userMessageTimestamps: Map<string, number[]> = new Map();

  constructor() {
    this.pubnub = new PubNub({
      publishKey: PUBNUB_PUBLISH_KEY,
      subscribeKey: PUBNUB_SUBSCRIBE_KEY,
      secretKey: PUBNUB_SECRET_KEY,
      uuid: 'server-admin',
    });
  }

  async grantToken(userId: string, commissionId: string): Promise<string> {
    const channel = `commission.${commissionId}`;
    try {
      const token = await this.pubnub.grantToken({
        ttl: 1440, // 24 hours
        authorized_uuid: userId,
        resources: {
          channels: {
            [channel]: {
              read: true,
              write: true, // Allow write for signals/receipts, but clients should prefer backend for messages
            },
          },
        },
      });
      return token;
    } catch (error) {
      console.error('PubNub Grant Error:', error);
      throw new Error('Failed to grant chat token');
    }
  }

  async sendMessage(userId: string, commissionId: string, content: { text?: string; imageUrl?: string }): Promise<void> {
    const channel = `commission.${commissionId}`;

    // 1. Rate Limiting
    this.checkRateLimit(userId);

    // 2. Content Moderation (PII & NudeNet Placeholder)
    if (content.text) {
      this.checkPII(content.text);
    }
    if (content.imageUrl) {
      await this.checkImageSafety(content.imageUrl);
    }

    // 3. Publish to PubNub
    try {
      await this.pubnub.publish({
        channel,
        message: {
          ...content,
          uuid: userId,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.error('PubNub Publish Error:', error);
      throw new HttpException(500, 'Failed to send message');
    }
  }

  private checkRateLimit(userId: string): void {
    const now = Date.now();
    const timestamps = this.userMessageTimestamps.get(userId) || [];
    
    // Filter out timestamps older than the window
    const recentTimestamps = timestamps.filter(t => now - t < this.RATE_LIMIT_WINDOW);
    
    if (recentTimestamps.length >= this.MAX_MESSAGES_PER_MINUTE) {
      throw new HttpException(429, 'Rate limit exceeded. Max 10 messages per minute.');
    }

    recentTimestamps.push(now);
    this.userMessageTimestamps.set(userId, recentTimestamps);
  }

  private checkPII(text: string): void {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;

    if (emailRegex.test(text) || phoneRegex.test(text)) {
      throw new HttpException(400, 'Message contains PII (Email or Phone). Please remove it.');
    }
  }

  private async checkImageSafety(imageUrl: string): Promise<void> {
    // TODO: Integrate real NudeNet service or similar API
    // For now, we mock it. If URL contains "unsafe", we block it.
    if (imageUrl.includes('unsafe')) {
        // Admin notify logic would go here
        console.warn(`[Admin Notify] Unsafe image blocked: ${imageUrl}`);
        throw new HttpException(400, 'Image detected as unsafe content.');
    }
  }
}

