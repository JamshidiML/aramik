import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import de from './locales/de.json';
import en from './locales/en.json';

// Team rule: never hardcode text directly in a component.
// Always use t('namespace.key') so future languages can be added easily.

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'de';
const supportedLanguages = ['de', 'en'];
const defaultLanguage = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'de';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    de: { translation: de },
    en: { translation: en },
  },
  lng: defaultLanguage, // The user can change this manually in settings later.
  fallbackLng: 'de',
  interpolation: { escapeValue: false },
});

export default i18n;
