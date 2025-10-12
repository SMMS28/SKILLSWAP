const request = require('supertest');
const express = require('express');
const skillRoutes = require('../routes/skills');
const authRoutes = require('../routes/auth');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);

describe('Skills Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Create a test user and get auth token
    const userData = testUtils.createTestUser();
    
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    userId = registerResponse.body.data.user.id;
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });
    
    authToken = loginResponse.body.data.token;
  });

  describe('GET /api/skills/available', () => {
    it('should get available skills', async () => {
      const response = await request(app)
        .get('/api/skills/available')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/skills/search', () => {
    it('should search skills by name', async () => {
      const response = await request(app)
        .get('/api/skills/search?q=JavaScript')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search skills by category', async () => {
      const response = await request(app)
        .get('/api/skills/search?category=Programming')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search skills by location', async () => {
      const response = await request(app)
        .get('/api/skills/search?location=Stockholm')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search skills with multiple filters', async () => {
      const response = await request(app)
        .get('/api/skills/search?q=JavaScript&category=Programming&location=Stockholm')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/skills/search?q=NonexistentSkill')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('POST /api/skills', () => {
    it('should add a new skill successfully', async () => {
      const skillData = testUtils.createTestSkill();

      const response = await request(app)
        .post('/api/skills')
        .send(skillData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Skill added successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(skillData.name);
      expect(response.body.data.description).toBe(skillData.description);
    });

    // Note: Skills creation doesn't require authentication in the actual implementation

    it('should reject skill addition with missing required fields', async () => {
      const skillData = {
        // Missing name and description
        category: 'Programming'
      };

      const response = await request(app)
        .post('/api/skills')
        .send(skillData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Name and description are required');
    });

    it('should reject skill addition with invalid skill level', async () => {
      const skillData = testUtils.createTestSkill({
        skillLevel: 'InvalidLevel'
      });

      const response = await request(app)
        .post('/api/skills')
        .send(skillData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid skill level');
    });
  });

  describe('GET /api/skills/categories', () => {
    it('should get all skill categories', async () => {
      const response = await request(app)
        .get('/api/skills/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/skills/:id', () => {
    let skillId;

    beforeEach(async () => {
      // Create a test skill
      const skillData = testUtils.createTestSkill();
      
      const response = await request(app)
        .post('/api/skills')
        .send(skillData);
      
      skillId = response.body.data.id;
    });

    it('should get skill by ID', async () => {
      const response = await request(app)
        .get(`/api/skills/${skillId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(skillId);
      expect(response.body.data.name).toBe('JavaScript');
    });

    it('should return 404 for non-existent skill', async () => {
      const response = await request(app)
        .get('/api/skills/nonexistent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Skill not found');
    });
  });

  // Note: PUT and DELETE routes for skills are not implemented in the actual API
  // These tests are commented out until the routes are added
});
