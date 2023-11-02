import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RestoreInstanceContent from '@/components/restore/RestoreInstanceContent';

describe('RestoreInstanceContent', () => {
  it('should render correctly', async () => {
    render(<RestoreInstanceContent />);
    expect(screen.findByTestId('instanceId')).toBeDefined();
  });
});
