import { apiClient as api } from "./api";

export interface ZohoStatus {
  connected: boolean;
  zoho_user_email: string | null;
  connected_at: string | null;
}

export interface ZohoPushItem {
  record_id: string;
  item_type: "person" | "company";
  data: Record<string, unknown>;
}

export interface ZohoPushItemResult {
  record_id: string;
  zoho_id: string | null;
  error: string | null;
}

export interface ZohoPushResult {
  pushed: number;
  failed: number;
  results: ZohoPushItemResult[];
}

export async function getZohoStatus(): Promise<ZohoStatus> {
  const { data } = await api.get<ZohoStatus>("/integrations/zoho/status");
  return data;
}

export async function getZohoAuthorizeUrl(): Promise<string> {
  const { data } = await api.get<{ url: string }>("/integrations/zoho/authorize");
  return data.url;
}

export async function disconnectZoho(): Promise<void> {
  await api.delete("/integrations/zoho/disconnect");
}

export async function pushToZoho(items: ZohoPushItem[]): Promise<ZohoPushResult> {
  const { data } = await api.post<ZohoPushResult>("/integrations/zoho/push", { items });
  return data;
}
