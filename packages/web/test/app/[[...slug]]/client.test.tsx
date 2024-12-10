import { render, waitFor } from '@testing-library/react';
import { ClientOnly } from '@/app/[[...slug]]/client';
import React from 'react';
import { vi, it, expect } from 'vitest';

global.fetch = () => Promise.resolve(new Response(JSON.stringify({})));

// Mock the dynamic import of App component
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (func: () => Promise<any>) => {
    const DynamicComponent = () => {
      const [Component, setComponent] =
        React.useState<React.ComponentType | null>(null);

      React.useEffect(() => {
        func().then(mod => setComponent(() => mod.default));
      }, []);

      if (!Component) return null;
      return <Component />;
    };

    return DynamicComponent;
  }
}));

// Mock the App component
vi.mock('@/components/App', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-app">Mocked App Component</div>
}));

it('renders the App component within QueryClientProvider', async () => {
  const { getByTestId } = render(<ClientOnly />);

  // Wait for dynamic component to load
  await waitFor(() => {
    expect(getByTestId('mock-app')).toBeInTheDocument();
    expect(getByTestId('mock-app')).toHaveTextContent('Mocked App Component');
  });
});
