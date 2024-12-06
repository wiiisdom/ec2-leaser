import { describe, vi, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MainContent from '../../src/components/MainContent';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

global.fetch = () => Promise.resolve(new Response(JSON.stringify({})));

describe('MainContent', () => {
  it('should render all features if env var set to 1', async () => {
    vi.stubEnv('NEXT_PUBLIC_SHOW_SNAPSHOT_RESTORE', '1');

    const queryClient = new QueryClient();

    const { queryByTestId } = render(
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <MainContent />
        </QueryClientProvider>
      </SessionProvider>
    );

    expect(queryByTestId('start')).toBeInTheDocument();
    expect(queryByTestId('snapshot')).toBeInTheDocument();
  });
  it('should render only start if env var set to 0', async () => {
    vi.stubEnv('NEXT_PUBLIC_SHOW_SNAPSHOT_RESTORE', '0');

    const queryClient = new QueryClient();

    const { queryByTestId } = render(
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <MainContent />
        </QueryClientProvider>
      </SessionProvider>
    );
    expect(queryByTestId('start')).not.toBeInTheDocument();
    expect(queryByTestId('snapshot')).not.toBeInTheDocument();
  });
});
