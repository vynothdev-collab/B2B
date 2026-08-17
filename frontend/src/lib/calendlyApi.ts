import { apiClient as api } from "./api";

export interface CalendlyStatus {
  connected: boolean;
  scheduling_url: string | null;
  connected_at: string | null;
}

export async function getCalendlyStatus(): Promise<CalendlyStatus> {
  const { data } = await api.get<CalendlyStatus>("/integrations/calendly/status");
  return data;
}

export async function connectCalendly(apiKey: string): Promise<CalendlyStatus> {
  const { data } = await api.post<CalendlyStatus>("/integrations/calendly/connect", { api_key: apiKey });
  return data;
}

export async function disconnectCalendly(): Promise<void> {
  await api.delete("/integrations/calendly/disconnect");
}
