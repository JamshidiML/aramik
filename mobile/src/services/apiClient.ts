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
