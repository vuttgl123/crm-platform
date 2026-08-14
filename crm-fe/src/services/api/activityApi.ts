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

export type ActivityPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type ActivityStatus =
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

export interface ActivitySummaryResponse {
  id: string;
  activityType: ActivityType;
  subject: string;
  direction?: ActivityDirection | null;
  status: ActivityStatus;
  priority: ActivityPriority;
  owner: ActivityOwner;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  completedAt?: string | null;
  updatedAt: string;
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
  activityType: ActivityType;
  subject: string;
  description?: string | null;
  direction?: ActivityDirection | null;
  priority?: ActivityPriority;
  owner?: ActivityOwner;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  durationSeconds?: number | null;
  outcomeCode?: string | null;
  externalReference?: string | null;
  recurrenceRule?: string | null;
}

export interface UpdateActivityRequest {
  version: number;
  activityType: ActivityType;
  subject: string;
  description?: string | null;
  direction?: ActivityDirection | null;
  status?: ActivityStatus;
  priority?: ActivityPriority;
  owner?: ActivityOwner;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  durationSeconds?: number | null;
  outcomeCode?: string | null;
  externalReference?: string | null;
  recurrenceRule?: string | null;
}

export interface CompleteActivityRequest {
  outcomeCode?: string;
}

export interface ActivitySearchRequest {
  q?: string;
  activityType?: ActivityType;
  status?: ActivityStatus;
  priority?: ActivityPriority;
  ownerUserId?: string;
  assignedTeamId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const activityApi = {
  async list(params: ActivitySearchRequest = {}): Promise<PageResult<ActivitySummaryResponse>> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.activityType) query.append('activityType', params.activityType);
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.ownerUserId) query.append('ownerUserId', params.ownerUserId);
    if (params.assignedTeamId) query.append('assignedTeamId', params.assignedTeamId);
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/activities${queryString ? `?${queryString}` : ''}`;
    return apiFetch<PageResult<ActivitySummaryResponse>>(endpoint, { method: 'GET' });
  },

  async getById(id: string): Promise<ActivityResponse> {
    return apiFetch<ActivityResponse>(`/activities/${id}`, { method: 'GET' });
  },

  async create(request: CreateActivityRequest): Promise<ActivityResponse> {
    return apiFetch<ActivityResponse>('/activities', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async update(id: string, request: UpdateActivityRequest): Promise<ActivityResponse> {
    return apiFetch<ActivityResponse>(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async complete(id: string, outcomeCode: string | undefined, version: number): Promise<ActivityResponse> {
    return apiFetch<ActivityResponse>(
      `/activities/${id}/complete`,
      {
        method: 'POST',
        headers: {
          'If-Match': `"${version}"`,
        },
        body: JSON.stringify({ outcomeCode }),
      }
    );
  },

  async delete(id: string, version: number): Promise<void> {
    return apiFetch<void>(`/activities/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
