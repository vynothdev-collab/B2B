import { api } from "@/lib/api";

export interface SearchActivityRecord {
  id: string;
  user_name: string;
  account_type: "Individual" | "Enterprise";
  company: string | null;
  search_type: string;
  created_at: string;
}

export interface PagedSearchActivity {
  items: SearchActivityRecord[];
  total: number;
  page: number;
  page_size: number;
}

export interface UnlockRecord {
  id: string;
  user_name: string;
  account_type: "Individual" | "Enterprise";
  company: string | null;
  field: string;
  value: string | null;
  unlocked_at: string;
}

export interface PagedUnlocks {
  items: UnlockRecord[];
  total: number;
  page: number;
  page_size: number;
}

export async function listSearchActivity(
  params: {
    page?: number;
    page_size?: number;
    period?: string;
    account_type?: string;
    search_type?: string;
  },
  signal?: AbortSignal,
): Promise<PagedSearchActivity> {
  const { data } = await api.get<PagedSearchActivity>("/admin/reports/search-activity", {
    params,
    signal,
  });
  return data;
}

export async function listUnlocks(
  params: {
    field: "email" | "mobile";
    page?: number;
    page_size?: number;
    period?: string;
    account_type?: string;
  },
  signal?: AbortSignal,
): Promise<PagedUnlocks> {
  const { data } = await api.get<PagedUnlocks>("/admin/reports/unlocks", {
    params,
    signal,
  });
  return data;
}

export interface ActivityItem {
  type: string;
  text: string;
  timestamp: string;
}

export interface RecentActivityResponse {
  items: ActivityItem[];
}

export async function listRecentActivity(
  limit = 10,
  signal?: AbortSignal,
): Promise<RecentActivityResponse> {
  const { data } = await api.get<RecentActivityResponse>("/admin/reports/recent-activity", {
    params: { limit },
    signal,
  });
  return data;
}
