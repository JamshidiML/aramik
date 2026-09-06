import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { authStorage } from '../../services/authStorage';
import * as authService from '../../services/authService';
import { useAuthStore } from '../authStore';
import { useCheckInStore } from '../checkInStore';

jest.mock('../../services/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
}));

let mockStoredToken: string | null = null;

const clearToken = jest.spyOn(authStorage, 'clear');
const getToken = jest.spyOn(authStorage, 'get');
const setToken = jest.spyOn(authStorage, 'set');
const mockLogin = jest.mocked(authService.login);
const mockRegister = jest.mocked(authService.register);

const authResponse = {
  accessToken: 'signed.jwt.token',
  userId: 'f4f6c776-eec9-4b67-85bd-f95f538a96e8',
  email: 'user@example.com',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    mockStoredToken = null;
    clearToken.mockReset().mockImplementation(async () => {
      mockStoredToken = null;
    });
    getToken.mockReset().mockImplementation(async () => mockStoredToken);
    setToken.mockReset().mockImplementation(async (token) => {
      mockStoredToken = token;
    });
    mockLogin.mockReset().mockResolvedValue(authResponse);
    mockRegister.mockReset().mockResolvedValue(authResponse);
    useAuthStore.setState({ accessToken: null, hasHydrated: false, userId: null });
    useCheckInStore.setState({ latestCheckIn: null });
  });

  it('restores a persisted session on hydrate', async () => {
    await useAuthStore.getState().signIn({ email: 'user@example.com', password: 'secret' });
    useAuthStore.setState({ accessToken: null, hasHydrated: false, userId: null });

    await useAuthStore.getState().hydrateAuth();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'signed.jwt.token',
      hasHydrated: true,
    });
  });

  it('signs up, persists the token, and stores the user id', async () => {
    await useAuthStore.getState().signUp({ email: 'user@example.com', password: 'secret' });

    expect(mockRegister).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret' });
    expect(mockStoredToken).toBe('signed.jwt.token');
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'signed.jwt.token',
      userId: 'f4f6c776-eec9-4b67-85bd-f95f538a96e8',
    });
  });

  it('signing out clears the session and the in-memory check-in draft', async () => {
    await useAuthStore.getState().signIn({ email: 'user@example.com', password: 'secret' });
    useCheckInStore.getState().saveCheckIn({ mood: 'stress', note: 'Work' });

    await useAuthStore.getState().signOut();

    expect(mockStoredToken).toBeNull();
    expect(useAuthStore.getState()).toMatchObject({ accessToken: null, userId: null });
    expect(useCheckInStore.getState().latestCheckIn).toBeNull();
  });

  it('propagates a login failure without storing a token', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid email or password.'));

    await expect(
      useAuthStore.getState().signIn({ email: 'user@example.com', password: 'wrong' }),
    ).rejects.toThrow('Invalid email or password.');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
