import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useCheckInStore } from '../../store/checkInStore';
import CheckInScreen from '../CheckInScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

type CheckInScreenProps = NativeStackScreenProps<RootStackParamList, 'CheckIn'>;

function createProps(): CheckInScreenProps {
  return {
    navigation: {
      navigate: jest.fn(),
    } as unknown as CheckInScreenProps['navigation'],
    route: {
      key: 'CheckIn-test',
      name: 'CheckIn',
      params: undefined,
    },
  };
}

describe('CheckInScreen', () => {
  beforeEach(() => {
    useCheckInStore.setState({ latestCheckIn: null });
  });

  it('selects only the most recently pressed mood', async () => {
    const props = createProps();
    const screen = await render(<CheckInScreen {...props} />);
    const stressedMood = screen.getByRole('button', { name: 'checkin.mood_stress' });
    const calmMood = screen.getByRole('button', { name: 'checkin.mood_calm' });

    await fireEvent.press(stressedMood);
    expect(stressedMood).toBeSelected();

    await fireEvent.press(calmMood);
    expect(stressedMood).not.toBeSelected();
    expect(calmMood).toBeSelected();
  });

  it('enables submit after mood selection and navigates to the mock meditation', async () => {
    const props = createProps();
    const screen = await render(<CheckInScreen {...props} />);
    const submitButton = screen.getByRole('button', { name: 'checkin.submit' });

    expect(submitButton).toBeDisabled();

    await fireEvent.press(screen.getByRole('button', { name: 'checkin.mood_tired' }));
    await fireEvent.changeText(
      screen.getByLabelText('checkin.prompt_label'),
      '  Need deeper rest  ',
    );
    expect(submitButton).toBeEnabled();

    await fireEvent.press(submitButton);
    expect(useCheckInStore.getState().latestCheckIn).toEqual({
      mood: 'tired',
      note: 'Need deeper rest',
    });
    expect(props.navigation.navigate).toHaveBeenCalledWith('MeditationPlayer', {
      meditationId: 'mock-day1-meditation',
    });
  });
});
