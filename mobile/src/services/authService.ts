import { apiClient } from './apiClient';

export type AuthResponse = {
  accessToken: string;
  userId: string;
  email: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export class ApiContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiContractError';
  }
}

export async function register(credentials: AuthCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<unknown>('/auth/register', credentials);
  if (!isAuthResponse(response.data)) {
    throw new ApiContractError('The registration API returned a malformed response.');
  }
  return response.data;
}

export async function login(credentials: AuthCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<unknown>('/auth/login', credentials);
  if (!isAuthResponse(response.data)) {
    throw new ApiContractError('The login API returned a malformed response.');
  }
  return response.data;
}

function isAuthResponse(value: unknown): value is AuthResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.accessToken === 'string' &&
    value.accessToken.length > 0 &&
    typeof value.userId === 'string' &&
    typeof value.email === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
