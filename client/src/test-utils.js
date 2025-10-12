import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a test theme
const testTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Mock auth context values
const mockAuthValue = {
  user: null,
  token: null,
  loading: false,
  isAuthenticated: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn(),
  refreshToken: jest.fn(),
};

// Mock socket context values
const mockSocketValue = {
  socket: null,
  notifications: [],
  isConnected: false,
  connect: jest.fn(),
  disconnect: jest.fn(),
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};

// Custom render function that includes all providers
const customRender = (ui, options = {}) => {
  const {
    authValue = mockAuthValue,
    socketValue = mockSocketValue,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <ThemeProvider theme={testTheme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Helper to create authenticated user
export const createAuthenticatedUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  pointsBalance: 100,
  skillsOffered: ['JavaScript', 'React'],
  averageRating: 4.5,
  profilePicture: null,
  ...overrides,
});

// Helper to create mock exchange
export const createMockExchange = (overrides = {}) => ({
  id: 1,
  skill: 'JavaScript',
  description: 'Learn JavaScript fundamentals',
  status: 'Pending',
  requesterID: 1,
  providerID: 2,
  requesterName: 'Test User',
  providerName: 'Provider User',
  createdAt: '2024-01-01T00:00:00Z',
  scheduledDate: '2024-01-15T10:00:00Z',
  ...overrides,
});

// Helper to create mock notification
export const createMockNotification = (overrides = {}) => ({
  id: 1,
  title: 'New Message',
  message: 'You have a new message',
  type: 'new_message',
  isRead: false,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
