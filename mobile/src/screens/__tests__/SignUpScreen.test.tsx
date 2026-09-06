import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../store/authStore';
import { useConsentStore } from '../../store/consentStore';
import SignUpScreen from '../SignUpScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

function createProps(): SignUpScreenProps {
  return {
    navigation: {
      navigate: jest.fn(),
      replace: jest.fn(),
    } as unknown as SignUpScreenProps['navigation'],
    route: { key: 'SignUp-test', name: 'SignUp', params: undefined },
  };
}

describe('SignUpScreen', () => {
  beforeEach(() => {
    useConsentStore.setState({ consentGiven: null, hasHydrated: true });
    useAuthStore.setState({ accessToken: null, hasHydrated: true, userId: null });
  });

  it('requires a password of at least 8 characters before enabling submit', () => {
    const props = createProps();
    const screen = render(<SignUpScreen {...props} />);
    const submitButton = screen.getByRole('button', { name: 'auth.sign_up_submit' });

    fireEvent.changeText(screen.getByLabelText('auth.email_label'), 'user@example.com');
    fireEvent.changeText(screen.getByLabelText('auth.password_label'), 'short');
    expect(submitButton).toBeDisabled();

    fireEvent.changeText(screen.getByLabelText('auth.password_label'), 'long-enough');
    expect(submitButton).toBeEnabled();
  });

  it('signs up and navigates to onboarding', async () => {
    useAuthStore.setState({
      signUp: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    });
    const props = createProps();
    const screen = render(<SignUpScreen {...props} />);

    fireEvent.changeText(screen.getByLabelText('auth.email_label'), 'user@example.com');
    fireEvent.changeText(screen.getByLabelText('auth.password_label'), 'long-enough');
    fireEvent.press(screen.getByRole('button', { name: 'auth.sign_up_submit' }));

    await waitFor(() => {
      expect(props.navigation.replace).toHaveBeenCalledWith('Onboarding');
    });
  });

  it('shows an error message when registration fails', async () => {
    useAuthStore.setState({
      signUp: jest
        .fn<() => Promise<void>>()
        .mockRejectedValue(new Error('An account with this email already exists.')),
    });
    const props = createProps();
    const screen = render(<SignUpScreen {...props} />);

    fireEvent.changeText(screen.getByLabelText('auth.email_label'), 'user@example.com');
    fireEvent.changeText(screen.getByLabelText('auth.password_label'), 'long-enough');
    fireEvent.press(screen.getByRole('button', { name: 'auth.sign_up_submit' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('auth.error_generic');
    expect(props.navigation.replace).not.toHaveBeenCalled();
  });
});
