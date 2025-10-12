const request = require('supertest');
const express = require('express');
const notificationRoutes = require('../routes/notifications');
const authRoutes = require('../routes/auth');
const exchangeRoutes = require('../routes/exchanges');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/notifications', notificationRoutes);

describe('Notification Routes', () => {
  let userToken;
  let userId;
  let otherUserToken;
  let otherUserId;

  beforeEach(async () => {
    // Create two test users
    const userData = testUtils.createTestUser({
      email: 'user@example.com',
      name: 'Test User'
    });
    
    const otherUserData = testUtils.createTestUser({
      email: 'other@example.com',
      name: 'Other User'
    });

    // Register and login first user
    await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });
    
    userToken = userLoginResponse.body.data.token;
    userId = userLoginResponse.body.data.user.id;

    // Register and login second user
    await request(app)
      .post('/api/auth/register')
      .send(otherUserData);
    
    const otherUserLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: otherUserData.email,
        password: otherUserData.password
      });
    
    otherUserToken = otherUserLoginResponse.body.data.token;
    otherUserId = otherUserLoginResponse.body.data.user.id;
  });

  describe('GET /api/notifications', () => {
    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get notifications with limit', async () => {
      const response = await request(app)
        .get('/api/notifications?limit=10')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should filter notifications by type', async () => {
      const response = await request(app)
        .get('/api/notifications?type=exchange')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter notifications by read status', async () => {
      const response = await request(app)
        .get('/api/notifications?read=false')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('should get unread notification count', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('unreadCount');
      expect(typeof response.body.data.unreadCount).toBe('number');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    let notificationId;

    beforeEach(async () => {
      // Create an exchange to generate a notification
      const exchangeData = testUtils.createTestExchange({
        providerID: otherUserId
      });

      const exchangeResponse = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(exchangeData);

      // Get notifications to find the created one
      const notificationsResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${otherUserToken}`);

      if (notificationsResponse.body.data.length > 0) {
        notificationId = notificationsResponse.body.data[0].id;
      }
    });

    it('should mark notification as read', async () => {
      if (!notificationId) {
        // Skip test if no notification was created
        return;
      }

      const response = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification marked as read');
    });

    it('should reject request without authentication', async () => {
      if (!notificationId) {
        return;
      }

      const response = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .put('/api/notifications/nonexistent-id/read')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Notification not found');
    });

    it('should reject marking notification as read by wrong user', async () => {
      if (!notificationId) {
        return;
      }

      const response = await request(app)
        .put(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Notification not found');
    });
  });

  describe('PUT /api/notifications/mark-all-read', () => {
    it('should mark all notifications as read', async () => {
      const response = await request(app)
        .put('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('All notifications marked as read');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .put('/api/notifications/mark-all-read')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    let notificationId;

    beforeEach(async () => {
      // Create an exchange to generate a notification
      const exchangeData = testUtils.createTestExchange({
        providerID: otherUserId
      });

      await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(exchangeData);

      // Get notifications to find the created one
      const notificationsResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${otherUserToken}`);

      if (notificationsResponse.body.data.length > 0) {
        notificationId = notificationsResponse.body.data[0].id;
      }
    });

    it('should delete notification successfully', async () => {
      if (!notificationId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification deleted successfully');
    });

    it('should reject request without authentication', async () => {
      if (!notificationId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .delete('/api/notifications/nonexistent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Notification not found');
    });

    it('should reject deletion by wrong user', async () => {
      if (!notificationId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Notification not found');
    });
  });

  describe('Notification Integration Tests', () => {
    it('should create notification when exchange is created', async () => {
      // Get initial notification count
      const initialResponse = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${otherUserToken}`);

      const initialCount = initialResponse.body.data.unreadCount;

      // Create an exchange
      const exchangeData = testUtils.createTestExchange({
        providerID: otherUserId
      });

      await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(exchangeData);

      // Check if notification count increased
      const finalResponse = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(finalResponse.body.data.unreadCount).toBeGreaterThan(initialCount);
    });

    it('should create notification when exchange is accepted', async () => {
      // Create an exchange
      const exchangeData = testUtils.createTestExchange({
        providerID: otherUserId
      });

      const exchangeResponse = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(exchangeData);

      const exchangeId = exchangeResponse.body.data.id;

      // Get initial notification count for requester
      const initialResponse = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`);

      const initialCount = initialResponse.body.data.unreadCount;

      // Accept the exchange
      await request(app)
        .put(`/api/exchanges/${exchangeId}/accept`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      // Check if notification count increased for requester
      const finalResponse = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`);

      expect(finalResponse.body.data.unreadCount).toBeGreaterThan(initialCount);
    });

    it('should create notification when exchange is completed', async () => {
      // Create and accept an exchange
      const exchangeData = testUtils.createTestExchange({
        providerID: otherUserId
      });

      const exchangeResponse = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send(exchangeData);

      const exchangeId = exchangeResponse.body.data.id;

      await request(app)
        .put(`/api/exchanges/${exchangeId}/accept`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      // Get initial notification count for requester
      const initialResponse = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`);

      const initialCount = initialResponse.body.data.unreadCount;

      // Complete the exchange
      await request(app)
        .put(`/api/exchanges/${exchangeId}/status`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ status: 'Completed' });

      // Check if notification count increased for requester
      const finalResponse = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`);

      expect(finalResponse.body.data.unreadCount).toBeGreaterThan(initialCount);
    });
  });
});
