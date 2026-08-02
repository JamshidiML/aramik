import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import MeditationPlayerScreen from '../MeditationPlayerScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

type MeditationPlayerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MeditationPlayer'
>;

describe('MeditationPlayerScreen', () => {
  it('renders the generated script as readable text', () => {
    const props = {
      navigation: {} as MeditationPlayerScreenProps['navigation'],
      route: {
        key: 'MeditationPlayer-test',
        name: 'MeditationPlayer',
        params: {
          meditationId: 'e6de626c-647e-4871-9b4f-c50594c21f41',
          script: 'Take a slow breath and let your shoulders soften.',
        },
      },
    } satisfies MeditationPlayerScreenProps;

    const screen = render(<MeditationPlayerScreen {...props} />);

    expect(screen.getByText('Take a slow breath and let your shoulders soften.')).toBeTruthy();
  });
});
