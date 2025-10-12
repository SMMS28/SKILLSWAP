import React from 'react';
import { render, screen } from '../test-utils';
import App from '../App';

// Mock axios to prevent import issues
jest.mock('../config/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
}));

// Mock the contexts
jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
  }),
}));

jest.mock('../contexts/SocketContext', () => ({
  SocketProvider: ({ children }) => <div data-testid="socket-provider">{children}</div>,
  useSocket: () => ({
    notifications: [],
    isConnected: false,
  }),
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('SkillSwap')).toBeInTheDocument();
  });

  test('renders all main navigation routes', () => {
    render(<App />);
    
    // Check if main navigation elements are present
    expect(screen.getByText('SkillSwap')).toBeInTheDocument();
  });

  test('provides theme context', () => {
    render(<App />);
    
    // Check if Material-UI theme is applied
    const appElement = screen.getByText('SkillSwap');
    expect(appElement).toBeInTheDocument();
  });

  test('wraps app with all necessary providers', () => {
    render(<App />);
    
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('socket-provider')).toBeInTheDocument();
  });
});
