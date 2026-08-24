import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/core/session/useAuth';
import { can } from '@/core/permissions/evaluator';
import {
  LeadSummaryResponse,
  LeadResponse,
  LeadSearchParams as ApiLeadSearchParams,
} from '@/services/api/leadApi';
import {
  parseLeadSearchParams,
  serializeLeadSearchParams,
} from './leadSearchParams';
import {
  LeadFilterState,
} from './model/leadTypes';
import {
  useLeadsQuery,
  useLeadStatusesQuery,
  useLeadSourcesQuery,
  useDeleteLeadMutation,
} from './hooks/leadQueries';
import { mapLeadError } from './model/leadErrors';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { LeadsToolbar } from './components/LeadsToolbar';
import { LeadsCollection } from './components/LeadsCollection';
import { LeadDetailSheet } from './components/LeadDetailSheet';
import { LeadEditorSheet } from './components/LeadEditorSheet';
import { LeadScoreDialog } from './components/LeadScoreDialog';
import { LeadAutoAssignDialog } from './components/LeadAutoAssignDialog';
import { LeadConversionDialog } from './components/LeadConversionDialog';
import { LeadDeleteDialog } from './components/LeadDeleteDialog';
import { Button } from '@/components/ui/button';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const LeadsPage: React.FC = () => {
  const { session } = useAuth();
  const tenantId = session?.tenant?.id || 'default';
  const currentUserId = session?.user?.id;
  const currentTeamId = session?.assignedTeam?.id;

  const canWrite = can('crm_lead.write', session);

  // URL state synchronization
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = useMemo(() => parseLeadSearchParams(searchParams), [searchParams]);

  // Catalogues
  const { data: statuses = [] } = useLeadStatusesQuery(tenantId);
  const { data: sources = [] } = useLeadSourcesQuery(tenantId);

  // Convert UI URL state to backend Search Request
  const searchRequest: ApiLeadSearchParams = useMemo(() => {
    const req: ApiLeadSearchParams = {
      q: urlState.q || undefined,
      statusId: urlState.statusId || undefined,
      sourceId: urlState.sourceId || undefined,
      rating: urlState.rating !== 'ALL' ? urlState.rating : undefined,
      page: Math.max(0, urlState.page - 1),
      size: urlState.size,
    };

    if (urlState.ownership === 'MINE' && currentUserId) {
      req.ownerType = 'USER';
      req.ownerId = currentUserId;
    } else if (urlState.ownership === 'TEAM' && currentTeamId) {
      req.ownerType = 'TEAM';
      req.ownerId = currentTeamId;
    }

    if (urlState.conversion === 'ACTIVE') {
      req.converted = false;
    } else if (urlState.conversion === 'CONVERTED') {
      req.converted = true;
    }

    return req;
  }, [urlState, currentUserId, currentTeamId]);

  // Query leads list
  const {
    data: pageResult,
    isLoading,
    isError,
    error,
    refetch,
  } = useLeadsQuery(searchRequest, tenantId);

  const leads = pageResult?.items || [];
  const totalElements = pageResult?.totalElements ?? 0;
  const totalPages = pageResult?.totalPages ?? 0;

  // Workflow Dialog States
  const [scoreTarget, setScoreTarget] = useState<LeadSummaryResponse | LeadResponse | null>(null);
  const [autoAssignTarget, setAutoAssignTarget] = useState<LeadSummaryResponse | LeadResponse | null>(null);
  const [convertTarget, setConvertTarget] = useState<LeadSummaryResponse | LeadResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadSummaryResponse | LeadResponse | null>(null);

  const deleteMutation = useDeleteLeadMutation(tenantId);

  // Filter change handlers updating URL search params
  const handleFilterChange = useCallback(
    (newFilters: Partial<LeadFilterState>) => {
      setSearchParams((prev) => {
        return serializeLeadSearchParams(
          {
            q: newFilters.q !== undefined ? newFilters.q : urlState.q,
            statusId: newFilters.statusId !== undefined ? newFilters.statusId : urlState.statusId,
            sourceId: newFilters.sourceId !== undefined ? newFilters.sourceId : urlState.sourceId,
            rating: newFilters.rating !== undefined ? newFilters.rating : urlState.rating,
            ownership:
              newFilters.ownership !== undefined
                ? newFilters.ownership
                : urlState.ownership,
            conversion:
              newFilters.conversion !== undefined
                ? newFilters.conversion
                : urlState.conversion,
            page: newFilters.page !== undefined ? newFilters.page : urlState.page,
            size: newFilters.size !== undefined ? newFilters.size : urlState.size,
          },
          prev
        );
      });
    },
    [setSearchParams, urlState]
  );

  const handleResetFilters = useCallback(() => {
    setSearchParams((prev) =>
      serializeLeadSearchParams(
        {
          q: '',
          statusId: '',
          sourceId: '',
          rating: 'ALL',
          ownership: 'ALL',
          conversion: 'ALL',
          page: 1,
        },
        prev
      )
    );
  }, [setSearchParams]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams((prev) =>
        serializeLeadSearchParams({ page: newPage }, prev)
      );
    },
    [setSearchParams]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setSearchParams((prev) =>
        serializeLeadSearchParams({ size: newSize, page: 1 }, prev)
      );
    },
    [setSearchParams]
  );

  // Sheet Navigation Handlers
  const handleOpenCreate = useCallback(() => {
    setSearchParams((prev) =>
      serializeLeadSearchParams({ mode: 'create', lead: undefined }, prev)
    );
  }, [setSearchParams]);

  const handleOpenView = useCallback(
    (l: LeadSummaryResponse) => {
      setSearchParams((prev) =>
        serializeLeadSearchParams({ mode: 'view', lead: l.id }, prev)
      );
    },
    [setSearchParams]
  );

  const handleOpenEdit = useCallback(
    (l: LeadSummaryResponse) => {
      setSearchParams((prev) =>
        serializeLeadSearchParams({ mode: 'edit', lead: l.id }, prev)
      );
    },
    [setSearchParams]
  );

  const handleCloseSheet = useCallback(() => {
    setSearchParams((prev) =>
      serializeLeadSearchParams({ mode: undefined, lead: undefined }, prev)
    );
  }, [setSearchParams]);

  // Delete Action Handlers
  const handleConfirmDelete = async (l: LeadSummaryResponse | LeadResponse) => {
    try {
      await deleteMutation.mutateAsync({ id: l.id, version: l.version });
      toast.success('Lead deleted');
      setDeleteTarget(null);
      if (urlState.lead === l.id) {
        handleCloseSheet();
      }
    } catch (err: any) {
      const errorMapping = mapLeadError(err);
      toast.error(errorMapping.title, {
        description: errorMapping.description,
      });
    }
  };

  const hasActiveFilters = Boolean(
    urlState.q.trim() ||
      urlState.statusId ||
      urlState.sourceId ||
      urlState.rating !== 'ALL' ||
      urlState.ownership !== 'ALL' ||
      urlState.conversion !== 'ALL'
  );

  const isDetailSheetOpen = urlState.mode === 'view' && Boolean(urlState.lead);
  const isEditorSheetOpen = urlState.mode === 'create' || (urlState.mode === 'edit' && Boolean(urlState.lead));

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Header */}
      <StandardPageHeader
        title="Leads"
        subtitle="Qualify, assign, and convert prospective sales opportunities."
        badgeLabel="leads"
        badgeCount={totalElements}
        actions={
          <div className="flex items-center gap-2">
            <ActionTooltip label="Refresh lead list">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border-slate-200 rounded-[3px] gap-1.5"
                aria-label="Refresh leads"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </ActionTooltip>

            {canWrite && (
              <Button
                size="sm"
                onClick={handleOpenCreate}
                className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
                aria-label="Create new lead"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Lead</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Toolbar */}
      <LeadsToolbar
        filters={{
          q: urlState.q,
          statusId: urlState.statusId,
          sourceId: urlState.sourceId,
          rating: urlState.rating,
          ownership: urlState.ownership,
          conversion: urlState.conversion,
          page: urlState.page,
          size: urlState.size,
        }}
        statuses={statuses}
        sources={sources}
        hasSessionTeam={Boolean(currentTeamId)}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Collection */}
      <LeadsCollection
        leads={leads}
        statuses={statuses}
        sources={sources}
        totalElements={totalElements}
        totalPages={totalPages}
        page={urlState.page}
        pageSize={urlState.size}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasActiveFilters={hasActiveFilters}
        canWrite={canWrite}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={() => refetch()}
        onResetFilters={handleResetFilters}
        onCreateClick={handleOpenCreate}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={(l) => setDeleteTarget(l)}
        onCalculateScore={(l) => setScoreTarget(l)}
        onAutoAssign={(l) => setAutoAssignTarget(l)}
        onConvert={(l) => setConvertTarget(l)}
      />

      {/* Read-only Detail Sheet */}
      <LeadDetailSheet
        isOpen={isDetailSheetOpen}
        leadId={urlState.lead}
        tenantId={tenantId}
        statuses={statuses}
        sources={sources}
        canWrite={canWrite}
        onClose={handleCloseSheet}
        onEdit={() => {
          if (urlState.lead) {
            setSearchParams((prev) =>
              serializeLeadSearchParams({ mode: 'edit', lead: urlState.lead }, prev)
            );
          }
        }}
        onCalculateScore={(l) => setScoreTarget(l)}
        onAutoAssign={(l) => setAutoAssignTarget(l)}
        onConvert={(l) => setConvertTarget(l)}
      />

      {/* Create / Edit Form Sheet */}
      <LeadEditorSheet
        isOpen={isEditorSheetOpen}
        mode={urlState.mode || 'create'}
        leadId={urlState.lead}
        tenantId={tenantId}
        statuses={statuses}
        sources={sources}
        onClose={handleCloseSheet}
      />

      {/* Rule-Based Scoring Calculation Dialog */}
      <LeadScoreDialog
        isOpen={Boolean(scoreTarget)}
        lead={scoreTarget}
        onClose={() => setScoreTarget(null)}
      />

      {/* Round-Robin Auto-Assign Confirmation Dialog */}
      <LeadAutoAssignDialog
        isOpen={Boolean(autoAssignTarget)}
        lead={autoAssignTarget}
        tenantId={tenantId}
        onClose={() => setAutoAssignTarget(null)}
      />

      {/* Mark As Converted Dialog */}
      <LeadConversionDialog
        isOpen={Boolean(convertTarget)}
        lead={convertTarget}
        statuses={statuses}
        tenantId={tenantId}
        onClose={() => setConvertTarget(null)}
      />

      {/* Version-Safe Delete Confirmation Dialog */}
      <LeadDeleteDialog
        isOpen={Boolean(deleteTarget)}
        lead={deleteTarget}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
