import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MainScreen from '../../src/components/MainScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

describe('MainScreen', () => {
  it('should render correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MainScreen />
      </QueryClientProvider>
    );
    expect(screen.findByText('imageA')).toBeDefined();
    expect(screen.findByText('imageB')).toBeDefined();
    expect(screen.findByText('mocked desc')).toBeDefined();
  });
});
