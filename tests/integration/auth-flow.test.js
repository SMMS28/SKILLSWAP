const request = require('supertest');
const app = require('../../server');
const database = require('../../src/backend/models/Database');

describe('Authentication Flow Integration Tests', () => {
  beforeAll(async () => {
    await database.initialize();
  });

  afterAll(async () => {
    // Clean up
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full registration and login flow', async () => {
      const userData = {
        name: 'Integration Test User',
        email: 'integration@test.com',
        password: 'password123',
        location: 'Test City',
        bio: 'Integration test user'
      };

      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.user.email).toBe(userData.email);
      expect(registerResponse.body.data.token).toBeDefined();

      const token = registerResponse.body.data.token;

      // Step 2: Access protected route
      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data.email).toBe(userData.email);

      // Step 3: Login with same credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.user.email).toBe(userData.email);
    });
  });
});
