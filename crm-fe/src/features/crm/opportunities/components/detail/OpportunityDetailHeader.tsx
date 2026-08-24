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
  renderOpportunityStatusBadge,
  renderOpportunityStageBadge,
} from '@/config/crmStatusConfig';
import { formatDateTime } from '@/lib/formatters';
import {
  OpportunityResponse,
  PipelineItem,
} from '../../model/opportunityTypes';
import { useOwnerResolver } from '../../hooks/useOwnerResolver';
import {
  TrendingUp,
  ChevronRight,
  Edit,
  ArrowRightCircle,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Trash2,
  User,
  Users,
  MoreHorizontal,
} from 'lucide-react';

interface OpportunityDetailHeaderProps {
  opportunity: OpportunityResponse;
  pipelines: PipelineItem[];
  canWrite: boolean;
  onEdit: () => void;
  onTransition: (action: string) => void;
  onDelete: () => void;
}

export const OpportunityDetailHeader: React.FC<OpportunityDetailHeaderProps> = ({
  opportunity: opp,
  pipelines,
  canWrite,
  onEdit,
  onTransition,
  onDelete,
}) => {
  const { resolveOwner } = useOwnerResolver();
  const ownerInfo = resolveOwner(opp.owner);

  const stageInfo = React.useMemo(() => {
    for (const p of pipelines) {
      const st = p.stages?.find((s) => s.id === opp.currentStageId);
      if (st) return { name: st.name, category: st.stageCategory, pipelineName: p.name };
    }
    return null;
  }, [pipelines, opp.currentStageId]);

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3 font-sans w-full">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/app/crm/opportunities" className="hover:text-blue-600 font-medium">
          Opportunities
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold truncate max-w-sm">
          {opp.name}
        </span>
      </div>

      {/* Main Identity Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
            <TrendingUp className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                {opp.name}
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-[2px]">
                {opp.opportunityNumber}
              </span>
              {renderOpportunityStageBadge(
                stageInfo?.name || `Stage: ${opp.currentStageId.slice(0, 6)}…`,
                stageInfo?.category
              )}
              {renderOpportunityStatusBadge(opp.status)}
            </div>
          </div>
        </div>

        {/* Right side: Amount, Owner & Actions */}
        <div className="flex items-center gap-4 shrink-0 self-start sm:self-center">
          <div className="hidden lg:flex flex-col items-end text-xs text-slate-500 pr-3 border-r border-slate-200">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              {opp.owner ? (
                <>
                  {ownerInfo.type === 'USER' ? (
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className={ownerInfo.isCurrentUser ? 'font-bold text-slate-900' : 'text-slate-800'}>
                    {ownerInfo.label}
                  </span>
                </>
              ) : (
                <span className="italic text-slate-400">Unassigned Owner</span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5">
              Updated: {formatDateTime(opp.updatedAt)}
            </span>
          </div>

          {/* Action Buttons */}
          {canWrite && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={onEdit}
                className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Opportunity</span>
              </Button>

              {opp.status === 'OPEN' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTransition('MOVE_STAGE')}
                  className="h-8 px-2.5 text-xs font-semibold border-slate-200 text-slate-700 rounded-[3px] gap-1.5"
                >
                  <ArrowRightCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Move Stage</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTransition('REOPEN')}
                  className="h-8 px-2.5 text-xs font-semibold border-slate-200 text-blue-700 rounded-[3px] gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Reopen Deal</span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-[3px] text-slate-600 hover:text-slate-900"
                    aria-label="More opportunity actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 text-xs font-sans">
                  {opp.status === 'OPEN' && (
                    <>
                      <DropdownMenuItem
                        onClick={() => onTransition('MARK_WON')}
                        className="gap-2 text-xs text-emerald-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark as Won</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onTransition('MARK_LOST')}
                        className="gap-2 text-xs text-rose-700"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Mark as Lost</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onTransition('CANCEL')}
                        className="gap-2 text-xs text-slate-600"
                      >
                        <Ban className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cancel Deal</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem
                    onClick={onDelete}
                    className="gap-2 text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Opportunity</span>
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
