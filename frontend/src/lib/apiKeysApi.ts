import { apiClient as api } from "./api";

export interface ApiKeyOut {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export interface ApiKeyCreateResponse extends ApiKeyOut {
  key: string;
}

export async function listApiKeys(signal?: AbortSignal): Promise<ApiKeyOut[]> {
  const { data } = await api.get<ApiKeyOut[]>("/api-keys", { signal });
  return data;
}

export async function createApiKey(name: string): Promise<ApiKeyCreateResponse> {
  const { data } = await api.post<ApiKeyCreateResponse>("/api-keys", { name });
  return data;
}

export async function revokeApiKey(keyId: string): Promise<void> {
  await api.delete(`/api-keys/${keyId}`);
}
