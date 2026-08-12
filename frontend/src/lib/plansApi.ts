import { apiClient as api } from "./api";

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  plan_type: "validity" | "payg";
  target: string;
  credits: number;
  validity_days: number | null;
  price_cents: number;
  is_active: boolean;
}

export interface UserPlanOut {
  id: string;
  plan_id: string;
  plan_name: string;
  plan_type: "validity" | "payg";
  credits_total: number;
  credits_remaining: number;
  status: "active" | "queued" | "expired" | "used_up";
  starts_at: string | null;
  expires_at: string | null;
  queue_position: number | null;
  purchased_at: string;
}

export interface CreditSummary {
  validity_credits_remaining: number;
  payg_credits_remaining: number;
  legacy_credits_remaining: number;
  total_remaining: number;
}

export interface MyPlansResponse {
  active_validity: UserPlanOut | null;
  queued_validity: UserPlanOut[];
  active_payg: UserPlanOut[];
  summary: CreditSummary;
}

export async function getAvailablePlans(signal?: AbortSignal): Promise<Plan[]> {
  const { data } = await api.get<Plan[]>("/plans/available", { signal });
  return data;
}

export async function getMyPlans(signal?: AbortSignal): Promise<MyPlansResponse> {
  const { data } = await api.get<MyPlansResponse>("/plans/my", { signal });
  return data;
}

export async function purchasePlan(planId: string): Promise<UserPlanOut> {
  const { data } = await api.post<UserPlanOut>(`/plans/purchase/${planId}`);
  return data;
}

export async function getMyPlanHistory(signal?: AbortSignal): Promise<UserPlanOut[]> {
  const { data } = await api.get<UserPlanOut[]>("/plans/my/history", { signal });
  return data;
}

export type BillingHistoryKind = "purchase" | "person" | "company" | "agentic";
export type BillingHistoryFilter = "all" | "purchase" | "usage";

export interface BillingHistoryItem {
  id: string;
  date: string;
  kind: BillingHistoryKind;
  label: string;
  detail: string;
  credits: number;
}

export interface BillingHistoryResponse {
  items: BillingHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export async function getMyBillingHistory(
  filter: BillingHistoryFilter = "all",
  page = 1,
  pageSize = 10,
  signal?: AbortSignal,
): Promise<BillingHistoryResponse> {
  const { data } = await api.get<BillingHistoryResponse>("/plans/my/billing-history", {
    params: { filter, page, page_size: pageSize },
    signal,
  });
  return data;
}
