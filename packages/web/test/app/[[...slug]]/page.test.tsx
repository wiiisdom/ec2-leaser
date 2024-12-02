import { render } from '@testing-library/react';
import Page from '@/app/[[...slug]]/page';
import { ClientOnly } from '@/app/[[...slug]]/client';
import { generateStaticParams } from '@/app/[[...slug]]/page';
import { vi, it, expect } from 'vitest';

// Mock the ClientOnly component
vi.mock('@/app/[[...slug]]/client', () => ({
  ClientOnly: vi.fn(() => (
    <div data-testid="client-only">Mocked ClientOnly</div>
  ))
}));

// Mock the CSS import
vi.mock('@/index.css', () => ({}));

it('renders ClientOnly component', () => {
  const { getByTestId } = render(<Page />);

  // Verify ClientOnly is rendered
  expect(getByTestId('client-only')).toBeInTheDocument();
});

it('generates correct static params', () => {
  const params = generateStaticParams();

  // Test the static params generation
  expect(params).toEqual([{ slug: [''] }]);
});

it('ClientOnly component is called', () => {
  render(<Page />);

  // Verify ClientOnly was called
  expect(ClientOnly).toHaveBeenCalled();
});
