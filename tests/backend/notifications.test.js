const request = require('supertest');
const app = require('../../server');
const database = require('../../src/backend/models/Database');

describe('Notifications API', () => {
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

  describe('GET /api/notifications', () => {
    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      // First create a notification
      const notificationData = {
        type: 'exchange_request',
        title: 'New Exchange Request',
        message: 'You have a new exchange request',
        data: { exchangeId: 'test-id' }
      };

      const createResponse = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationData)
        .expect(201);

      const notificationId = createResponse.body.data.id;

      // Mark as read
      const response = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
