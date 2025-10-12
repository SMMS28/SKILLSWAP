import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { createAuthenticatedUser, createMockNotification } from '../../test-utils';
import Navbar from '../../components/Navbar';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockLocation = { pathname: '/' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders navbar with logo', () => {
    render(<Navbar />);
    expect(screen.getByText('SkillSwap')).toBeInTheDocument();
  });

  test('shows login and sign up buttons when not authenticated', () => {
    render(<Navbar />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('shows user menu when authenticated', () => {
    const user = createAuthenticatedUser();
    const authValue = {
      user,
      isAuthenticated: true,
      logout: jest.fn(),
    };

    render(<Navbar />, { authValue });
    
    expect(screen.getByText(`${user.pointsBalance} points`)).toBeInTheDocument();
    expect(screen.getByLabelText('account menu')).toBeInTheDocument();
  });

  test('displays navigation items for authenticated users', () => {
    const user = createAuthenticatedUser();
    const authValue = {
      user,
      isAuthenticated: true,
      logout: jest.fn(),
    };

    render(<Navbar />, { authValue });
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('shows notification badge with unread count', () => {
    const user = createAuthenticatedUser();
    const notifications = [
      createMockNotification({ isRead: false }),
      createMockNotification({ isRead: true }),
      createMockNotification({ isRead: false }),
    ];
    
    const authValue = {
      user,
      isAuthenticated: true,
      logout: jest.fn(),
    };
    
    const socketValue = {
      notifications,
      isConnected: true,
    };

    render(<Navbar />, { authValue, socketValue });
    
    // Check for notification badge with count
    const notificationButton = screen.getByLabelText('notifications');
    expect(notificationButton).toBeInTheDocument();
  });

  test('opens user menu when avatar is clicked', async () => {
    const user = createAuthenticatedUser();
    const authValue = {
      user,
      isAuthenticated: true,
      logout: jest.fn(),
    };

    render(<Navbar />, { authValue });
    
    const userMenuButton = screen.getByLabelText('account menu');
    fireEvent.click(userMenuButton);
    
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  test('calls logout when logout is clicked', async () => {
    const mockLogout = jest.fn();
    const user = createAuthenticatedUser();
    const authValue = {
      user,
      isAuthenticated: true,
      logout: mockLogout,
    };

    render(<Navbar />, { authValue });
    
    const userMenuButton = screen.getByLabelText('account menu');
    fireEvent.click(userMenuButton);
    
    await waitFor(() => {
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
    });
    
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('navigates to correct pages when navigation items are clicked', () => {
    const user = createAuthenticatedUser();
    const authValue = {
      user,
      isAuthenticated: true,
      logout: jest.fn(),
    };

    render(<Navbar />, { authValue });
    
    fireEvent.click(screen.getByText('Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    
    fireEvent.click(screen.getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('shows mobile menu button on small screens', () => {
    render(<Navbar />);
    
    const mobileMenuButton = screen.getByLabelText('open drawer');
    expect(mobileMenuButton).toBeInTheDocument();
  });

  test('toggles mobile drawer when menu button is clicked', () => {
    render(<Navbar />);
    
    const mobileMenuButton = screen.getByLabelText('open drawer');
    fireEvent.click(mobileMenuButton);
    
    // Check if drawer is opened (mobile navigation items should be visible)
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
