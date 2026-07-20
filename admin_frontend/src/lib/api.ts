import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./cookies";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "") + "/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// ── Request interceptor — attach access token ──────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — auto-refresh on 401 ────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(newToken: string) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers["Authorization"] = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post<{ access_token: string }>(
        `${BASE_URL}/admin/auth/refresh`,
        { refresh_token: refreshToken }
      );
      const newAccess = data.access_token;
      setTokens(newAccess, refreshToken);
      processQueue(newAccess);
      original.headers["Authorization"] = `Bearer ${newAccess}`;
      return api(original);
    } catch {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);
