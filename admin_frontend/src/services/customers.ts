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
}

export interface ListCustomersParams {
  role?: CustomerRole;
  enterprise_id?: string;
  q?: string;
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
): Promise<Customer[]> {
  const { data } = await api.get<Customer[]>("/admin/customers", { params, signal });
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
