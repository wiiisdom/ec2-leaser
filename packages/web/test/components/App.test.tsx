import { describe, vi, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import App from '../../src/components/App';
import { getUserInfo } from '@/api';

vi.mock('@tanstack/react-query');
vi.mock('@/api');

describe('App', () => {
  it('should show login if no token', async () => {
    const { queryByTestId } = render(<App />);
    expect(queryByTestId('azure-login')).toBeInTheDocument();
  });
  it('should show main content if token', async () => {
    localStorage.setItem('session', 'token');
    vi.mocked(getUserInfo).mockResolvedValue({
      userId: '1',
      token: 'token'
    });
    const { queryByTestId } = render(<App />);
    await waitFor(() => expect(queryByTestId('result')).toBeInTheDocument());
    expect(queryByTestId('azure-login')).not.toBeInTheDocument();
  });
});
