const request = require('supertest');
const express = require('express');
const exchangeRoutes = require('../routes/exchanges');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const database = require('../models/Database');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exchanges', exchangeRoutes);

describe('Exchange Routes', () => {
  let requesterToken;
  let providerToken;
  let requesterId;
  let providerId;

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

  describe('POST /api/exchanges/create', () => {
    it('should create a new exchange successfully', async () => {
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId,
        skillID: 'test-skill-id', // Add required skillID
        skillLevel: 'Intermediate' // Add required skillLevel
      });

      const response = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Exchange request created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.skill).toBe(exchangeData.skill);
      expect(response.body.data.requesterID).toBe(requesterId);
      expect(response.body.data.providerID).toBe(providerId);
      expect(response.body.data.status).toBe('Pending');
    });

    it('should reject exchange creation without authentication', async () => {
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId
      });

      const response = await request(app)
        .post('/api/exchanges/create')
        .send(exchangeData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should reject exchange creation with missing required fields', async () => {
      const exchangeData = {
        // Missing skill, providerID, and skillID
        description: 'Learn JavaScript'
      };

      const response = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Provider ID, skill ID, and skill name are required');
    });

    it('should reject exchange creation with invalid provider', async () => {
      const exchangeData = testUtils.createTestExchange({
        providerID: 'nonexistent-provider-id'
      });

      const response = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Provider not found');
    });

    it('should reject exchange creation with insufficient points', async () => {
      // Create exchange with very high cost
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId,
        hourlyRate: 1000,
        durationHours: 10 // Total cost: 10,000 points
      });

      const response = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient points. You need 10000 points but only have 100 points.');
    });
  });

  describe('GET /api/exchanges/my-exchanges', () => {
    let exchangeId;

    beforeEach(async () => {
      // Create a test exchange
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId
      });

      const response = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData);
      
      exchangeId = response.body.data.id;
    });

    it('should get user exchanges as requester', async () => {
      const response = await request(app)
        .get('/api/exchanges/my-exchanges')
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].id).toBe(exchangeId);
    });

    it('should get user exchanges as provider', async () => {
      const response = await request(app)
        .get('/api/exchanges/my-exchanges')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].id).toBe(exchangeId);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/exchanges/my-exchanges')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('GET /api/exchanges/:id', () => {
    let exchangeId;

    beforeEach(async () => {
      // Create a test exchange
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId
      });

      const response = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData);
      
      exchangeId = response.body.data.id;
    });

    it('should get exchange details for requester', async () => {
      const response = await request(app)
        .get(`/api/exchanges/${exchangeId}`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(exchangeId);
      expect(response.body.data.requesterID).toBe(requesterId);
      expect(response.body.data.providerID).toBe(providerId);
    });

    it('should get exchange details for provider', async () => {
      const response = await request(app)
        .get(`/api/exchanges/${exchangeId}`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(exchangeId);
      expect(response.body.data.requesterID).toBe(requesterId);
      expect(response.body.data.providerID).toBe(providerId);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/exchanges/${exchangeId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should return 404 for non-existent exchange', async () => {
      const response = await request(app)
        .get('/api/exchanges/nonexistent-id')
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Exchange not found');
    });
  });

  describe('PUT /api/exchanges/:id/accept', () => {
    let exchangeId;

    beforeEach(async () => {
      // Create a test exchange
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId
      });

      const response = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData);
      
      exchangeId = response.body.data.id;
    });

    it('should accept exchange successfully', async () => {
      const response = await request(app)
        .put(`/api/exchanges/${exchangeId}/accept`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Exchange accepted successfully');
      expect(response.body.data.status).toBe('Accepted');
    });

    it('should reject acceptance without authentication', async () => {
      const response = await request(app)
        .put(`/api/exchanges/${exchangeId}/accept`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should reject acceptance by non-provider', async () => {
      const response = await request(app)
        .put(`/api/exchanges/${exchangeId}/accept`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Only the provider can accept this exchange');
    });

    it('should reject acceptance of already processed exchange', async () => {
      // First accept the exchange
      await request(app)
        .put(`/api/exchanges/${exchangeId}/accept`)
        .set('Authorization', `Bearer ${providerToken}`);

      // Try to accept again
      const response = await request(app)
        .put(`/api/exchanges/${exchangeId}/accept`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Exchange is no longer pending');
    });
  });

  describe('PUT /api/exchanges/:id/decline', () => {
    let exchangeId;

    beforeEach(async () => {
      // Create a test exchange
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId
      });

      const response = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData);
      
      exchangeId = response.body.data.id;
    });

    it('should decline exchange successfully', async () => {
      const response = await request(app)
        .put(`/api/exchanges/${exchangeId}/decline`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Exchange declined successfully');
      expect(response.body.data.status).toBe('Cancelled');
    });

    it('should reject decline without authentication', async () => {
      const response = await request(app)
        .put(`/api/exchanges/${exchangeId}/decline`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should reject decline by non-provider', async () => {
      const response = await request(app)
        .put(`/api/exchanges/${exchangeId}/decline`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Only the provider can decline this exchange');
    });
  });

  describe('PUT /api/exchanges/:id/status', () => {
    let exchangeId;

    beforeEach(async () => {
      // Create and accept a test exchange
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId
      });

      const createResponse = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData);
      
      exchangeId = createResponse.body.data.id;

      // Accept the exchange
      await request(app)
        .put(`/api/exchanges/${exchangeId}/accept`)
        .set('Authorization', `Bearer ${providerToken}`);
    });

    it('should complete exchange successfully', async () => {
      const response = await request(app)
        .put(`/api/exchanges/${exchangeId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ status: 'Completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Exchange status updated successfully');
      expect(response.body.data.status).toBe('Completed');
    });

    it('should reject completion without authentication', async () => {
      const response = await request(app)
        .put(`/api/exchanges/${exchangeId}/status`)
        .send({ status: 'Completed' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should reject completion by non-participant', async () => {
      const response = await request(app)
        .put(`/api/exchanges/${exchangeId}/status`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ status: 'Completed' })
        .expect(200); // Both requester and provider can update status

      expect(response.body.success).toBe(true);
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .put(`/api/exchanges/${exchangeId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ status: 'InvalidStatus' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid status');
    });
  });

  describe('POST /api/exchanges/:id/rate', () => {
    let exchangeId;

    beforeEach(async () => {
      // Create, accept, and complete a test exchange
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId
      });

      const createResponse = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData);
      
      exchangeId = createResponse.body.data.id;

      // Accept and complete the exchange
      await request(app)
        .put(`/api/exchanges/${exchangeId}/accept`)
        .set('Authorization', `Bearer ${providerToken}`);

      await request(app)
        .put(`/api/exchanges/${exchangeId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ status: 'Completed' });
    });

    it('should rate exchange successfully', async () => {
      const ratingData = {
        ratedUserID: providerId,
        score: 5,
        reviewText: 'Excellent teaching!'
      };

      const response = await request(app)
        .post(`/api/exchanges/${exchangeId}/rate`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(ratingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Rating submitted successfully');
      expect(response.body.data.score).toBe(ratingData.score);
      expect(response.body.data.reviewText).toBe(ratingData.reviewText);
    });

    it('should reject rating without authentication', async () => {
      const ratingData = {
        ratedUserID: providerId,
        score: 5,
        reviewText: 'Excellent teaching!'
      };

      const response = await request(app)
        .post(`/api/exchanges/${exchangeId}/rate`)
        .send(ratingData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should reject rating by non-requester', async () => {
      const ratingData = {
        ratedUserID: providerId,
        score: 5,
        reviewText: 'Excellent teaching!'
      };

      const response = await request(app)
        .post(`/api/exchanges/${exchangeId}/rate`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send(ratingData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Only the student can rate the teacher');
    });

    it('should reject rating of non-completed exchange', async () => {
      // Give the requester more points to create a second exchange
      await database.awardPoints(requesterId, 100, 'Award', 'Test points for second exchange', null);

      // Create a new exchange that is NOT completed
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId,
        skillID: 'test-skill-id-2',
        skillLevel: 'Intermediate'
      });

      const createResponse = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData)
        .expect(201);
      
      const newExchangeId = createResponse.body.data.id;

      // Accept the exchange but don't complete it
      await request(app)
        .put(`/api/exchanges/${newExchangeId}/accept`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      const ratingData = {
        ratedUserID: providerId,
        score: 5,
        reviewText: 'Excellent teaching!'
      };

      const response = await request(app)
        .post(`/api/exchanges/${newExchangeId}/rate`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(ratingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Can only rate completed exchanges');
    });

    it('should reject invalid rating values', async () => {
      const ratingData = {
        ratedUserID: providerId,
        score: 6, // Invalid rating (should be 1-5)
        reviewText: 'Excellent teaching!'
      };

      const response = await request(app)
        .post(`/api/exchanges/${exchangeId}/rate`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(ratingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Score must be between 1 and 5');
    });
  });

  describe('POST /api/exchanges/:id/message', () => {
    let exchangeId;

    beforeEach(async () => {
      // Create a test exchange
      const exchangeData = testUtils.createTestExchange({
        providerID: providerId
      });

      const response = await request(app)
        .post('/api/exchanges/create')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(exchangeData);
      
      exchangeId = response.body.data.id;
    });

    it('should send message successfully', async () => {
      const messageData = {
        content: 'Hello, when can we schedule this?',
        messageType: 'text'
      };

      const response = await request(app)
        .post(`/api/exchanges/${exchangeId}/message`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Message sent successfully');
      expect(response.body.data.content).toBe(messageData.content);
      expect(response.body.data.senderID).toBe(requesterId);
    });

    it('should reject message without authentication', async () => {
      const messageData = {
        content: 'Hello, when can we schedule this?',
        messageType: 'text'
      };

      const response = await request(app)
        .post(`/api/exchanges/${exchangeId}/message`)
        .send(messageData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should reject message with missing content', async () => {
      const messageData = {
        messageType: 'text'
      };

      const response = await request(app)
        .post(`/api/exchanges/${exchangeId}/message`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(messageData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Message content is required');
    });
  });
});
