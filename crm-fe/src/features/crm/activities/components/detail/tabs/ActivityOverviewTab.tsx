import React from 'react';
import {
  ActivityDetail,
  ActivityStatusHistoryEntry,
} from '../../../model/activityTypes';
import {
  renderActivityStatusBadge,
  renderActivityPriorityBadge,
} from '@/config/crmStatusConfig';
import { formatDateTime } from '@/lib/formatters';
import { getActivityTypeIcon } from '../../../utils/activityIconUtils';
import { useOwnerResolver } from '../../../hooks/useOwnerResolver';
import {
  Calendar,
  Clock,
  FileText,
  ShieldCheck,
  CheckCircle2,
  History,
  ArrowRight,
  User,
  Users,
} from 'lucide-react';

interface ActivityOverviewTabProps {
  activity: ActivityDetail;
  statusHistory: ActivityStatusHistoryEntry[];
  isLoadingHistory: boolean;
}

export const ActivityOverviewTab: React.FC<ActivityOverviewTabProps> = ({
  activity: act,
  statusHistory,
  isLoadingHistory,
}) => {
  const { resolveOwner } = useOwnerResolver();
  const ownerInfo = resolveOwner(act.owner);

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* 2-COLUMN METADATA GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SECTION 1: IDENTITY & PARAMETERS */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Activity Parameters</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Activity Type:</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                {getActivityTypeIcon(act.activityType, 'w-3.5 h-3.5')}
                <span>{act.activityType}</span>
              </div>
            </div>

            {act.direction && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Direction:</span>
                <span className="font-semibold text-slate-800">{act.direction}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status:</span>
              <span>{renderActivityStatusBadge(act.status)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Priority:</span>
              <span>{renderActivityPriorityBadge(act.priority)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: SCHEDULE & TIMING */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Schedule & Timing</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Scheduled Start:</span>
              <span className="font-mono font-semibold text-slate-800">
                {act.scheduledStartAt ? formatDateTime(act.scheduledStartAt) : 'Not scheduled'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Scheduled End:</span>
              <span className="font-mono font-semibold text-slate-800">
                {act.scheduledEndAt ? formatDateTime(act.scheduledEndAt) : '—'}
              </span>
            </div>

            {act.completedAt && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Completed At:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatDateTime(act.completedAt)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Timezone:</span>
              <span className="font-mono text-[11px] text-slate-500">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: OWNERSHIP */}
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ownership Assignment</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Owner Kind:</span>
              <span className="font-mono text-xs font-semibold text-slate-700">
                {ownerInfo.type}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] block">Assigned Owner</span>
              <div className="flex items-center gap-1.5 pt-0.5 text-slate-800">
                {ownerInfo.type === 'USER' ? (
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : (
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className="font-semibold">{ownerInfo.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: OUTCOME SUMMARY (When Completed) */}
        {act.status === 'COMPLETED' && (
          <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Completion Outcome</span>
            </div>

            <div className="space-y-2 pt-1">
              {act.outcomeCode && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Outcome Code:</span>
                  <span className="font-mono font-bold text-slate-800">{act.outcomeCode}</span>
                </div>
              )}

              <div>
                <span className="text-slate-400 text-[10px] block">Completion Notes</span>
                <p className="text-slate-700 italic pt-0.5">
                  {(act as any).outcomeNotes || 'No outcome notes recorded'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: DESCRIPTION */}
      {act.description && (
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
            Activity Description & Objectives
          </span>
          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
            {act.description}
          </p>
        </div>
      )}

      {/* SECTION 6: RECENT STATUS HISTORY */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <History className="w-4 h-4 text-purple-600" />
          <span className="text-xs uppercase tracking-wider">Lifecycle Status History</span>
        </div>

        {isLoadingHistory ? (
          <div className="py-4 text-center text-slate-400">Loading history…</div>
        ) : statusHistory.length === 0 ? (
          <div className="py-4 text-center text-slate-400 italic">
            No status transitions recorded yet
          </div>
        ) : (
          <div className="space-y-3">
            {statusHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-[3px] text-xs"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {entry.fromStatus && (
                    <>
                      {renderActivityStatusBadge(entry.fromStatus)}
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </>
                  )}
                  {renderActivityStatusBadge(entry.toStatus)}
                  {entry.reason && (
                    <span className="text-slate-600 text-[11px] italic">
                      — &quot;{entry.reason}&quot;
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  {entry.changedBy && <span>by {entry.changedBy}</span>}
                  <span>{formatDateTime(entry.changedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AUDIT METADATA */}
      <div className="p-3 rounded-[4px] bg-slate-100/80 border border-slate-200 text-[11px] text-slate-500 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Created: {formatDateTime(act.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Updated: {formatDateTime(act.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};
