import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useConsentStore } from '../../store/consentStore';
import ConsentScreen from '../ConsentScreen';

const mockSetConsent = jest.fn<(consentGiven: boolean) => Promise<void>>();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

type ConsentScreenProps = NativeStackScreenProps<RootStackParamList, 'Consent'>;

function createProps(): ConsentScreenProps {
  return {
    navigation: {
      replace: jest.fn(),
    } as unknown as ConsentScreenProps['navigation'],
    route: {
      key: 'Consent-test',
      name: 'Consent',
      params: undefined,
    },
  };
}

describe('ConsentScreen', () => {
  beforeEach(() => {
    mockSetConsent.mockReset().mockResolvedValue(undefined);
    useConsentStore.setState({
      consentGiven: null,
      hasHydrated: true,
      setConsent: mockSetConsent,
    });
  });

  it('keeps declined users out of CheckIn and shows the explanation path', async () => {
    const props = createProps();
    const screen = render(<ConsentScreen {...props} />);

    fireEvent.press(screen.getByRole('button', { name: 'consent.decline' }));

    await waitFor(() => {
      expect(props.navigation.replace).toHaveBeenCalledWith('ConsentDeclined');
    });
    expect(props.navigation.replace).not.toHaveBeenCalledWith('CheckIn');
    expect(mockSetConsent).toHaveBeenCalledWith(false);
  });
});
