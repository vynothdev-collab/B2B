import { apiClient as api } from "./api";

export interface WebhookStatus {
  connected: boolean;
  webhook_url: string | null;
  connected_at: string | null;
  last_delivery_at: string | null;
  last_delivery_status: "success" | "failed" | null;
}

export interface WebhookConnectResult {
  connected: boolean;
  webhook_url: string;
  signing_secret: string;
  connected_at: string | null;
}

export interface WebhookPushItem {
  record_id: string;
  item_type: "person" | "company";
  data: Record<string, unknown>;
}

export interface WebhookPushItemResult {
  record_id: string;
  delivered: boolean;
  error: string | null;
}

export interface WebhookPushResult {
  pushed: number;
  failed: number;
  results: WebhookPushItemResult[];
}

export async function getWebhookStatus(): Promise<WebhookStatus> {
  const { data } = await api.get<WebhookStatus>("/integrations/webhook/status");
  return data;
}

export async function connectWebhook(webhookUrl: string): Promise<WebhookConnectResult> {
  const { data } = await api.post<WebhookConnectResult>("/integrations/webhook/connect", {
    webhook_url: webhookUrl,
  });
  return data;
}

export async function regenerateWebhookSecret(): Promise<{ signing_secret: string }> {
  const { data } = await api.post<{ signing_secret: string }>("/integrations/webhook/regenerate-secret");
  return data;
}

export async function disconnectWebhook(): Promise<void> {
  await api.delete("/integrations/webhook/disconnect");
}

export async function pushToWebhook(items: WebhookPushItem[]): Promise<WebhookPushResult> {
  const { data } = await api.post<WebhookPushResult>("/integrations/webhook/push", { items });
  return data;
}
