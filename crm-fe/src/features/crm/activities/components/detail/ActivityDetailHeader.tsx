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
import {
  renderActivityStatusBadge,
  renderActivityPriorityBadge,
} from '@/config/crmStatusConfig';
import { getActivityTypeIcon } from '../../utils/activityIconUtils';
import { formatActivitySchedule } from '../../utils/activityDateUtils';
import { ActivityDetail } from '../../model/activityTypes';
import { useOwnerResolver } from '../../hooks/useOwnerResolver';
import {
  ChevronRight,
  Play,
  CheckCircle2,
  Pause,
  RotateCcw,
  Ban,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  Users,
} from 'lucide-react';

interface ActivityDetailHeaderProps {
  activity: ActivityDetail;
  canWrite: boolean;
  onEdit: () => void;
  onTransition: (action: string) => void;
  onReschedule: () => void;
  onDelete: () => void;
}

export const ActivityDetailHeader: React.FC<ActivityDetailHeaderProps> = ({
  activity: act,
  canWrite,
  onEdit,
  onTransition,
  onReschedule,
  onDelete,
}) => {
  const { resolveOwner } = useOwnerResolver();
  const ownerInfo = resolveOwner(act.owner);

  const renderPrimaryAction = () => {
    if (!canWrite) return null;

    if (act.status === 'PLANNED') {
      return (
        <Button
          size="sm"
          onClick={() => onTransition('START')}
          className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Start Activity</span>
        </Button>
      );
    }

    if (act.status === 'IN_PROGRESS') {
      return (
        <Button
          size="sm"
          onClick={() => onTransition('COMPLETE')}
          className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[3px] gap-1.5 shadow-none"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Complete Activity</span>
        </Button>
      );
    }

    if (act.status === 'DEFERRED') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTransition('RESUME')}
          className="h-8 px-3 text-xs font-semibold border-slate-200 text-blue-700 rounded-[3px] gap-1.5"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Resume</span>
        </Button>
      );
    }

    if (act.status === 'COMPLETED' || act.status === 'CANCELLED') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTransition('REOPEN')}
          className="h-8 px-3 text-xs font-semibold border-slate-200 text-slate-700 rounded-[3px] gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reopen Activity</span>
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3 font-sans w-full">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/app/crm/activities" className="hover:text-blue-600 font-medium">
          Activities
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold truncate max-w-sm">
          {act.subject}
        </span>
      </div>

      {/* Main Identity Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[4px] bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0 mt-0.5 border border-slate-200">
            {getActivityTypeIcon(act.activityType, 'w-5 h-5')}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                {act.subject}
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-[2px] uppercase">
                {act.activityType}
              </span>
              {act.direction && (
                <span className="text-xs text-slate-500 font-medium">
                  • {act.direction}
                </span>
              )}
              {renderActivityPriorityBadge(act.priority)}
              {renderActivityStatusBadge(act.status)}
            </div>
          </div>
        </div>

        {/* Right side: Owner & Actions */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <div className="hidden lg:flex flex-col items-end text-xs text-slate-500 pr-3 border-r border-slate-200">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              {ownerInfo.type === 'USER' ? (
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              ) : (
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span className={ownerInfo.isCurrentUser ? 'font-bold text-slate-900' : 'text-slate-800'}>
                {ownerInfo.label}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5">
              Schedule: {formatActivitySchedule(act.scheduledStartAt, act.scheduledEndAt)}
            </span>
          </div>

          {/* Action Buttons */}
          {canWrite && (
            <div className="flex items-center gap-2">
              {renderPrimaryAction()}

              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="h-8 px-2.5 text-xs font-semibold border-slate-200 text-slate-700 rounded-[3px] gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onReschedule}
                className="h-8 px-2.5 text-xs font-semibold border-slate-200 text-slate-700 rounded-[3px] gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Reschedule</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-[3px] text-slate-600 hover:text-slate-900"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 text-xs font-sans">
                  {act.status === 'IN_PROGRESS' && (
                    <DropdownMenuItem
                      onClick={() => onTransition('DEFER')}
                      className="gap-2 text-xs text-amber-700"
                    >
                      <Pause className="w-3.5 h-3.5 text-amber-600" />
                      <span>Defer Activity</span>
                    </DropdownMenuItem>
                  )}

                  {act.status !== 'COMPLETED' && act.status !== 'CANCELLED' && (
                    <DropdownMenuItem
                      onClick={() => onTransition('CANCEL')}
                      className="gap-2 text-xs text-slate-600"
                    >
                      <Ban className="w-3.5 h-3.5 text-slate-500" />
                      <span>Cancel Activity</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="gap-2 text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Activity</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
