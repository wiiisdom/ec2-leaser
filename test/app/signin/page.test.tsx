import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import SignInPage from '@/app/signin/page';

vi.mock('@/auth');

it('renders SignInPage correctly', () => {
  render(<SignInPage />);

  expect(screen.getByText('Login with Azure')).toBeInTheDocument();
  expect(screen.getByTestId('azure-login')).toBeInTheDocument();
});
