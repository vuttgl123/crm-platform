import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Shield, Key, ArrowLeftRight, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardPagination } from '@/components/common/StandardPagination';
import { StandardGlidingTabs } from '@/components/common/StandardGlidingTabs';
import { RoleSummaryResponse } from '@/services/api/roleApi';
import { useAuth } from '@/core/session/useAuth';
import { can } from '@/core/permissions/evaluator';

import { RoleEditorMode } from './model/roleTypes';
import { parseRoleError } from './model/roleErrors';
import { useRoleSearchParams } from './roleSearchParams';
import {
  useRolesList,
  usePermissionCatalogue,
  useTeamsList,
  useRoleMutations,
} from './hooks/roleQueries';

import { RolesSummary } from './components/RolesSummary';
import { RolesToolbar } from './components/RolesToolbar';
import { RolesTable } from './components/RolesTable';
import { PermissionCatalogue } from './components/PermissionCatalogue';
import { RoleComparison } from './components/RoleComparison';
import { RoleEditorSheet } from './components/RoleEditorSheet';
import { RoleDeleteDialog } from './components/RoleDeleteDialog';

export const RolesPage: React.FC = () => {
  const { session } = useAuth();
  const tenantId = session?.tenant?.id || 'default';
  const canManage = can('platform_role.manage', session);

  // URL State
  const {
    activeTab,
    setActiveTab,
    roleFilters,
    setRoleFilters,
    catalogueFilters,
    setCatalogueFilters,
    comparisonFilters,
    setComparisonFilters,
  } = useRoleSearchParams();

  // Queries
  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    refetch: refetchRoles,
  } = useRolesList(tenantId);
  const {
    data: catalog = [],
    isLoading: isLoadingCatalog,
    refetch: refetchCatalog,
  } = usePermissionCatalogue(tenantId);
  const { data: teams = [] } = useTeamsList(tenantId);
  const { deleteMutation } = useRoleMutations(tenantId);

  // Editor Sheet State
  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    mode: RoleEditorMode;
    roleId?: string | null;
  }>({
    isOpen: false,
    mode: 'create',
    roleId: null,
  });

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<RoleSummaryResponse | null>(null);

  // Filtered Roles List
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const q = roleFilters.search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.roleCode.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q));

      const matchesStatus =
        roleFilters.status === 'ALL' || r.status === roleFilters.status;

      const isSystem = r.system || r.isSystem;
      const matchesType =
        roleFilters.type === 'ALL' ||
        (roleFilters.type === 'SYSTEM' && isSystem) ||
        (roleFilters.type === 'CUSTOM' && !isSystem);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [roles, roleFilters]);

  // Paginated Roles
  const totalRolesCount = filteredRoles.length;
  const totalRolesPages = Math.max(1, Math.ceil(totalRolesCount / roleFilters.pageSize));
  const currentRolesPage = Math.min(roleFilters.page, totalRolesPages);

  const paginatedRoles = useMemo(() => {
    const start = (currentRolesPage - 1) * roleFilters.pageSize;
    return filteredRoles.slice(start, start + roleFilters.pageSize);
  }, [filteredRoles, currentRolesPage, roleFilters.pageSize]);

  // Summary stats
  const stats = useMemo(() => {
    const active = roles.filter((r) => r.status === 'ACTIVE').length;
    const custom = roles.filter((r) => !(r.system || r.isSystem)).length;
    return {
      totalRoles: roles.length,
      activeRoles: active,
      customRoles: custom,
      totalPermissions: catalog.length,
    };
  }, [roles, catalog]);

  // Handlers for Row Actions
  const handleOpenCreate = useCallback(() => {
    setEditorState({
      isOpen: true,
      mode: 'create',
      roleId: null,
    });
  }, []);

  const handleOpenView = useCallback((role: RoleSummaryResponse) => {
    setEditorState({
      isOpen: true,
      mode: 'view',
      roleId: role.id,
    });
  }, []);

  const handleOpenEdit = useCallback((role: RoleSummaryResponse) => {
    setEditorState({
      isOpen: true,
      mode: 'edit',
      roleId: role.id,
    });
  }, []);

  const handleOpenClone = useCallback((role: RoleSummaryResponse) => {
    setEditorState({
      isOpen: true,
      mode: 'clone',
      roleId: role.id,
    });
  }, []);

  const handleOpenDelete = useCallback((role: RoleSummaryResponse) => {
    setDeleteTarget(role);
  }, []);

  const handleConfirmDelete = async (role: RoleSummaryResponse) => {
    try {
      await deleteMutation.mutateAsync({ id: role.id, version: role.version || 1 });
      toast.success(`Role "${role.name}" deleted successfully`);
      setDeleteTarget(null);
    } catch (err) {
      const parsed = parseRoleError(err);
      toast.error(parsed.title, {
        description: parsed.description,
      });
    }
  };

  const handleRefresh = useCallback(() => {
    refetchRoles();
    refetchCatalog();
  }, [refetchRoles, refetchCatalog]);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Header */}
      <StandardPageHeader
        title="Roles & Permissions Governance"
        subtitle="Administer security roles, capability matrices, and granular organizational data scoping."
        badgeLabel="roles"
        badgeCount={roles.length}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-8 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-[3px] gap-1.5 shadow-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>
            {canManage && (
              <Button
                size="sm"
                onClick={handleOpenCreate}
                className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none rounded-[3px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Role</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Summary KPI Strip */}
      <RolesSummary stats={stats} loading={isLoadingRoles || isLoadingCatalog} />

      {/* Gliding Navigation Tabs */}
      <StandardGlidingTabs
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        tabs={[
          {
            id: 'roles',
            label: 'Security Roles',
            icon: Shield,
            badgeCount: roles.length,
          },
          {
            id: 'catalogue',
            label: 'Permission Directory',
            icon: Key,
            badgeCount: catalog.length,
          },
          {
            id: 'compare',
            label: 'Role Differential Matrix',
            icon: ArrowLeftRight,
          },
        ]}
      />

      {/* Tab 1: Roles List */}
      {activeTab === 'roles' && (
        <div className="space-y-3 animate-tab-content">
          <RolesToolbar
            searchQuery={roleFilters.search}
            onSearchChange={(q) => setRoleFilters({ search: q, page: 1 })}
            statusFilter={roleFilters.status}
            onStatusChange={(status) => setRoleFilters({ status, page: 1 })}
            typeFilter={roleFilters.type}
            onTypeChange={(type) => setRoleFilters({ type, page: 1 })}
            onResetFilters={() =>
              setRoleFilters({
                search: '',
                status: 'ALL',
                type: 'ALL',
                page: 1,
              })
            }
          />

          <RolesTable
            roles={paginatedRoles}
            loading={isLoadingRoles}
            canManage={canManage}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onClone={handleOpenClone}
            onDelete={handleOpenDelete}
            onCreateClick={handleOpenCreate}
          />

          <StandardPagination
            currentPage={currentRolesPage}
            totalPages={totalRolesPages}
            totalElements={totalRolesCount}
            pageSize={roleFilters.pageSize}
            onPageChange={(p) => setRoleFilters({ page: p })}
            onPageSizeChange={(s) => setRoleFilters({ pageSize: s, page: 1 })}
            itemLabel="roles"
          />
        </div>
      )}

      {/* Tab 2: Permission Catalogue */}
      {activeTab === 'catalogue' && (
        <div className="animate-tab-content">
          <PermissionCatalogue
            permissions={catalog}
            loading={isLoadingCatalog}
            filters={catalogueFilters}
            onFilterChange={setCatalogueFilters}
          />
        </div>
      )}

      {/* Tab 3: Role Comparison */}
      {activeTab === 'compare' && (
        <div className="animate-tab-content">
          <RoleComparison
            roles={roles}
            catalog={catalog}
            filters={comparisonFilters}
            onFilterChange={setComparisonFilters}
            tenantId={tenantId}
          />
        </div>
      )}

      {/* Role Editor Sheet (4-Step Wizard) */}
      <RoleEditorSheet
        isOpen={editorState.isOpen}
        onClose={() => setEditorState((prev) => ({ ...prev, isOpen: false }))}
        roleId={editorState.roleId}
        mode={editorState.mode}
        catalog={catalog}
        teams={teams}
        tenantId={tenantId}
      />

      {/* Delete Confirmation Dialog */}
      <RoleDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        role={deleteTarget}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default RolesPage;
