import { apiClient as api } from "./api";

export interface InstantlyStatus {
  connected: boolean;
  connected_at: string | null;
}

export interface InstantlyCampaign {
  id: string;
  name: string;
}

export interface InstantlyPushItem {
  record_id: string;
  item_type: "person" | "company";
  data: Record<string, unknown>;
}

export interface InstantlyPushItemResult {
  record_id: string;
  instantly_lead_id: string | null;
  error: string | null;
}

export interface InstantlyPushResult {
  pushed: number;
  failed: number;
  results: InstantlyPushItemResult[];
}

export async function getInstantlyStatus(): Promise<InstantlyStatus> {
  const { data } = await api.get<InstantlyStatus>("/integrations/instantly/status");
  return data;
}

export async function connectInstantly(apiKey: string): Promise<InstantlyStatus> {
  const { data } = await api.post<InstantlyStatus>("/integrations/instantly/connect", { api_key: apiKey });
  return data;
}

export async function disconnectInstantly(): Promise<void> {
  await api.delete("/integrations/instantly/disconnect");
}

export async function getInstantlyCampaigns(): Promise<InstantlyCampaign[]> {
  const { data } = await api.get<{ campaigns: InstantlyCampaign[] }>("/integrations/instantly/campaigns");
  return data.campaigns;
}

export async function pushToInstantly(
  items: InstantlyPushItem[],
  campaignId: string,
): Promise<InstantlyPushResult> {
  const { data } = await api.post<InstantlyPushResult>("/integrations/instantly/push", {
    campaign_id: campaignId,
    items,
  });
  return data;
}
