import { create } from 'zustand';

import { consentStorage } from '../services/consentStorage';
import { useCheckInStore } from './checkInStore';

type ConsentState = {
  consentGiven: boolean | null;
  hasHydrated: boolean;
  hydrateConsent: () => Promise<void>;
  revokeConsent: () => Promise<void>;
  setConsent: (consentGiven: boolean) => Promise<void>;
};

export const useConsentStore = create<ConsentState>((set) => ({
  consentGiven: null,
  hasHydrated: false,
  hydrateConsent: async () => {
    try {
      const storedConsent = await consentStorage.get();
      set({
        consentGiven: storedConsent,
        hasHydrated: true,
      });
    } catch {
      // A storage failure must never bypass the consent gate.
      set({ consentGiven: null, hasHydrated: true });
    }
  },
  revokeConsent: async () => {
    try {
      await consentStorage.clear();
    } finally {
      useCheckInStore.getState().reset();
      set({ consentGiven: null, hasHydrated: true });
    }
  },
  setConsent: async (consentGiven) => {
    await consentStorage.set(consentGiven);
    set({ consentGiven, hasHydrated: true });
  },
}));
