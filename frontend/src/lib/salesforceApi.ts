import { apiClient as api } from "./api";

export interface SalesforceStatus {
  connected: boolean;
  salesforce_org_id: string | null;
  salesforce_user_email: string | null;
  connected_at: string | null;
}

export interface SalesforcePushItem {
  record_id: string;
  item_type: "person" | "company";
  data: Record<string, unknown>;
}

export interface SalesforcePushItemResult {
  record_id: string;
  salesforce_id: string | null;
  error: string | null;
}

export interface SalesforcePushResult {
  pushed: number;
  failed: number;
  results: SalesforcePushItemResult[];
}

export async function getSalesforceStatus(): Promise<SalesforceStatus> {
  const { data } = await api.get<SalesforceStatus>("/integrations/salesforce/status");
  return data;
}

export async function getSalesforceAuthorizeUrl(): Promise<string> {
  const { data } = await api.get<{ url: string }>("/integrations/salesforce/authorize");
  return data.url;
}

export async function disconnectSalesforce(): Promise<void> {
  await api.delete("/integrations/salesforce/disconnect");
}

export async function pushToSalesforce(items: SalesforcePushItem[]): Promise<SalesforcePushResult> {
  const { data } = await api.post<SalesforcePushResult>("/integrations/salesforce/push", { items });
  return data;
}
