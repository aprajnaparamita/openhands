import request from 'supertest';
import { createTestApp, resetUserDB } from '@/test/setup';

describe('Users API', () => {
  let server: any;
  const prefix = '/api/v1';

  beforeAll(() => {
    server = createTestApp(); // Initialize server with shared repository
  });

  beforeEach(() => {
    resetUserDB(); // Reset repository before each test
  });

  const walletUser = { 
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    name: 'Test User'
  };

  it('should create a new user', async () => {
    const res = await request(server).post(`${prefix}/users`).send(walletUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.walletAddress).toBe(walletUser.walletAddress);
    expect(res.body.data.name).toBe(walletUser.name);
  });

  it('should retrieve all users', async () => {
    await request(server).post(`${prefix}/users`).send(walletUser);
    const res = await request(server).get(`${prefix}/users`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].walletAddress).toBe(walletUser.walletAddress);
  });

  it('should retrieve a user by id', async () => {
    const createRes = await request(server).post(`${prefix}/users`).send(walletUser);
    const id = createRes.body.data.id;

    const res = await request(server).get(`${prefix}/users/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.walletAddress).toBe(walletUser.walletAddress);
  });

  it('should update user information', async () => {
    // 1. Create user
    const createRes = await request(server).post(`${prefix}/users`).send(walletUser);
    const id = createRes.body.data.id;

    // 2. Login to get cookie (AuthMiddleware required for PUT)
    const loginRes = await request(server).post(`${prefix}/auth/wallet`).send({ walletAddress: walletUser.walletAddress });
    const cookie = loginRes.headers['set-cookie'];

    // 3. Update
    const newName = 'Updated Name';
    const res = await request(server)
      .put(`${prefix}/users/${id}`)
      .set('Cookie', cookie)
      .send({ name: newName });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(id);
    expect(res.body.data.name).toBe(newName);
  });

  it('should delete a user', async () => {
    // 1. Create user
    const createRes = await request(server).post(`${prefix}/users`).send(walletUser);
    const id = createRes.body.data.id;

    // 2. Login to get cookie (AuthMiddleware required for DELETE)
    const loginRes = await request(server).post(`${prefix}/auth/wallet`).send({ walletAddress: walletUser.walletAddress });
    const cookie = loginRes.headers['set-cookie'];

    // 3. Delete
    const res = await request(server)
      .delete(`${prefix}/users/${id}`)
      .set('Cookie', cookie);
      
    expect(res.statusCode).toBe(204);
  });

  it('should return 404 if user does not exist', async () => {
    // Use a random UUID
    const randomId = '00000000-0000-0000-0000-000000000000';
    const res = await request(server).get(`${prefix}/users/${randomId}`);
    expect(res.statusCode).toBe(404);
  });
});
