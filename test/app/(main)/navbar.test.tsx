import { render, screen } from '@testing-library/react';
import { auth } from '@/auth';
import { expect, it, vi } from 'vitest';
import Navbar from '@/app/(main)/navbar';

vi.mock('@/auth');

it('renders the logo and title', async () => {
  vi.mocked(auth).mockResolvedValue(null as any);
  render(<Navbar />);

  expect(screen.getByText('EC2 Leaser')).toBeInTheDocument();
});

it('renders the logout butto', async () => {
  vi.mocked(auth).mockResolvedValue({ user: 'testUser' } as any);
  render(<Navbar />);

  expect(screen.getByTestId('logout')).toBeInTheDocument();
});
