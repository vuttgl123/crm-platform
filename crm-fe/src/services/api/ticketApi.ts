import { apiFetch } from './apiClient';

export type TicketPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TicketStatus = 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketChannel = 'PORTAL' | 'EMAIL' | 'PHONE' | 'CHAT';

export interface TicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  description?: string;
  accountId?: string | null;
  accountName?: string | null;
  contactId?: string | null;
  contactName?: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  channel?: TicketChannel;
  assignedTo?: string | null;
  category?: string | null;
  createdAt: string;
  createdBy?: string | null;
  resolvedAt?: string | null;
  updatedAt?: string;
  updatedBy?: string | null;
  version?: number;
}

export interface TicketPageResult {
  items: TicketItem[];
  content?: TicketItem[];
  pageNumber?: number;
  pageSize?: number;
  page?: number;
  size?: number;
  totalElements: number;
  totalPages: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface CreateTicketRequest {
  subject: string;
  description?: string;
  priority: TicketPriority;
  category?: string;
  accountId?: string;
  accountName?: string;
  contactId?: string;
  contactName?: string;
  assignedTo?: string;
  channel?: TicketChannel;
}

export interface UpdateTicketRequest {
  version?: number;
  subject?: string;
  description?: string;
  priority?: TicketPriority;
  category?: string;
  status?: TicketStatus;
  accountId?: string;
  accountName?: string;
  contactId?: string;
  contactName?: string;
  assignedTo?: string;
  channel?: TicketChannel;
}

export const TICKET_STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  NEW: { label: 'NEW', className: 'bg-purple-50 text-purple-700 border-purple-200 font-bold' },
  OPEN: { label: 'OPEN', className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold' },
  IN_PROGRESS: { label: 'IN PROGRESS', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' },
  RESOLVED: { label: 'RESOLVED', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  CLOSED: { label: 'CLOSED', className: 'bg-slate-100 text-slate-600 border-slate-300 font-semibold' },
};

function normalizeTicket(t: any): TicketItem {
  return {
    ...t,
    id: t.id || '',
    ticketNumber: t.ticketNumber || `TCK-${t.id?.slice(-4) || '000'}`,
    subject: t.subject || 'Phiếu hỗ trợ',
    description: t.description || '',
    accountId: t.accountId || 'acc-001',
    accountName: t.accountName || 'Doanh nghiệp',
    contactName: t.contactName || 'Người gửi',
    priority: t.priority || 'MEDIUM',
    status: t.status || 'NEW',
    channel: t.channel || 'PORTAL',
    category: t.category || 'Yêu cầu Dịch vụ',
    assignedTo: t.assignedTo || 'Phạm Tuấn Vũ',
    createdAt: t.createdAt || new Date().toISOString(),
    version: t.version || 1,
  };
}

export const ticketApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: TicketItem[]; items: TicketItem[]; totalElements: number; totalPages: number; page: number; size: number }> => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.priority && params.priority !== 'ALL') query.set('priority', params.priority);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size !== undefined) query.set('size', String(params.size));
    if (params?.search) query.set('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<any>(`/service/tickets${qs}`);

    const rawItems: any[] = Array.isArray(res) ? res : res.items || res.content || [];
    const content = rawItems.map(normalizeTicket);

    return {
      content,
      items: content,
      totalElements: res.totalElements ?? content.length,
      totalPages: res.totalPages ?? 1,
      page: res.page ?? res.pageNumber ?? 0,
      size: res.size ?? res.pageSize ?? 10,
    };
  },

  get: async (id: string): Promise<TicketItem> => {
    const res = await apiFetch<any>(`/service/tickets/${id}`);
    return normalizeTicket(res);
  },

  create: async (payload: CreateTicketRequest): Promise<TicketItem> => {
    const res = await apiFetch<any>('/service/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeTicket({ ...res, ...payload });
  },

  update: async (id: string, payload: UpdateTicketRequest): Promise<TicketItem> => {
    const res = await apiFetch<any>(`/service/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ version: payload.version || 1, ...payload }),
    });
    return normalizeTicket({ ...res, ...payload });
  },

  updateStatus: async (id: string, version: number, status: TicketStatus): Promise<TicketItem> => {
    const res = await apiFetch<any>(`/service/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ version, status }),
    });
    return normalizeTicket(res);
  },

  delete: async (id: string, version: number = 1): Promise<void> => {
    return apiFetch<void>(`/service/tickets/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
