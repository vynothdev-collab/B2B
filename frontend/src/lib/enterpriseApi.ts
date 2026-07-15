import { apiClient } from "./api";

export interface EnterpriseMe {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  country: string | null;
  size: string | null;
  phone: string | null;
  plan: string;
  credits: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface EnterpriseMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateEnterpriseUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export async function apiGetMyEnterprise(): Promise<EnterpriseMe> {
  const { data } = await apiClient.get<EnterpriseMe>("/enterprise/me");
  return data;
}

export async function apiListEnterpriseMembers(): Promise<EnterpriseMember[]> {
  const { data } = await apiClient.get<EnterpriseMember[]>("/enterprise/users");
  return data;
}

export async function apiCreateEnterpriseUser(
  payload: CreateEnterpriseUserPayload,
): Promise<EnterpriseMember> {
  const { data } = await apiClient.post<EnterpriseMember>("/enterprise/users", payload);
  return data;
}

export async function apiUpdateEnterpriseMemberStatus(
  userId: string,
  is_active: boolean,
): Promise<EnterpriseMember> {
  const { data } = await apiClient.patch<EnterpriseMember>(
    `/enterprise/users/${userId}/status`,
    { is_active },
  );
  return data;
}
