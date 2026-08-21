import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  roleApi,
  RoleSummaryResponse,
  RoleDetailResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/services/api/roleApi';
import { teamApi, TeamItem } from '@/services/api/teamApi';
import { mapPermissionResponse } from '../model/roleMappers';
import { ExtendedPermission } from '../model/roleTypes';

export function useRolesList(tenantId: string = 'default') {
  return useQuery<RoleSummaryResponse[]>({
    queryKey: ['roles', tenantId],
    queryFn: async () => {
      const list = await roleApi.getRoles();
      return list || [];
    },
    staleTime: 30000,
  });
}

export function usePermissionCatalogue(tenantId: string = 'default') {
  return useQuery<ExtendedPermission[]>({
    queryKey: ['permissions', tenantId],
    queryFn: async () => {
      const raw = await roleApi.getPermissions();
      return (raw || []).map(mapPermissionResponse);
    },
    staleTime: 60000,
  });
}

export function useRoleDetail(
  roleId: string | null | undefined,
  tenantId: string = 'default',
  enabled: boolean = true
) {
  return useQuery<RoleDetailResponse>({
    queryKey: ['role', tenantId, roleId],
    queryFn: async () => {
      if (!roleId) throw new Error('Role ID is required');
      return roleApi.getRole(roleId);
    },
    enabled: Boolean(enabled && roleId),
    staleTime: 10000,
  });
}

export function useTeamsList(
  tenantId: string = 'default',
  enabled: boolean = true
) {
  return useQuery<TeamItem[]>({
    queryKey: ['teams', tenantId],
    queryFn: async () => {
      return teamApi.listTeams();
    },
    enabled,
    staleTime: 60000,
  });
}

export function useRoleMutations(tenantId: string = 'default') {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateRoleRequest) => roleApi.createRole(data),
    onSuccess: (newRole) => {
      queryClient.invalidateQueries({ queryKey: ['roles', tenantId] });
      queryClient.setQueryData(['role', tenantId, newRole.id], newRole);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      roleApi.updateRole(id, data),
    onSuccess: (updatedRole) => {
      queryClient.invalidateQueries({ queryKey: ['roles', tenantId] });
      queryClient.setQueryData(['role', tenantId, updatedRole.id], updatedRole);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      roleApi.deleteRole(id, version),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', tenantId] });
      queryClient.removeQueries({ queryKey: ['role', tenantId, variables.id] });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
