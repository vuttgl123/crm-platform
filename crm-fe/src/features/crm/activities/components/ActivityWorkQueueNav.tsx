import React from 'react';
import { ActivityQueuePreset, ActivityQueueSummary } from '../model/activityTypes';
import { cn } from '@/lib/utils';
import {
  Inbox,
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ListFilter,
  Loader2,
} from 'lucide-react';

interface ActivityWorkQueueNavProps {
  activeQueue: ActivityQueuePreset;
  queueSummary?: ActivityQueueSummary;
  isLoading: boolean;
  onSelectQueue: (queue: ActivityQueuePreset) => void;
}

export const ActivityWorkQueueNav: React.FC<ActivityWorkQueueNavProps> = ({
  activeQueue,
  queueSummary,
  isLoading,
  onSelectQueue,
}) => {
  const queues: {
    id: ActivityQueuePreset;
    label: string;
    icon: React.ReactNode;
    countKey?: keyof ActivityQueueSummary;
    badgeColor?: string;
  }[] = [
    {
      id: 'my-work',
      label: 'My work',
      icon: <Inbox className="w-3.5 h-3.5" />,
      countKey: 'myWork',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'overdue',
      label: 'Overdue',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />,
      countKey: 'overdue',
      badgeColor: 'bg-rose-100 text-rose-800 font-bold',
    },
    {
      id: 'today',
      label: 'Today',
      icon: <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />,
      countKey: 'today',
      badgeColor: 'bg-amber-100 text-amber-900 font-bold',
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />,
      countKey: 'upcoming',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      countKey: 'completed',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'all',
      label: 'All activities',
      icon: <ListFilter className="w-3.5 h-3.5 text-slate-500" />,
      countKey: 'all',
      badgeColor: 'bg-slate-200 text-slate-700',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-1.5 shadow-2xs overflow-x-auto font-sans w-full">
      <div className="flex items-center gap-1.5 min-w-max">
        {queues.map((q) => {
          const isActive = activeQueue === q.id;
          const count = q.countKey && queueSummary ? (queueSummary[q.countKey] as number) : undefined;

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQueue(q.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-[3px] text-xs font-semibold transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              )}
            >
              <span className="shrink-0">{q.icon}</span>
              <span>{q.label}</span>

              {isLoading && !queueSummary ? (
                <Loader2 className="w-3 h-3 animate-spin text-slate-400 ml-0.5" />
              ) : count !== undefined ? (
                <span
                  className={cn(
                    'font-mono text-[10px] px-1.5 py-0.2 rounded-[2px] ml-0.5',
                    isActive ? 'bg-blue-600 text-white font-bold' : q.badgeColor || 'bg-slate-100 text-slate-600'
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};
