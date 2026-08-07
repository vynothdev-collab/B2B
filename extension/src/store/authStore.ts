import { create } from 'zustand';
import type { User } from '../types';
import { tokens } from '../utils/tokens';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import { authApi } from '../api/auth';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  setUser: (user) => set({ user }),

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      const accessToken = await tokens.getAccess();
      if (!accessToken) {
        const refreshToken = await tokens.getRefresh();
        if (!refreshToken) {
          set({ user: null, loading: false, initialized: true });
          return;
        }
        const result = await authApi.refresh(refreshToken);
        await tokens.setAccess(result.access_token);
      }
      const user = await authApi.getMe();
      await storage.set(STORAGE_KEYS.USER, user);
      set({ user, loading: false, initialized: true, error: null });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        await tokens.clear();
        set({ user: null, loading: false, initialized: true, error: null });
      } else {
        const cachedUser = await storage.get<User>(STORAGE_KEYS.USER);
        set({ user: cachedUser, loading: false, initialized: true, error: null });
      }
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await authApi.login(email, password);
      await tokens.store(result.access_token, result.refresh_token);
      await storage.set(STORAGE_KEYS.USER, result.user);
      set({ user: result.user, loading: false, error: null });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const msg = axiosErr?.response?.data?.detail || 'Login failed. Please check your credentials.';
      set({ loading: false, error: msg });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
    }
    await tokens.clear();
    set({ user: null, error: null });
  },

  refreshUser: async () => {
    try {
      const user = await authApi.getMe();
      await storage.set(STORAGE_KEYS.USER, user);
      set({ user });
    } catch {
    }
  },
}));
