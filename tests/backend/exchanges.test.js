const request = require('supertest');
const app = require('../../server');
const database = require('../../src/backend/models/Database');

describe('Exchanges API', () => {
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

  describe('GET /api/exchanges', () => {
    it('should get user exchanges', async () => {
      const response = await request(app)
        .get('/api/exchanges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/exchanges', () => {
    it('should create a new exchange', async () => {
      const exchangeData = {
        providerID: 'test-provider-id',
        skillID: 'test-skill-id',
        skill: 'JavaScript',
        skillLevel: 'Intermediate',
        description: 'Learn JavaScript basics',
        sessionType: 'Online',
        hourlyRate: 25,
        scheduledDate: '2024-01-15T10:00:00Z',
        durationHours: 2,
        isMutualExchange: false
      };

      const response = await request(app)
        .post('/api/exchanges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exchangeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.skill).toBe(exchangeData.skill);
    });
  });
});
