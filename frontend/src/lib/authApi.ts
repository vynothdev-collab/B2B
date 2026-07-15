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
