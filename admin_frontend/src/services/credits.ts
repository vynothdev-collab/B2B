import { api } from "@/lib/api";

export interface IndividualCreditRecord {
  id: string;
  name: string;
  email: string;
  allocated_credits: number;
  used_credits: number;
  remaining_credits: number;
  status: "healthy" | "low" | "exceeded";
}

export interface EnterpriseCreditRecord {
  id: string;
  name: string;
  plan: string;
  pool_credits: number;
  total_allocated: number;
  total_used: number;
  total_remaining: number;
  status: "healthy" | "low" | "exceeded";
}

export interface CreditStats {
  total_allocated: number;
  total_used: number;
  total_remaining: number;
}

export interface PagedIndividualCredits {
  items: IndividualCreditRecord[];
  total: number;
  page: number;
  page_size: number;
  stats: CreditStats;
}

export interface PagedEnterpriseCredits {
  items: EnterpriseCreditRecord[];
  total: number;
  page: number;
  page_size: number;
  stats: CreditStats;
}

export interface AllocateCreditsPayload {
  credits: number;
}

export interface CreditTransactionRecord {
  id: string;
  account_name: string;
  account_type: "individual" | "enterprise";
  transaction_type: "allocation" | "deduction";
  reason: string;
  delta: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

export interface PagedCreditTransactions {
  items: CreditTransactionRecord[];
  total: number;
  page: number;
  page_size: number;
  stats: CreditStats;
}

export async function listIndividualCredits(
  params: { page?: number; page_size?: number; q?: string; status?: string },
  signal?: AbortSignal,
): Promise<PagedIndividualCredits> {
  const { data } = await api.get<PagedIndividualCredits>("/admin/credits/individual", {
    params,
    signal,
  });
  return data;
}

export async function listEnterpriseCredits(
  params: { page?: number; page_size?: number; q?: string; status?: string },
  signal?: AbortSignal,
): Promise<PagedEnterpriseCredits> {
  const { data } = await api.get<PagedEnterpriseCredits>("/admin/credits/enterprises", {
    params,
    signal,
  });
  return data;
}

export async function listCreditTransactions(
  params: {
    page?: number;
    page_size?: number;
    q?: string;
    account_type?: string;
    type?: string;
  },
  signal?: AbortSignal,
): Promise<PagedCreditTransactions> {
  const { data } = await api.get<PagedCreditTransactions>("/admin/credits/transactions", {
    params,
    signal,
  });
  return data;
}

export async function addCreditsToUser(
  userId: string,
  payload: AllocateCreditsPayload,
): Promise<void> {
  await api.post(`/admin/customers/${userId}/allocate-credits`, payload);
}

export async function addCreditsToEnterprise(
  enterpriseId: string,
  payload: AllocateCreditsPayload,
): Promise<void> {
  await api.post(`/admin/credits/enterprises/${enterpriseId}/add-credits`, payload);
}
