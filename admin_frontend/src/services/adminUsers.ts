import { api } from "@/lib/api";

export interface AdminAccountRecord {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  is_active: boolean;
  created_at: string;
  is_you: boolean;
}

export interface CreateAdminAccountPayload {
  name: string;
  email: string;
  password: string;
  role: "admin" | "super_admin";
}

export interface UpdateAdminAccountPayload {
  name: string;
  email: string;
  role: "admin" | "super_admin";
}

export async function listAdminAccounts(signal?: AbortSignal): Promise<AdminAccountRecord[]> {
  const { data } = await api.get<AdminAccountRecord[]>("/admin/users/accounts", { signal });
  return data;
}

export async function createAdminAccount(
  payload: CreateAdminAccountPayload,
): Promise<AdminAccountRecord> {
  const { data } = await api.post<AdminAccountRecord>("/admin/users/accounts", payload);
  return data;
}

export async function updateAdminAccount(
  id: string,
  payload: UpdateAdminAccountPayload,
): Promise<AdminAccountRecord> {
  const { data } = await api.patch<AdminAccountRecord>(`/admin/users/accounts/${id}`, payload);
  return data;
}

export async function setAdminAccountStatus(
  id: string,
  is_active: boolean,
): Promise<AdminAccountRecord> {
  const { data } = await api.patch<AdminAccountRecord>(`/admin/users/accounts/${id}/status`, {
    is_active,
  });
  return data;
}

export interface AdminSelfInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface UpdateOwnProfilePayload {
  name: string;
  current_password?: string;
  new_password?: string;
}

export async function updateOwnProfile(
  payload: UpdateOwnProfilePayload,
): Promise<AdminSelfInfo> {
  const { data } = await api.patch<AdminSelfInfo>("/admin/auth/me", payload);
  return data;
}
