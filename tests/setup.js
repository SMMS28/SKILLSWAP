// Test setup file
const path = require('path');

// Set test environment variables before any other imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DB_PATH = ':memory:'; // Use in-memory database for tests
process.env.PORT = '5002';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.SOCKET_CORS_ORIGIN = 'http://localhost:3000';

// Try to load .env file if it exists
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (error) {
  // .env file doesn't exist, that's okay for tests
}

// Global test timeout
jest.setTimeout(10000);
