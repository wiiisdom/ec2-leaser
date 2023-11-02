import { describe, vi, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SelectSchedule from '../../../src/components/start/SelectSchedule';

vi.mock('aws-amplify');

describe('SelectSchedule', () => {
  it('should render correctly', async () => {
    const setSchedule = vi.fn();
    const schedule = '';
    render(<SelectSchedule schedule={schedule} setSchedule={setSchedule} />);
    await screen.findByText('lille-office-stop - desc');
  });
});
