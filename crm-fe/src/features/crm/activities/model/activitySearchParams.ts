import {
  ActivityViewMode,
  ActivityQueuePreset,
  ActivityType,
  ActivityStatus,
  ActivityPriority,
  ActivityRelatedType,
} from './activityTypes';

export interface ActivityUrlState {
  view: ActivityViewMode;
  queue: ActivityQueuePreset;
  q: string;
  activityType: ActivityType | '';
  status: ActivityStatus | '';
  priority: ActivityPriority | '';
  ownerUserId: string;
  assignedTeamId: string;
  relatedType: ActivityRelatedType | '';
  relatedId: string;
  from: string;
  to: string;
  page: number;
  size: number;
  sort: string;
}

export const DEFAULT_ACTIVITY_URL_STATE: ActivityUrlState = {
  view: 'agenda',
  queue: 'my-work',
  q: '',
  activityType: '',
  status: '',
  priority: '',
  ownerUserId: '',
  assignedTeamId: '',
  relatedType: '',
  relatedId: '',
  from: '',
  to: '',
  page: 0,
  size: 20,
  sort: 'scheduledStartAt:asc',
};

const VALID_VIEWS: ActivityViewMode[] = ['agenda', 'list'];
const VALID_QUEUES: ActivityQueuePreset[] = [
  'my-work',
  'overdue',
  'today',
  'upcoming',
  'completed',
  'all',
];
const VALID_TYPES: ActivityType[] = [
  'CALL',
  'EMAIL',
  'MEETING',
  'TASK',
  'MESSAGE',
  'DEMO',
  'FOLLOW_UP',
  'OTHER',
];
const VALID_STATUSES: ActivityStatus[] = [
  'PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'DEFERRED',
];
const VALID_PRIORITIES: ActivityPriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const VALID_RELATED_TYPES: ActivityRelatedType[] = ['ACCOUNT', 'CONTACT', 'LEAD', 'OPPORTUNITY'];

export function parseActivityUrlParams(searchParams: URLSearchParams): ActivityUrlState {
  const rawView = searchParams.get('view') as ActivityViewMode;
  const view = VALID_VIEWS.includes(rawView) ? rawView : 'agenda';

  const rawQueue = searchParams.get('queue') as ActivityQueuePreset;
  const queue = VALID_QUEUES.includes(rawQueue) ? rawQueue : 'my-work';

  const q = searchParams.get('q')?.trim() || '';

  const rawType = searchParams.get('activityType') as ActivityType;
  const activityType = VALID_TYPES.includes(rawType) ? rawType : '';

  const rawStatus = searchParams.get('status') as ActivityStatus;
  const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : '';

  const rawPriority = searchParams.get('priority') as ActivityPriority;
  const priority = VALID_PRIORITIES.includes(rawPriority) ? rawPriority : '';

  const ownerUserId = searchParams.get('ownerUserId')?.trim() || '';
  const assignedTeamId = searchParams.get('assignedTeamId')?.trim() || '';

  const rawRelatedType = searchParams.get('relatedType') as ActivityRelatedType;
  const relatedType = VALID_RELATED_TYPES.includes(rawRelatedType) ? rawRelatedType : '';
  const relatedId = searchParams.get('relatedId')?.trim() || '';

  const from = searchParams.get('from')?.trim() || '';
  const to = searchParams.get('to')?.trim() || '';

  const rawPage = parseInt(searchParams.get('page') || '0', 10);
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;

  const rawSize = parseInt(searchParams.get('size') || '20', 10);
  const size = [10, 20, 50, 100].includes(rawSize) ? rawSize : 20;

  const defaultSort = view === 'agenda' ? 'scheduledStartAt:asc' : 'updatedAt:desc';
  const sort = searchParams.get('sort')?.trim() || defaultSort;

  return {
    view,
    queue,
    q,
    activityType,
    status,
    priority,
    ownerUserId,
    assignedTeamId,
    relatedType: relatedType && relatedId ? relatedType : '',
    relatedId: relatedType && relatedId ? relatedId : '',
    from,
    to,
    page,
    size,
    sort,
  };
}

export function serializeActivityUrlParams(state: ActivityUrlState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.view && state.view !== 'agenda') params.set('view', state.view);
  if (state.queue && state.queue !== 'my-work') params.set('queue', state.queue);
  if (state.q.trim()) params.set('q', state.q.trim());
  if (state.activityType) params.set('activityType', state.activityType);
  if (state.status) params.set('status', state.status);
  if (state.priority) params.set('priority', state.priority);
  if (state.ownerUserId) params.set('ownerUserId', state.ownerUserId);
  if (state.assignedTeamId) params.set('assignedTeamId', state.assignedTeamId);
  if (state.relatedType && state.relatedId) {
    params.set('relatedType', state.relatedType);
    params.set('relatedId', state.relatedId);
  }
  if (state.from) params.set('from', state.from);
  if (state.to) params.set('to', state.to);
  if (state.page > 0) params.set('page', state.page.toString());
  if (state.size !== 20) params.set('size', state.size.toString());

  const defaultSort = state.view === 'agenda' ? 'scheduledStartAt:asc' : 'updatedAt:desc';
  if (state.sort && state.sort !== defaultSort) {
    params.set('sort', state.sort);
  }

  return params;
}
