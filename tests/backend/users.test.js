const request = require('supertest');
const app = require('../../server');
const database = require('../../src/backend/models/Database');

describe('Users API', () => {
  let authToken;

  beforeAll(async () => {
    await database.initialize();
    
    // Get auth token for protected routes
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  describe('GET /api/users', () => {
    it('should get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/users/search', () => {
    it('should search users', async () => {
      const response = await request(app)
        .get('/api/users/search?q=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
