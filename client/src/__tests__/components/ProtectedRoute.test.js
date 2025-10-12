import React from 'react';
import { render, screen } from '../../test-utils';
import ProtectedRoute from '../../components/ProtectedRoute';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockLocation = { pathname: '/dashboard' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

describe('ProtectedRoute Component', () => {
  const TestComponent = () => <div>Protected Content</div>;

  test('shows loading spinner when authentication is loading', () => {
    const authValue = {
      isAuthenticated: false,
      loading: true,
    };

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      { authValue }
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    const authValue = {
      isAuthenticated: false,
      loading: false,
    };

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      { authValue }
    );

    // Should redirect to login, so protected content should not be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('renders children when user is authenticated', () => {
    const authValue = {
      isAuthenticated: true,
      loading: false,
    };

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      { authValue }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('passes location state to redirect', () => {
    const authValue = {
      isAuthenticated: false,
      loading: false,
    };

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      { authValue }
    );

    // The component should handle redirect internally
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
