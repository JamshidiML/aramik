import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../store/authStore';
import { useConsentStore } from '../../store/consentStore';
import SignInScreen from '../SignInScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

function createProps(): SignInScreenProps {
  return {
    navigation: {
      navigate: jest.fn(),
      replace: jest.fn(),
    } as unknown as SignInScreenProps['navigation'],
    route: { key: 'SignIn-test', name: 'SignIn', params: undefined },
  };
}

describe('SignInScreen', () => {
  beforeEach(() => {
    useConsentStore.setState({ consentGiven: null, hasHydrated: true });
    useAuthStore.setState({ accessToken: null, hasHydrated: true, userId: null });
  });

  it('disables submit until both fields are filled', () => {
    const props = createProps();
    const screen = render(<SignInScreen {...props} />);
    const submitButton = screen.getByRole('button', { name: 'auth.sign_in_submit' });

    expect(submitButton).toBeDisabled();

    fireEvent.changeText(screen.getByLabelText('auth.email_label'), 'user@example.com');
    expect(submitButton).toBeDisabled();

    fireEvent.changeText(screen.getByLabelText('auth.password_label'), 'secret');
    expect(submitButton).toBeEnabled();
  });

  it('signs in and navigates to onboarding for a first-time user', async () => {
    useAuthStore.setState({
      signIn: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    });
    const props = createProps();
    const screen = render(<SignInScreen {...props} />);

    fireEvent.changeText(screen.getByLabelText('auth.email_label'), 'user@example.com');
    fireEvent.changeText(screen.getByLabelText('auth.password_label'), 'secret');
    fireEvent.press(screen.getByRole('button', { name: 'auth.sign_in_submit' }));

    await waitFor(() => {
      expect(props.navigation.replace).toHaveBeenCalledWith('Onboarding');
    });
  });

  it('shows an error message when sign-in fails', async () => {
    useAuthStore.setState({
      signIn: jest.fn<() => Promise<void>>().mockRejectedValue(new Error('Invalid email or password.')),
    });
    const props = createProps();
    const screen = render(<SignInScreen {...props} />);

    fireEvent.changeText(screen.getByLabelText('auth.email_label'), 'user@example.com');
    fireEvent.changeText(screen.getByLabelText('auth.password_label'), 'wrong');
    fireEvent.press(screen.getByRole('button', { name: 'auth.sign_in_submit' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('auth.error_generic');
    expect(props.navigation.replace).not.toHaveBeenCalled();
  });
});
