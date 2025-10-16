// Minimal test utilities for SkillSwap frontend
import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a minimal test theme
const testTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// Minimal render function with essential providers only
const customRender = (ui, options = {}) => {
  const Wrapper = ({ children }) => (
    <ThemeProvider theme={testTheme}>
      {children}
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };