import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  renderAccountTypeBadge,
  renderLifecycleStageBadge,
} from '@/config/crmStatusConfig';
import { formatDate } from '@/lib/formatters';
import { AccountSummaryResponse } from '../model/accountTypes';
import { useOwnerResolver } from '../hooks/useOwnerResolver';
import {
  Eye,
  Edit,
  Trash2,
  GitFork,
  MoreHorizontal,
  Ban,
  User,
  Users,
} from 'lucide-react';

interface AccountCompactListProps {
  accounts: AccountSummaryResponse[];
  canWrite: boolean;
  onEdit: (account: AccountSummaryResponse) => void;
  onAddSubsidiary: (account: AccountSummaryResponse) => void;
  onDelete: (account: AccountSummaryResponse) => void;
}

export const AccountCompactList: React.FC<AccountCompactListProps> = ({
  accounts,
  canWrite,
  onEdit,
  onAddSubsidiary,
  onDelete,
}) => {
  const { resolveOwner } = useOwnerResolver();

  return (
    <div className="space-y-3 font-sans">
      {accounts.map((acc) => {
        const ownerInfo = resolveOwner(acc.owner);

        return (
          <div
            key={acc.id}
            className="p-4 bg-white border border-slate-200 rounded-[4px] shadow-2xs space-y-3"
          >
            {/* Top row: Name, Number, Type & Lifecycle */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  to={`/app/crm/accounts/${acc.id}`}
                  className="font-bold text-sm text-slate-900 hover:text-blue-600 text-left line-clamp-1 transition-colors"
                >
                  {acc.displayName}
                </Link>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs text-slate-400">
                    {acc.accountNumber}
                  </span>
                  {acc.legalName && (
                    <span className="text-[11px] text-slate-500 italic line-clamp-1">
                      • {acc.legalName}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1 flex-wrap justify-end">
                {renderAccountTypeBadge(acc.accountType)}
                {renderLifecycleStageBadge(acc.lifecycleStage)}
              </div>
            </div>

            {/* Middle metadata: Parent Account, Owner */}
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Parent Account
                </span>
                <span className="text-slate-700 font-medium line-clamp-1 mt-0.5 font-mono">
                  {acc.parentAccountId ? `Account: ${acc.parentAccountId.slice(0, 8)}…` : 'None (Root)'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Owner
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-700">
                  {acc.owner ? (
                    <>
                      {ownerInfo.type === 'USER' ? (
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ) : (
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span
                        className={`line-clamp-1 ${
                          ownerInfo.isCurrentUser ? 'font-bold text-slate-900' : 'font-medium'
                        }`}
                      >
                        {ownerInfo.label}
                      </span>
                    </>
                  ) : (
                    <span className="italic text-slate-400">Unassigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* DNC Tag if active */}
            {acc.doNotContact && (
              <div className="pt-1">
                <Badge
                  variant="destructive"
                  className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] px-1.5 py-0 font-bold gap-1 rounded-[2px]"
                >
                  <Ban className="w-2.5 h-2.5" />
                  <span>Do Not Contact</span>
                </Badge>
              </div>
            )}

            {/* Bottom row: Updated date & Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
              <span className="text-[11px] text-slate-400 font-mono">
                Updated: {formatDate(acc.updatedAt)}
              </span>

              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 rounded-[3px]"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 text-xs font-sans">
                    <DropdownMenuItem asChild className="gap-2 text-xs">
                      <Link to={`/app/crm/accounts/${acc.id}`}>
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View 360° Workspace</span>
                      </Link>
                    </DropdownMenuItem>

                    {canWrite && (
                      <>
                        <DropdownMenuItem
                          onClick={() => onAddSubsidiary(acc)}
                          className="gap-2 text-xs"
                        >
                          <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Add Subsidiary</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(acc)}
                          className="gap-2 text-xs"
                        >
                          <Edit className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit Account</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(acc)}
                          className="gap-2 text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Account</span>
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
