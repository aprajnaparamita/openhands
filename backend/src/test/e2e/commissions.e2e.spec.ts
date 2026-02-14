import request from 'supertest';
import { createTestApp, resetUserDB } from '@/test/setup';

describe('Commissions API', () => {
  let server: any;
  const prefix = '/api/v1';

  beforeAll(() => {
    server = createTestApp();
  });

  beforeEach(() => {
    resetUserDB();
  });

  const walletUser = { 
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' 
  };

  async function login() {
    const res = await request(server)
      .post(`${prefix}/auth/wallet`)
      .send(walletUser);
    return res.headers['set-cookie'];
  }

  it('should create a commission', async () => {
    const cookie = await login();

    const commissionData = {
      title: 'New Commission',
      description: 'Test Description',
      price: 100,
      deadline: new Date().toISOString()
    };

    const res = await request(server)
      .post(`${prefix}/commissions`)
      .set('Cookie', cookie)
      .send(commissionData);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe(commissionData.title);
    expect(res.body.data.status).toBe('created');
  });

  it('should get available commissions', async () => {
    // 1. Login and Create a funded commission (simulated)
    // Since we are mocking the repository, we can just check if the endpoint returns empty list initially
    
    const res = await request(server)
      .get(`${prefix}/commissions/available`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get commission by id', async () => {
    const cookie = await login();

    // Create
    const createRes = await request(server)
      .post(`${prefix}/commissions`)
      .set('Cookie', cookie)
      .send({
        title: 'For ID Check',
        description: 'Desc',
        price: 50
      });
    
    const id = createRes.body.data.id;

    // Get
    const getRes = await request(server)
      .get(`${prefix}/commissions/${id}`)
      .set('Cookie', cookie);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.data.id).toBe(id);
  });
});
