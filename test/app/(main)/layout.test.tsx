import { render, screen } from '@testing-library/react';
import MainLayout from '@/app/(main)/layout';
import { expect, it, vi } from 'vitest';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

vi.mock('@/auth');

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    // this Error allow to handle correctly the redirect in the test
    throw new Error('NEXT_REDIRECT');
  })
}));

it('renders children correctly if authenticated', async () => {
  vi.mocked(auth).mockResolvedValue({
    user: { name: 'Test User' }
  } as any);

  const testChild = <div data-testid="test-child">Test Content</div>;
  render(await MainLayout({ children: testChild }));

  // Test that the child component is rendered
  expect(screen.getByText('Test Content')).toBeInTheDocument();
});

it('redirects to /signin if no session', async () => {
  vi.mocked(auth).mockResolvedValue(null as any);

  try {
    const testChild = <div data-testid="test-child">Test Content</div>;

    await MainLayout({ children: testChild });
  } catch (error) {
    // Check if the error is not the expected NEXT_REDIRECT
    if ((error as Error).message !== 'NEXT_REDIRECT') {
      throw error;
    }
  }
  expect(redirect).toHaveBeenCalledWith('/signin');
});
