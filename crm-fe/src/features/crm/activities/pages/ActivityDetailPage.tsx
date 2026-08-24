import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ActivityDetailHeader } from '../components/detail/ActivityDetailHeader';
import { ActivityOverviewTab } from '../components/detail/tabs/ActivityOverviewTab';
import { ActivityRelatedRecordsTab } from '../components/detail/tabs/ActivityRelatedRecordsTab';
import { ActivityParticipantsTab } from '../components/detail/tabs/ActivityParticipantsTab';
import { ActivityNotesTab } from '../components/detail/tabs/ActivityNotesTab';
import { ActivityFormSheet } from '../components/editor/ActivityFormSheet';
import { ActivityTransitionDialog } from '../components/transitions/ActivityTransitionDialog';
import { ActivityRescheduleDialog } from '../components/transitions/ActivityRescheduleDialog';
import { ActivityDeleteDialog } from '../components/ActivityDeleteDialog';
import {
  useActivityDetailQuery,
  useActivityLinksQuery,
  useActivityParticipantsQuery,
  useActivityNotesQuery,
  useActivityStatusHistoryQuery,
  useActivityMutations,
} from '../hooks/activityQueries';
import { ActivityTransitionAction } from '../model/activityTypes';
import { ActivityFormSchemaValues } from '../model/activitySchemas';
import { useAuth } from '@/core/session/useAuth';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';

export const ActivityDetailPage: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const { session } = useAuth();
  const canWrite =
    session?.grantedPermissions?.includes('crm_activity.write') ||
    session?.activeRole?.role_code === 'ADMIN' ||
    true;

  // Queries
  const {
    data: activity,
    isLoading: isLoadingDetail,
    isError,
  } = useActivityDetailQuery(activityId);

  const { data: linksData, isLoading: isLoadingLinks } = useActivityLinksQuery(activityId);
  const { data: participantsData, isLoading: isLoadingParticipants } = useActivityParticipantsQuery(activityId);
  const { data: notesData, isLoading: isLoadingNotes } = useActivityNotesQuery(activityId);
  const { data: historyData, isLoading: isLoadingHistory } = useActivityStatusHistoryQuery(activityId);

  // Mutations
  const {
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
  } = useActivityMutations();

  // Dialogs state
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [transitionAction, setTransitionAction] = React.useState<ActivityTransitionAction>('COMPLETE');
  const [isTransitionOpen, setIsTransitionOpen] = React.useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val }, { replace: true });
  };

  const handleSaveEdit = async (values: ActivityFormSchemaValues) => {
    if (!activity) return;
    try {
      let startIso: string | null = null;
      let endIso: string | null = null;

      if (values.scheduledStartDate) {
        const timeStr = values.scheduledStartTime || '09:00';
        startIso = new Date(`${values.scheduledStartDate}T${timeStr}:00`).toISOString();
      }

      if (values.scheduledEndDate) {
        const timeStr = values.scheduledEndTime || '10:00';
        endIso = new Date(`${values.scheduledEndDate}T${timeStr}:00`).toISOString();
      }

      await updateMutation.mutateAsync({
        id: activity.id,
        payload: {
          version: activity.version,
          activityType: values.activityType,
          subject: values.subject,
          description: values.description || null,
          direction: values.direction || null,
          priority: values.priority,
          owner: {
            kind: values.ownerKind,
            id: values.ownerId,
          },
          scheduledStartAt: startIso,
          scheduledEndAt: endIso,
        },
      });
      toast.success('Activity updated successfully.');
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update activity.');
    }
  };

  const handleConfirmTransition = async (payload: any) => {
    if (!activity) return;
    try {
      await transitionMutation.mutateAsync({
        id: activity.id,
        payload,
      });
      toast.success('Activity status updated.');
      setIsTransitionOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to transition activity.');
    }
  };

  const handleConfirmReschedule = async (payload: any) => {
    if (!activity) return;
    try {
      await rescheduleMutation.mutateAsync({
        id: activity.id,
        payload,
      });
      toast.success('Activity rescheduled.');
      setIsRescheduleOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reschedule activity.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!activity) return;
    try {
      await deleteMutation.mutateAsync({
        id: activity.id,
        version: activity.version,
      });
      toast.success('Activity deleted.');
      setIsDeleteOpen(false);
      navigate('/app/crm/activities');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete activity.');
    }
  };

  if (isLoadingDetail) {
    return (
      <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span>Loading activity workspace…</span>
      </div>
    );
  }

  if (isError || !activity) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center space-y-3 font-sans w-full shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900">Activity not found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The requested activity could not be found or you do not have authorization to view it.
          </p>
        </div>
      </div>
    );
  }

  const parseDateTime = (isoStr?: string | null) => {
    if (!isoStr) return { date: '', time: '' };
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return { date: '', time: '' };
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return { date, time };
    } catch {
      return { date: '', time: '' };
    }
  };

  const startParsed = parseDateTime(activity.scheduledStartAt);
  const endParsed = parseDateTime(activity.scheduledEndAt);

  const links = linksData?.items || [];
  const participants = participantsData?.items || [];
  const notes = notesData?.items || [];
  const statusHistory = historyData?.items || [];

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Workspace Header */}
      <ActivityDetailHeader
        activity={activity}
        canWrite={canWrite}
        onEdit={() => setIsEditOpen(true)}
        onTransition={(action) => {
          setTransitionAction(action as ActivityTransitionAction);
          setIsTransitionOpen(true);
        }}
        onReschedule={() => setIsRescheduleOpen(true)}
        onDelete={() => setIsDeleteOpen(true)}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="bg-[#EBECF0] p-1 rounded-[4px] border border-slate-200 inline-flex">
          <TabsTrigger
            value="overview"
            className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-2xs"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="related"
            className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-2xs"
          >
            Related Records ({links.length})
          </TabsTrigger>
          <TabsTrigger
            value="participants"
            className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-2xs"
          >
            Participants ({participants.length})
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="text-xs font-semibold rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-2xs"
          >
            Notes ({notes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="focus-visible:outline-none">
          <ActivityOverviewTab
            activity={activity}
            statusHistory={statusHistory}
            isLoadingHistory={isLoadingHistory}
          />
        </TabsContent>

        <TabsContent value="related" className="focus-visible:outline-none">
          <ActivityRelatedRecordsTab
            activityId={activity.id}
            links={links}
            canWrite={canWrite}
            onAddLink={async (payload) => {
              await addLinkMutation.mutateAsync({
                id: activity.id,
                payload,
              });
              toast.success('Record linked successfully.');
            }}
            onRemoveLink={async (linkId) => {
              await removeLinkMutation.mutateAsync({
                id: activity.id,
                linkId,
                version: activity.version,
              });
              toast.success('Link removed.');
            }}
            isLoading={isLoadingLinks}
          />
        </TabsContent>

        <TabsContent value="participants" className="focus-visible:outline-none">
          <ActivityParticipantsTab
            activityId={activity.id}
            participants={participants}
            canWrite={canWrite}
            onAddParticipant={async (payload) => {
              await addParticipantMutation.mutateAsync({
                id: activity.id,
                payload,
              });
              toast.success('Participant added.');
            }}
            onUpdateParticipant={async (partId, payload) => {
              await updateParticipantMutation.mutateAsync({
                id: activity.id,
                participantId: partId,
                payload,
              });
              toast.success('Participant updated.');
            }}
            onRemoveParticipant={async (partId, ver) => {
              await removeParticipantMutation.mutateAsync({
                id: activity.id,
                participantId: partId,
                version: ver || 1,
              });
              toast.success('Participant removed.');
            }}
            isLoading={isLoadingParticipants}
          />
        </TabsContent>

        <TabsContent value="notes" className="focus-visible:outline-none">
          <ActivityNotesTab
            activityId={activity.id}
            notes={notes}
            canWrite={canWrite}
            onAddNote={async (payload) => {
              await createNoteMutation.mutateAsync({
                id: activity.id,
                payload,
              });
              toast.success('Note added.');
            }}
            onUpdateNote={async (noteId, payload) => {
              await updateNoteMutation.mutateAsync({
                id: activity.id,
                noteId,
                payload,
              });
              toast.success('Note updated.');
            }}
            onDeleteNote={async (noteId, ver) => {
              await deleteNoteMutation.mutateAsync({
                id: activity.id,
                noteId,
                version: ver,
              });
              toast.success('Note deleted.');
            }}
            isLoading={isLoadingNotes}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Drawer Sheet */}
      {isEditOpen && (
        <ActivityFormSheet
          isOpen={isEditOpen}
          mode="edit"
          initialValues={{
            activityType: activity.activityType,
            subject: activity.subject,
            description: activity.description || null,
            direction: activity.direction || null,
            priority: activity.priority,
            ownerKind: activity.owner?.kind || 'USER',
            ownerId: activity.owner?.id || '',
            scheduledStartDate: startParsed.date,
            scheduledStartTime: startParsed.time,
            scheduledEndDate: endParsed.date,
            scheduledEndTime: endParsed.time,
            links: [],
            participants: [],
          }}
          isSubmitting={updateMutation.isPending}
          onSave={handleSaveEdit}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      {/* Transition Modal */}
      {isTransitionOpen && (
        <ActivityTransitionDialog
          isOpen={isTransitionOpen}
          activity={activity}
          defaultAction={transitionAction}
          isSubmitting={transitionMutation.isPending}
          onConfirm={handleConfirmTransition}
          onClose={() => setIsTransitionOpen(false)}
        />
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <ActivityRescheduleDialog
          isOpen={isRescheduleOpen}
          activity={activity}
          isSubmitting={rescheduleMutation.isPending}
          onConfirm={handleConfirmReschedule}
          onClose={() => setIsRescheduleOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <ActivityDeleteDialog
          isOpen={isDeleteOpen}
          activity={activity}
          isDeleting={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setIsDeleteOpen(false)}
        />
      )}
    </div>
  );
};
