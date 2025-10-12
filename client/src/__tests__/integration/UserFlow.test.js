import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Mock the entire app with real contexts
jest.mock('../../config/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
}));

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('complete login flow', async () => {
    const user = userEvent.setup();
    
    // Mock successful login response
    const mockAxios = require('../../config/axios');
    mockAxios.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          user: { id: 1, name: 'Test User', email: 'test@example.com', pointsBalance: 100 },
          token: 'mock-token'
        }
      }
    });

    mockAxios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });

    render(<App />);

    // Navigate to login page
    fireEvent.click(screen.getByText('Login'));

    // Fill in login form
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Wait for login to complete and redirect
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    });

    // Verify user is now authenticated
    expect(screen.getByText('100 points')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('navigation between pages', async () => {
    const user = userEvent.setup();
    
    // Mock authenticated user
    const mockAxios = require('../../config/axios');
    mockAxios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });

    // Set up authenticated state
    localStorage.setItem('token', 'mock-token');
    mockAxios.get.mockImplementation((url) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          data: {
            success: true,
            data: { id: 1, name: 'Test User', email: 'test@example.com', pointsBalance: 100 }
          }
        });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });

    render(<App />);

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    });

    // Test navigation to different pages
    fireEvent.click(screen.getByText('Profile'));
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Messages'));
    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Transactions'));
    await waitFor(() => {
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });
  });

  test('protected route redirects to login', async () => {
    const mockAxios = require('../../config/axios');
    mockAxios.get.mockResolvedValue({
      data: { success: false }
    });

    render(<App />);

    // Try to access protected route directly
    window.history.pushState({}, 'Test page', '/dashboard');
    fireEvent.popState(window);

    // Should redirect to login
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
  });

  test('logout flow', async () => {
    const user = userEvent.setup();
    
    // Mock authenticated user
    const mockAxios = require('../../config/axios');
    localStorage.setItem('token', 'mock-token');
    
    mockAxios.get.mockImplementation((url) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          data: {
            success: true,
            data: { id: 1, name: 'Test User', email: 'test@example.com', pointsBalance: 100 }
          }
        });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });

    render(<App />);

    // Wait for authentication
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    });

    // Open user menu and logout
    const userMenuButton = screen.getByLabelText('account menu');
    fireEvent.click(userMenuButton);

    await waitFor(() => {
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
    });

    // Should redirect to home and show login button
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
  });

  test('error handling in user flows', async () => {
    const user = userEvent.setup();
    
    // Mock failed login
    const mockAxios = require('../../config/axios');
    mockAxios.post.mockResolvedValue({
      data: {
        success: false,
        message: 'Invalid credentials'
      }
    });

    render(<App />);

    // Navigate to login
    fireEvent.click(screen.getByText('Login'));

    // Fill in form with invalid credentials
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    await user.type(emailInput, 'invalid@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    // Should still be on login page
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  test('responsive navigation', async () => {
    // Mock authenticated user
    const mockAxios = require('../../config/axios');
    localStorage.setItem('token', 'mock-token');
    
    mockAxios.get.mockImplementation((url) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          data: {
            success: true,
            data: { id: 1, name: 'Test User', email: 'test@example.com', pointsBalance: 100 }
          }
        });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });

    render(<App />);

    // Wait for authentication
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    });

    // Test mobile menu toggle
    const mobileMenuButton = screen.getByLabelText('open drawer');
    fireEvent.click(mobileMenuButton);

    // Mobile navigation should be visible
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Search Skills')).toBeInTheDocument();
    });
  });
});
