import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants';
import { tokens } from '../utils/tokens';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let refreshPromise: Promise<string> | null = null;

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokens.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !original._retry
    ) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          const refreshToken = await tokens.getRefresh();
          if (!refreshToken) throw new Error('No refresh token');
          refreshPromise = axios
            .post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
            .then((r) => r.data.access_token)
            .finally(() => {
              refreshPromise = null;
            });
        }
        const newAccessToken = await refreshPromise;
        await tokens.setAccess(newAccessToken);
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(original);
      } catch (refreshErr: unknown) {
        const refreshStatus = (refreshErr as { response?: { status?: number } })?.response?.status;
        if (refreshStatus === 401 || refreshStatus === 403) {
          await tokens.clear();
          chrome.runtime.sendMessage({ type: 'AUTH_EXPIRED' });
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
