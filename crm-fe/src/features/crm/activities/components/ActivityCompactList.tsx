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
import { getActivityTypeIcon } from '../utils/activityIconUtils';
import { formatActivitySchedule } from '../utils/activityDateUtils';
import { ActivitySummary } from '../model/activityTypes';
import { useOwnerResolver } from '../hooks/useOwnerResolver';
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
  User,
} from 'lucide-react';

interface ActivityCompactListProps {
  activities: ActivitySummary[];
  canWrite: boolean;
  onEdit: (activity: ActivitySummary) => void;
  onTransition: (activity: ActivitySummary, action: string) => void;
  onReschedule: (activity: ActivitySummary) => void;
  onDelete: (activity: ActivitySummary) => void;
}

export const ActivityCompactList: React.FC<ActivityCompactListProps> = ({
  activities,
  canWrite,
  onEdit,
  onTransition,
  onReschedule,
  onDelete,
}) => {
  const { resolveOwner } = useOwnerResolver();

  return (
    <div className="space-y-3 font-sans w-full">
      {activities.map((act) => {
        const ownerInfo = resolveOwner(act.owner);
        const visibleLinks = act.relatedRecords?.slice(0, 2) || [];
        const hiddenLinkCount = Math.max(0, (act.relatedRecordCount || 0) - visibleLinks.length);

        return (
          <div
            key={act.id}
            className="p-4 bg-white border border-slate-200 rounded-[4px] shadow-2xs space-y-3 text-xs"
          >
            {/* Top row: Subject, Badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-[2px] bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  {getActivityTypeIcon(act.activityType, 'w-3 h-3')}
                </div>
                <div>
                  <Link
                    to={`/app/crm/activities/${act.id}`}
                    className="font-bold text-sm text-slate-900 hover:text-blue-600 line-clamp-1 transition-colors"
                  >
                    {act.subject}
                  </Link>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                    <span className="uppercase font-semibold">{act.activityType}</span>
                    {act.direction && <span>• {act.direction}</span>}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 flex-wrap justify-end">
                {renderActivityPriorityBadge(act.priority)}
                {renderActivityStatusBadge(act.status)}
              </div>
            </div>

            {/* Middle metadata: Schedule, Owner, Related */}
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Schedule
                </span>
                <span className="font-mono text-slate-800 font-medium block mt-0.5 truncate">
                  {formatActivitySchedule(act.scheduledStartAt, act.scheduledEndAt)}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Owner
                </span>
                <div className="flex items-center gap-1 mt-0.5 text-slate-700">
                  {ownerInfo.type === 'USER' ? (
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                  ) : (
                    <Users className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate font-medium">{ownerInfo.label}</span>
                </div>
              </div>

              {visibleLinks.length > 0 && (
                <div className="col-span-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Related Records
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {visibleLinks.map((link) => (
                      <span
                        key={link.id}
                        className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded-[2px]"
                      >
                        <Building2 className="w-2.5 h-2.5 text-slate-400" />
                        <span className="truncate max-w-[140px]">
                          {link.accessible ? link.displayName : 'Restricted'}
                        </span>
                      </span>
                    ))}
                    {hiddenLinkCount > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        +{hiddenLinkCount}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom row: Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
              <span className="text-[11px] text-slate-400 font-mono">
                {act.participantCount > 0 && `${act.participantCount} participants`}
              </span>

              <div className="flex items-center gap-1">
                <ActionTooltip label="View details">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 rounded-[3px]"
                  >
                    <Link
                      to={`/app/crm/activities/${act.id}`}
                      aria-label={`View activity ${act.subject}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                </ActionTooltip>

                {canWrite && (
                  <ActionTooltip label="Edit activity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(act)}
                      className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 rounded-[3px]"
                      aria-label={`Edit activity ${act.subject}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </ActionTooltip>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-600 rounded-[3px]"
                      aria-label="More actions"
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
          </div>
        );
      })}
    </div>
  );
};
