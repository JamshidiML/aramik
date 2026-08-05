import * as SecureStore from 'expo-secure-store';

const CONSENT_STORAGE_KEY = 'aramik.health-data-consent';
const CONSENT_RECORD_VERSION = 1;

export const CURRENT_CONSENT_POLICY_VERSION = '2026-08-05';

type ConsentRecord = {
  version: typeof CONSENT_RECORD_VERSION;
  policyVersion: typeof CURRENT_CONSENT_POLICY_VERSION;
  consentGiven: boolean;
  decidedAt: string;
};

export const consentStorage = {
  clear: () => SecureStore.deleteItemAsync(CONSENT_STORAGE_KEY),
  get: async (): Promise<boolean | null> => {
    const storedValue = await SecureStore.getItemAsync(CONSENT_STORAGE_KEY);
    if (storedValue === null) {
      return null;
    }

    try {
      const parsedValue: unknown = JSON.parse(storedValue);
      return isCurrentConsentRecord(parsedValue) ? parsedValue.consentGiven : null;
    } catch {
      // Legacy boolean strings and malformed values are never accepted as current consent.
      return null;
    }
  },
  set: (consentGiven: boolean) => {
    const record: ConsentRecord = {
      version: CONSENT_RECORD_VERSION,
      policyVersion: CURRENT_CONSENT_POLICY_VERSION,
      consentGiven,
      decidedAt: new Date().toISOString(),
    };
    return SecureStore.setItemAsync(CONSENT_STORAGE_KEY, JSON.stringify(record));
  },
};

function isCurrentConsentRecord(value: unknown): value is ConsentRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate.version === CONSENT_RECORD_VERSION &&
    candidate.policyVersion === CURRENT_CONSENT_POLICY_VERSION &&
    typeof candidate.consentGiven === 'boolean' &&
    typeof candidate.decidedAt === 'string' &&
    !Number.isNaN(Date.parse(candidate.decidedAt))
  );
}
