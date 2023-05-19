import { describe, vi, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SelectSpotInstance from '../src/components/SelectSpotInstance';

describe('SelectSpotInstance', () => {
  it('should render correctly', async () => {
    const setIsSpotInstance = vi.fn();
    const isSpotInstance = false;
    render(
      <SelectSpotInstance
        isSpotInstance={isSpotInstance}
        setIsSpotInstance={setIsSpotInstance}
      />
    );
    expect(screen.findAllByRole('input').checked).toBeFalsy();
  });
});
