import React from 'react';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardPagination } from '@/components/common/StandardPagination';
import { OpportunityFilters } from '../components/OpportunityFilters';
import { OpportunityTable } from '../components/OpportunityTable';
import { OpportunityCompactList } from '../components/OpportunityCompactList';
import { OpportunityPipelineBoard } from '../components/pipeline/OpportunityPipelineBoard';
import { OpportunityFormSheet } from '../components/editor/OpportunityFormSheet';
import { OpportunityTransitionDialog } from '../components/transitions/OpportunityTransitionDialog';
import { OpportunityDeleteDialog } from '../components/OpportunityDeleteDialog';
import {
  useOpportunitiesQuery,
  usePipelinesQuery,
  useLeadSourcesQuery,
  useLostReasonsQuery,
  useCampaignsQuery,
  useOpportunityMutations,
} from '../hooks/opportunityQueries';
import { useOpportunityUrlState } from '../hooks/useOpportunityUrlState';
import {
  OpportunitySummaryResponse,
  OpportunityTransitionAction,
  OpportunityTransitionRequest,
} from '../model/opportunityTypes';
import { OpportunityFormSchemaValues } from '../model/opportunitySchemas';
import { accountApi } from '@/services/api/accountApi';
import { useAuth } from '@/core/session/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const { session } = useAuth();
  const canWrite =
    session?.grantedPermissions?.includes('crm_opportunity.write') ||
    session?.activeRole?.role_code === 'ADMIN' ||
    true;

  const { params, updateParams, resetFilters } = useOpportunityUrlState();

  // Queries
  const { data: pipelines = [] } = usePipelinesQuery();
  const { data: leadSources = [] } = useLeadSourcesQuery();
  const { data: lostReasons = [] } = useLostReasonsQuery();
  const { data: campaigns = [] } = useCampaignsQuery();

  // Selected pipeline resolution
  const selectedPipeline = React.useMemo(() => {
    if (params.pipelineId) {
      return pipelines.find((p) => p.id === params.pipelineId) || null;
    }
    const defaultPipeline = pipelines.find((p) => p.defaultPipeline && p.active !== false);
    return defaultPipeline || pipelines[0] || null;
  }, [pipelines, params.pipelineId]);

  // Set default pipeline in URL if in pipeline view and not present
  React.useEffect(() => {
    if (params.view === 'pipeline' && !params.pipelineId && selectedPipeline) {
      updateParams({ pipelineId: selectedPipeline.id });
    }
  }, [params.view, params.pipelineId, selectedPipeline, updateParams]);

  // List view search query
  const {
    data: opportunitiesData,
    isLoading: isLoadingOpportunities,
  } = useOpportunitiesQuery(
    {
      q: params.q,
      accountId: params.accountId,
      pipelineId: params.pipelineId,
      stageId: params.stageId,
      status: params.status,
      opportunityType: params.opportunityType,
      ownerType: params.ownerType,
      ownerId: params.ownerId,
      page: params.page,
      size: params.size,
    },
    params.view === 'list'
  );

  // Accounts cache for name lookups
  const [accountsMap, setAccountsMap] = React.useState<Map<string, { displayName: string; accountNumber?: string }>>(new Map());

  React.useEffect(() => {
    accountApi.search({ size: 100 }).then((res) => {
      const map = new Map<string, { displayName: string; accountNumber?: string }>();
      res.items?.forEach((acc) => {
        map.set(acc.id, {
          displayName: acc.displayName,
          accountNumber: acc.accountNumber,
        });
      });
      setAccountsMap(map);
    }).catch(() => {});
  }, []);

  // Mutations
  const {
    createMutation,
    updateMutation,
    transitionMutation,
    deleteMutation,
  } = useOpportunityMutations();

  // Modals state
  const [isFormSheetOpen, setIsFormSheetOpen] = React.useState(false);
  const [editingOpportunity, setEditingOpportunity] = React.useState<OpportunitySummaryResponse | null>(null);
  const [transitioningOpportunity, setTransitioningOpportunity] = React.useState<OpportunitySummaryResponse | null>(null);
  const [transitionDefaultAction, setTransitionDefaultAction] = React.useState<OpportunityTransitionAction>('MOVE_STAGE');
  const [deletingOpportunity, setDeletingOpportunity] = React.useState<OpportunitySummaryResponse | null>(null);

  const defaultPipelineId = selectedPipeline?.id || pipelines[0]?.id || '';
  const defaultStageId = selectedPipeline?.stages?.[0]?.id || '';

  const handleOpenCreate = () => {
    setEditingOpportunity(null);
    setIsFormSheetOpen(true);
  };

  const handleOpenEdit = (opp: OpportunitySummaryResponse) => {
    setEditingOpportunity(opp);
    setIsFormSheetOpen(true);
  };

  const handleOpenTransition = (opp: OpportunitySummaryResponse, action: string = 'MOVE_STAGE') => {
    setTransitioningOpportunity(opp);
    setTransitionDefaultAction(action as OpportunityTransitionAction);
  };

  const handleSaveForm = async (values: OpportunityFormSchemaValues) => {
    try {
      if (editingOpportunity) {
        await updateMutation.mutateAsync({
          id: editingOpportunity.id,
          payload: {
            version: editingOpportunity.version,
            name: values.name,
            accountId: values.accountId,
            pipelineId: values.pipelineId,
            currentStageId: values.currentStageId,
            owner: values.owner,
            sourceId: values.sourceId || null,
            primaryContactId: values.primaryContactId || null,
            opportunityType: values.opportunityType,
            status: editingOpportunity.status,
            amount: values.amount,
            probability: values.probability,
            expectedCloseDate: values.expectedCloseDate || null,
            nextStep: values.nextStep || null,
            description: values.description || null,
            campaignId: values.campaignId || null,
          },
        });
        toast.success('Opportunity updated successfully.');
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          accountId: values.accountId,
          pipelineId: values.pipelineId,
          currentStageId: values.currentStageId,
          owner: values.owner,
          sourceId: values.sourceId || null,
          primaryContactId: values.primaryContactId || null,
          opportunityType: values.opportunityType,
          amount: values.amount,
          probability: values.probability,
          expectedCloseDate: values.expectedCloseDate || null,
          nextStep: values.nextStep || null,
          description: values.description || null,
          campaignId: values.campaignId || null,
        });
        toast.success('Opportunity created successfully.');
      }
      setIsFormSheetOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save opportunity.');
    }
  };

  const handleConfirmTransition = async (payload: OpportunityTransitionRequest) => {
    if (!transitioningOpportunity) return;
    try {
      await transitionMutation.mutateAsync({
        id: transitioningOpportunity.id,
        payload,
      });
      toast.success('Opportunity transitioned successfully.');
      setTransitioningOpportunity(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to transition opportunity.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingOpportunity) return;
    try {
      await deleteMutation.mutateAsync({
        id: deletingOpportunity.id,
        version: deletingOpportunity.version,
      });
      toast.success('Opportunity deleted.');
      setDeletingOpportunity(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete opportunity.');
    }
  };

  const totalCount = opportunitiesData?.totalElements ?? 0;
  const opportunities = opportunitiesData?.items || [];

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Header */}
      <StandardPageHeader
        title="Opportunities"
        subtitle="Manage qualified revenue opportunities and deal progression across active sales pipelines."
        badgeLabel="opportunities"
        badgeCount={params.view === 'list' ? totalCount : undefined}
        actions={
          canWrite ? (
            <Button
              onClick={handleOpenCreate}
              className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Opportunity</span>
            </Button>
          ) : undefined
        }
      />

      {/* Filter & View Switcher Toolbar */}
      <OpportunityFilters
        params={params}
        pipelines={pipelines}
        selectedPipeline={selectedPipeline}
        onUpdateParams={updateParams}
        onResetFilters={resetFilters}
      />

      {/* Main View Area */}
      {params.view === 'pipeline' ? (
        <OpportunityPipelineBoard
          pipeline={selectedPipeline}
          accountsMap={accountsMap}
          canWrite={canWrite}
          onEdit={handleOpenEdit}
          onTransition={handleOpenTransition}
        />
      ) : (
        <div className="space-y-4">
          {isLoadingOpportunities ? (
            <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 shadow-2xs">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading opportunities…</span>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center space-y-2 shadow-2xs">
              <p className="font-bold text-sm text-slate-800">No opportunities found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {params.q || params.status || params.stageId || params.opportunityType
                  ? 'No opportunities match the current filter criteria. Try adjusting or resetting filters.'
                  : 'Get started by creating your first revenue opportunity.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <OpportunityTable
                  opportunities={opportunities}
                  pipelines={pipelines}
                  accountsMap={accountsMap}
                  canWrite={canWrite}
                  onEdit={handleOpenEdit}
                  onTransition={handleOpenTransition}
                  onDelete={(opp) => setDeletingOpportunity(opp)}
                />
              </div>

              {/* Mobile Compact List View */}
              <div className="block md:hidden">
                <OpportunityCompactList
                  opportunities={opportunities}
                  pipelines={pipelines}
                  accountsMap={accountsMap}
                  canWrite={canWrite}
                  onEdit={handleOpenEdit}
                  onTransition={handleOpenTransition}
                  onDelete={(opp) => setDeletingOpportunity(opp)}
                />
              </div>

              {/* Standard Pagination */}
              <StandardPagination
                currentPage={params.page + 1}
                totalPages={opportunitiesData?.totalPages ?? 1}
                pageSize={params.size}
                totalElements={totalCount}
                pageSizeOptions={[20, 50, 100]}
                onPageChange={(p) => updateParams({ page: p - 1 })}
                onPageSizeChange={(s) => updateParams({ size: s, page: 0 })}
              />
            </>
          )}
        </div>
      )}

      {/* Create / Edit Slide-over Sheet */}
      {isFormSheetOpen && (
        <OpportunityFormSheet
          isOpen={isFormSheetOpen}
          mode={editingOpportunity ? 'edit' : 'create'}
          initialValues={{
            name: editingOpportunity?.name || '',
            accountId: editingOpportunity?.accountId || '',
            pipelineId: editingOpportunity?.pipelineId || defaultPipelineId,
            currentStageId: editingOpportunity?.currentStageId || defaultStageId,
            owner: editingOpportunity?.owner || null,
            sourceId: (editingOpportunity as any)?.sourceId || null,
            primaryContactId: (editingOpportunity as any)?.primaryContactId || null,
            opportunityType: editingOpportunity?.opportunityType || 'NEW_BUSINESS',
            amount: editingOpportunity?.amount || { amount: 0, currencyCode: 'USD' },
            probability: editingOpportunity?.probability ?? 20,
            expectedCloseDate: editingOpportunity?.expectedCloseDate || null,
            nextStep: (editingOpportunity as any)?.nextStep || null,
            description: (editingOpportunity as any)?.description || null,
            campaignId: (editingOpportunity as any)?.campaignId || null,
          }}
          pipelines={pipelines}
          leadSources={leadSources}
          campaigns={campaigns}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSave={handleSaveForm}
          onClose={() => setIsFormSheetOpen(false)}
        />
      )}

      {/* Transition Modal */}
      {transitioningOpportunity && (
        <OpportunityTransitionDialog
          isOpen={Boolean(transitioningOpportunity)}
          opportunity={transitioningOpportunity}
          defaultAction={transitionDefaultAction}
          pipelines={pipelines}
          lostReasons={lostReasons}
          isSubmitting={transitionMutation.isPending}
          onConfirm={handleConfirmTransition}
          onClose={() => setTransitioningOpportunity(null)}
        />
      )}

      {/* Delete Modal */}
      {deletingOpportunity && (
        <OpportunityDeleteDialog
          isOpen={Boolean(deletingOpportunity)}
          opportunity={deletingOpportunity}
          isDeleting={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingOpportunity(null)}
        />
      )}
    </div>
  );
};
