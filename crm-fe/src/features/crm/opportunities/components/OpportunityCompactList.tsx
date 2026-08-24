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
  renderOpportunityStatusBadge,
  renderOpportunityStageBadge,
} from '@/config/crmStatusConfig';
import { formatDate } from '@/lib/formatters';
import {
  OpportunitySummaryResponse,
  PipelineItem,
} from '../model/opportunityTypes';
import { useOwnerResolver } from '../hooks/useOwnerResolver';
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  User,
  Users,
  ArrowRightCircle,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
} from 'lucide-react';

interface OpportunityCompactListProps {
  opportunities: OpportunitySummaryResponse[];
  pipelines: PipelineItem[];
  accountsMap: Map<string, { displayName: string; accountNumber?: string }>;
  canWrite: boolean;
  onEdit: (opp: OpportunitySummaryResponse) => void;
  onTransition: (opp: OpportunitySummaryResponse, action?: string) => void;
  onDelete: (opp: OpportunitySummaryResponse) => void;
}

export const OpportunityCompactList: React.FC<OpportunityCompactListProps> = ({
  opportunities,
  pipelines,
  accountsMap,
  canWrite,
  onEdit,
  onTransition,
  onDelete,
}) => {
  const { resolveOwner } = useOwnerResolver();

  const stageMap = React.useMemo(() => {
    const map = new Map<string, { name: string; category?: string }>();
    pipelines.forEach((p) => {
      p.stages?.forEach((st) => {
        map.set(st.id, {
          name: st.name,
          category: st.stageCategory,
        });
      });
    });
    return map;
  }, [pipelines]);

  return (
    <div className="space-y-3 font-sans w-full">
      {opportunities.map((opp) => {
        const account = accountsMap.get(opp.accountId);
        const stageInfo = stageMap.get(opp.currentStageId);
        const ownerInfo = resolveOwner(opp.owner);

        return (
          <div
            key={opp.id}
            className="p-4 bg-white border border-slate-200 rounded-[4px] shadow-2xs space-y-3"
          >
            {/* Top row: Name, Number, Badges */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  to={`/app/crm/opportunities/${opp.id}`}
                  className="font-bold text-sm text-slate-900 hover:text-blue-600 line-clamp-1 transition-colors"
                >
                  {opp.name}
                </Link>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs text-slate-400">
                    {opp.opportunityNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    • {opp.opportunityType.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1 flex-wrap justify-end">
                {renderOpportunityStageBadge(
                  stageInfo?.name || `Stage: ${opp.currentStageId.slice(0, 6)}…`,
                  stageInfo?.category
                )}
                {renderOpportunityStatusBadge(opp.status)}
              </div>
            </div>

            {/* Middle metadata: Account, Amount, Expected Close */}
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Account Organization
                </span>
                <span className="text-slate-800 font-medium line-clamp-1 mt-0.5">
                  {account?.displayName || (opp.accountId ? `Account: ${opp.accountId.slice(0, 8)}…` : '—')}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Deal Value
                </span>
                <span className="font-mono font-bold text-slate-900 line-clamp-1 mt-0.5">
                  {opp.amount?.amount !== undefined
                    ? `${opp.amount.amount.toLocaleString()} ${opp.amount.currencyCode}`
                    : '—'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Probability
                </span>
                <span className="font-mono font-semibold text-slate-700 mt-0.5 block">
                  {opp.probability}%
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Owner
                </span>
                <div className="flex items-center gap-1 mt-0.5 text-slate-700">
                  {opp.owner ? (
                    <>
                      {ownerInfo.type === 'USER' ? (
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <Users className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                      <span className="line-clamp-1 font-medium">{ownerInfo.label}</span>
                    </>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom row: Updated & Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
              <span className="text-[11px] text-slate-400 font-mono">
                Updated: {formatDate(opp.updatedAt)}
              </span>

              <div className="flex items-center gap-1">
                <ActionTooltip label="View opportunity workspace">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 rounded-[3px]"
                  >
                    <Link
                      to={`/app/crm/opportunities/${opp.id}`}
                      aria-label={`View opportunity ${opp.name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                </ActionTooltip>

                {canWrite && (
                  <ActionTooltip label="Edit opportunity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(opp)}
                      className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 rounded-[3px]"
                      aria-label={`Edit opportunity ${opp.name}`}
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
                  <DropdownMenuContent align="end" className="w-48 text-xs font-sans">
                    <DropdownMenuItem asChild className="gap-2 text-xs">
                      <Link to={`/app/crm/opportunities/${opp.id}`}>
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Workspace</span>
                      </Link>
                    </DropdownMenuItem>

                    {canWrite && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit(opp)} className="gap-2 text-xs">
                          <Edit className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit Opportunity</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {opp.status === 'OPEN' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onTransition(opp, 'MOVE_STAGE')}
                              className="gap-2 text-xs"
                            >
                              <ArrowRightCircle className="w-3.5 h-3.5 text-blue-600" />
                              <span>Move to Stage…</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onTransition(opp, 'MARK_WON')}
                              className="gap-2 text-xs text-emerald-700"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mark as Won</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onTransition(opp, 'MARK_LOST')}
                              className="gap-2 text-xs text-rose-700"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Mark as Lost</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onTransition(opp, 'CANCEL')}
                              className="gap-2 text-xs text-slate-600"
                            >
                              <Ban className="w-3.5 h-3.5 text-slate-500" />
                              <span>Cancel Deal</span>
                            </DropdownMenuItem>
                          </>
                        )}

                        {opp.status !== 'OPEN' && (
                          <DropdownMenuItem
                            onClick={() => onTransition(opp, 'REOPEN')}
                            className="gap-2 text-xs text-blue-700"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                            <span>Reopen Deal</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(opp)}
                          className="gap-2 text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Opportunity</span>
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
