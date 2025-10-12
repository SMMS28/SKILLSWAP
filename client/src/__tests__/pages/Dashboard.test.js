import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { createAuthenticatedUser, createMockExchange, createMockNotification } from '../../test-utils';
import Dashboard from '../../pages/Dashboard';

// Mock axios
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../config/axios', () => mockAxios);

// Mock react-router-dom
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders welcome message with user name', () => {
    const user = createAuthenticatedUser({ name: 'John Doe' });
    const authValue = {
      user,
      isAuthenticated: true,
    };

    mockAxios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });

    render(<Dashboard />, { authValue });
    
    expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
  });

  test('shows loading spinner while fetching data', () => {
    const user = createAuthenticatedUser();
    const authValue = {
      user,
      isAuthenticated: true,
    };

    // Mock a pending promise
    mockAxios.get.mockImplementation(() => new Promise(() => {}));

    render(<Dashboard />, { authValue });
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays user statistics cards', async () => {
    const user = createAuthenticatedUser({ 
      pointsBalance: 150,
      skillsOffered: ['JavaScript', 'React'],
      averageRating: 4.8
    });
    const authValue = {
      user,
      isAuthenticated: true,
    };

    mockAxios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });

    render(<Dashboard />, { authValue });
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // Points balance
      expect(screen.getByText('4.8')).toBeInTheDocument(); // Average rating
    });
  });

  test('shows quick action buttons', async () => {
    const user = createAuthenticatedUser();
    const authValue = {
      user,
      isAuthenticated: true,
    };

    mockAxios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });

    render(<Dashboard />, { authValue });
    
    await waitFor(() => {
      expect(screen.getByText('Find Teachers')).toBeInTheDocument();
      expect(screen.getByText('Update Profile')).toBeInTheDocument();
      expect(screen.getByText('View Messages')).toBeInTheDocument();
    });
  });

  test('navigates to correct pages when quick action buttons are clicked', async () => {
    const user = createAuthenticatedUser();
    const authValue = {
      user,
      isAuthenticated: true,
    };

    mockAxios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });

    render(<Dashboard />, { authValue });
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Find Teachers'));
      expect(mockNavigate).toHaveBeenCalledWith('/search');
      
      fireEvent.click(screen.getByText('Update Profile'));
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
      
      fireEvent.click(screen.getByText('View Messages'));
      expect(mockNavigate).toHaveBeenCalledWith('/messages');
    });
  });

  test('displays recent notifications', async () => {
    const user = createAuthenticatedUser();
    const notifications = [
      createMockNotification({ title: 'New Message', message: 'You have a new message' }),
      createMockNotification({ title: 'Exchange Accepted', message: 'Your exchange request was accepted' }),
    ];
    
    const authValue = {
      user,
      isAuthenticated: true,
    };
    
    const socketValue = {
      notifications,
    };

    mockAxios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });

    render(<Dashboard />, { authValue, socketValue });
    
    await waitFor(() => {
      expect(screen.getByText('New Message')).toBeInTheDocument();
      expect(screen.getByText('You have a new message')).toBeInTheDocument();
      expect(screen.getByText('Exchange Accepted')).toBeInTheDocument();
    });
  });

  test('shows no recent activity message when no notifications', async () => {
    const user = createAuthenticatedUser();
    const authValue = {
      user,
      isAuthenticated: true,
    };
    
    const socketValue = {
      notifications: [],
    };

    mockAxios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });

    render(<Dashboard />, { authValue, socketValue });
    
    await waitFor(() => {
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
      expect(screen.getByText('Start by searching for skills to learn!')).toBeInTheDocument();
    });
  });

  test('displays exchanges with correct status', async () => {
    const user = createAuthenticatedUser();
    const exchanges = [
      createMockExchange({ 
        id: 1, 
        skill: 'JavaScript', 
        status: 'Pending',
        providerName: 'John Teacher'
      }),
      createMockExchange({ 
        id: 2, 
        skill: 'React', 
        status: 'Accepted',
        providerName: 'Jane Teacher'
      }),
    ];
    
    const authValue = {
      user,
      isAuthenticated: true,
    };

    mockAxios.get.mockResolvedValue({
      data: { success: true, data: exchanges }
    });

    render(<Dashboard />, { authValue });
    
    await waitFor(() => {
      expect(screen.getByText('JavaScript with John Teacher')).toBeInTheDocument();
      expect(screen.getByText('React with Jane Teacher')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Accepted')).toBeInTheDocument();
    });
  });

  test('filters exchanges by tab selection', async () => {
    const user = createAuthenticatedUser();
    const exchanges = [
      createMockExchange({ id: 1, status: 'Pending' }),
      createMockExchange({ id: 2, status: 'Accepted' }),
      createMockExchange({ id: 3, status: 'Completed' }),
    ];
    
    const authValue = {
      user,
      isAuthenticated: true,
    };

    mockAxios.get.mockResolvedValue({
      data: { success: true, data: exchanges }
    });

    render(<Dashboard />, { authValue });
    
    await waitFor(() => {
      // All exchanges should be visible initially
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Accepted')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      
      // Click on Pending tab
      fireEvent.click(screen.getByText('Pending'));
      
      // Only pending exchanges should be visible
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.queryByText('Accepted')).not.toBeInTheDocument();
      expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    });
  });

  test('navigates to exchange details when exchange is clicked', async () => {
    const user = createAuthenticatedUser();
    const exchanges = [
      createMockExchange({ id: 1, skill: 'JavaScript' }),
    ];
    
    const authValue = {
      user,
      isAuthenticated: true,
    };

    mockAxios.get.mockResolvedValue({
      data: { success: true, data: exchanges }
    });

    render(<Dashboard />, { authValue });
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('JavaScript with Provider User'));
      expect(mockNavigate).toHaveBeenCalledWith('/exchange/1');
    });
  });

  test('shows error message when exchanges fail to load', async () => {
    const user = createAuthenticatedUser();
    const authValue = {
      user,
      isAuthenticated: true,
    };

    mockAxios.get.mockRejectedValue(new Error('Network error'));

    render(<Dashboard />, { authValue });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load exchanges')).toBeInTheDocument();
    });
  });

  test('shows no exchanges message when no exchanges exist', async () => {
    const user = createAuthenticatedUser();
    const authValue = {
      user,
      isAuthenticated: true,
    };

    mockAxios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });

    render(<Dashboard />, { authValue });
    
    await waitFor(() => {
      expect(screen.getByText('No exchanges found')).toBeInTheDocument();
      expect(screen.getByText("You haven't created any exchanges yet. Start by finding a teacher!")).toBeInTheDocument();
    });
  });
});
