import React from 'react';
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
  Sparkles,
  UserCheck,
  CheckCircle2,
  MoreHorizontal,
  Flame,
  Sun,
  Snowflake,
} from 'lucide-react';

interface LeadCompactListProps {
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

export const LeadCompactList: React.FC<LeadCompactListProps> = ({
  leads,
  statuses,
  sources: _sources,
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

  const renderStatusBadge = (statusId: string) => {
    const status = statusMap.get(statusId);
    if (!status) {
      return (
        <Badge variant="outline" className="text-[10px] font-mono text-slate-500 rounded-[3px]">
          {statusId.slice(0, 8)}…
        </Badge>
      );
    }

    const config = LeadStatusConfigMap[status.statusCode];
    if (config) {
      return (
        <Badge className={`text-[10px] rounded-[3px] uppercase tracking-wider px-1.5 py-0.5 ${config.className}`}>
          {status.name}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-[10px] font-semibold text-slate-700 border-slate-200 rounded-[3px]">
        {status.name}
      </Badge>
    );
  };

  const renderRatingBadge = (rating?: LeadRating | null) => {
    if (!rating) return null;

    switch (rating) {
      case 'HOT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-[2px]">
            <Flame className="w-2.5 h-2.5 text-rose-600" />
            <span>HOT</span>
          </span>
        );
      case 'WARM':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-[2px]">
            <Sun className="w-2.5 h-2.5 text-amber-600" />
            <span>WARM</span>
          </span>
        );
      case 'COLD':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-[2px]">
            <Snowflake className="w-2.5 h-2.5 text-slate-400" />
            <span>COLD</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      {leads.map((l) => (
        <div
          key={l.id}
          className="p-4 bg-white border border-slate-200 rounded-[4px] shadow-2xs space-y-3"
        >
          {/* Top row: Name, Number, Status & Rating */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <button
                onClick={() => onView(l)}
                className="font-bold text-sm text-slate-900 hover:text-blue-600 text-left line-clamp-1 transition-colors"
              >
                {l.displayName}
              </button>
              <span className="font-mono text-xs text-slate-400 block mt-0.5">
                {l.leadNumber}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
              {renderStatusBadge(l.statusId)}
              {renderRatingBadge(l.rating)}
            </div>
          </div>

          {/* Middle metadata: Company, Estimated Value, Owner */}
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2.5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Company & Job Title
              </span>
              <span className="text-slate-700 font-medium line-clamp-1 mt-0.5">
                {l.companyName || '—'} {l.jobTitle ? `(${l.jobTitle})` : ''}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Estimated Value
              </span>
              <span className="text-slate-900 font-mono font-semibold block mt-0.5">
                {l.estimatedValue
                  ? `${l.estimatedValue.amount.toLocaleString()} ${l.estimatedValue.currencyCode}`
                  : '—'}
              </span>
            </div>
          </div>

          {/* Bottom row: Updated date & Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">
                {formatDate(l.updatedAt)}
              </span>
              {l.convertedAt && (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 font-bold"
                >
                  Converted
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {l.phoneE164 && (
                <ActionTooltip label={`Call ${l.phoneE164}`}>
                  <a
                    href={`tel:${l.phoneE164}`}
                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 rounded-lg flex items-center justify-center"
                    aria-label={`Call ${l.displayName}`}
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </ActionTooltip>
              )}

              <ActionTooltip label="View details">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(l)}
                  className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 rounded-lg"
                  aria-label={`View details for ${l.displayName}`}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </ActionTooltip>

              {canWrite && (
                <ActionTooltip label="Edit lead">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(l)}
                    className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 rounded-lg"
                    aria-label={`Edit lead ${l.displayName}`}
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
                    className="h-8 w-8 p-0 text-slate-600 rounded-lg"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 text-xs">
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
                        className="gap-2 text-xs text-rose-600 focus:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Lead</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
