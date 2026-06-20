import axios, { type InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, updateAccessToken } from "./tokens";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Separate bare axios instance used ONLY for the token-refresh call.
// This avoids the circular interceptor loop: if the refresh request went
// through apiClient, a 401 on /auth/refresh would trigger another refresh,
// causing an infinite loop.
const refreshClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ── Request: attach access token ──────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: silent token refresh on 401 ────────────────────────────────────
// Only one refresh call is made even if multiple requests fail simultaneously.
// All other failed requests are queued and retried once the new token arrives.

let isRefreshing = false;
let waitQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function drainQueue(token: string) {
  waitQueue.forEach((p) => p.resolve(token));
  waitQueue = [];
}

function rejectQueue(err: unknown) {
  waitQueue.forEach((p) => p.reject(err));
  waitQueue = [];
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Guard: network errors have no config or response
    const original = error.config as RetryConfig | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // On auth pages: surface the error directly — no redirect, no refresh
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path === "/login" || path === "/register") {
        return Promise.reject(error);
      }
    }

    // Queue this request while a refresh is already in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waitQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");

      // Use refreshClient (no interceptors) to avoid recursive 401 handling
      const { data } = await refreshClient.post<{ access_token: string }>(
        "/auth/refresh",
        { refresh_token: refreshToken }
      );

      const newToken = data.access_token;
      updateAccessToken(newToken);
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      drainQueue(newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (refreshError) {
      rejectQueue(refreshError);
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
