import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProtectedRoute from '../../components/ProtectedRoute';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/dashboard' }),
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    loading: false,
  }),
}));

describe('ProtectedRoute Component', () => {
  const TestComponent = () => <div>Protected Content</div>;

  test('shows loading spinner when authentication is loading', () => {
    // Mock loading state
    jest.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => ({
        isAuthenticated: false,
        loading: true,
      }),
    }));

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    // Should redirect to login, so protected content should not be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
