import { describe, vi, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SelectCostCenter from '../../../src/components/start/SelectCostCenter';
import { callApi } from '@/api';

vi.mock('@/api');

describe('SelectCostCenter', () => {
  it('should render correctly', async () => {
    vi.mocked(callApi).mockResolvedValue([
      { name: 'cc1', description: 'cc1 desc' },
      { name: 'cc2', description: 'cc2 desc' }
    ]);
    const setCostCenter = vi.fn();
    const costCenter = '';
    render(
      <SelectCostCenter costCenter={costCenter} setCostCenter={setCostCenter} />
    );
    await screen.findByText('cc1 - cc1 desc');
  });
});
