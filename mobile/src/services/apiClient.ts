import axios from 'axios';
import Constants from 'expo-constants';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const configuredApiBaseUrl: unknown = Constants.expoConfig?.extra?.apiBaseUrl;

export const apiClient = axios.create({
  baseURL:
    typeof configuredApiBaseUrl === 'string' && configuredApiBaseUrl.length > 0
      ? configuredApiBaseUrl
      : DEFAULT_API_BASE_URL,
  timeout: 30_000,
});

// Kept outside the store on purpose: authStore depends on authService, which depends on
// apiClient, so apiClient cannot import authStore back without a circular dependency.
// authStore calls setAuthToken() whenever the token changes instead.
let currentAccessToken: string | null = null;

export function setAuthToken(accessToken: string | null): void {
  currentAccessToken = accessToken;
}

apiClient.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});
