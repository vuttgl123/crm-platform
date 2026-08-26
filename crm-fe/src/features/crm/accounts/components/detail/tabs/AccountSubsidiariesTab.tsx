import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AccountResponse, AccountSummaryResponse } from '../../../model/accountTypes';
import {
  useSubsidiaryAccountsQuery,
  useDeleteAccountMutation,
} from '../../../hooks/accountQueries';
import {
  renderAccountTypeBadge,
  renderLifecycleStageBadge,
} from '@/config/crmStatusConfig';
import { formatDateTime } from '@/lib/formatters';
import { useOwnerResolver } from '../../../hooks/useOwnerResolver';
import { mapAccountError } from '../../../model/accountErrors';
import { AccountDeleteDialog } from '../../AccountDeleteDialog';
import { Button } from '@/components/ui/button';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  GitFork,
  Plus,
  Building2,
  User,
  Users,
  ExternalLink,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface AccountSubsidiariesTabProps {
  account: AccountResponse;
  canWrite: boolean;
  onAddSubsidiary: () => void;
}

export const AccountSubsidiariesTab: React.FC<AccountSubsidiariesTabProps> = ({
  account,
  canWrite,
  onAddSubsidiary,
}) => {
  const { resolveOwner } = useOwnerResolver();
  const [deleteTarget, setDeleteTarget] = useState<AccountSummaryResponse | null>(null);

  const {
    data: subsidiaries = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSubsidiaryAccountsQuery(account.id);

  const deleteMutation = useDeleteAccountMutation();

  const handleConfirmDelete = async (target: AccountSummaryResponse | AccountResponse) => {
    try {
      await deleteMutation.mutateAsync({ id: target.id, version: target.version });
      toast.success('Subsidiary account deleted', {
        description: `${target.displayName} has been removed.`,
      });
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      const errorMapping = mapAccountError(err);
      toast.error(errorMapping.title, {
        description: errorMapping.description,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2 font-sans bg-white border border-slate-200 rounded-[4px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Loading subsidiary accounts…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-white rounded-[4px] border border-slate-200 text-center space-y-3 font-sans">
        <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto" />
        <p className="text-xs text-slate-600">
          {(error as any)?.message || 'Failed to load subsidiary accounts.'}
        </p>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="h-7 text-xs">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans w-full">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-[4px] bg-indigo-50 text-indigo-600 border border-indigo-100">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Subsidiary Companies & Hierarchy
              </h2>
              <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.2 rounded-[2px]">
                {subsidiaries.length} {subsidiaries.length === 1 ? 'subsidiary' : 'subsidiaries'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Child organizations and branches directly under {account.displayName}.
            </p>
          </div>
        </div>

        {canWrite && (
          <Button
            size="sm"
            onClick={onAddSubsidiary}
            className="h-8 px-3 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-[3px] gap-1.5 shadow-none shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subsidiary</span>
          </Button>
        )}
      </div>

      {/* List or Empty State */}
      {subsidiaries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[4px] p-10 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <GitFork className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">
              No Subsidiary Accounts Registered
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This organization does not have any registered child entities or subsidiaries yet.
            </p>
          </div>
          {canWrite && (
            <Button
              size="sm"
              onClick={onAddSubsidiary}
              className="h-8 px-3 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-[3px] gap-1.5 shadow-none mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Subsidiary</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden shadow-2xs">
          <Table>
            <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
              <TableRow className="hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Subsidiary Entity
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Account Type
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Lifecycle Stage
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Owner
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Last Updated
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subsidiaries.map((sub) => {
                const ownerInfo = resolveOwner(sub.owner);
                return (
                  <TableRow
                    key={sub.id}
                    className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs transition-colors"
                  >
                    <TableCell className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-[3px] bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link
                            to={`/app/crm/accounts/${sub.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 flex items-center gap-1"
                          >
                            <span>{sub.displayName}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400 font-semibold">
                              {sub.accountNumber}
                            </span>
                            {sub.legalName && (
                              <span className="text-[10px] text-slate-500 italic line-clamp-1">
                                • {sub.legalName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 px-3">
                      {renderAccountTypeBadge(sub.accountType)}
                    </TableCell>

                    <TableCell className="py-2.5 px-3">
                      {renderLifecycleStageBadge(sub.lifecycleStage)}
                    </TableCell>

                    <TableCell className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        {sub.owner ? (
                          <>
                            {ownerInfo.type === 'USER' ? (
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className={ownerInfo.isCurrentUser ? 'font-bold' : ''}>
                              {ownerInfo.label}
                            </span>
                          </>
                        ) : (
                          <span className="italic text-slate-400">Unassigned</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {formatDateTime(sub.updatedAt)}
                    </TableCell>

                    <TableCell className="py-2.5 px-3 text-right pr-4">
                      {canWrite && (
                        <div className="flex items-center justify-end">
                          <ActionTooltip label="Delete subsidiary">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteTarget(sub)}
                              className="h-7 w-7 rounded-[3px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              aria-label="Delete subsidiary"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AccountDeleteDialog
        isOpen={Boolean(deleteTarget)}
        account={deleteTarget}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default AccountSubsidiariesTab;
