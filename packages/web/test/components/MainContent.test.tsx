import { describe, vi, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MainContent from '../../src/components/MainContent';

vi.mock('@tanstack/react-query');

describe('MainContent', () => {
  it('should render all features if env var set to 1', async () => {
    vi.stubEnv('VITE_SHOW_SNAPSHOT_RESTORE', '1');

    const { queryByTestId } = render(<MainContent />);
    expect(queryByTestId('start')).toBeInTheDocument();
    expect(queryByTestId('snapshot')).toBeInTheDocument();
  });
  it('should render only start if env var set to 0', async () => {
    vi.stubEnv('VITE_SHOW_SNAPSHOT_RESTORE', '0');

    const { queryByTestId } = render(<MainContent />);
    expect(queryByTestId('start')).not.toBeInTheDocument();
    expect(queryByTestId('snapshot')).not.toBeInTheDocument();
  });
});
