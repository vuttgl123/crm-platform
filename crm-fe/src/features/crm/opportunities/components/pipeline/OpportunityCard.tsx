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
import { formatDate } from '@/lib/formatters';
import { OpportunitySummaryResponse } from '../../model/opportunityTypes';
import { useOwnerResolver } from '../../hooks/useOwnerResolver';
import {
  MoreHorizontal,
  Eye,
  Edit,
  ArrowRightCircle,
  CheckCircle2,
  XCircle,
  Ban,
  User,
  Users,
  Calendar,
  Building2,
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: OpportunitySummaryResponse;
  accountName?: string;
  canWrite: boolean;
  onEdit: (opp: OpportunitySummaryResponse) => void;
  onTransition: (opp: OpportunitySummaryResponse, action?: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity: opp,
  accountName,
  canWrite,
  onEdit,
  onTransition,
}) => {
  const { resolveOwner } = useOwnerResolver();
  const ownerInfo = resolveOwner(opp.owner);

  return (
    <div className="p-3 bg-white border border-slate-200 rounded-[4px] shadow-2xs hover:shadow-xs transition-shadow space-y-2 text-xs font-sans group">
      {/* Header: Name and Menu */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0 flex-1">
          <Link
            to={`/app/crm/opportunities/${opp.id}`}
            className="font-bold text-xs text-slate-900 hover:text-blue-600 line-clamp-2 leading-snug transition-colors"
          >
            {opp.name}
          </Link>
          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
            {opp.opportunityNumber}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-[3px] text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              aria-label="Card actions"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-xs font-sans">
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
                  <span>Edit Details</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => onTransition(opp, 'MOVE_STAGE')}
                  className="gap-2 text-xs"
                >
                  <ArrowRightCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Move Stage…</span>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Account Association */}
      <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="truncate">
          {accountName || (opp.accountId ? `Account: ${opp.accountId.slice(0, 8)}…` : 'No Account')}
        </span>
      </div>

      {/* Amount & Probability Bar */}
      <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="font-mono font-bold text-xs text-slate-900 truncate">
          {opp.amount?.amount !== undefined
            ? `${opp.amount.amount.toLocaleString()} ${opp.amount.currencyCode}`
            : '—'}
        </span>
        <span className="font-mono text-[11px] font-semibold text-slate-600 shrink-0">
          {opp.probability}%
        </span>
      </div>

      {/* Footer: Expected Date & Owner */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="font-mono">
            {opp.expectedCloseDate ? formatDate(opp.expectedCloseDate) : 'No date'}
          </span>
        </div>

        <div className="flex items-center gap-1 max-w-[110px] truncate text-slate-600">
          {opp.owner ? (
            <>
              {ownerInfo.type === 'USER' ? (
                <User className="w-3 h-3 text-slate-400 shrink-0" />
              ) : (
                <Users className="w-3 h-3 text-slate-400 shrink-0" />
              )}
              <span className="truncate">{ownerInfo.label}</span>
            </>
          ) : (
            <span className="italic text-slate-400">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
};
