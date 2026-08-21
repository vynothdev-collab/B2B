import { api } from "@/lib/api";

export type CustomerRole = "individual" | "enterprise_admin" | "enterprise_user";

export interface Customer {
  id: string;
  name: string;
  email: string;
  role: CustomerRole;
  phone: string | null;
  is_active: boolean;
  enterprise_id: string | null;
  enterprise_name: string | null;
  created_at: string;
  allocated_credits: number;
  used_credits: number;
  remaining_credits: number;
}

export interface ListCustomersParams {
  page?: number;
  page_size?: number;
  role?: CustomerRole;
  roles?: CustomerRole[];
  enterprise_id?: string;
  q?: string;
  status?: "active" | "suspended";
}

export interface PagedCustomers {
  items: Customer[];
  total: number;
  page: number;
  page_size: number;
}

export interface CustomerStats {
  total: number;
  active: number;
  suspended: number;
  new_count: number;
}

export interface PlanBreakdownItem {
  name: string;
  count: number;
}

export interface PlanBreakdownResponse {
  total: number;
  items: PlanBreakdownItem[];
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: CustomerRole;
  enterprise_id?: string;
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  const { data } = await api.post<Customer>("/admin/customers", payload);
  return data;
}

export async function listCustomers(
  params: ListCustomersParams = {},
  signal?: AbortSignal,
): Promise<PagedCustomers> {
  const { data } = await api.get<PagedCustomers>("/admin/customers", { params, signal });
  return data;
}

export async function getCustomerStats(
  params: { role?: CustomerRole; roles?: CustomerRole[]; period?: "week" | "month" } = {},
  signal?: AbortSignal,
): Promise<CustomerStats> {
  const { data } = await api.get<CustomerStats>("/admin/customers/stats", { params, signal });
  return data;
}

export async function getCustomerPlanBreakdown(
  signal?: AbortSignal,
): Promise<PlanBreakdownResponse> {
  const { data } = await api.get<PlanBreakdownResponse>("/admin/customers/plan-breakdown", { signal });
  return data;
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data } = await api.get<Customer>(`/admin/customers/${id}`);
  return data;
}

export async function updateCustomerRole(
  id: string,
  role: CustomerRole,
  enterprise_id?: string | null,
): Promise<Customer> {
  const { data } = await api.patch<Customer>(`/admin/customers/${id}/role`, {
    role,
    enterprise_id: enterprise_id ?? null,
  });
  return data;
}

export async function updateCustomerStatus(id: string, is_active: boolean): Promise<Customer> {
  const { data } = await api.patch<Customer>(`/admin/customers/${id}/status`, { is_active });
  return data;
}

export async function updateCustomerPassword(id: string, new_password: string): Promise<Customer> {
  const { data } = await api.patch<Customer>(`/admin/customers/${id}/password`, { new_password });
  return data;
}
