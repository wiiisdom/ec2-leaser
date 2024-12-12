import { render } from '@testing-library/react';
import RootLayout from '@/app/layout';
import { expect, it } from 'vitest';
import { metadata } from '@/app/layout';

it('renders children correctly', () => {
  const testChild = <div data-testid="test-child">Test Content</div>;
  const { getByTestId, container } = render(
    <RootLayout>{testChild}</RootLayout>
  );

  // Test that the child component is rendered
  expect(getByTestId('test-child')).toBeInTheDocument();
  expect(getByTestId('test-child')).toHaveTextContent('Test Content');

  // Test the basic structure
  expect(container.querySelector('html')).toHaveAttribute('lang', 'en');
  expect(container.querySelector('#root')).toBeInTheDocument();
});

it('has correct metadata', () => {
  // Test metadata export
  expect(metadata).toEqual({
    title: 'EC2 Leaser'
  });
});
