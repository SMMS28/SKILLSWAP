import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test to verify testing setup works
describe('Testing Setup', () => {
  test('renders a simple component', () => {
    const TestComponent = () => <div>Hello World</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  test('basic math works', () => {
    expect(2 + 2).toBe(4);
  });

  test('string manipulation works', () => {
    const str = 'Hello World';
    expect(str.toLowerCase()).toBe('hello world');
  });
});
