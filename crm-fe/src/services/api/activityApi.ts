import { apiFetch } from './apiClient';
import type { PageResult } from './accountApi';
import type { NoteItem, NoteVisibility } from './noteApi';

export type ActivityType =
  | 'CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'TASK'
  | 'MESSAGE'
  | 'DEMO'
  | 'FOLLOW_UP'
  | 'OTHER';

export type ActivityStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DEFERRED';

export type ActivityPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type ActivityDirection = 'INBOUND' | 'OUTBOUND' | 'INTERNAL';

export type ActivityOwnerKind = 'USER' | 'TEAM';

export interface ActivityOwnerRef {
  kind: ActivityOwnerKind;
  id: string;
  displayName?: string;
  secondaryLabel?: string | null;
}

export type ActivityRelatedType = 'ACCOUNT' | 'CONTACT' | 'LEAD' | 'OPPORTUNITY';

export interface ActivityLink {
  id: string;
  targetType: ActivityRelatedType;
  targetId?: string;
  displayName: string;
  displayCode?: string | null;
  relationRole: 'REGARDING';
  accessible: boolean;
  href?: string | null;
  createdAt: string;
}

export type ActivityParticipantType = 'USER' | 'CONTACT' | 'EXTERNAL_EMAIL';

export type ActivityParticipantRole =
  | 'ORGANIZER'
  | 'ATTENDEE'
  | 'REQUIRED'
  | 'OPTIONAL'
  | 'CC'
  | 'BCC';

export type ActivityParticipationStatus =
  | 'NEEDS_ACTION'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'TENTATIVE';

export interface ActivityParticipant {
  id: string;
  participantType: ActivityParticipantType;
  principalId?: string | null;
  displayName: string;
  email?: string | null;
  role: ActivityParticipantRole;
  participationStatus?: ActivityParticipationStatus | null;
  accessible: boolean;
  createdAt: string;
  version?: number;
}

export type ActivityAvailableAction =
  | 'EDIT'
  | 'START'
  | 'COMPLETE'
  | 'DEFER'
  | 'RESUME'
  | 'CANCEL'
  | 'REOPEN'
  | 'RESCHEDULE'
  | 'MANAGE_LINKS'
  | 'MANAGE_PARTICIPANTS'
  | 'ADD_NOTE'
  | 'DELETE';

export interface ActivitySummary {
  id: string;
  activityType: ActivityType;
  subject: string;
  direction?: ActivityDirection | null;
  status: ActivityStatus;
  priority: ActivityPriority;
  owner: ActivityOwnerRef;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  completedAt?: string | null;
  relatedRecords: ActivityLink[];
  relatedRecordCount: number;
  participantCount: number;
  availableActions: ActivityAvailableAction[];
  updatedAt: string;
  version: number;
}

export interface ActivityDetail extends ActivitySummary {
  description?: string | null;
  durationSeconds?: number | null;
  outcomeCode?: string | null;
  externalReference?: string | null;
  recurrenceRule?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export type ActivityQueueType =
  | 'MY_WORK'
  | 'OVERDUE'
  | 'TODAY'
  | 'UPCOMING'
  | 'COMPLETED'
  | 'ALL';

export interface ActivityQueueSummary {
  myWork: number;
  overdue: number;
  today: number;
  upcoming: number;
  completed: number;
  all: number;
  timeZone: string;
  asOf: string;
}

export type ActivityTransitionAction =
  | 'START'
  | 'COMPLETE'
  | 'DEFER'
  | 'RESUME'
  | 'CANCEL'
  | 'REOPEN';

export interface ActivityTransitionRequest {
  version: number;
  action: ActivityTransitionAction;
  outcomeCode?: string | null;
  outcomeNotes?: string | null;
  completedAt?: string | null;
  reason?: string | null;
}

export interface ActivityScheduleRequest {
  version: number;
  scheduledStartAt: string | null;
  scheduledEndAt?: string | null;
}

export interface ActivityStatusHistoryEntry {
  id: string;
  activityId: string;
  fromStatus?: ActivityStatus | null;
  toStatus: ActivityStatus;
  reason?: string | null;
  changedBy?: string | null;
  changedAt: string;
}

export interface ActivitySearchParams {
  q?: string;
  queue?: string;
  activityType?: ActivityType;
  status?: ActivityStatus;
  priority?: ActivityPriority;
  ownerUserId?: string;
  assignedTeamId?: string;
  relatedType?: ActivityRelatedType;
  relatedId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateActivityRequest {
  activityType: ActivityType;
  subject: string;
  description?: string | null;
  direction?: ActivityDirection | null;
  priority: ActivityPriority;
  owner?: {
    kind: ActivityOwnerKind;
    id: string;
  } | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  links?: {
    targetType: ActivityRelatedType;
    targetId: string;
  }[];
  participants?: {
    participantType: ActivityParticipantType;
    principalId?: string | null;
    displayName?: string;
    email?: string | null;
    role: ActivityParticipantRole;
  }[];
}

export interface UpdateActivityRequest {
  version: number;
  activityType: ActivityType;
  subject: string;
  description?: string | null;
  direction?: ActivityDirection | null;
  priority: ActivityPriority;
  owner: {
    kind: ActivityOwnerKind;
    id: string;
  };
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
}

export interface CreateActivityLinkRequest {
  targetType: ActivityRelatedType;
  targetId: string;
}

export interface CreateActivityParticipantRequest {
  participantType: ActivityParticipantType;
  principalId?: string | null;
  displayName?: string;
  email?: string | null;
  role: ActivityParticipantRole;
}

export interface UpdateActivityParticipantRequest {
  version: number;
  role: ActivityParticipantRole;
}

export interface ActivityStatsDto {
  totalActivities: number;
  dueTodayCount: number;
  overdueCount: number;
  completedCount: number;
  callsCount: number;
  meetingsCount: number;
  tasksCount: number;
}

export interface RescheduleActivityRequest {
  startsAt?: string;
  dueAt?: string;
  version: number;
}

export interface CancelActivityRequest {
  cancelReason?: string;
  version: number;
}

export interface BulkCompleteActivitiesRequest {
  activityIds: string[];
  outcomeCode?: string;
}

export const activityApi = {
  getStats: async (): Promise<ActivityStatsDto> => {
    return apiFetch<ActivityStatsDto>('/activities/stats', {
      method: 'GET',
    });
  },

  reschedule: async (id: string, data: RescheduleActivityRequest): Promise<ActivityDetails> => {
    return apiFetch<ActivityDetails>(`/activities/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cancel: async (id: string, data: CancelActivityRequest): Promise<ActivityDetails> => {
    return apiFetch<ActivityDetails>(`/activities/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  bulkComplete: async (data: BulkCompleteActivitiesRequest): Promise<{ completedCount: number }> => {
    return apiFetch<{ completedCount: number }>('/activities/bulk/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  search: async (params: ActivitySearchParams = {}): Promise<PageResult<ActivitySummary>> => {
    const searchParams = new URLSearchParams();
    if (params.q?.trim()) searchParams.set('q', params.q.trim());
    if (params.queue) searchParams.set('queue', params.queue);
    if (params.activityType) searchParams.set('activityType', params.activityType);
    if (params.status) searchParams.set('status', params.status);
    if (params.priority) searchParams.set('priority', params.priority);
    if (params.ownerUserId) searchParams.set('ownerUserId', params.ownerUserId);
    if (params.assignedTeamId) searchParams.set('assignedTeamId', params.assignedTeamId);
    if (params.relatedType && params.relatedId) {
      searchParams.set('relatedType', params.relatedType);
      searchParams.set('relatedId', params.relatedId);
    }
    if (params.from) searchParams.set('from', params.from);
    if (params.to) searchParams.set('to', params.to);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());

    const queryStr = searchParams.toString();
    const endpoint = queryStr ? `/activities?${queryStr}` : '/activities';
    return apiFetch<PageResult<ActivitySummary>>(endpoint);
  },

  getWorkQueueSummary: async (
    filters: Omit<ActivitySearchParams, 'queue' | 'page' | 'size' | 'sort'> = {}
  ): Promise<ActivityQueueSummary> => {
    const searchParams = new URLSearchParams();
    if (filters.q?.trim()) searchParams.set('q', filters.q.trim());
    if (filters.activityType) searchParams.set('activityType', filters.activityType);
    if (filters.priority) searchParams.set('priority', filters.priority);
    if (filters.ownerUserId) searchParams.set('ownerUserId', filters.ownerUserId);
    if (filters.assignedTeamId) searchParams.set('assignedTeamId', filters.assignedTeamId);
    if (filters.relatedType && filters.relatedId) {
      searchParams.set('relatedType', filters.relatedType);
      searchParams.set('relatedId', filters.relatedId);
    }
    if (filters.from) searchParams.set('from', filters.from);
    if (filters.to) searchParams.set('to', filters.to);

    const queryStr = searchParams.toString();
    const endpoint = queryStr ? `/activities/work-queue-summary?${queryStr}` : '/activities/work-queue-summary';
    return apiFetch<ActivityQueueSummary>(endpoint);
  },

  get: async (id: string): Promise<ActivityDetail> => {
    return apiFetch<ActivityDetail>(`/activities/${id}`);
  },

  create: async (payload: CreateActivityRequest): Promise<ActivityDetail> => {
    return apiFetch<ActivityDetail>('/activities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: UpdateActivityRequest): Promise<ActivityDetail> => {
    return apiFetch<ActivityDetail>(`/activities/${id}`, {
      method: 'PUT',
      headers: {
        'If-Match': `"${payload.version}"`,
      },
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string, version: number): Promise<void> => {
    return apiFetch<void>(`/activities/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  transition: async (id: string, payload: ActivityTransitionRequest): Promise<ActivityDetail> => {
    return apiFetch<ActivityDetail>(`/activities/${id}/transitions`, {
      method: 'POST',
      headers: {
        'If-Match': `"${payload.version}"`,
      },
      body: JSON.stringify(payload),
    });
  },

  reschedule: async (id: string, payload: ActivityScheduleRequest): Promise<ActivityDetail> => {
    return apiFetch<ActivityDetail>(`/activities/${id}/schedule`, {
      method: 'PUT',
      headers: {
        'If-Match': `"${payload.version}"`,
      },
      body: JSON.stringify(payload),
    });
  },

  listLinks: async (id: string, params: { page?: number; size?: number } = {}): Promise<PageResult<ActivityLink>> => {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());
    const queryStr = searchParams.toString();
    return apiFetch<PageResult<ActivityLink>>(`/activities/${id}/links${queryStr ? `?${queryStr}` : ''}`);
  },

  addLink: async (id: string, payload: CreateActivityLinkRequest): Promise<ActivityLink> => {
    return apiFetch<ActivityLink>(`/activities/${id}/links`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  removeLink: async (id: string, linkId: string, version: number): Promise<void> => {
    return apiFetch<void>(`/activities/${id}/links/${linkId}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  listParticipants: async (
    id: string,
    params: { page?: number; size?: number } = {}
  ): Promise<PageResult<ActivityParticipant>> => {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());
    const queryStr = searchParams.toString();
    return apiFetch<PageResult<ActivityParticipant>>(`/activities/${id}/participants${queryStr ? `?${queryStr}` : ''}`);
  },

  addParticipant: async (
    id: string,
    payload: CreateActivityParticipantRequest
  ): Promise<ActivityParticipant> => {
    return apiFetch<ActivityParticipant>(`/activities/${id}/participants`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateParticipant: async (
    id: string,
    participantId: string,
    payload: UpdateActivityParticipantRequest
  ): Promise<ActivityParticipant> => {
    return apiFetch<ActivityParticipant>(`/activities/${id}/participants/${participantId}`, {
      method: 'PUT',
      headers: {
        'If-Match': `"${payload.version}"`,
      },
      body: JSON.stringify(payload),
    });
  },

  removeParticipant: async (id: string, participantId: string, version: number): Promise<void> => {
    return apiFetch<void>(`/activities/${id}/participants/${participantId}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  listNotes: async (
    id: string,
    params: { page?: number; size?: number } = {}
  ): Promise<PageResult<NoteItem>> => {
    const searchParams = new URLSearchParams();
    searchParams.set('targetType', 'ACTIVITY');
    searchParams.set('targetId', id);
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());
    return apiFetch<PageResult<NoteItem>>(`/notes?${searchParams.toString()}`);
  },

  createNote: async (
    id: string,
    payload: { content: string; visibility: NoteVisibility }
  ): Promise<NoteItem> => {
    return apiFetch<NoteItem>('/notes', {
      method: 'POST',
      body: JSON.stringify({
        targetType: 'ACTIVITY',
        targetId: id,
        content: payload.content,
        visibility: payload.visibility,
      }),
    });
  },

  updateNote: async (
    id: string,
    noteId: string,
    payload: { content: string; visibility: NoteVisibility; version: number }
  ): Promise<NoteItem> => {
    return apiFetch<NoteItem>(`/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'If-Match': `"${payload.version}"`,
      },
      body: JSON.stringify({
        targetType: 'ACTIVITY',
        targetId: id,
        content: payload.content,
        visibility: payload.visibility,
        version: payload.version,
      }),
    });
  },

  deleteNote: async (_id: string, noteId: string, version: number): Promise<void> => {
    return apiFetch<void>(`/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  listStatusHistory: async (
    id: string,
    params: { page?: number; size?: number } = {}
  ): Promise<PageResult<ActivityStatusHistoryEntry>> => {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());
    const queryStr = searchParams.toString();
    return apiFetch<PageResult<ActivityStatusHistoryEntry>>(
      `/activities/${id}/status-history${queryStr ? `?${queryStr}` : ''}`
    );
  },
};
