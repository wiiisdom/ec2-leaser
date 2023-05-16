import { describe, vi, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SelectCostCenter from '../src/components/SelectCostCenter';

vi.mock('aws-amplify');

describe('SelectCostCenter', () => {
  it('should render correctly', async () => {
    const setCostCenter = vi.fn();
    const costCenter = undefined;
    render(
      <SelectCostCenter costCenter={costCenter} setCostCenter={setCostCenter} />
    );
    await screen.findByText('cc1 - cc1 desc');
  });
});
