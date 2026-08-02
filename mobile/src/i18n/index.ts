import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import de from './locales/de.json';
import en from './locales/en.json';

// قانون تیم: هیچ متنی نباید مستقیم در کامپوننت hardcode شود.
// همیشه از t('namespace.key') استفاده شود تا افزودن زبان‌های آینده (فارسی/عربی) ساده بماند.

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'de';
const supportedLanguages = ['de', 'en'];
const defaultLanguage = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'de';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    de: { translation: de },
    en: { translation: en },
  },
  lng: defaultLanguage, // کاربر می‌تواند بعداً در تنظیمات دستی تغییر دهد
  fallbackLng: 'de',
  interpolation: { escapeValue: false },
});

export default i18n;
