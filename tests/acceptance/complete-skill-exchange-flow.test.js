const request = require('supertest');
const app = require('../../server');
const database = require('../../src/backend/models/Database');

describe('Complete Skill Exchange Flow - Acceptance Tests', () => {
  let requesterToken, providerToken;
  let requesterId, providerId;
  let exchangeId;

  beforeAll(async () => {
    await database.initialize();
    
    // Create test users
    const requesterData = {
      name: 'Skill Requester',
      email: 'requester@test.com',
      password: 'password123'
    };

    const providerData = {
      name: 'Skill Provider',
      email: 'provider@test.com',
      password: 'password123'
    };

    // Register requester
    const requesterResponse = await request(app)
      .post('/api/auth/register')
      .send(requesterData);
    
    requesterToken = requesterResponse.body.data.token;
    requesterId = requesterResponse.body.data.user.id;

    // Register provider
    const providerResponse = await request(app)
      .post('/api/auth/register')
      .send(providerData);
    
    providerToken = providerResponse.body.data.token;
    providerId = providerResponse.body.data.user.id;
  });

  describe('Complete Exchange Flow', () => {
    it('should complete full skill exchange process', async () => {
      // Step 1: Create exchange request
      const exchangeData = {
        providerID: providerId,
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

      const createResponse = await request(app)
        .post('/api/exchanges')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      exchangeId = createResponse.body.data.id;

      // Step 2: Provider accepts exchange
      const acceptResponse = await request(app)
        .put(`/api/exchanges/${exchangeId}/accept`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(acceptResponse.body.success).toBe(true);

      // Step 3: Complete exchange
      const completeResponse = await request(app)
        .put(`/api/exchanges/${exchangeId}/complete`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(completeResponse.body.success).toBe(true);
    });
  });
});
