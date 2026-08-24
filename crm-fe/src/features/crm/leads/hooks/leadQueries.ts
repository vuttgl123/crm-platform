import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  leadApi,
  LeadSummaryResponse,
  LeadResponse,
  LeadSearchParams,
  CreateLeadRequest,
  UpdateLeadRequest,
  ConvertLeadRequest,
  LeadScoringResult,
} from '@/services/api/leadApi';
import {
  salesConfigApi,
  LeadStatusItem,
  LeadSourceItem,
} from '@/services/api/salesConfigApi';
import type { PageResult } from '@/services/api/accountApi';

export function useLeadsQuery(
  params: LeadSearchParams,
  tenantId: string = 'default'
) {
  return useQuery<PageResult<LeadSummaryResponse>>({
    queryKey: ['leads', tenantId, params],
    queryFn: async ({ signal }) => {
      return leadApi.search(params, { signal });
    },
    staleTime: 10000,
  });
}

export function useLeadDetailQuery(
  leadId?: string | null,
  tenantId: string = 'default',
  enabled: boolean = true
) {
  return useQuery<LeadResponse>({
    queryKey: ['lead', tenantId, leadId],
    queryFn: async ({ signal }) => {
      if (!leadId) throw new Error('Lead ID is required');
      return leadApi.get(leadId, { signal });
    },
    enabled: Boolean(enabled && leadId),
    staleTime: 15000,
  });
}

export function useLeadStatusesQuery(tenantId: string = 'default') {
  return useQuery<LeadStatusItem[]>({
    queryKey: ['lead-statuses', tenantId],
    queryFn: async () => {
      return salesConfigApi.listLeadStatuses();
    },
    staleTime: 60000,
  });
}

export function useLeadSourcesQuery(tenantId: string = 'default') {
  return useQuery<LeadSourceItem[]>({
    queryKey: ['lead-sources', tenantId],
    queryFn: async () => {
      return salesConfigApi.listLeadSources();
    },
    staleTime: 60000,
  });
}

export function useCreateLeadMutation(tenantId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadRequest) => leadApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['leads', tenantId] });
      queryClient.setQueryData(['lead', tenantId, created.id], created);
    },
  });
}

export function useUpdateLeadMutation(tenantId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
      leadApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['leads', tenantId] });
      queryClient.setQueryData(['lead', tenantId, updated.id], updated);
    },
  });
}

export function useDeleteLeadMutation(tenantId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      leadApi.delete(id, version),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads', tenantId] });
      queryClient.removeQueries({ queryKey: ['lead', tenantId, variables.id] });
    },
  });
}

export function useConvertLeadMutation(tenantId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConvertLeadRequest }) =>
      leadApi.convert(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['leads', tenantId] });
      queryClient.setQueryData(['lead', tenantId, updated.id], updated);
    },
  });
}

export function useCalculateScoreMutation() {
  return useMutation<LeadScoringResult, Error, string>({
    mutationFn: (id: string) => leadApi.calculateScore(id),
  });
}

export function useAutoAssignMutation(tenantId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadApi.autoAssign(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['leads', tenantId] });
      queryClient.setQueryData(['lead', tenantId, updated.id], updated);
    },
  });
}
