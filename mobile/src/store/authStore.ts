import { create } from 'zustand';

import type { AuthCredentials } from '../services/authService';
import { login, register } from '../services/authService';
import { authStorage } from '../services/authStorage';
import { setAuthToken } from '../services/apiClient';
import { useCheckInStore } from './checkInStore';

type AuthState = {
  accessToken: string | null;
  hasHydrated: boolean;
  userId: string | null;
  hydrateAuth: () => Promise<void>;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (credentials: AuthCredentials) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  hasHydrated: false,
  userId: null,
  hydrateAuth: async () => {
    try {
      const storedToken = await authStorage.get();
      setAuthToken(storedToken);
      set({ accessToken: storedToken, hasHydrated: true });
    } catch {
      // A storage failure must never leave a stale token wired into the API client.
      setAuthToken(null);
      set({ accessToken: null, hasHydrated: true });
    }
  },
  signIn: async (credentials) => {
    const response = await login(credentials);
    await authStorage.set(response.accessToken);
    setAuthToken(response.accessToken);
    set({ accessToken: response.accessToken, hasHydrated: true, userId: response.userId });
  },
  signOut: async () => {
    // GDPR health-data consent is intentionally left untouched here: it is a separate
    // decision from the session, and is re-checked per check-in via useConsentStore.
    try {
      await authStorage.clear();
    } finally {
      setAuthToken(null);
      useCheckInStore.getState().reset();
      set({ accessToken: null, hasHydrated: true, userId: null });
    }
  },
  signUp: async (credentials) => {
    const response = await register(credentials);
    await authStorage.set(response.accessToken);
    setAuthToken(response.accessToken);
    set({ accessToken: response.accessToken, hasHydrated: true, userId: response.userId });
  },
}));
