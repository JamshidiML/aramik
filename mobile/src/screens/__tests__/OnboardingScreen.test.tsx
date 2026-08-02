import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import OnboardingScreen from '../OnboardingScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

function createProps(): OnboardingScreenProps {
  return {
    navigation: {
      navigate: jest.fn(),
    } as unknown as OnboardingScreenProps['navigation'],
    route: {
      key: 'Onboarding-test',
      name: 'Onboarding',
      params: undefined,
    },
  };
}

describe('OnboardingScreen', () => {
  it('navigates to check-in when Get Started is pressed', () => {
    const props = createProps();
    const screen = render(<OnboardingScreen {...props} />);

    fireEvent.press(screen.getByRole('button', { name: 'onboarding.get_started' }));

    expect(props.navigation.navigate).toHaveBeenCalledWith('CheckIn');
  });
});
