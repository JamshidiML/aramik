import * as SecureStore from 'expo-secure-store';

const CONSENT_STORAGE_KEY = 'aramik.health-data-consent';

export const consentStorage = {
  clear: () => SecureStore.deleteItemAsync(CONSENT_STORAGE_KEY),
  get: () => SecureStore.getItemAsync(CONSENT_STORAGE_KEY),
  set: (consentGiven: boolean) =>
    SecureStore.setItemAsync(CONSENT_STORAGE_KEY, String(consentGiven)),
};
