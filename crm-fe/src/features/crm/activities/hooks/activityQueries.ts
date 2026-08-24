import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  activityApi,
  ActivitySearchParams,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityTransitionRequest,
  ActivityScheduleRequest,
  CreateActivityLinkRequest,
  CreateActivityParticipantRequest,
  UpdateActivityParticipantRequest,
} from '@/services/api/activityApi';
import type { NoteVisibility } from '@/services/api/noteApi';

export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (params: ActivitySearchParams) => [...activityKeys.lists(), params] as const,
  summaries: () => [...activityKeys.all, 'queue-summary'] as const,
  summary: (filters: any) => [...activityKeys.summaries(), filters] as const,
  details: () => [...activityKeys.all, 'detail'] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
  links: (id: string) => [...activityKeys.detail(id), 'links'] as const,
  participants: (id: string) => [...activityKeys.detail(id), 'participants'] as const,
  notes: (id: string) => [...activityKeys.detail(id), 'notes'] as const,
  statusHistory: (id: string) => [...activityKeys.detail(id), 'status-history'] as const,
};

export function useActivitiesQuery(params: ActivitySearchParams, enabled = true) {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => activityApi.search(params),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 15000,
  });
}

export function useActivityQueueSummaryQuery(
  filters: Omit<ActivitySearchParams, 'queue' | 'page' | 'size' | 'sort'>,
  enabled = true
) {
  return useQuery({
    queryKey: activityKeys.summary(filters),
    queryFn: () => activityApi.getWorkQueueSummary(filters),
    enabled,
    staleTime: 30000,
  });
}

export function useActivityDetailQuery(id?: string) {
  return useQuery({
    queryKey: activityKeys.detail(id || ''),
    queryFn: () => activityApi.get(id!),
    enabled: Boolean(id),
    staleTime: 30000,
  });
}

export function useActivityLinksQuery(id?: string) {
  return useQuery({
    queryKey: activityKeys.links(id || ''),
    queryFn: () => activityApi.listLinks(id!, { size: 100 }),
    enabled: Boolean(id),
    staleTime: 30000,
  });
}

export function useActivityParticipantsQuery(id?: string) {
  return useQuery({
    queryKey: activityKeys.participants(id || ''),
    queryFn: () => activityApi.listParticipants(id!, { size: 100 }),
    enabled: Boolean(id),
    staleTime: 30000,
  });
}

export function useActivityNotesQuery(id?: string, page = 0, size = 50) {
  return useQuery({
    queryKey: [...activityKeys.notes(id || ''), page, size],
    queryFn: () => activityApi.listNotes(id!, { page, size }),
    enabled: Boolean(id),
    staleTime: 30000,
  });
}

export function useActivityStatusHistoryQuery(id?: string, page = 0, size = 50) {
  return useQuery({
    queryKey: [...activityKeys.statusHistory(id || ''), page, size],
    queryFn: () => activityApi.listStatusHistory(id!, { page, size }),
    enabled: Boolean(id),
    staleTime: 30000,
  });
}

export function useActivityMutations() {
  const queryClient = useQueryClient();

  const invalidateActivities = () => {
    queryClient.invalidateQueries({ queryKey: activityKeys.all });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateActivityRequest) => activityApi.create(payload),
    onSuccess: () => {
      invalidateActivities();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateActivityRequest }) =>
      activityApi.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.summaries() });
    },
  });

  const transitionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ActivityTransitionRequest }) =>
      activityApi.transition(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.statusHistory(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.summaries() });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ActivityScheduleRequest }) =>
      activityApi.reschedule(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.summaries() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      activityApi.delete(id, version),
    onSuccess: () => {
      invalidateActivities();
    },
  });

  const addLinkMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateActivityLinkRequest }) =>
      activityApi.addLink(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.links(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });

  const removeLinkMutation = useMutation({
    mutationFn: ({
      id,
      linkId,
      version,
    }: {
      id: string;
      linkId: string;
      version: number;
    }) => activityApi.removeLink(id, linkId, version),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.links(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateActivityParticipantRequest;
    }) => activityApi.addParticipant(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.participants(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });

  const updateParticipantMutation = useMutation({
    mutationFn: ({
      id,
      participantId,
      payload,
    }: {
      id: string;
      participantId: string;
      payload: UpdateActivityParticipantRequest;
    }) => activityApi.updateParticipant(id, participantId, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.participants(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: ({
      id,
      participantId,
      version,
    }: {
      id: string;
      participantId: string;
      version: number;
    }) => activityApi.removeParticipant(id, participantId, version),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.participants(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { content: string; visibility: NoteVisibility };
    }) => activityApi.createNote(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.notes(id) });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({
      id,
      noteId,
      payload,
    }: {
      id: string;
      noteId: string;
      payload: { content: string; visibility: NoteVisibility; version: number };
    }) => activityApi.updateNote(id, noteId, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.notes(id) });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: ({
      id,
      noteId,
      version,
    }: {
      id: string;
      noteId: string;
      version: number;
    }) => activityApi.deleteNote(id, noteId, version),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.notes(id) });
    },
  });

  return {
    createMutation,
    updateMutation,
    transitionMutation,
    rescheduleMutation,
    deleteMutation,
    addLinkMutation,
    removeLinkMutation,
    addParticipantMutation,
    updateParticipantMutation,
    removeParticipantMutation,
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,
  };
}
