import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import {
  renderActivityStatusBadge,
  renderActivityPriorityBadge,
} from '@/config/crmStatusConfig';
import { getActivityTypeIcon } from '../../utils/activityIconUtils';
import { formatActivityTime } from '../../utils/activityDateUtils';
import { ActivitySummary } from '../../model/activityTypes';
import { useOwnerResolver } from '../../hooks/useOwnerResolver';
import {
  Play,
  CheckCircle2,
  Pause,
  RotateCcw,
  Ban,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Building2,
} from 'lucide-react';

interface ActivityAgendaItemProps {
  activity: ActivitySummary;
  canWrite: boolean;
  onEdit: (activity: ActivitySummary) => void;
  onTransition: (activity: ActivitySummary, action: string) => void;
  onReschedule: (activity: ActivitySummary) => void;
  onDelete: (activity: ActivitySummary) => void;
}

export const ActivityAgendaItem: React.FC<ActivityAgendaItemProps> = ({
  activity: act,
  canWrite,
  onEdit,
  onTransition,
  onReschedule,
  onDelete,
}) => {
  const { resolveOwner } = useOwnerResolver();
  const ownerInfo = resolveOwner(act.owner);

  const startTimeStr = formatActivityTime(act.scheduledStartAt);
  const endTimeStr = formatActivityTime(act.scheduledEndAt);
  const timeDisplay = startTimeStr
    ? endTimeStr
      ? `${startTimeStr} – ${endTimeStr}`
      : startTimeStr
    : 'No time';

  // Determine Primary Contextual Action based on status
  const renderPrimaryAction = () => {
    if (!canWrite) return null;

    if (act.status === 'PLANNED') {
      return (
        <ActionTooltip label="Start working on this activity">
          <Button
            size="sm"
            onClick={() => onTransition(act, 'START')}
            className="h-7 px-2.5 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1 shadow-none"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Start</span>
          </Button>
        </ActionTooltip>
      );
    }

    if (act.status === 'IN_PROGRESS') {
      return (
        <ActionTooltip label="Mark activity as completed">
          <Button
            size="sm"
            onClick={() => onTransition(act, 'COMPLETE')}
            className="h-7 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[3px] gap-1 shadow-none"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Complete</span>
          </Button>
        </ActionTooltip>
      );
    }

    if (act.status === 'DEFERRED') {
      return (
        <ActionTooltip label="Resume deferred activity">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTransition(act, 'RESUME')}
            className="h-7 px-2.5 text-xs font-semibold border-slate-200 text-blue-700 rounded-[3px] gap-1"
          >
            <Play className="w-3 h-3" />
            <span>Resume</span>
          </Button>
        </ActionTooltip>
      );
    }

    if (act.status === 'COMPLETED' || act.status === 'CANCELLED') {
      return (
        <ActionTooltip label="Reopen activity">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTransition(act, 'REOPEN')}
            className="h-7 px-2 text-xs font-semibold border-slate-200 text-slate-700 rounded-[3px] gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reopen</span>
          </Button>
        </ActionTooltip>
      );
    }

    return null;
  };

  const visibleLinks = act.relatedRecords?.slice(0, 2) || [];
  const hiddenLinkCount = Math.max(0, (act.relatedRecordCount || 0) - visibleLinks.length);

  return (
    <div className="p-3.5 bg-white border border-slate-200 rounded-[4px] shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans group">
      {/* Left Column: Time & Identity */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Time Badge */}
        <div className="shrink-0 w-24 pt-0.5">
          <span className="font-mono text-xs font-semibold text-slate-700 block">
            {timeDisplay}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            {act.activityType}
          </span>
        </div>

        {/* Type Icon */}
        <div className="w-7 h-7 rounded-[3px] bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
          {getActivityTypeIcon(act.activityType, 'w-3.5 h-3.5')}
        </div>

        {/* Subject, Status & Related Records */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/app/crm/activities/${act.id}`}
              className="font-bold text-xs text-slate-900 hover:text-blue-600 line-clamp-1 transition-colors"
            >
              {act.subject}
            </Link>
            {renderActivityPriorityBadge(act.priority)}
            {renderActivityStatusBadge(act.status)}
          </div>

          {/* Related Records & Participants */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 pt-0.5">
            {visibleLinks.map((link) => (
              <span
                key={link.id}
                className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 px-1.5 py-0.2 rounded-[2px]"
                title={link.targetType}
              >
                <Building2 className="w-2.5 h-2.5 text-slate-400" />
                <span className="truncate max-w-[140px] font-medium">
                  {link.accessible ? link.displayName : 'Restricted record'}
                </span>
              </span>
            ))}

            {hiddenLinkCount > 0 && (
              <span className="text-[10px] text-slate-400 font-semibold font-mono">
                +{hiddenLinkCount} more
              </span>
            )}

            {act.participantCount > 0 && (
              <span className="inline-flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{act.participantCount}</span>
              </span>
            )}

            {/* Resolved Owner */}
            <span className="text-slate-400 inline-flex items-center gap-1">
              • Owner: <span className="text-slate-700 font-medium">{ownerInfo.label}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Actions */}
      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        {renderPrimaryAction()}

        {/* Overflow Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-600 rounded-[3px]"
              aria-label="Activity options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-xs font-sans">
            <DropdownMenuItem asChild className="gap-2 text-xs">
              <Link to={`/app/crm/activities/${act.id}`}>
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>View Details</span>
              </Link>
            </DropdownMenuItem>

            {canWrite && (
              <>
                <DropdownMenuItem onClick={() => onEdit(act)} className="gap-2 text-xs">
                  <Edit className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit Activity</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onReschedule(act)} className="gap-2 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Reschedule…</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {act.status === 'PLANNED' && (
                  <DropdownMenuItem
                    onClick={() => onTransition(act, 'START')}
                    className="gap-2 text-xs text-blue-700"
                  >
                    <Play className="w-3.5 h-3.5 text-blue-600" />
                    <span>Start Activity</span>
                  </DropdownMenuItem>
                )}

                {act.status === 'IN_PROGRESS' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onTransition(act, 'COMPLETE')}
                      className="gap-2 text-xs text-emerald-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Complete Activity</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onTransition(act, 'DEFER')}
                      className="gap-2 text-xs text-amber-700"
                    >
                      <Pause className="w-3.5 h-3.5 text-amber-600" />
                      <span>Defer Activity</span>
                    </DropdownMenuItem>
                  </>
                )}

                {act.status !== 'COMPLETED' && act.status !== 'CANCELLED' && (
                  <DropdownMenuItem
                    onClick={() => onTransition(act, 'CANCEL')}
                    className="gap-2 text-xs text-slate-600"
                  >
                    <Ban className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cancel Activity</span>
                  </DropdownMenuItem>
                )}

                {(act.status === 'COMPLETED' || act.status === 'CANCELLED') && (
                  <DropdownMenuItem
                    onClick={() => onTransition(act, 'REOPEN')}
                    className="gap-2 text-xs text-blue-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Reopen Activity</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(act)}
                  className="gap-2 text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Activity</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
