import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';

import {
  consentStorage,
  CURRENT_CONSENT_POLICY_VERSION,
} from '../consentStorage';

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const getItemAsync = jest.mocked(SecureStore.getItemAsync);
const setItemAsync = jest.mocked(SecureStore.setItemAsync);

describe('consentStorage', () => {
  beforeEach(() => {
    getItemAsync.mockReset();
    setItemAsync.mockReset().mockResolvedValue(undefined);
  });

  it.each(['true', 'false', 'not-json'])('rejects legacy or malformed value %s', async (value) => {
    getItemAsync.mockResolvedValue(value);

    await expect(consentStorage.get()).resolves.toBeNull();
  });

  it('rejects consent recorded for an older policy version', async () => {
    getItemAsync.mockResolvedValue(
      JSON.stringify({
        version: 1,
        policyVersion: '2026-01-01',
        consentGiven: true,
        decidedAt: '2026-08-05T00:00:00.000Z',
      }),
    );

    await expect(consentStorage.get()).resolves.toBeNull();
  });

  it('restores a valid decision for the current policy', async () => {
    getItemAsync.mockResolvedValue(
      JSON.stringify({
        version: 1,
        policyVersion: CURRENT_CONSENT_POLICY_VERSION,
        consentGiven: true,
        decidedAt: '2026-08-05T00:00:00.000Z',
      }),
    );

    await expect(consentStorage.get()).resolves.toBe(true);
  });

  it('writes a versioned and timestamped decision record', async () => {
    await consentStorage.set(false);

    expect(setItemAsync).toHaveBeenCalledTimes(1);
    const [, serializedRecord] = setItemAsync.mock.calls[0];
    expect(JSON.parse(serializedRecord)).toMatchObject({
      version: 1,
      policyVersion: CURRENT_CONSENT_POLICY_VERSION,
      consentGiven: false,
    });
    expect(Date.parse(JSON.parse(serializedRecord).decidedAt)).not.toBeNaN();
  });
});
