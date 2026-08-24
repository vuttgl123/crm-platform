import { apiFetch } from './apiClient';

export type NoteVisibility = 'PRIVATE' | 'TEAM' | 'TENANT';

export interface NoteItem {
  id: string;
  targetType: string;
  targetId: string;
  content: string;
  visibility: NoteVisibility;
  createdBy?: string | null;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt: string;
  version: number;
}

export interface NoteSummaryItem {
  id: string;
  targetType: string;
  targetId: string;
  visibility: NoteVisibility;
  createdAt: string;
  createdBy?: string | null;
}

export interface NotePageResult {
  items: NoteItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const noteApi = {
  create: async (data: {
    targetType: string;
    targetId: string;
    content: string;
    visibility?: NoteVisibility;
  }): Promise<NoteItem> => {
    return apiFetch<NoteItem>('/crm/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get: async (id: string, options?: { signal?: AbortSignal }): Promise<NoteItem> => {
    return apiFetch<NoteItem>(`/crm/notes/${id}`, { signal: options?.signal });
  },

  search: async (
    params: { targetType: string; targetId: string; page?: number; size?: number },
    options?: { signal?: AbortSignal }
  ): Promise<{ items: NoteItem[]; total: number }> => {
    const query = new URLSearchParams();
    query.set('targetType', params.targetType);
    query.set('targetId', params.targetId);
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));

    const res = await apiFetch<NotePageResult | NoteItem[]>(
      `/crm/notes?${query.toString()}`,
      { signal: options?.signal }
    );
    if (Array.isArray(res)) {
      return { items: res, total: res.length };
    }
    return { items: res.items || [], total: res.totalElements || 0 };
  },

  update: async (
    id: string,
    data: { version: number; content: string; visibility?: NoteVisibility }
  ): Promise<NoteItem> => {
    return apiFetch<NoteItem>(`/crm/notes/${id}`, {
      method: 'PUT',
      headers: {
        'If-Match': `"${data.version}"`,
      },
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string, version: number): Promise<void> => {
    return apiFetch<void>(`/crm/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
