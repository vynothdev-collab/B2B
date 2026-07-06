import { apiClient } from "@/lib/api";

export interface ListRecord {
  id: string;
  name: string;
  list_type: string;
  is_default: boolean;
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListItemRecord {
  id: string;
  record_id: string;
  item_type: "person" | "company";
  data: Record<string, unknown>;
  added_at: string;
}

export interface ListItemPayload {
  record_id: string;
  item_type: "person" | "company";
  data: Record<string, unknown>;
}

export interface AddToListPayload {
  list_id?: string;
  list_name?: string;
  list_type?: string;
  items: ListItemPayload[];
}

export async function getLists(): Promise<ListRecord[]> {
  const { data } = await apiClient.get<ListRecord[]>("/lists");
  return data;
}

export async function createList(name: string, list_type: string): Promise<ListRecord> {
  const { data } = await apiClient.post<ListRecord>("/lists", { name, list_type });
  return data;
}

export async function addToList(payload: AddToListPayload): Promise<{ added: number; list_id: string; list_name: string }> {
  const { data } = await apiClient.post("/lists/add-items", payload);
  return data;
}

export async function renameList(id: string, name: string): Promise<ListRecord> {
  const { data } = await apiClient.patch<ListRecord>(`/lists/${id}`, { name });
  return data;
}

export async function getListItems(id: string): Promise<ListItemRecord[]> {
  const { data } = await apiClient.get<ListItemRecord[]>(`/lists/${id}/items`);
  return data;
}

export async function deleteList(id: string): Promise<void> {
  await apiClient.delete(`/lists/${id}`);
}

export async function removeListItem(listId: string, itemId: string): Promise<void> {
  await apiClient.delete(`/lists/${listId}/items/${itemId}`);
}
