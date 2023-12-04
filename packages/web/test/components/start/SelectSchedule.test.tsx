import { describe, vi, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SelectSchedule from '../../../src/components/start/SelectSchedule';
import { callApi } from '@/api';

vi.mock('@/api');

describe('SelectSchedule', () => {
  it('should render correctly', async () => {
    vi.mocked(callApi).mockResolvedValue([
      { name: 'lille-office-stop', description: 'desc' }
    ]);

    const setSchedule = vi.fn();
    const schedule = '';
    render(<SelectSchedule schedule={schedule} setSchedule={setSchedule} />);
    await screen.findByText('lille-office-stop - desc');
  });
});
