import React from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
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

interface ActivityTableProps {
  activities: ActivitySummary[];
  canWrite: boolean;
  onEdit: (activity: ActivitySummary) => void;
  onTransition: (activity: ActivitySummary, action: string) => void;
  onReschedule: (activity: ActivitySummary) => void;
  onDelete: (activity: ActivitySummary) => void;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  activities,
  canWrite,
  onEdit,
  onTransition,
  onReschedule,
  onDelete,
}) => {
  const { resolveOwner } = useOwnerResolver();

  const renderPrimaryAction = (act: ActivitySummary) => {
    if (!canWrite) return null;

    if (act.status === 'PLANNED') {
      return (
        <ActionTooltip label="Start activity">
          <Button
            size="sm"
            onClick={() => onTransition(act, 'START')}
            className="h-7 px-2 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1 shadow-none"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Start</span>
          </Button>
        </ActionTooltip>
      );
    }

    if (act.status === 'IN_PROGRESS') {
      return (
        <ActionTooltip label="Complete activity">
          <Button
            size="sm"
            onClick={() => onTransition(act, 'COMPLETE')}
            className="h-7 px-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[3px] gap-1 shadow-none"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Complete</span>
          </Button>
        </ActionTooltip>
      );
    }

    if (act.status === 'DEFERRED') {
      return (
        <ActionTooltip label="Resume activity">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTransition(act, 'RESUME')}
            className="h-7 px-2 text-xs font-semibold border-slate-200 text-blue-700 rounded-[3px] gap-1"
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

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs overflow-hidden font-sans w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 min-w-[240px]">
                Activity
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 min-w-[180px]">
                Related Records
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 min-w-[170px]">
                Schedule
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 min-w-[130px]">
                Owner
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Priority
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((act) => {
              const ownerInfo = resolveOwner(act.owner);
              const visibleLinks = act.relatedRecords?.slice(0, 2) || [];
              const hiddenLinkCount = Math.max(0, (act.relatedRecordCount || 0) - visibleLinks.length);

              return (
                <TableRow key={act.id} className="hover:bg-[#F1F2F4] text-xs transition-colors">
                  {/* Activity Subject & Type */}
                  <TableCell className="py-2.5 px-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-[2px] bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                        {getActivityTypeIcon(act.activityType, 'w-3 h-3')}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <Link
                          to={`/app/crm/activities/${act.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 line-clamp-1 transition-colors"
                        >
                          {act.subject}
                        </Link>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="uppercase font-semibold">{act.activityType}</span>
                          {act.direction && <span>• {act.direction}</span>}
                          {act.participantCount > 0 && (
                            <span className="flex items-center gap-0.5">
                              • <Users className="w-2.5 h-2.5" /> {act.participantCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Related Records */}
                  <TableCell className="py-2.5 px-3">
                    {visibleLinks.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1 text-[11px]">
                        {visibleLinks.map((link) => (
                          <span
                            key={link.id}
                            className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 px-1.5 py-0.2 rounded-[2px]"
                            title={link.targetType}
                          >
                            <Building2 className="w-2.5 h-2.5 text-slate-400" />
                            <span className="truncate max-w-[120px]">
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
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No related record</span>
                    )}
                  </TableCell>

                  {/* Schedule */}
                  <TableCell className="py-2.5 px-3">
                    <span className="font-mono text-xs text-slate-700">
                      {formatActivitySchedule(act.scheduledStartAt, act.scheduledEndAt)}
                    </span>
                  </TableCell>

                  {/* Owner */}
                  <TableCell className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      {ownerInfo.type === 'USER' ? (
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <Users className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                      <span className={ownerInfo.isCurrentUser ? 'font-bold text-slate-900 truncate' : 'truncate'}>
                        {ownerInfo.label}
                      </span>
                    </div>
                  </TableCell>

                  {/* Priority */}
                  <TableCell className="py-2.5 px-3">
                    {renderActivityPriorityBadge(act.priority)}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-2.5 px-3">
                    {renderActivityStatusBadge(act.status)}
                  </TableCell>

                  {/* Contextual Actions */}
                  <TableCell className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {renderPrimaryAction(act)}

                      <ActionTooltip label="View details">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 rounded-[3px]"
                        >
                          <Link
                            to={`/app/crm/activities/${act.id}`}
                            aria-label={`View activity ${act.subject}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </ActionTooltip>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-600 rounded-[3px]"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
