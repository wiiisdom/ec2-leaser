import { describe, vi, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import App from '../../src/components/App';
import { callApi } from '@/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from 'next-auth/react';
import { Session } from 'next-auth';

global.fetch = () => Promise.resolve(new Response(JSON.stringify({})));

vi.mock('@/api');
vi.mock(import('next-auth/react'), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useSession: vi.fn()
  };
});

const queryClient = new QueryClient();

describe('App', () => {
  it('should show login if not logged in', async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn()
    });
    const { queryByTestId } = render(
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </SessionProvider>
    );
    expect(queryByTestId('azure-login')).toBeInTheDocument();
  });
  it('should show main content if logged in', async () => {
    vi.mocked(callApi).mockResolvedValue([{ id: 'id', name: 'lt' }]);
    vi.mocked(useSession).mockReturnValue({
      data: {} as Session,
      status: 'authenticated',
      update: vi.fn()
    });

    const { queryByTestId } = render(
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </SessionProvider>
    );
    await waitFor(() => expect(queryByTestId('result')).toBeInTheDocument());
    expect(queryByTestId('azure-login')).not.toBeInTheDocument();
  });
});
