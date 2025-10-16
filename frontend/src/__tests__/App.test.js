import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders SkillSwap app', () => {
  render(<App />);
  const linkElement = screen.getByText(/SkillSwap/i);
  expect(linkElement).toBeInTheDocument();
});
