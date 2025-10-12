const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const exchangeRoutes = require('../routes/exchanges');
const skillRoutes = require('../routes/skills');
const notificationRoutes = require('../routes/notifications');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/notifications', notificationRoutes);

describe('Integration Tests', () => {
  let requesterToken;
  let providerToken;
  let requesterId;
  let providerId;
  let exchangeId;
  let skillId;

  beforeEach(async () => {
    // Create two test users
    const requesterData = testUtils.createTestUser({
      email: 'requester@example.com',
      name: 'Requester User'
    });
    
    const providerData = testUtils.createTestUser({
      email: 'provider@example.com',
      name: 'Provider User'
    });

    // Register and login requester
    await request(app)
      .post('/api/auth/register')
      .send(requesterData);
    
    const requesterLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: requesterData.email,
        password: requesterData.password
      });
    
    requesterToken = requesterLoginResponse.body.data.token;
    requesterId = requesterLoginResponse.body.data.user.id;

    // Register and login provider
    await request(app)
      .post('/api/auth/register')
      .send(providerData);
    
    const providerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: providerData.email,
        password: providerData.password
      });
    
    providerToken = providerLoginResponse.body.data.token;
    providerId = providerLoginResponse.body.data.user.id;
  });

  describe('Complete Exchange Flow', () => {
    it('should complete the full exchange workflow', async () => {
      // Step 1: Provider adds a skill
      const skillData = testUtils.createTestSkill();
      
    const skillResponse = await request(app)
      .post('/api/skills')
        .set('Authorization', `Bearer ${providerToken}`)
        .send(skillData)
        .expect(201);

    skillId = skillResponse.body.data.id;
      expect(skillResponse.body.success).toBe(true);

      // Step 2: Requester creates an exchange request
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId
      });

      const exchangeResponse = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData)
        .expect(201);
      
      exchangeId = exchangeResponse.body.data.id;
      expect(exchangeResponse.body.success).toBe(true);
      expect(exchangeResponse.body.data.status).toBe('Pending');

      // Step 3: Check that provider received notification
      const notificationsResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);
      
      expect(notificationsResponse.body.success).toBe(true);
      expect(notificationsResponse.body.data.length).toBeGreaterThan(0);

      // Step 4: Provider accepts the exchange
      const acceptResponse = await request(app)
        .put(`/api/exchanges/${exchangeId}/accept`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);
      
      expect(acceptResponse.body.success).toBe(true);
      expect(acceptResponse.body.data.status).toBe('Accepted');

      // Step 5: Check that requester received notification
      const requesterNotificationsResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(200);
      
      expect(requesterNotificationsResponse.body.success).toBe(true);
      expect(requesterNotificationsResponse.body.data.length).toBeGreaterThan(0);

      // Step 6: Provider completes the exchange
      const completeResponse = await request(app)
        .put(`/api/exchanges/${exchangeId}/complete`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);
      
      expect(completeResponse.body.success).toBe(true);
      expect(completeResponse.body.data.status).toBe('Completed');

      // Step 7: Requester rates the exchange
      const ratingData = {
        rating: 5,
        comment: 'Excellent teaching!'
      };

      const ratingResponse = await request(app)
        .post(`/api/exchanges/${exchangeId}/rate`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(ratingData)
        .expect(201);
      
      expect(ratingResponse.body.success).toBe(true);
      expect(ratingResponse.body.data.rating).toBe(5);

      // Step 8: Verify points were transferred
      const requesterProfileResponse = await request(app)
        .get(`/api/users/${requesterId}`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(200);
      
      expect(requesterProfileResponse.body.success).toBe(true);
      expect(requesterProfileResponse.body.data.pointsBalance).toBeLessThan(100); // Should be less due to payment

      const providerProfileResponse = await request(app)
        .get(`/api/users/${providerId}`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);
      
      expect(providerProfileResponse.body.success).toBe(true);
      expect(providerProfileResponse.body.data.pointsBalance).toBeGreaterThan(100); // Should be more due to earning

      // Step 9: Verify transaction history
      const requesterTransactionsResponse = await request(app)
        .get('/api/users/my-transactions')
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(200);
      
      expect(requesterTransactionsResponse.body.success).toBe(true);
      expect(requesterTransactionsResponse.body.data.transactions.length).toBeGreaterThan(0);

      const providerTransactionsResponse = await request(app)
        .get('/api/users/my-transactions')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);
      
      expect(providerTransactionsResponse.body.success).toBe(true);
      expect(providerTransactionsResponse.body.data.transactions.length).toBeGreaterThan(0);

      // Step 10: Verify rating was recorded
      const providerRatingsResponse = await request(app)
        .get(`/api/users/${providerId}/ratings`)
        .expect(200);
      
      expect(providerRatingsResponse.body.success).toBe(true);
      expect(providerRatingsResponse.body.data.length).toBeGreaterThan(0);
      expect(providerRatingsResponse.body.data[0].rating).toBe(5);
    });
  });

  describe('Exchange Decline Flow', () => {
    it('should handle exchange decline and refund', async () => {
      // Step 1: Requester creates an exchange request
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId
      });

      const exchangeResponse = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData)
        .expect(201);
      
      exchangeId = exchangeResponse.body.data.id;
      const initialPoints = 100;

      // Step 2: Check requester's initial points
      const initialProfileResponse = await request(app)
        .get(`/api/users/${requesterId}`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(200);
      
      expect(initialProfileResponse.body.data.pointsBalance).toBeLessThan(initialPoints);

      // Step 3: Provider declines the exchange
      const declineResponse = await request(app)
        .put(`/api/exchanges/${exchangeId}/decline`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);
      
      expect(declineResponse.body.success).toBe(true);
      expect(declineResponse.body.data.status).toBe('Declined');

      // Step 4: Verify points were refunded
      const finalProfileResponse = await request(app)
        .get(`/api/users/${requesterId}`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(200);
      
      expect(finalProfileResponse.body.data.pointsBalance).toBe(initialPoints);

      // Step 5: Verify refund transaction was recorded
      const transactionsResponse = await request(app)
        .get('/api/users/my-transactions')
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(200);
      
      expect(transactionsResponse.body.success).toBe(true);
      expect(transactionsResponse.body.data.transactions.length).toBeGreaterThan(0);
      
      // Should have both payment and refund transactions
      const transactions = transactionsResponse.body.data.transactions;
      const paymentTransaction = transactions.find(t => t.type === 'Payment');
      const refundTransaction = transactions.find(t => t.type === 'Award' && t.description.includes('Refund'));
      
      expect(paymentTransaction).toBeDefined();
      expect(refundTransaction).toBeDefined();
    });
  });

  describe('Messaging Flow', () => {
    it('should handle exchange messaging', async () => {
      // Step 1: Create an exchange
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId
      });

      const exchangeResponse = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData)
        .expect(201);
      
      exchangeId = exchangeResponse.body.data.id;

      // Step 2: Requester sends a message
      const messageData = {
        content: 'Hello, when can we schedule this?',
        messageType: 'text'
      };

      const messageResponse = await request(app)
        .post(`/api/exchanges/${exchangeId}/message`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(messageData)
        .expect(201);
      
      expect(messageResponse.body.success).toBe(true);
      expect(messageResponse.body.data.content).toBe(messageData.content);

      // Step 3: Provider sends a reply
      const replyData = {
        content: 'How about tomorrow at 2 PM?',
        messageType: 'text'
      };

      const replyResponse = await request(app)
        .post(`/api/exchanges/${exchangeId}/message`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send(replyData)
        .expect(201);
      
      expect(replyResponse.body.success).toBe(true);
      expect(replyResponse.body.data.content).toBe(replyData.content);

      // Step 4: Get exchange details to verify messages
      const exchangeDetailsResponse = await request(app)
        .get(`/api/exchanges/${exchangeId}`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(200);
      
      expect(exchangeDetailsResponse.body.success).toBe(true);
      expect(exchangeDetailsResponse.body.data.messages.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Search and Discovery Flow', () => {
    it('should handle skill search and user discovery', async () => {
      // Step 1: Provider adds multiple skills
      const skills = [
        testUtils.createTestSkill({ name: 'JavaScript', category: 'Programming' }),
        testUtils.createTestSkill({ name: 'Python', category: 'Programming' }),
        testUtils.createTestSkill({ name: 'Cooking', category: 'Lifestyle' })
      ];

      for (const skill of skills) {
        await request(app)
          .post('/api/skills')
          .set('Authorization', `Bearer ${providerToken}`)
          .send(skill)
          .expect(201);
      }

      // Step 2: Search for programming skills
      const searchResponse = await request(app)
        .get('/api/skills/search?category=Programming')
        .expect(200);
      
      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data.length).toBeGreaterThanOrEqual(2);

      // Step 3: Search for specific skill
      const specificSearchResponse = await request(app)
        .get('/api/skills/search?q=JavaScript')
        .expect(200);
      
      expect(specificSearchResponse.body.success).toBe(true);
      expect(specificSearchResponse.body.data.length).toBeGreaterThan(0);

      // Step 4: Get all users
      const usersResponse = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(usersResponse.body.success).toBe(true);
      expect(usersResponse.body.data.length).toBeGreaterThanOrEqual(2);

      // Step 5: Search users by location
      const locationSearchResponse = await request(app)
        .get('/api/users?location=Stockholm')
        .expect(200);
      
      expect(locationSearchResponse.body.success).toBe(true);
      expect(locationSearchResponse.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle various error scenarios gracefully', async () => {
      // Test invalid authentication
      const invalidTokenResponse = await request(app)
        .get('/api/users/my-transactions')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
      
      expect(invalidTokenResponse.body.success).toBe(false);

      // Test missing authentication
      const noTokenResponse = await request(app)
        .get('/api/users/my-transactions')
        .expect(401);
      
      expect(noTokenResponse.body.success).toBe(false);

      // Test non-existent resource
      const notFoundResponse = await request(app)
        .get('/api/exchanges/nonexistent-id')
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(404);
      
      expect(notFoundResponse.body.success).toBe(false);

      // Test invalid data
      const invalidDataResponse = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({}) // Missing required fields
        .expect(400);
      
      expect(invalidDataResponse.body.success).toBe(false);

      // Test unauthorized access
      const unauthorizedResponse = await request(app)
        .put(`/api/users/${providerId}`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ name: 'Hacked Name' })
        .expect(403);
      
      expect(unauthorizedResponse.body.success).toBe(false);
    });
  });
});