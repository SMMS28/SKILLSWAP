import React from 'react';
import { render, screen, act, waitFor } from '../../test-utils';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock axios
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
};

jest.mock('../../config/axios', () => mockAxios);

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user">{JSON.stringify(auth.user)}</div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <button onClick={() => auth.login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('provides initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  test('loads user from token on mount', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock-token';
    
    localStorage.setItem('token', mockToken);
    mockAxios.get.mockResolvedValue({
      data: { success: true, data: mockUser }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/api/auth/me');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  test('clears invalid token', async () => {
    const mockToken = 'invalid-token';
    
    localStorage.setItem('token', mockToken);
    mockAxios.get.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  test('successful login', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockToken = 'new-token';
    
    mockAxios.post.mockResolvedValue({
      data: { 
        success: true, 
        data: { user: mockUser, token: mockToken } 
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    act(() => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });
  });

  test('failed login', async () => {
    mockAxios.post.mockResolvedValue({
      data: { 
        success: false, 
        message: 'Invalid credentials' 
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    act(() => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  test('logout clears user and token', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock-token';
    
    localStorage.setItem('token', mockToken);
    mockAxios.get.mockResolvedValue({
      data: { success: true, data: mockUser }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });

  test('sets authorization header when token exists', async () => {
    const mockToken = 'mock-token';
    localStorage.setItem('token', mockToken);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });
  });

  test('removes authorization header when token is cleared', async () => {
    const mockToken = 'mock-token';
    localStorage.setItem('token', mockToken);
    mockAxios.get.mockResolvedValue({
      data: { success: true, data: { id: 1, name: 'Test User' } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(mockAxios.defaults.headers.common['Authorization']).toBeUndefined();
  });
});
