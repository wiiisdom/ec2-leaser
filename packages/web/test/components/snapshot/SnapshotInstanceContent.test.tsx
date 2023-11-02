import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SnapshotInstanceContent from '@/components/snapshot/SnapshotInstanceContent';

describe('SnapshotInstanceContent', () => {
  it('should render correctly', async () => {
    render(<SnapshotInstanceContent />);
    expect(screen.findByTestId('instanceId')).toBeDefined();
  });
});
