import { describe, vi, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SelectSchedule from '../src/components/SelectSchedule';

vi.mock('aws-amplify');

describe('SelectSchedule', () => {
  it('should render correctly', async () => {
    const setSchedule = vi.fn();
    const schedule = undefined;
    render(<SelectSchedule schedule={schedule} setSchedule={setSchedule} />);
    await screen.findByText('lille-office-stop - desc');
  });
});