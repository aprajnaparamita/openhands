import request from 'supertest';
import { createTestApp, resetUserDB } from '@/test/setup';

describe('Auth API', () => {
  let server: any;
  const prefix = '/api/v1';

  beforeAll(() => {
    server = createTestApp(); // Use shared repository for testing
  });

  beforeEach(() => {
    resetUserDB(); // Reset repository before each test
  });

  const walletUser = { 
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' 
  };

  it('should login with wallet and set a cookie', async () => {
    const res = await request(server)
      .post(`${prefix}/auth/wallet`)
      .send(walletUser);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.data.walletAddress).toBe(walletUser.walletAddress);
    expect(res.header['set-cookie']).toBeDefined();
  });

  it('should logout a user', async () => {
    // First login
    const loginRes = await request(server)
      .post(`${prefix}/auth/wallet`)
      .send(walletUser);
      
    const cookie = loginRes.headers['set-cookie'];
    
    // Then logout
    const logoutRes = await request(server)
      .post(`${prefix}/auth/logout`)
      .set('Cookie', cookie);
      
    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.body.message).toBe('logout');
  });

  it('should get current user (me)', async () => {
    // First login
    const loginRes = await request(server)
      .post(`${prefix}/auth/wallet`)
      .send(walletUser);
      
    const cookie = loginRes.headers['set-cookie'];

    // Get me
    const meRes = await request(server)
      .get(`${prefix}/auth/me`)
      .set('Cookie', cookie);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.data.walletAddress).toBe(walletUser.walletAddress);
  });
});
