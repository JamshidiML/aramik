import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { apiClient } from '../apiClient';
import { ApiContractError, login, register } from '../authService';

const postRequest = jest.spyOn(apiClient, 'post');

const credentials = { email: 'user@example.com', password: 'a-strong-password' } as const;

describe('authService', () => {
  beforeEach(() => {
    postRequest.mockReset();
  });

  it('returns a contract-valid response on register and login', async () => {
    const authResponse = {
      accessToken: 'signed.jwt.token',
      userId: 'f4f6c776-eec9-4b67-85bd-f95f538a96e8',
      email: 'user@example.com',
    } as const;
    postRequest.mockResolvedValue({ data: authResponse });

    await expect(register(credentials)).resolves.toEqual(authResponse);
    await expect(login(credentials)).resolves.toEqual(authResponse);
    expect(postRequest).toHaveBeenNthCalledWith(1, '/auth/register', credentials);
    expect(postRequest).toHaveBeenNthCalledWith(2, '/auth/login', credentials);
  });

  it('propagates network/auth failures without returning partial data', async () => {
    postRequest.mockRejectedValueOnce(new Error('Invalid email or password.'));

    await expect(login(credentials)).rejects.toThrow('Invalid email or password.');
  });

  it('rejects malformed API responses', async () => {
    postRequest.mockResolvedValueOnce({ data: { accessToken: '' } });

    await expect(register(credentials)).rejects.toBeInstanceOf(ApiContractError);
  });
});
