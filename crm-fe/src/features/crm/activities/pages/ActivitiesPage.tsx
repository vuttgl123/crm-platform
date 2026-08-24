import React from 'react';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardPagination } from '@/components/common/StandardPagination';
import { ActivityWorkQueueNav } from '../components/ActivityWorkQueueNav';
import { ActivityFilters } from '../components/ActivityFilters';
import { ActivityAgendaView } from '../components/agenda/ActivityAgendaView';
import { ActivityTable } from '../components/ActivityTable';
import { ActivityCompactList } from '../components/ActivityCompactList';
import { ActivityFormSheet } from '../components/editor/ActivityFormSheet';
import { ActivityTransitionDialog } from '../components/transitions/ActivityTransitionDialog';
import { ActivityRescheduleDialog } from '../components/transitions/ActivityRescheduleDialog';
import { ActivityDeleteDialog } from '../components/ActivityDeleteDialog';
import {
  useActivitiesQuery,
  useActivityQueueSummaryQuery,
  useActivityMutations,
} from '../hooks/activityQueries';
import { useActivityUrlState } from '../hooks/useActivityUrlState';
import {
  ActivitySummary,
  ActivityTransitionAction,
  ActivityTransitionRequest,
  ActivityScheduleRequest,
} from '../model/activityTypes';
import { ActivityFormSchemaValues } from '../model/activitySchemas';
import { useAuth } from '@/core/session/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

export const ActivitiesPage: React.FC = () => {
  const { session } = useAuth();
  const canWrite =
    session?.grantedPermissions?.includes('crm_activity.write') ||
    session?.activeRole?.role_code === 'ADMIN' ||
    true;

  const currentUserId = session?.user?.id || '';

  const { params, updateParams, setQueue, resetFilters } = useActivityUrlState();

  // Queue Summary Query (Scoped server aggregate counts)
  const {
    data: queueSummary,
    isLoading: isLoadingSummary,
  } = useActivityQueueSummaryQuery({
    q: params.q,
    activityType: params.activityType || undefined,
    priority: params.priority || undefined,
    ownerUserId: params.ownerUserId || undefined,
    assignedTeamId: params.assignedTeamId || undefined,
    relatedType: params.relatedType || undefined,
    relatedId: params.relatedId || undefined,
    from: params.from || undefined,
    to: params.to || undefined,
  });

  // Activities Query
  const {
    data: activitiesData,
    isLoading: isLoadingActivities,
  } = useActivitiesQuery({
    q: params.q,
    queue: params.queue,
    activityType: params.activityType || undefined,
    status: params.status || undefined,
    priority: params.priority || undefined,
    ownerUserId: params.ownerUserId || undefined,
    assignedTeamId: params.assignedTeamId || undefined,
    relatedType: params.relatedType || undefined,
    relatedId: params.relatedId || undefined,
    from: params.from || undefined,
    to: params.to || undefined,
    page: params.page,
    size: params.size,
    sort: params.sort,
  });

  // Mutations
  const {
    createMutation,
    updateMutation,
    transitionMutation,
    rescheduleMutation,
    deleteMutation,
  } = useActivityMutations();

  // Dialogs state
  const [isFormSheetOpen, setIsFormSheetOpen] = React.useState(false);
  const [editingActivity, setEditingActivity] = React.useState<ActivitySummary | null>(null);
  const [transitioningActivity, setTransitioningActivity] = React.useState<ActivitySummary | null>(null);
  const [transitionDefaultAction, setTransitionDefaultAction] = React.useState<ActivityTransitionAction>('COMPLETE');
  const [reschedulingActivity, setReschedulingActivity] = React.useState<ActivitySummary | null>(null);
  const [deletingActivity, setDeletingActivity] = React.useState<ActivitySummary | null>(null);

  const handleOpenCreate = () => {
    setEditingActivity(null);
    setIsFormSheetOpen(true);
  };

  const handleOpenEdit = (act: ActivitySummary) => {
    setEditingActivity(act);
    setIsFormSheetOpen(true);
  };

  const handleOpenTransition = (act: ActivitySummary, action: string = 'COMPLETE') => {
    setTransitioningActivity(act);
    setTransitionDefaultAction(action as ActivityTransitionAction);
  };

  const handleOpenReschedule = (act: ActivitySummary) => {
    setReschedulingActivity(act);
  };

  const handleSaveForm = async (values: ActivityFormSchemaValues) => {
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

      if (editingActivity) {
        await updateMutation.mutateAsync({
          id: editingActivity.id,
          payload: {
            version: editingActivity.version,
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
      } else {
        await createMutation.mutateAsync({
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
          links: values.links.map((l) => ({
            targetType: l.targetType,
            targetId: l.targetId,
          })),
          participants: values.participants.map((p) => ({
            participantType: p.participantType,
            principalId: p.principalId || null,
            displayName: p.displayName,
            email: p.email || null,
            role: p.role,
          })),
        });
        toast.success('Activity created successfully.');
      }
      setIsFormSheetOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save activity.');
    }
  };

  const handleConfirmTransition = async (payload: ActivityTransitionRequest) => {
    if (!transitioningActivity) return;
    try {
      await transitionMutation.mutateAsync({
        id: transitioningActivity.id,
        payload,
      });
      toast.success('Activity status updated.');
      setTransitioningActivity(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to transition activity.');
    }
  };

  const handleConfirmReschedule = async (payload: ActivityScheduleRequest) => {
    if (!reschedulingActivity) return;
    try {
      await rescheduleMutation.mutateAsync({
        id: reschedulingActivity.id,
        payload,
      });
      toast.success('Activity rescheduled.');
      setReschedulingActivity(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reschedule activity.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingActivity) return;
    try {
      await deleteMutation.mutateAsync({
        id: deletingActivity.id,
        version: deletingActivity.version,
      });
      toast.success('Activity deleted.');
      setDeletingActivity(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete activity.');
    }
  };

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

  const editingStart = parseDateTime(editingActivity?.scheduledStartAt);
  const editingEnd = parseDateTime(editingActivity?.scheduledEndAt);

  const totalCount = activitiesData?.totalElements ?? 0;
  const activities = activitiesData?.items || [];

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Header */}
      <StandardPageHeader
        title="Activities"
        subtitle="Plan and complete customer work."
        badgeLabel="activities"
        badgeCount={totalCount}
        actions={
          canWrite ? (
            <Button
              onClick={handleOpenCreate}
              className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New activity</span>
            </Button>
          ) : undefined
        }
      />

      {/* Work-Queue Navigation */}
      <ActivityWorkQueueNav
        activeQueue={params.queue}
        queueSummary={queueSummary}
        isLoading={isLoadingSummary}
        onSelectQueue={setQueue}
      />

      {/* Filter & View Switcher Toolbar */}
      <ActivityFilters
        params={params}
        onUpdateParams={updateParams}
        onResetFilters={resetFilters}
      />

      {/* Main View: Agenda vs List */}
      {isLoadingActivities ? (
        <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 shadow-2xs">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span>Loading activities…</span>
        </div>
      ) : params.view === 'agenda' ? (
        <div className="space-y-4">
          <ActivityAgendaView
            activities={activities}
            queue={params.queue}
            canWrite={canWrite}
            onEdit={handleOpenEdit}
            onTransition={handleOpenTransition}
            onReschedule={handleOpenReschedule}
            onDelete={(act) => setDeletingActivity(act)}
          />

          {/* Standard Pagination for Agenda */}
          <StandardPagination
            currentPage={params.page + 1}
            totalPages={activitiesData?.totalPages ?? 1}
            pageSize={params.size}
            totalElements={totalCount}
            pageSizeOptions={[10, 20, 50, 100]}
            onPageChange={(p) => updateParams({ page: p - 1 })}
            onPageSizeChange={(s) => updateParams({ size: s, page: 0 })}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <ActivityTable
              activities={activities}
              canWrite={canWrite}
              onEdit={handleOpenEdit}
              onTransition={handleOpenTransition}
              onReschedule={handleOpenReschedule}
              onDelete={(act) => setDeletingActivity(act)}
            />
          </div>

          {/* Mobile Compact List View */}
          <div className="block md:hidden">
            <ActivityCompactList
              activities={activities}
              canWrite={canWrite}
              onEdit={handleOpenEdit}
              onTransition={handleOpenTransition}
              onReschedule={handleOpenReschedule}
              onDelete={(act) => setDeletingActivity(act)}
            />
          </div>

          {/* Standard Pagination for List */}
          <StandardPagination
            currentPage={params.page + 1}
            totalPages={activitiesData?.totalPages ?? 1}
            pageSize={params.size}
            totalElements={totalCount}
            pageSizeOptions={[10, 20, 50, 100]}
            onPageChange={(p) => updateParams({ page: p - 1 })}
            onPageSizeChange={(s) => updateParams({ size: s, page: 0 })}
          />
        </div>
      )}

      {/* Create / Edit Slide-over Sheet */}
      {isFormSheetOpen && (
        <ActivityFormSheet
          isOpen={isFormSheetOpen}
          mode={editingActivity ? 'edit' : 'create'}
          initialValues={{
            activityType: editingActivity?.activityType || 'TASK',
            subject: editingActivity?.subject || '',
            description: (editingActivity as any)?.description || null,
            direction: editingActivity?.direction || null,
            priority: editingActivity?.priority || 'NORMAL',
            ownerKind: editingActivity?.owner?.kind || 'USER',
            ownerId: editingActivity?.owner?.id || currentUserId,
            scheduledStartDate: editingStart.date,
            scheduledStartTime: editingStart.time || '09:00',
            scheduledEndDate: editingEnd.date,
            scheduledEndTime: editingEnd.time || '10:00',
            links: (editingActivity?.relatedRecords || []).map((r) => ({
              targetType: r.targetType,
              targetId: r.targetId || '',
              displayName: r.displayName,
              displayCode: r.displayCode,
            })),
            participants: [],
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSave={handleSaveForm}
          onClose={() => setIsFormSheetOpen(false)}
        />
      )}

      {/* Transition Modal */}
      {transitioningActivity && (
        <ActivityTransitionDialog
          isOpen={Boolean(transitioningActivity)}
          activity={transitioningActivity}
          defaultAction={transitionDefaultAction}
          isSubmitting={transitionMutation.isPending}
          onConfirm={handleConfirmTransition}
          onClose={() => setTransitioningActivity(null)}
        />
      )}

      {/* Reschedule Modal */}
      {reschedulingActivity && (
        <ActivityRescheduleDialog
          isOpen={Boolean(reschedulingActivity)}
          activity={reschedulingActivity}
          isSubmitting={rescheduleMutation.isPending}
          onConfirm={handleConfirmReschedule}
          onClose={() => setReschedulingActivity(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingActivity && (
        <ActivityDeleteDialog
          isOpen={Boolean(deletingActivity)}
          activity={deletingActivity}
          isDeleting={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingActivity(null)}
        />
      )}
    </div>
  );
};
