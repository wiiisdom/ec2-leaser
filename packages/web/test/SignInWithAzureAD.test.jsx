import { describe, vi, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SignInWithAzureAD from '../src/components/SignInWithAzureAD';
import { Auth } from 'aws-amplify';

describe('SignInWithAzureAD', () => {
  it('should render a button with text "Log in with Azure"', () => {
    const test = render(<SignInWithAzureAD />);
    const button = screen.getByTestId('azure-signin-button');
    test.debug();
    expect(button).toBeVisible();
  });

  it('should call Auth.federatedSignIn when the button is clicked', () => {
    const federatedSignIn = vi.spyOn(Auth, 'federatedSignIn');
    render(<SignInWithAzureAD />);
    const button = screen.getByTestId('azure-signin-button');
    fireEvent.click(button, {preventDefault: vi.fn() });  
        expect(federatedSignIn).toHaveBeenCalledWith({
      provider: 'AzureAD',
      customState: 'redirect = /'
    });
  });
});