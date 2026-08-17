import { apiClient as api } from "./api";

export interface SmartreachStatus {
  connected: boolean;
  connected_at: string | null;
}

export interface SmartreachCampaign {
  id: string;
  name: string;
}

export interface SmartreachPushItem {
  record_id: string;
  item_type: "person" | "company";
  data: Record<string, unknown>;
}

export interface SmartreachPushItemResult {
  record_id: string;
  smartreach_prospect_id: string | null;
  error: string | null;
}

export interface SmartreachPushResult {
  pushed: number;
  failed: number;
  results: SmartreachPushItemResult[];
}

export async function getSmartreachStatus(): Promise<SmartreachStatus> {
  const { data } = await api.get<SmartreachStatus>("/integrations/smartreach/status");
  return data;
}

export async function connectSmartreach(apiKey: string): Promise<SmartreachStatus> {
  const { data } = await api.post<SmartreachStatus>("/integrations/smartreach/connect", { api_key: apiKey });
  return data;
}

export async function disconnectSmartreach(): Promise<void> {
  await api.delete("/integrations/smartreach/disconnect");
}

export async function getSmartreachCampaigns(): Promise<SmartreachCampaign[]> {
  const { data } = await api.get<{ campaigns: SmartreachCampaign[] }>("/integrations/smartreach/campaigns");
  return data.campaigns;
}

export async function pushToSmartreach(
  items: SmartreachPushItem[],
  campaignId: string,
): Promise<SmartreachPushResult> {
  const { data } = await api.post<SmartreachPushResult>("/integrations/smartreach/push", {
    campaign_id: campaignId,
    items,
  });
  return data;
}
