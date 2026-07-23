import { apiClient } from "./api";
import { clearTokens, storeTokens, updateAccessToken } from "./tokens";

export type { };
export { storeTokens, updateAccessToken, clearTokens };

export type UserRole = "individual" | "enterprise_admin" | "enterprise_user" | string;

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  enterprise_id?: string | null;
  allocated_credits: number;
  used_credits: number;
  remaining_credits: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserInfo;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/login", { email, password });
  return res.data;
}

export async function apiRegister(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/register", { name, email, password });
  return res.data;
}

export async function apiGetMe(): Promise<UserInfo> {
  const res = await apiClient.get<UserInfo>("/users/me");
  return res.data;
}

export interface DailyUsage {
  date:    string;
  total:   number;
  person:  number;
  company: number;
  agentic: number;
}

export interface RecentSearch {
  id:          string;
  search_type: string;
  created_at:  string;
}

export interface UsageHistoryResponse {
  daily_usage:  DailyUsage[];
  recent:       RecentSearch[];
  total_logs:   number;
}

export async function apiGetUsageHistory(
  days = 30,
  signal?: AbortSignal,
): Promise<UsageHistoryResponse> {
  const res = await apiClient.get<UsageHistoryResponse>("/users/me/usage-history", {
    params: { days },
    signal,
  });
  return res.data;
}
