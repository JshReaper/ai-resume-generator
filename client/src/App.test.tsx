import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AI Resume Generator header', () => {
  render(<App />);
  const headerElement = screen.getByText(/AI Resume Generator/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders file upload section', () => {
  render(<App />);
  const uploadText = screen.getByText(/Drop your CV here/i);
  expect(uploadText).toBeInTheDocument();
});

test('renders language selectors', () => {
  render(<App />);
  const interfaceLabel = screen.getByText(/Interface:/i);
  const cvOutputLabel = screen.getByText(/CV Output:/i);
  expect(interfaceLabel).toBeInTheDocument();
  expect(cvOutputLabel).toBeInTheDocument();
});
