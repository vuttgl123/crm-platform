import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import { LeadStatusConfigMap } from '@/config/crmStatusConfig';
import { formatDate } from '@/lib/formatters';
import {
  LeadSummaryResponse,
  LeadStatusItem,
  LeadSourceItem,
  LeadRating,
} from '../model/leadTypes';
import {
  Eye,
  Edit,
  Trash2,
  PhoneCall,
  User,
  Users,
  Sparkles,
  UserCheck,
  CheckCircle2,
  MoreHorizontal,
  Flame,
  Sun,
  Snowflake,
} from 'lucide-react';

interface LeadsTableProps {
  leads: LeadSummaryResponse[];
  statuses: LeadStatusItem[];
  sources: LeadSourceItem[];
  canWrite: boolean;
  onView: (lead: LeadSummaryResponse) => void;
  onEdit: (lead: LeadSummaryResponse) => void;
  onDelete: (lead: LeadSummaryResponse) => void;
  onCalculateScore: (lead: LeadSummaryResponse) => void;
  onAutoAssign: (lead: LeadSummaryResponse) => void;
  onConvert: (lead: LeadSummaryResponse) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  statuses,
  sources,
  canWrite,
  onView,
  onEdit,
  onDelete,
  onCalculateScore,
  onAutoAssign,
  onConvert,
}) => {
  const statusMap = React.useMemo(() => {
    return new Map(statuses.map((s) => [s.id, s]));
  }, [statuses]);

  const sourceMap = React.useMemo(() => {
    return new Map(sources.map((src) => [src.id, src.name]));
  }, [sources]);

  const renderStatusBadge = (statusId: string) => {
    const status = statusMap.get(statusId);
    if (!status) {
      return (
        <Badge variant="outline" className="text-[11px] font-mono text-slate-500 rounded-[3px]">
          {statusId.slice(0, 8)}…
        </Badge>
      );
    }

    const config = LeadStatusConfigMap[status.statusCode];
    if (config) {
      return (
        <Badge className={`text-[11px] rounded-[3px] uppercase tracking-wider px-2 py-0.5 ${config.className}`}>
          {status.name}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-[11px] font-semibold text-slate-700 border-slate-200 rounded-[3px]">
        {status.name}
      </Badge>
    );
  };

  const renderRatingBadge = (rating?: LeadRating | null) => {
    if (!rating) return <span className="text-slate-400">—</span>;

    switch (rating) {
      case 'HOT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-[2px]">
            <Flame className="w-3 h-3 text-rose-600" />
            <span>HOT</span>
          </span>
        );
      case 'WARM':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-[2px]">
            <Sun className="w-3 h-3 text-amber-600" />
            <span>WARM</span>
          </span>
        );
      case 'COLD':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-[2px]">
            <Snowflake className="w-3 h-3 text-slate-400" />
            <span>COLD</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
            <TableRow className="hover:bg-[#F7F8F9]">
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 w-[220px]">
                Lead
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 w-[180px]">
                Company & Role
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Rating
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Source
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Est. Value
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Owner
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                Updated
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4 w-[110px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((l) => (
              <TableRow
                key={l.id}
                className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs transition-colors"
              >
                {/* Lead Name & Number */}
                <TableCell className="py-2.5 px-3">
                  <div className="flex flex-col">
                    <button
                      onClick={() => onView(l)}
                      className="font-bold text-xs text-slate-900 hover:text-blue-600 text-left line-clamp-1 transition-colors"
                    >
                      {l.displayName}
                    </button>
                    <span className="font-mono text-[11px] text-slate-400 mt-0.5">
                      {l.leadNumber}
                    </span>
                  </div>
                </TableCell>

                {/* Company & Role */}
                <TableCell className="py-2.5 px-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-800 line-clamp-1">
                      {l.companyName || '—'}
                    </span>
                    {l.jobTitle && (
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {l.jobTitle}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-2.5 px-3">
                  {renderStatusBadge(l.statusId)}
                </TableCell>

                {/* Rating */}
                <TableCell className="py-2.5 px-3">
                  {renderRatingBadge(l.rating)}
                </TableCell>

                {/* Source */}
                <TableCell className="py-2.5 px-3 text-xs text-slate-600">
                  {l.sourceId ? sourceMap.get(l.sourceId) || l.sourceId.slice(0, 8) : '—'}
                </TableCell>

                {/* Est. Value */}
                <TableCell className="py-2.5 px-3 text-xs font-mono font-semibold text-slate-800">
                  {l.estimatedValue
                    ? `${l.estimatedValue.amount.toLocaleString()} ${l.estimatedValue.currencyCode}`
                    : '—'}
                </TableCell>

                {/* Owner */}
                <TableCell className="py-2.5 px-3">
                  {l.owner ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      {l.owner.type === 'USER' ? (
                        <User className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className="font-mono text-[11px]">
                        {l.owner.type === 'USER' ? 'User' : 'Team'}: {l.owner.id.slice(0, 6)}…
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Unassigned</span>
                  )}
                </TableCell>

                {/* Updated */}
                <TableCell className="py-2.5 px-3 text-xs text-slate-500 font-mono">
                  {formatDate(l.updatedAt)}
                </TableCell>

                {/* Actions */}
                <TableCell className="py-2.5 px-3 text-right pr-4">
                  <div className="flex items-center justify-end gap-1">
                    {/* Truthful Quick Call Tel Action */}
                    {l.phoneE164 && (
                      <ActionTooltip label={`Call ${l.displayName} (${l.phoneE164})`}>
                        <a
                          href={`tel:${l.phoneE164}`}
                          className="h-7 w-7 rounded-[3px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-colors"
                          aria-label={`Call ${l.displayName}`}
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                      </ActionTooltip>
                    )}

                    <ActionTooltip label="View details">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(l)}
                        className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        aria-label={`View details for ${l.displayName}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </ActionTooltip>

                    {canWrite && (
                      <ActionTooltip label="Edit lead">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(l)}
                          className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          aria-label={`Edit lead ${l.displayName}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </ActionTooltip>
                    )}

                    {/* Extended Workflow Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-slate-900"
                          aria-label="More lead actions"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 text-xs font-sans">
                        <DropdownMenuItem onClick={() => onCalculateScore(l)} className="gap-2 text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>Calculate Score</span>
                        </DropdownMenuItem>

                        {canWrite && !l.convertedAt && (
                          <>
                            <DropdownMenuItem onClick={() => onAutoAssign(l)} className="gap-2 text-xs">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Auto-assign</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onConvert(l)} className="gap-2 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mark as Converted</span>
                            </DropdownMenuItem>
                          </>
                        )}

                        {canWrite && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(l)}
                              className="gap-2 text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Lead</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
