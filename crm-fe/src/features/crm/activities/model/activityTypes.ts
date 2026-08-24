import {
  ActivityType,
  ActivityStatus,
  ActivityPriority,
  ActivityDirection,
  ActivityOwnerKind,
  ActivityOwnerRef,
  ActivityRelatedType,
  ActivityLink,
  ActivityParticipantType,
  ActivityParticipantRole,
  ActivityParticipationStatus,
  ActivityParticipant,
  ActivityAvailableAction,
  ActivitySummary,
  ActivityDetail,
  ActivityQueueType,
  ActivityQueueSummary,
  ActivityTransitionAction,
  ActivityTransitionRequest,
  ActivityScheduleRequest,
  ActivityStatusHistoryEntry,
  ActivitySearchParams,
  CreateActivityRequest,
  UpdateActivityRequest,
  CreateActivityLinkRequest,
  CreateActivityParticipantRequest,
  UpdateActivityParticipantRequest,
} from '@/services/api/activityApi';
import type { NoteItem, NoteVisibility } from '@/services/api/noteApi';

export type ActivityViewMode = 'agenda' | 'list';

export type ActivityQueuePreset =
  | 'my-work'
  | 'overdue'
  | 'today'
  | 'upcoming'
  | 'completed'
  | 'all';

export type {
  ActivityType,
  ActivityStatus,
  ActivityPriority,
  ActivityDirection,
  ActivityOwnerKind,
  ActivityOwnerRef,
  ActivityRelatedType,
  ActivityLink,
  ActivityParticipantType,
  ActivityParticipantRole,
  ActivityParticipationStatus,
  ActivityParticipant,
  ActivityAvailableAction,
  ActivitySummary,
  ActivityDetail,
  ActivityQueueType,
  ActivityQueueSummary,
  ActivityTransitionAction,
  ActivityTransitionRequest,
  ActivityScheduleRequest,
  ActivityStatusHistoryEntry,
  ActivitySearchParams,
  CreateActivityRequest,
  UpdateActivityRequest,
  CreateActivityLinkRequest,
  CreateActivityParticipantRequest,
  UpdateActivityParticipantRequest,
  NoteItem,
  NoteVisibility,
};

export interface ActivityFormParticipantValue {
  id?: string;
  participantType: ActivityParticipantType;
  principalId?: string | null;
  displayName: string;
  email?: string | null;
  role: ActivityParticipantRole;
}

export interface ActivityFormLinkValue {
  id?: string;
  targetType: ActivityRelatedType;
  targetId: string;
  displayName?: string;
  displayCode?: string | null;
}

export interface ActivityFormValues {
  activityType: ActivityType;
  subject: string;
  description?: string | null;
  direction?: ActivityDirection | null;
  priority: ActivityPriority;
  ownerKind: ActivityOwnerKind;
  ownerId: string;
  scheduledStartDate?: string | null;
  scheduledStartTime?: string | null;
  scheduledEndDate?: string | null;
  scheduledEndTime?: string | null;
  links: ActivityFormLinkValue[];
  participants: ActivityFormParticipantValue[];
}

export type ActivityEditorMode = 'create' | 'edit';
