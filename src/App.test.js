import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the dashboard shell', () => {
  render(<App />);
  expect(screen.getAllByText(/Tableau de bord/i).length).toBeGreaterThan(0);
});

test('shows the empty state when there is no workout yet', () => {
  window.localStorage.clear();
  render(<App />);
  expect(screen.getAllByText(/Démarrer une séance/i).length).toBeGreaterThan(0);
});
