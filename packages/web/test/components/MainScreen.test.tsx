import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MainScreen from '../../src/components/MainScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

const queryClient = new QueryClient();

global.fetch = () => Promise.resolve(new Response(JSON.stringify({})));

describe('MainScreen', () => {
  it('should render correctly', async () => {
    render(
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <MainScreen />
        </QueryClientProvider>
      </SessionProvider>
    );
    expect(screen.findByText('imageA')).toBeDefined();
    expect(screen.findByText('imageB')).toBeDefined();
    expect(screen.findByText('mocked desc')).toBeDefined();
  });
});
