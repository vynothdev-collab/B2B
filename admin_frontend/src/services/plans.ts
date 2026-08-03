import { api } from "@/lib/api";

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  plan_type: "validity" | "payg";
  target: "individual" | "enterprise";
  credits: number;
  validity_days: number | null;
  price_cents: number;
  is_active: boolean;
  created_at: string;
}

export interface PagedPlans {
  items: Plan[];
  total: number;
  page: number;
  page_size: number;
}

export interface PlansSummary {
  total: number;
  active_count: number;
  inactive_count: number;
}

export interface CreatePlanPayload {
  name: string;
  description?: string;
  plan_type: "validity" | "payg";
  target: "individual" | "enterprise";
  credits: number;
  validity_days?: number;
  price_cents: number;
}

export interface EditPlanPayload {
  name?: string;
  description?: string;
  price_cents?: number;
  credits?: number;
  validity_days?: number;
}

export async function getPlansSummary(target: string, signal?: AbortSignal): Promise<PlansSummary> {
  const { data } = await api.get<PlansSummary>("/admin/plans/summary", { params: { target }, signal });
  return data;
}

export async function listPlans(
  params?: { target?: string; page?: number; page_size?: number; search?: string; is_active?: boolean },
  signal?: AbortSignal,
): Promise<PagedPlans> {
  const { data } = await api.get<PagedPlans>("/admin/plans", { params, signal });
  return data;
}

export async function createPlan(payload: CreatePlanPayload): Promise<Plan> {
  const { data } = await api.post<Plan>("/admin/plans", payload);
  return data;
}

export async function editPlan(id: string, payload: EditPlanPayload): Promise<Plan> {
  const { data } = await api.patch<Plan>(`/admin/plans/${id}`, payload);
  return data;
}

export async function togglePlan(id: string): Promise<Plan> {
  const { data } = await api.patch<Plan>(`/admin/plans/${id}/toggle`);
  return data;
}

export async function deletePlan(id: string): Promise<void> {
  await api.delete(`/admin/plans/${id}`);
}
