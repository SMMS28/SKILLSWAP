// Test setup file
const path = require('path');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_PATH = ':memory:';

// Global test timeout
jest.setTimeout(30000);

// Setup and teardown
beforeAll(async () => {
  console.log('Setting up test environment...');
});

afterAll(async () => {
  console.log('Cleaning up test environment...');
});

