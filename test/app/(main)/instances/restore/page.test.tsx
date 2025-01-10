import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Page from '@/app/(main)/instances/restore/page';
import { callApi } from '@/api';

vi.mock('@/api');

it('should render correctly', async () => {
  render(<Page />);
  expect(
    screen.getByText(/This is the instance ID you want to restore/i)
  ).toBeInTheDocument();
});

it('should display a message when the form is submitted successfully', async () => {
  vi.mocked(callApi).mockResolvedValue({ instanceId: '123' });

  render(<Page />);
  fireEvent.change(screen.getByLabelText(/instance id/i), {
    target: { value: 'i-12345678901234567' }
  });
  fireEvent.submit(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(
      screen.getByText(/Restoring the instance ID 123/i)
    ).toBeInTheDocument();
  });
});

it('should display an error message when the form submission fails', async () => {
  vi.mocked(callApi).mockRejectedValue(new Error('Failed to restore instance'));

  render(<Page />);
  fireEvent.change(screen.getByLabelText(/instance id/i), {
    target: { value: 'i-12345678901234567' }
  });
  fireEvent.submit(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(screen.getByText(/Failed to restore instance/i)).toBeInTheDocument();
  });
});
