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

interface OpportunityTableProps {
  opportunities: OpportunitySummaryResponse[];
  pipelines: PipelineItem[];
  accountsMap: Map<string, { displayName: string; accountNumber?: string }>;
  canWrite: boolean;
  onEdit: (opp: OpportunitySummaryResponse) => void;
  onTransition: (opp: OpportunitySummaryResponse, action?: string) => void;
  onDelete: (opp: OpportunitySummaryResponse) => void;
}

export const OpportunityTable: React.FC<OpportunityTableProps> = ({
  opportunities,
  pipelines,
  accountsMap,
  canWrite,
  onEdit,
  onTransition,
  onDelete,
}) => {
  const { resolveOwner } = useOwnerResolver();

  // Create quick lookup for stage name by stageId
  const stageMap = React.useMemo(() => {
    const map = new Map<string, { name: string; category?: string; pipelineName?: string }>();
    pipelines.forEach((p) => {
      p.stages?.forEach((st) => {
        map.set(st.id, {
          name: st.name,
          category: st.stageCategory,
          pipelineName: p.name,
        });
      });
    });
    return map;
  }, [pipelines]);

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden w-full font-sans">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
            <TableRow className="hover:bg-[#F7F8F9]">
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 min-w-[240px]">
                Opportunity
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 min-w-[180px]">
                Account Organization
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Pipeline Stage
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right">
                Value Amount
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Probability
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Expected Close
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Owner
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4 w-[90px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opp) => {
              const account = accountsMap.get(opp.accountId);
              const stageInfo = stageMap.get(opp.currentStageId);
              const ownerInfo = resolveOwner(opp.owner);

              return (
                <TableRow
                  key={opp.id}
                  className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs transition-colors"
                >
                  {/* Opportunity Name & Number */}
                  <TableCell className="py-2.5 px-3">
                    <div className="flex flex-col">
                      <Link
                        to={`/app/crm/opportunities/${opp.id}`}
                        className="font-bold text-xs text-slate-900 hover:text-blue-600 text-left line-clamp-1 transition-colors"
                      >
                        {opp.name}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] text-slate-400">
                          {opp.opportunityNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          • {opp.opportunityType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Account Name */}
                  <TableCell className="py-2.5 px-3">
                    {opp.accountId ? (
                      <Link
                        to={`/app/crm/accounts/${opp.accountId}`}
                        className="font-medium text-xs text-slate-800 hover:text-blue-600 line-clamp-1"
                      >
                        {account?.displayName || `Account: ${opp.accountId.slice(0, 8)}…`}
                      </Link>
                    ) : (
                      <span className="text-slate-400 italic">No account</span>
                    )}
                  </TableCell>

                  {/* Stage */}
                  <TableCell className="py-2.5 px-3">
                    {renderOpportunityStageBadge(
                      stageInfo?.name || `Stage: ${opp.currentStageId.slice(0, 6)}…`,
                      stageInfo?.category
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-2.5 px-3">
                    {renderOpportunityStatusBadge(opp.status)}
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {opp.amount?.amount !== undefined
                      ? `${opp.amount.amount.toLocaleString()} ${opp.amount.currencyCode}`
                      : '—'}
                  </TableCell>

                  {/* Probability */}
                  <TableCell className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                        <div
                          className={`h-full ${
                            opp.probability >= 70
                              ? 'bg-emerald-500'
                              : opp.probability >= 40
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, opp.probability))}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-slate-700">
                        {opp.probability}%
                      </span>
                    </div>
                  </TableCell>

                  {/* Expected Close */}
                  <TableCell className="py-2.5 px-3 text-xs text-slate-600 font-mono">
                    {opp.expectedCloseDate ? formatDate(opp.expectedCloseDate) : '—'}
                  </TableCell>

                  {/* Owner */}
                  <TableCell className="py-2.5 px-3">
                    {opp.owner ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        {ownerInfo.type === 'USER' ? (
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span
                          className={`line-clamp-1 ${
                            ownerInfo.isCurrentUser ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                          }`}
                        >
                          {ownerInfo.label}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </TableCell>

                  {/* Row Actions */}
                  <TableCell className="py-2.5 px-3 text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <ActionTooltip label="View opportunity workspace">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Link
                            to={`/app/crm/opportunities/${opp.id}`}
                            aria-label={`View opportunity ${opp.name}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </ActionTooltip>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-slate-900"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
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
                              <DropdownMenuItem
                                onClick={() => onEdit(opp)}
                                className="gap-2 text-xs"
                              >
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
