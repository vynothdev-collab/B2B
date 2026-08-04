import { STORAGE_KEYS } from '../constants';
import { storage } from './storage';

export const tokens = {
  getAccess: () => storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN),
  getRefresh: () => storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN),
  setAccess: (token: string) => storage.set(STORAGE_KEYS.ACCESS_TOKEN, token),
  setRefresh: (token: string) => storage.set(STORAGE_KEYS.REFRESH_TOKEN, token),
  store: async (accessToken: string, refreshToken?: string) => {
    await storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) await storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },
  clear: async () => {
    await storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    await storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    await storage.remove(STORAGE_KEYS.USER);
  },
};
