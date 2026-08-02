import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import SettingsScreen from '../SettingsScreen';

const mockChangeLanguage = jest.fn();
let mockLanguage = 'de';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      changeLanguage: mockChangeLanguage,
      language: mockLanguage,
    },
    t: (key: string) => key,
  }),
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    mockChangeLanguage.mockClear();
    mockLanguage = 'de';
  });

  it('changes the language from German to English', () => {
    const screen = render(<SettingsScreen />);
    const languageSwitch = screen.getByRole('switch', {
      name: 'settings.language_switch_label',
    });

    expect(languageSwitch.props.value).toBe(false);
    fireEvent(languageSwitch, 'valueChange', true);

    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });
});
