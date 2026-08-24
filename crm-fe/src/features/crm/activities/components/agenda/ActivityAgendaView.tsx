import React from 'react';
import { ActivitySummary, ActivityQueuePreset } from '../../model/activityTypes';
import { groupActivitiesForAgenda } from '../../utils/activityDateUtils';
import { ActivityAgendaItem } from './ActivityAgendaItem';
import {
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  Clock,
  Inbox,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityAgendaViewProps {
  activities: ActivitySummary[];
  queue: ActivityQueuePreset;
  canWrite: boolean;
  onEdit: (activity: ActivitySummary) => void;
  onTransition: (activity: ActivitySummary, action: string) => void;
  onReschedule: (activity: ActivitySummary) => void;
  onDelete: (activity: ActivitySummary) => void;
}

export const ActivityAgendaView: React.FC<ActivityAgendaViewProps> = ({
  activities,
  queue,
  canWrite,
  onEdit,
  onTransition,
  onReschedule,
  onDelete,
}) => {
  const groups = React.useMemo(
    () => groupActivitiesForAgenda(activities),
    [activities]
  );

  if (activities.length === 0) {
    let emptyTitle = 'No activities found';
    let emptySubtitle = 'No activities match the current filter criteria.';
    let emptyIcon = <Inbox className="w-6 h-6 text-slate-400" />;

    if (queue === 'my-work') {
      emptyTitle = 'No work is due in this window';
      emptySubtitle = 'You are all caught up on your scheduled tasks and activities.';
      emptyIcon = <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
    } else if (queue === 'today') {
      emptyTitle = 'Nothing is scheduled for today';
      emptySubtitle = 'Check upcoming or overdue queues to plan your agenda.';
      emptyIcon = <CalendarCheck className="w-6 h-6 text-blue-500" />;
    } else if (queue === 'overdue') {
      emptyTitle = 'No overdue activities';
      emptySubtitle = 'Great job! There are no outstanding overdue tasks.';
      emptyIcon = <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
    }

    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center space-y-3 font-sans w-full shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto border border-slate-100">
          {emptyIcon}
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900">{emptyTitle}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{emptySubtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans w-full">
      {groups.map((group) => (
        <div key={group.id} className="space-y-2.5">
          {/* Group Header */}
          <div
            className={cn(
              'flex items-center justify-between px-3 py-1.5 rounded-[4px] border text-xs font-bold',
              group.isOverdue
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : group.isToday
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : group.isUnscheduled
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
            )}
          >
            <div className="flex items-center gap-1.5">
              {group.isOverdue ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              ) : group.isToday ? (
                <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
              ) : group.isUnscheduled ? (
                <Clock className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span className="uppercase tracking-wider text-[11px]">{group.title}</span>
            </div>

            <span
              className={cn(
                'font-mono text-[10px] px-1.5 py-0.2 rounded-[2px] font-semibold',
                group.isOverdue
                  ? 'bg-rose-600 text-white'
                  : group.isToday
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              )}
            >
              {group.items.length} {group.items.length === 1 ? 'activity' : 'activities'}
            </span>
          </div>

          {/* Group Items List */}
          <div className="space-y-2">
            {group.items.map((act) => (
              <ActivityAgendaItem
                key={act.id}
                activity={act}
                canWrite={canWrite}
                onEdit={onEdit}
                onTransition={onTransition}
                onReschedule={onReschedule}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
