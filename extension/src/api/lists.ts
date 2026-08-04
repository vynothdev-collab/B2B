import client from './client';
import type { LeadsList, ListItem, PaginatedResponse } from '../types';

export const listsApi = {
  getLists: (): Promise<LeadsList[]> =>
    client.get('/lists').then((r) => r.data),

  createList: (name: string, description?: string): Promise<LeadsList> =>
    client.post('/lists', { name, description }).then((r) => r.data),

  updateList: (listId: string, name: string): Promise<LeadsList> =>
    client.patch(`/lists/${listId}`, { name }).then((r) => r.data),

  deleteList: (listId: string): Promise<void> =>
    client.delete(`/lists/${listId}`).then((r) => r.data),

  getListItems: (listId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<ListItem>> =>
    client.get(`/lists/${listId}/items`, { params: { page, page_size: pageSize } }).then((r) => r.data),

  addItems: (listId: string, items: { record_id: string; record_type: 'person' | 'company' }[]): Promise<void> =>
    client.post('/lists/add-items', { list_id: listId, items }).then((r) => r.data),

  removeItem: (listId: string, itemId: string): Promise<void> =>
    client.delete(`/lists/${listId}/items/${itemId}`).then((r) => r.data),
};
