import { api } from "@/lib/api";

export interface PlatformSettingsRecord {
  platform_name: string;
  support_email: string;
  default_plan: string;
  new_registrations: boolean;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  updated_at: string;
}

export interface UpdatePlatformSettingsPayload {
  platform_name?: string;
  support_email?: string;
  default_plan?: string;
  new_registrations?: boolean;
  maintenance_mode?: boolean;
  maintenance_message?: string | null;
}

export async function getPlatformSettings(signal?: AbortSignal): Promise<PlatformSettingsRecord> {
  const { data } = await api.get<PlatformSettingsRecord>("/admin/settings/", { signal });
  return data;
}

export async function updatePlatformSettings(
  payload: UpdatePlatformSettingsPayload,
): Promise<PlatformSettingsRecord> {
  const { data } = await api.patch<PlatformSettingsRecord>("/admin/settings/", payload);
  return data;
}
