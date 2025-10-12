// Frontend test setup
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock environment variables
process.env.REACT_APP_SERVER_URL = 'http://localhost:5002';

// Global test utilities for frontend
global.testUtils = {
  // Helper to wrap components with Router
  withRouter: (component) => (
    <BrowserRouter>{component}</BrowserRouter>
  ),

  // Helper to create mock user data
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    location: 'Stockholm',
    bio: 'Test bio',
    pointsBalance: 100,
    averageRating: 4.5,
    skillsOffered: [],
    skillsWanted: [],
    ratings: [],
    ...overrides
  }),

  // Helper to create mock exchange data
  createMockExchange: (overrides = {}) => ({
    id: 'test-exchange-id',
    skill: 'JavaScript',
    description: 'Learn JavaScript basics',
    status: 'Pending',
    hourlyRate: 50,
    durationHours: 2,
    requesterID: 'requester-id',
    providerID: 'provider-id',
    requesterName: 'Requester User',
    providerName: 'Provider User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  // Helper to create mock skill data
  createMockSkill: (overrides = {}) => ({
    id: 'test-skill-id',
    name: 'JavaScript',
    description: 'Programming language',
    category: 'Programming',
    skillLevel: 'Intermediate',
    ...overrides
  }),

  // Helper to create mock notification data
  createMockNotification: (overrides = {}) => ({
    id: 'test-notification-id',
    type: 'exchange',
    title: 'New Exchange Request',
    message: 'You have received a new exchange request',
    read: false,
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  // Helper to create mock transaction data
  createMockTransaction: (overrides = {}) => ({
    id: 'test-transaction-id',
    type: 'Payment',
    amount: -50,
    description: 'Exchange request for JavaScript',
    exchangeID: 'test-exchange-id',
    skill: 'JavaScript',
    exchangeStatus: 'Pending',
    hourlyRate: 50,
    durationHours: 2,
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to mock localStorage
  mockLocalStorage: () => {
    const store = {};
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      })
    };
  },

  // Helper to mock fetch
  mockFetch: (response, status = 200) => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response))
      })
    );
  },

  // Helper to mock axios
  mockAxios: (response, status = 200) => {
    const axios = require('axios');
    axios.get = jest.fn(() => Promise.resolve({ data: response, status }));
    axios.post = jest.fn(() => Promise.resolve({ data: response, status }));
    axios.put = jest.fn(() => Promise.resolve({ data: response, status }));
    axios.delete = jest.fn(() => Promise.resolve({ data: response, status }));
  }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock scrollTo
global.scrollTo = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
