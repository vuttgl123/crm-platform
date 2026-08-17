import { apiFetch } from './apiClient';

export interface TagItem {
  id: string;
  name: string;
  colorHex?: string;
  description?: string;
  active: boolean;
  version: number;
}

export interface EntityTagItem {
  id: string;
  tagId: string;
  tagName: string;
  colorHex?: string;
  targetType: string;
  targetId: string;
  assignedAt: string;
  assignedBy?: string;
}

export const tagApi = {
  create: async (data: { name: string; colorHex?: string; description?: string }): Promise<TagItem> => {
    return apiFetch<TagItem>('/crm/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get: async (id: string): Promise<TagItem> => {
    return apiFetch<TagItem>(`/crm/tags/${id}`);
  },

  list: async (): Promise<TagItem[]> => {
    return apiFetch<TagItem[]>('/crm/tags');
  },

  update: async (id: string, data: { version: number; name: string; colorHex?: string; description?: string; active: boolean }): Promise<TagItem> => {
    return apiFetch<TagItem>(`/crm/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  assign: async (data: { tagId: string; targetType: string; targetId: string }): Promise<EntityTagItem> => {
    return apiFetch<EntityTagItem>('/crm/tags/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  unassign: async (tagId: string, targetType: string, targetId: string): Promise<void> => {
    const query = new URLSearchParams({ tagId, targetType, targetId });
    return apiFetch<void>(`/crm/tags/assignments?${query.toString()}`, {
      method: 'DELETE',
    });
  },

  listByEntity: async (targetType: string, targetId: string): Promise<EntityTagItem[]> => {
    const query = new URLSearchParams({ targetType, targetId });
    return apiFetch<EntityTagItem[]>(`/crm/tags/by-entity?${query.toString()}`);
  },
};
