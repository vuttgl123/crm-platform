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
import { ActionTooltip } from '@/components/ui/action-tooltip';
import {
  renderAccountTypeBadge,
  renderLifecycleStageBadge,
} from '@/config/crmStatusConfig';
import { formatDateTime } from '@/lib/formatters';
import { AccountResponse } from '../../model/accountTypes';
import { useOwnerResolver } from '../../hooks/useOwnerResolver';
import {
  Building2,
  ChevronRight,
  Edit,
  GitFork,
  MoreHorizontal,
  Trash2,
  User,
  Users,
  Ban,
} from 'lucide-react';

interface AccountDetailHeaderProps {
  account: AccountResponse;
  canWrite: boolean;
  onEdit: () => void;
  onAddSubsidiary: () => void;
  onDelete: () => void;
}

export const AccountDetailHeader: React.FC<AccountDetailHeaderProps> = ({
  account,
  canWrite,
  onEdit,
  onAddSubsidiary,
  onDelete,
}) => {
  const { resolveOwner } = useOwnerResolver();
  const ownerInfo = resolveOwner(account.owner);

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3 font-sans w-full">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/app/crm/accounts" className="hover:text-blue-600 font-medium">
          Accounts
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold truncate max-w-sm">
          {account.displayName}
        </span>
      </div>

      {/* Main Identity Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
            <Building2 className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                {account.displayName}
              </h1>
              {account.legalName && (
                <span className="text-xs text-slate-500 italic">
                  ({account.legalName})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-[2px]">
                {account.accountNumber}
              </span>
              {renderAccountTypeBadge(account.accountType)}
              {renderLifecycleStageBadge(account.lifecycleStage)}
              {account.doNotContact && (
                <Badge
                  variant="destructive"
                  className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] px-2 py-0.5 font-bold gap-1 rounded-[2px]"
                >
                  <Ban className="w-3 h-3" />
                  <span>Do Not Contact</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Owner, Updated & Actions */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <div className="hidden lg:flex flex-col items-end text-xs text-slate-500 pr-2 border-r border-slate-200">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              {account.owner ? (
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
              Updated: {formatDateTime(account.updatedAt)}
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
                <span>Edit Account</span>
              </Button>

              <ActionTooltip label="Add subsidiary account">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddSubsidiary}
                  className="h-8 px-2.5 text-xs font-semibold border-slate-200 text-slate-700 rounded-[3px] gap-1.5"
                >
                  <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Add Subsidiary</span>
                </Button>
              </ActionTooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-[3px] text-slate-600 hover:text-slate-900"
                    aria-label="More account actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 text-xs font-sans">
                  <DropdownMenuItem onClick={onEdit} className="gap-2 text-xs">
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAddSubsidiary} className="gap-2 text-xs">
                    <GitFork className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Add Subsidiary</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="gap-2 text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
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
