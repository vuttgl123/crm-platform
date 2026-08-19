import { apiFetch } from './apiClient';

export type ActivityType =
  | 'CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'TASK'
  | 'MESSAGE'
  | 'DEMO'
  | 'FOLLOW_UP'
  | 'OTHER';

export type ActivityPriority = 'LOW' | 'MEDIUM' | 'NORMAL' | 'HIGH' | 'URGENT';

export type ActivityStatus =
  | 'PENDING'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DEFERRED';

export type ActivityDirection = 'INBOUND' | 'OUTBOUND' | 'INTERNAL';

export interface ActivityOwner {
  ownerUserId?: string | null;
  assignedTeamId?: string | null;
}

export interface ActivityItem {
  id: string;
  subject: string;
  type: ActivityType;
  activityType?: ActivityType;
  priority: ActivityPriority;
  status: ActivityStatus;
  dueDate: string;
  dueTime?: string;
  accountId?: string;
  accountName?: string;
  contactName?: string;
  assignedTo: string;
  description?: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  createdAt: string;
  updatedAt?: string;
  version: number;
}

export interface ActivityResponse {
  id: string;
  activityType: ActivityType;
  subject: string;
  description?: string | null;
  direction?: ActivityDirection | null;
  status: ActivityStatus;
  priority: ActivityPriority;
  owner: ActivityOwner;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  completedAt?: string | null;
  durationSeconds?: number | null;
  outcomeCode?: string | null;
  externalReference?: string | null;
  recurrenceRule?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
}

export interface CreateActivityRequest {
  activityType?: ActivityType;
  type?: ActivityType;
  subject: string;
  description?: string | null;
  direction?: ActivityDirection | null;
  priority?: ActivityPriority;
  status?: ActivityStatus;
  owner?: ActivityOwner;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  dueDate?: string;
  dueTime?: string;
  durationSeconds?: number | null;
  outcomeCode?: string | null;
  externalReference?: string | null;
  recurrenceRule?: string | null;
  accountName?: string;
  contactName?: string;
  assignedTo?: string;
}

export interface UpdateActivityRequest {
  version: number;
  activityType?: ActivityType;
  type?: ActivityType;
  subject: string;
  description?: string | null;
  direction?: ActivityDirection | null;
  status?: ActivityStatus;
  priority?: ActivityPriority;
  owner?: ActivityOwner;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  dueDate?: string;
  dueTime?: string;
  durationSeconds?: number | null;
  outcomeCode?: string | null;
  externalReference?: string | null;
  recurrenceRule?: string | null;
  accountName?: string;
  contactName?: string;
  assignedTo?: string;
}

export interface ActivitySearchRequest {
  q?: string;
  search?: string;
  type?: string;
  activityType?: ActivityType;
  status?: string;
  priority?: string;
  ownerUserId?: string;
  assignedTeamId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const ACTIVITY_TYPE_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
  CALL: { label: 'Cuộc gọi điện', icon: 'Phone', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  MEETING: { label: 'Cuộc họp / Gặp gỡ', icon: 'Users', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  TASK: { label: 'Nhiệm vụ cần làm', icon: 'CheckSquare', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  EMAIL: { label: 'Gửi Email', icon: 'Mail', className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

function normalizeActivity(a: any): ActivityItem {
  const type: ActivityType = a.type || a.activityType || 'TASK';
  const priority: ActivityPriority = a.priority || 'MEDIUM';
  const status: ActivityStatus = a.status || 'PENDING';
  const scheduled = a.scheduledStartAt || a.dueDate || new Date().toISOString();
  const dueDate = scheduled.split('T')[0] || scheduled.split(' ')[0] || '2026-08-15';
  const dueTime = a.dueTime || (scheduled.includes('T') ? scheduled.split('T')[1]?.substring(0, 5) : '09:00');

  return {
    ...a,
    id: a.id || '',
    subject: a.subject || 'Công việc',
    type,
    activityType: type,
    priority,
    status,
    dueDate,
    dueTime,
    accountName: a.accountName || 'Doanh nghiệp',
    contactName: a.contactName || 'Người liên hệ',
    assignedTo: a.assignedTo || 'Phạm Tuấn Vũ',
    description: a.description || '',
    createdAt: a.createdAt || new Date().toISOString(),
    version: a.version || 1,
  };
}

export const activityApi = {
  async list(params: ActivitySearchRequest = {}): Promise<{ content: ActivityItem[]; totalElements: number; totalPages: number; page: number; size: number }> {
    const query = new URLSearchParams();
    const q = params.q || params.search;
    if (q) query.append('q', q);
    if (params.type && params.type !== 'ALL') query.append('activityType', params.type);
    if (params.activityType) query.append('activityType', params.activityType);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.priority && params.priority !== 'ALL') query.append('priority', params.priority);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/activities${queryString ? `?${queryString}` : ''}`;
    const res = await apiFetch<any>(endpoint, { method: 'GET' });

    const rawItems: any[] = Array.isArray(res) ? res : res.items || res.content || [];
    const content = rawItems.map(normalizeActivity);

    return {
      content,
      totalElements: res.totalElements ?? content.length,
      totalPages: res.totalPages ?? 1,
      page: res.page ?? res.pageNumber ?? 0,
      size: res.size ?? res.pageSize ?? 10,
    };
  },

  async getById(id: string): Promise<ActivityItem> {
    const res = await apiFetch<any>(`/activities/${id}`, { method: 'GET' });
    return normalizeActivity(res);
  },

  async create(request: CreateActivityRequest): Promise<ActivityItem> {
    const type = request.type || request.activityType || 'TASK';
    const payload = {
      activityType: type,
      subject: request.subject,
      description: request.description,
      priority: request.priority === 'MEDIUM' ? 'NORMAL' : (request.priority || 'NORMAL'),
      scheduledStartAt: request.dueDate ? `${request.dueDate}T${request.dueTime || '09:00'}:00Z` : new Date().toISOString(),
    };
    const res = await apiFetch<any>('/activities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeActivity({ ...res, ...request });
  },

  async update(id: string, request: UpdateActivityRequest): Promise<ActivityItem> {
    const type = request.type || request.activityType || 'TASK';
    const payload = {
      version: request.version || 1,
      activityType: type,
      subject: request.subject,
      description: request.description,
      status: request.status || 'PENDING',
      priority: request.priority === 'MEDIUM' ? 'NORMAL' : (request.priority || 'NORMAL'),
      scheduledStartAt: request.dueDate ? `${request.dueDate}T${request.dueTime || '09:00'}:00Z` : new Date().toISOString(),
    };
    const res = await apiFetch<any>(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeActivity({ ...res, ...request });
  },

  async complete(id: string, version: number = 1): Promise<ActivityItem> {
    const res = await apiFetch<any>(`/activities/${id}/complete`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
      body: JSON.stringify({ outcomeCode: 'SUCCESS' }),
    });
    return normalizeActivity(res);
  },

  async delete(id: string, version: number = 1): Promise<void> {
    return apiFetch<void>(`/activities/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
