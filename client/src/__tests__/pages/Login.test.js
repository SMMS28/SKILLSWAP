import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import Login from '../../pages/Login';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockLocation = { state: { from: { pathname: '/dashboard' } } };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue your learning journey')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('shows sign up link', () => {
    render(<Login />);
    
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Sign up here')).toBeInTheDocument();
  });

  test('allows user to input email and password', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByLabelText('toggle password visibility');
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click to hide password again
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('shows loading state when submitting', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
    
    const authValue = {
      login: mockLogin,
      isAuthenticated: false,
    };

    render(<Login />, { authValue });
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('calls login function with correct credentials', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn().mockResolvedValue({ success: true });
    
    const authValue = {
      login: mockLogin,
      isAuthenticated: false,
    };

    render(<Login />, { authValue });
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  test('navigates to dashboard on successful login', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn().mockResolvedValue({ success: true });
    
    const authValue = {
      login: mockLogin,
      isAuthenticated: false,
    };

    render(<Login />, { authValue });
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  test('shows error message on failed login', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn().mockResolvedValue({ 
      success: false, 
      message: 'Invalid credentials' 
    });
    
    const authValue = {
      login: mockLogin,
      isAuthenticated: false,
    };

    render(<Login />, { authValue });
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('redirects to dashboard if already authenticated', () => {
    const authValue = {
      isAuthenticated: true,
    };

    render(<Login />, { authValue });
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  test('clears error when user starts typing', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn().mockResolvedValue({ 
      success: false, 
      message: 'Invalid credentials' 
    });
    
    const authValue = {
      login: mockLogin,
      isAuthenticated: false,
    };

    render(<Login />, { authValue });
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    // First, trigger an error
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    
    // Then start typing again
    await user.clear(emailInput);
    await user.type(emailInput, 'new@example.com');
    
    // Error should be cleared
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });
});
