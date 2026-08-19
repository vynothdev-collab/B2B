import { apiClient as api } from "./api";

export interface HubspotStatus {
  connected: boolean;
  hubspot_hub_id: string | null;
  hubspot_hub_domain: string | null;
  connected_at: string | null;
}

export interface HubspotPushItem {
  record_id: string;
  item_type: "person" | "company";
  data: Record<string, unknown>;
}

export interface HubspotPushItemResult {
  record_id: string;
  hubspot_id: string | null;
  error: string | null;
}

export interface HubspotPushResult {
  pushed: number;
  failed: number;
  results: HubspotPushItemResult[];
}

export async function getHubspotStatus(): Promise<HubspotStatus> {
  const { data } = await api.get<HubspotStatus>("/integrations/hubspot/status");
  return data;
}

export async function connectHubspot(apiKey: string): Promise<HubspotStatus> {
  const { data } = await api.post<HubspotStatus>("/integrations/hubspot/connect", {
    api_key: apiKey,
  });
  return data;
}

export async function disconnectHubspot(): Promise<void> {
  await api.delete("/integrations/hubspot/disconnect");
}

export async function pushToHubspot(items: HubspotPushItem[]): Promise<HubspotPushResult> {
  const { data } = await api.post<HubspotPushResult>("/integrations/hubspot/push", { items });
  return data;
}
