import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../contexts/AuthContext';

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

test('renders login form', () => {
  renderWithProviders(<Login />);
  
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});

test('shows error for invalid credentials', async () => {
  renderWithProviders(<Login />);
  
  const emailInput = screen.getByLabelText(/email address/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /sign in/i });

  fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
  });
});
