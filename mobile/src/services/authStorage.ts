import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_STORAGE_KEY = 'aramik.access-token';

export const authStorage = {
  clear: () => SecureStore.deleteItemAsync(ACCESS_TOKEN_STORAGE_KEY),
  get: () => SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY),
  set: (accessToken: string) => SecureStore.setItemAsync(ACCESS_TOKEN_STORAGE_KEY, accessToken),
};
