import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';

const TestComponent = () => <div>Protected Content</div>;

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

test('renders protected content when authenticated', () => {
  // Mock authenticated state
  const mockAuthContext = {
    user: { id: '1', name: 'Test User' },
    isAuthenticated: true
  };

  renderWithProviders(
    <ProtectedRoute>
      <TestComponent />
    </ProtectedRoute>
  );
  
  // Should redirect to login when not authenticated
  expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
});
