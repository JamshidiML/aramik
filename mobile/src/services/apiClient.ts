import { create, isAxiosError } from 'axios';
import Constants from 'expo-constants';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const configuredApiBaseUrl: unknown = Constants.expoConfig?.extra?.apiBaseUrl;

export const apiClient = create({
  baseURL:
    typeof configuredApiBaseUrl === 'string' && configuredApiBaseUrl.length > 0
      ? configuredApiBaseUrl
      : DEFAULT_API_BASE_URL,
  timeout: 30_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (__DEV__) {
      const diagnostics = isAxiosError(error)
        ? {
            code: error.code ?? null,
            method: error.config?.method?.toUpperCase() ?? null,
            path: error.config?.url ?? null,
            status: error.response?.status ?? null,
          }
        : { code: null, method: null, path: null, status: null };
      console.error('[Aramik API] Request failed', diagnostics);
    }
    return Promise.reject(error);
  },
);
