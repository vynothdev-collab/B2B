import client from './client';
import type { LeadsList, ListItemsPage } from '../types';

export const listsApi = {
  getLists: (search?: string): Promise<LeadsList[]> =>
    client.get('/lists', { params: search ? { search } : undefined }).then((r) => r.data),

  createList: (name: string, list_type = 'people'): Promise<LeadsList> =>
    client.post('/lists', { name, list_type }).then((r) => r.data),

  updateList: (listId: string, name: string): Promise<LeadsList> =>
    client.patch(`/lists/${listId}`, { name }).then((r) => r.data),

  deleteList: (listId: string): Promise<void> =>
    client.delete(`/lists/${listId}`).then((r) => r.data),

  getListItems: (listId: string, page = 1, pageSize = 25, search?: string): Promise<ListItemsPage> =>
    client.get(`/lists/${listId}/items`, {
      params: { page, page_size: pageSize, ...(search ? { search } : {}) },
    }).then((r) => r.data),

  // item_type is the correct field name; data can be empty — backend hydrates from search records
  addItems: (
    listId: string,
    items: { record_id: string; item_type: 'person' | 'company' }[]
  ): Promise<{ added: number; list_id: string; list_name: string }> =>
    client
      .post('/lists/add-items', {
        list_id: listId,
        items: items.map((i) => ({ ...i, data: {} })),
      })
      .then((r) => r.data),

  // Same as addItems, but also supports creating a new list inline via list_name.
  addToList: (payload: {
    list_id?: string;
    list_name?: string;
    list_type?: 'people' | 'companies';
    items: { record_id: string; item_type: 'person' | 'company' }[];
  }): Promise<{ added: number; list_id: string; list_name: string }> =>
    client
      .post('/lists/add-items', {
        ...payload,
        items: payload.items.map((i) => ({ ...i, data: {} })),
      })
      .then((r) => r.data),

  removeItem: (listId: string, itemId: string): Promise<void> =>
    client.delete(`/lists/${listId}/items/${itemId}`).then((r) => r.data),
};
