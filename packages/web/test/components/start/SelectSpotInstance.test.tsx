import { describe, vi, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SelectSpotInstance from '../../../src/components/start/SelectSpotInstance';

describe('SelectSpotInstance', () => {
  it('should render correctly', async () => {
    const setIsSpotInstance = vi.fn();
    const isSpotInstance = false;
    const { getByTestId } = render(
      <SelectSpotInstance
        isSpotInstance={isSpotInstance}
        setIsSpotInstance={setIsSpotInstance}
      />
    );
    expect(getByTestId('spot')).not.toBeChecked();
  });
});
