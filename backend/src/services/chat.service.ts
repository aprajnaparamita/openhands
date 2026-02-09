import { injectable } from 'tsyringe';
import PubNub from 'pubnub';
import { 
  PUBNUB_PUBLISH_KEY, 
  PUBNUB_SUBSCRIBE_KEY, 
  PUBNUB_SECRET_KEY 
} from '@config/env';

@injectable()
export class ChatService {
  private pubnub: PubNub;

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
              write: true,
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
}
