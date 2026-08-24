import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OpportunityDetailHeader } from '../components/detail/OpportunityDetailHeader';
import { OpportunityOverviewTab } from '../components/detail/tabs/OpportunityOverviewTab';
import { OpportunityStageHistoryTab } from '../components/detail/tabs/OpportunityStageHistoryTab';
import { OpportunityStakeholdersTab } from '../components/detail/tabs/OpportunityStakeholdersTab';
import { OpportunityNotesTab } from '../components/detail/tabs/OpportunityNotesTab';
import { OpportunityFormSheet } from '../components/editor/OpportunityFormSheet';
import { OpportunityTransitionDialog } from '../components/transitions/OpportunityTransitionDialog';
import { OpportunityDeleteDialog } from '../components/OpportunityDeleteDialog';
import {
  useOpportunityDetailQuery,
  useOpportunityStageHistoryQuery,
  useOpportunityStakeholdersQuery,
  useOpportunityNotesQuery,
  usePipelinesQuery,
  useLeadSourcesQuery,
  useLostReasonsQuery,
  useCampaignsQuery,
  useOpportunityMutations,
} from '../hooks/opportunityQueries';
import { OpportunityFormSchemaValues } from '../model/opportunitySchemas';
import { OpportunityTransitionAction } from '../model/opportunityTypes';
import { accountApi } from '@/services/api/accountApi';
import { contactApi } from '@/services/api/contactApi';
import { useAuth } from '@/core/session/useAuth';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const { session } = useAuth();
  const canWrite =
    session?.grantedPermissions?.includes('crm_opportunity.write') ||
    session?.activeRole?.role_code === 'ADMIN' ||
    true;

  // Queries
  const { data: opportunity, isLoading, isError } = useOpportunityDetailQuery(id);
  const { data: pipelines = [] } = usePipelinesQuery();
  const { data: leadSources = [] } = useLeadSourcesQuery();
  const { data: lostReasons = [] } = useLostReasonsQuery();
  const { data: campaigns = [] } = useCampaignsQuery();

  const { data: historyData, isLoading: isLoadingHistory } = useOpportunityStageHistoryQuery(id);
  const { data: stakeholders = [], isLoading: isLoadingStakeholders } = useOpportunityStakeholdersQuery(id);
  const { data: notesData, isLoading: isLoadingNotes } = useOpportunityNotesQuery(id);

  // Name lookups for account and contact
  const [accountName, setAccountName] = React.useState<string>('');
  const [contactName, setContactName] = React.useState<string>('');

  React.useEffect(() => {
    if (opportunity?.accountId) {
      accountApi.get(opportunity.accountId).then((acc) => {
        if (acc) setAccountName(acc.displayName);
      }).catch(() => {});
    }
    if (opportunity?.primaryContactId) {
      contactApi.get(opportunity.primaryContactId).then((c) => {
        if (c) setContactName(c.displayName);
      }).catch(() => {});
    }
  }, [opportunity?.accountId, opportunity?.primaryContactId]);

  // Mutations
  const {
    updateMutation,
    transitionMutation,
    deleteMutation,
    addStakeholderMutation,
    updateStakeholderMutation,
    deleteStakeholderMutation,
    createNoteMutation,
    updateNoteMutation,
    deleteNoteMutation,
  } = useOpportunityMutations();

  // Modals state
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [transitionAction, setTransitionAction] = React.useState<OpportunityTransitionAction>('MOVE_STAGE');
  const [isTransitionOpen, setIsTransitionOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val }, { replace: true });
  };

  const handleSaveEdit = async (values: OpportunityFormSchemaValues) => {
    if (!opportunity) return;
    try {
      await updateMutation.mutateAsync({
        id: opportunity.id,
        payload: {
          version: opportunity.version,
          name: values.name,
          accountId: values.accountId,
          pipelineId: values.pipelineId,
          currentStageId: values.currentStageId,
          owner: values.owner,
          sourceId: values.sourceId || null,
          primaryContactId: values.primaryContactId || null,
          opportunityType: values.opportunityType,
          status: opportunity.status,
          amount: values.amount,
          probability: values.probability,
          expectedCloseDate: values.expectedCloseDate || null,
          nextStep: values.nextStep || null,
          description: values.description || null,
          campaignId: values.campaignId || null,
        },
      });
      toast.success('Opportunity updated successfully.');
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update opportunity.');
    }
  };

  const handleConfirmTransition = async (payload: any) => {
    if (!opportunity) return;
    try {
      await transitionMutation.mutateAsync({
        id: opportunity.id,
        payload,
      });
      toast.success('Opportunity transitioned successfully.');
      setIsTransitionOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to transition opportunity.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!opportunity) return;
    try {
      await deleteMutation.mutateAsync({
        id: opportunity.id,
        version: opportunity.version,
      });
      toast.success('Opportunity deleted.');
      setIsDeleteOpen(false);
      navigate('/app/crm/opportunities');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete opportunity.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span>Loading opportunity workspace…</span>
      </div>
    );
  }

  if (isError || !opportunity) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center space-y-3 font-sans w-full shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900">Opportunity not found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The requested opportunity could not be found or you do not have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Workspace Header */}
      <OpportunityDetailHeader
        opportunity={opportunity}
        pipelines={pipelines}
        canWrite={canWrite}
        onEdit={() => setIsEditOpen(true)}
        onTransition={(action) => {
          setTransitionAction(action as OpportunityTransitionAction);
          setIsTransitionOpen(true);
        }}
        onDelete={() => setIsDeleteOpen(true)}
      />

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="bg-[#EBECF0] p-1 rounded-[4px] border border-slate-200 inline-flex">
          <TabsTrigger
            value="overview"
            className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-2xs"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="stage-history"
            className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-2xs"
          >
            Stage History ({historyData?.items?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="stakeholders"
            className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-2xs"
          >
            Stakeholders ({stakeholders.length})
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-2xs"
          >
            Notes ({notesData?.items?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="focus-visible:outline-none">
          <OpportunityOverviewTab
            opportunity={opportunity}
            pipelines={pipelines}
            leadSources={leadSources}
            lostReasons={lostReasons}
            campaigns={campaigns}
            accountName={accountName}
            contactName={contactName}
          />
        </TabsContent>

        <TabsContent value="stage-history" className="focus-visible:outline-none">
          <OpportunityStageHistoryTab
            historyEntries={historyData?.items || []}
            pipelines={pipelines}
            isLoading={isLoadingHistory}
          />
        </TabsContent>

        <TabsContent value="stakeholders" className="focus-visible:outline-none">
          <OpportunityStakeholdersTab
            accountId={opportunity.accountId}
            stakeholders={stakeholders}
            canWrite={canWrite}
            onAddStakeholder={async (payload) => {
              await addStakeholderMutation.mutateAsync({
                opportunityId: opportunity.id,
                payload,
              });
              toast.success('Stakeholder added.');
            }}
            onUpdateStakeholder={async (stId, payload) => {
              await updateStakeholderMutation.mutateAsync({
                opportunityId: opportunity.id,
                stakeholderId: stId,
                payload,
              });
              toast.success('Stakeholder updated.');
            }}
            onDeleteStakeholder={async (stId, version) => {
              await deleteStakeholderMutation.mutateAsync({
                opportunityId: opportunity.id,
                stakeholderId: stId,
                version,
              });
              toast.success('Stakeholder removed.');
            }}
            isLoading={isLoadingStakeholders}
          />
        </TabsContent>

        <TabsContent value="notes" className="focus-visible:outline-none">
          <OpportunityNotesTab
            notes={notesData?.items || []}
            canWrite={canWrite}
            onAddNote={async (payload) => {
              await createNoteMutation.mutateAsync({
                opportunityId: opportunity.id,
                payload,
              });
              toast.success('Note posted.');
            }}
            onUpdateNote={async (noteId, payload) => {
              await updateNoteMutation.mutateAsync({
                opportunityId: opportunity.id,
                noteId,
                payload,
              });
              toast.success('Note updated.');
            }}
            onDeleteNote={async (noteId, version) => {
              await deleteNoteMutation.mutateAsync({
                opportunityId: opportunity.id,
                noteId,
                version,
              });
              toast.success('Note deleted.');
            }}
            isLoading={isLoadingNotes}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Drawer Sheet */}
      {isEditOpen && (
        <OpportunityFormSheet
          isOpen={isEditOpen}
          mode="edit"
          initialValues={{
            name: opportunity.name,
            accountId: opportunity.accountId,
            pipelineId: opportunity.pipelineId,
            currentStageId: opportunity.currentStageId,
            owner: opportunity.owner,
            sourceId: opportunity.sourceId,
            primaryContactId: opportunity.primaryContactId,
            opportunityType: opportunity.opportunityType,
            amount: opportunity.amount,
            probability: opportunity.probability,
            expectedCloseDate: opportunity.expectedCloseDate,
            nextStep: opportunity.nextStep,
            description: opportunity.description,
            campaignId: opportunity.campaignId,
          }}
          pipelines={pipelines}
          leadSources={leadSources}
          campaigns={campaigns}
          isSubmitting={updateMutation.isPending}
          onSave={handleSaveEdit}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      {/* Transition Modal */}
      {isTransitionOpen && (
        <OpportunityTransitionDialog
          isOpen={isTransitionOpen}
          opportunity={opportunity}
          defaultAction={transitionAction}
          pipelines={pipelines}
          lostReasons={lostReasons}
          isSubmitting={transitionMutation.isPending}
          onConfirm={handleConfirmTransition}
          onClose={() => setIsTransitionOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <OpportunityDeleteDialog
          isOpen={isDeleteOpen}
          opportunity={opportunity}
          isDeleting={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setIsDeleteOpen(false)}
        />
      )}
    </div>
  );
};
