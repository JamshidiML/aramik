import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { consentStorage } from '../../services/consentStorage';
import { useCheckInStore } from '../checkInStore';
import { useConsentStore } from '../consentStore';

let mockStoredConsent: string | null = null;

const clearConsent = jest.spyOn(consentStorage, 'clear');
const getConsent = jest.spyOn(consentStorage, 'get');
const setConsent = jest.spyOn(consentStorage, 'set');

describe('useConsentStore', () => {
  beforeEach(() => {
    mockStoredConsent = null;
    clearConsent.mockReset().mockImplementation(async () => {
      mockStoredConsent = null;
    });
    getConsent.mockReset().mockImplementation(async () => mockStoredConsent);
    setConsent.mockReset().mockImplementation(async (consentGiven) => {
      mockStoredConsent = String(consentGiven);
    });
    useConsentStore.setState({ consentGiven: null, hasHydrated: false });
    useCheckInStore.setState({ latestCheckIn: null });
  });

  it('restores persisted consent during a simulated store re-read', async () => {
    await useConsentStore.getState().setConsent(true);
    useConsentStore.setState({ consentGiven: null, hasHydrated: false });

    await useConsentStore.getState().hydrateConsent();

    expect(useConsentStore.getState()).toMatchObject({
      consentGiven: true,
      hasHydrated: true,
    });
  });

  it('revoking consent clears both secure consent and in-memory check-in data', async () => {
    await useConsentStore.getState().setConsent(true);
    useCheckInStore.getState().saveCheckIn({ mood: 'stress', note: 'Work' });

    await useConsentStore.getState().revokeConsent();

    expect(mockStoredConsent).toBeNull();
    expect(useConsentStore.getState().consentGiven).toBeNull();
    expect(useCheckInStore.getState().latestCheckIn).toBeNull();
  });
});
