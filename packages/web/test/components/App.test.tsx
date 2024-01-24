import { describe, vi, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import App from '../../src/components/App';
import { getUserInfo } from '@/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/api');
const queryClient = new QueryClient();

describe('App', () => {
  it('should show login if no token', async () => {
    const { queryByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(queryByTestId('azure-login')).toBeInTheDocument();
  });
  it('should show main content if token', async () => {
    localStorage.setItem('session', 'token');
    vi.mocked(getUserInfo).mockResolvedValue({
      userId: '1',
      token: 'token'
    });
    const { queryByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    await waitFor(() => expect(queryByTestId('result')).toBeInTheDocument());
    expect(queryByTestId('azure-login')).not.toBeInTheDocument();
  });
});
