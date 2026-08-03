import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { RootStackParamList } from '../../navigation/RootNavigator';
import { generateMeditation, submitCheckIn } from '../../services/moodService';
import { useCheckInStore } from '../../store/checkInStore';
import { useConsentStore } from '../../store/consentStore';
import CheckInScreen from '../CheckInScreen';

jest.mock('../../services/moodService', () => ({
  generateMeditation: jest.fn(),
  submitCheckIn: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string) => key,
  }),
}));

const mockGenerateMeditation = jest.mocked(generateMeditation);
const mockSubmitCheckIn = jest.mocked(submitCheckIn);

type CheckInScreenProps = NativeStackScreenProps<RootStackParamList, 'CheckIn'>;

function createProps(): CheckInScreenProps {
  return {
    navigation: {
      navigate: jest.fn(),
      replace: jest.fn(),
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
    useConsentStore.setState({ consentGiven: true, hasHydrated: true });
    mockSubmitCheckIn.mockReset().mockResolvedValue({
      id: '4f247cae-e092-48c9-8932-1d559b96d2bd',
      moodTag: 'tired',
      intensity: 3,
      topic: 'sleep',
      aiSummary: 'The user needs deeper rest.',
      createdAt: '2026-08-03T10:00:00.000Z',
    });
    mockGenerateMeditation.mockReset().mockResolvedValue({
      id: 'e6de626c-647e-4871-9b4f-c50594c21f41',
      script: 'Take a slow breath and let your shoulders soften.',
      language: 'en',
      generatedAt: '2026-08-03T10:00:01.000Z',
    });
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

  it('submits the check-in and navigates with the generated meditation script', async () => {
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

    fireEvent.press(submitButton);
    expect(useCheckInStore.getState().latestCheckIn).toEqual({
      mood: 'tired',
      note: 'Need deeper rest',
    });
    await waitFor(() => {
      expect(props.navigation.navigate).toHaveBeenCalledWith('MeditationPlayer', {
        meditationId: 'e6de626c-647e-4871-9b4f-c50594c21f41',
        script: 'Take a slow breath and let your shoulders soften.',
      });
    });
    expect(mockSubmitCheckIn).toHaveBeenCalledWith({
      userId: 'f4f6c776-eec9-4b67-85bd-f95f538a96e8',
      rawUserText: 'Need deeper rest',
      consentGiven: true,
    });
  });

  it('shows a retry action after a network failure', async () => {
    mockSubmitCheckIn.mockRejectedValueOnce(new Error('Network unavailable'));
    const props = createProps();
    const screen = render(<CheckInScreen {...props} />);

    fireEvent.press(screen.getByRole('button', { name: 'checkin.mood_calm' }));
    fireEvent.press(screen.getByRole('button', { name: 'checkin.submit' }));

    const retryButton = await screen.findByRole('button', { name: 'checkin.retry' });
    expect(screen.getByRole('alert')).toHaveTextContent('checkin.submit_error');
    expect(props.navigation.navigate).not.toHaveBeenCalled();

    fireEvent.press(retryButton);
    await waitFor(() => {
      expect(props.navigation.navigate).toHaveBeenCalledWith('MeditationPlayer', {
        meditationId: 'e6de626c-647e-4871-9b4f-c50594c21f41',
        script: 'Take a slow breath and let your shoulders soften.',
      });
    });
  });

  it('redirects to consent without submitting when consent is not granted', () => {
    useConsentStore.setState({ consentGiven: false });
    const props = createProps();
    const screen = render(<CheckInScreen {...props} />);

    fireEvent.press(screen.getByRole('button', { name: 'checkin.mood_calm' }));
    fireEvent.press(screen.getByRole('button', { name: 'checkin.submit' }));

    expect(props.navigation.replace).toHaveBeenCalledWith('Consent');
    expect(mockSubmitCheckIn).not.toHaveBeenCalled();
    expect(mockGenerateMeditation).not.toHaveBeenCalled();
    expect(useCheckInStore.getState().latestCheckIn).toBeNull();
  });
});
