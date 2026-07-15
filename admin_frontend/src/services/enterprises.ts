import { api } from "@/lib/api";

export type EnterpriseStatus = "active" | "suspended" | "inactive";

export interface Enterprise {
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
  user_count: number;
  admin_name: string | null;
  admin_email: string | null;
}

export interface CreateEnterprisePayload {
  name: string;
  industry?: string;
  website?: string;
  country?: string;
  size?: string;
  phone?: string;
  plan?: string;
  credits?: number;
  status?: EnterpriseStatus;
  notes?: string;
}

export type UpdateEnterprisePayload = Partial<CreateEnterprisePayload>;

export interface CreateEnterpriseAdminPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface EnterpriseAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  enterprise_id: string;
}

export interface ListEnterprisesParams {
  page?: number;
  page_size?: number;
  q?: string;
  status?: "active" | "suspended" | "inactive";
}

export interface PagedEnterprises {
  items: Enterprise[];
  total: number;
  page: number;
  page_size: number;
}

export interface EnterpriseStats {
  total: number;
  active: number;
  total_users: number;
  total_credits: number;
}

export async function listEnterprises(
  params: ListEnterprisesParams = {},
  signal?: AbortSignal,
): Promise<PagedEnterprises> {
  const { data } = await api.get<PagedEnterprises>("/admin/enterprises", { params, signal });
  return data;
}

export async function getEnterpriseStats(signal?: AbortSignal): Promise<EnterpriseStats> {
  const { data } = await api.get<EnterpriseStats>("/admin/enterprises/stats", { signal });
  return data;
}

export async function getEnterprise(id: string): Promise<Enterprise> {
  const { data } = await api.get<Enterprise>(`/admin/enterprises/${id}`);
  return data;
}

export async function createEnterprise(payload: CreateEnterprisePayload): Promise<Enterprise> {
  const { data } = await api.post<Enterprise>("/admin/enterprises", payload);
  return data;
}

export async function updateEnterprise(
  id: string,
  payload: UpdateEnterprisePayload,
): Promise<Enterprise> {
  const { data } = await api.patch<Enterprise>(`/admin/enterprises/${id}`, payload);
  return data;
}

export async function createEnterpriseAdmin(
  enterpriseId: string,
  payload: CreateEnterpriseAdminPayload,
): Promise<EnterpriseAdmin> {
  const { data } = await api.post<EnterpriseAdmin>(
    `/admin/enterprises/${enterpriseId}/admins`,
    payload,
  );
  return data;
}
