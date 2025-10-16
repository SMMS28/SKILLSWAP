import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Custom render function that includes providers
const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = {},
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => {
    return (
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    );
  };

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { renderWithProviders as render };
