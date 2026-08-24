import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  opportunityApi,
  OpportunitySearchParams,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  OpportunityTransitionRequest,
  CreateOpportunityStakeholderRequest,
  UpdateOpportunityStakeholderRequest,
  CreateOpportunityNoteRequest,
  UpdateOpportunityNoteRequest,
  OpportunityStatus,
} from '@/services/api/opportunityApi';
import { pipelineApi } from '@/services/api/pipelineApi';
import { salesConfigApi } from '@/services/api/salesConfigApi';
import { campaignApi } from '@/services/api/campaignApi';

export const opportunityKeys = {
  all: ['opportunities'] as const,
  lists: () => ['opportunities', 'list'] as const,
  list: (params: OpportunitySearchParams) =>
    ['opportunities', 'list', params] as const,
  lane: (pipelineId: string, stageId: string, status: OpportunityStatus, page: number = 0) =>
    ['opportunities', 'lane', pipelineId, stageId, status, page] as const,
  detail: (id: string) => ['opportunities', 'detail', id] as const,
  history: (id: string, page: number = 0, size: number = 20) =>
    ['opportunities', 'history', id, page, size] as const,
  stakeholders: (id: string) =>
    ['opportunities', 'stakeholders', id] as const,
  notes: (id: string, page: number = 0, size: number = 20) =>
    ['opportunities', 'notes', id, page, size] as const,
  pipelines: ['platform-pipelines'] as const,
  pipelineDetail: (id: string) => ['platform-pipeline-detail', id] as const,
  lostReasons: ['platform-lost-reasons'] as const,
  leadSources: ['platform-lead-sources'] as const,
  campaigns: ['platform-campaigns'] as const,
};

export function useOpportunitiesQuery(params: OpportunitySearchParams, enabled = true) {
  return useQuery({
    queryKey: opportunityKeys.list(params),
    queryFn: () => opportunityApi.search(params),
    enabled,
    staleTime: 30000,
  });
}

export function useOpportunityLaneQuery(
  pipelineId: string,
  stageId: string,
  status: OpportunityStatus,
  page: number = 0,
  size: number = 20,
  enabled = true
) {
  return useQuery({
    queryKey: opportunityKeys.lane(pipelineId, stageId, status, page),
    queryFn: () =>
      opportunityApi.search({
        pipelineId,
        stageId,
        status,
        page,
        size,
      }),
    enabled: Boolean(pipelineId && stageId && enabled),
    staleTime: 30000,
  });
}

export function useOpportunityDetailQuery(id?: string | null) {
  return useQuery({
    queryKey: opportunityKeys.detail(id || ''),
    queryFn: () => opportunityApi.get(id!),
    enabled: Boolean(id),
    staleTime: 30000,
  });
}

export function useOpportunityStageHistoryQuery(id?: string | null, page = 0, size = 20) {
  return useQuery({
    queryKey: opportunityKeys.history(id || '', page, size),
    queryFn: () => opportunityApi.listStageHistory(id!, { page, size }),
    enabled: Boolean(id),
    staleTime: 30000,
  });
}

export function useOpportunityStakeholdersQuery(id?: string | null) {
  return useQuery({
    queryKey: opportunityKeys.stakeholders(id || ''),
    queryFn: () => opportunityApi.listStakeholders(id!),
    enabled: Boolean(id),
    staleTime: 30000,
  });
}

export function useOpportunityNotesQuery(id?: string | null, page = 0, size = 20) {
  return useQuery({
    queryKey: opportunityKeys.notes(id || '', page, size),
    queryFn: () => opportunityApi.listNotes(id!, { page, size }),
    enabled: Boolean(id),
    staleTime: 30000,
  });
}

export function usePipelinesQuery() {
  return useQuery({
    queryKey: opportunityKeys.pipelines,
    queryFn: () => pipelineApi.listPipelines(),
    staleTime: 60000,
  });
}

export function usePipelineDetailQuery(pipelineId?: string | null) {
  return useQuery({
    queryKey: opportunityKeys.pipelineDetail(pipelineId || ''),
    queryFn: () => pipelineApi.getPipeline(pipelineId!),
    enabled: Boolean(pipelineId),
    staleTime: 60000,
  });
}

export function useLostReasonsQuery() {
  return useQuery({
    queryKey: opportunityKeys.lostReasons,
    queryFn: () => salesConfigApi.listLostReasons(),
    staleTime: 60000,
  });
}

export function useLeadSourcesQuery() {
  return useQuery({
    queryKey: opportunityKeys.leadSources,
    queryFn: () => salesConfigApi.listLeadSources(),
    staleTime: 60000,
  });
}

export function useCampaignsQuery() {
  return useQuery({
    queryKey: opportunityKeys.campaigns,
    queryFn: async () => {
      try {
        const res: any = await campaignApi.list({ size: 100 });
        return res?.content || res?.items || [];
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });
}

export function useOpportunityMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateOpportunityRequest) => opportunityApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOpportunityRequest }) =>
      opportunityApi.update(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(opportunityKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
    },
  });

  const transitionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OpportunityTransitionRequest }) =>
      opportunityApi.transition(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(opportunityKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      opportunityApi.delete(id, version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
    },
  });

  const addStakeholderMutation = useMutation({
    mutationFn: ({ opportunityId, payload }: { opportunityId: string; payload: CreateOpportunityStakeholderRequest }) =>
      opportunityApi.addStakeholder(opportunityId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.stakeholders(variables.opportunityId) });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(variables.opportunityId) });
    },
  });

  const updateStakeholderMutation = useMutation({
    mutationFn: ({
      opportunityId,
      stakeholderId,
      payload,
    }: {
      opportunityId: string;
      stakeholderId: string;
      payload: UpdateOpportunityStakeholderRequest;
    }) => opportunityApi.updateStakeholder(opportunityId, stakeholderId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.stakeholders(variables.opportunityId) });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(variables.opportunityId) });
    },
  });

  const deleteStakeholderMutation = useMutation({
    mutationFn: ({
      opportunityId,
      stakeholderId,
      version,
    }: {
      opportunityId: string;
      stakeholderId: string;
      version: number;
    }) => opportunityApi.deleteStakeholder(opportunityId, stakeholderId, version),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.stakeholders(variables.opportunityId) });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(variables.opportunityId) });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: ({ opportunityId, payload }: { opportunityId: string; payload: CreateOpportunityNoteRequest }) =>
      opportunityApi.createNote(opportunityId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.notes(variables.opportunityId) });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({
      opportunityId,
      noteId,
      payload,
    }: {
      opportunityId: string;
      noteId: string;
      payload: UpdateOpportunityNoteRequest;
    }) => opportunityApi.updateNote(opportunityId, noteId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.notes(variables.opportunityId) });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: ({
      opportunityId,
      noteId,
      version,
    }: {
      opportunityId: string;
      noteId: string;
      version: number;
    }) => opportunityApi.deleteNote(opportunityId, noteId, version),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.notes(variables.opportunityId) });
    },
  });

  return {
    createMutation,
    updateMutation,
    transitionMutation,
    deleteMutation,
    addStakeholderMutation,
    updateStakeholderMutation,
    deleteStakeholderMutation,
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,
  };
}
