import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/core/session/useAuth';
import { can } from '@/core/permissions/evaluator';
import {
  AccountSummaryResponse,
  AccountResponse,
  AccountSearchParams as ApiAccountSearchParams,
} from '@/services/api/accountApi';
import {
  parseAccountSearchParams,
  serializeAccountSearchParams,
} from './accountSearchParams';
import {
  AccountFilterState,
} from './model/accountTypes';
import {
  useAccountsQuery,
  useDeleteAccountMutation,
} from './hooks/accountQueries';
import { getAllParentNodeIds } from './model/accountTree';
import { mapAccountError } from './model/accountErrors';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { AccountsToolbar } from './components/AccountsToolbar';
import { AccountsCollection } from './components/AccountsCollection';
import { AccountEditorSheet } from './components/AccountEditorSheet';
import { AccountDeleteDialog } from './components/AccountDeleteDialog';
import { Button } from '@/components/ui/button';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const AccountsPage: React.FC = () => {
  const { session } = useAuth();
  const tenantId = session?.tenant?.id || 'default';
  const currentUserId = session?.user?.id;
  const currentTeamId = session?.assignedTeam?.id;

  const canWrite = can('crm_account.write', session);

  // URL state synchronization
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = useMemo(() => parseAccountSearchParams(searchParams), [searchParams]);

  // Convert UI URL state to backend Search Request
  const searchRequest: ApiAccountSearchParams = useMemo(() => {
    const req: ApiAccountSearchParams = {
      q: urlState.q || undefined,
      accountType: urlState.accountType !== 'ALL' ? urlState.accountType : undefined,
      lifecycleStage: urlState.lifecycleStage !== 'ALL' ? urlState.lifecycleStage : undefined,
      page: Math.max(0, urlState.page - 1),
      size: urlState.size,
    };

    if (urlState.ownership === 'MINE' && currentUserId) {
      req.ownerType = 'USER';
      req.ownerId = currentUserId;
    } else if (urlState.ownership === 'TEAM' && currentTeamId) {
      req.ownerType = 'TEAM';
      req.ownerId = currentTeamId;
    }

    return req;
  }, [urlState, currentUserId, currentTeamId]);

  // Query accounts list
  const {
    data: pageResult,
    isLoading,
    isError,
    error,
    refetch,
  } = useAccountsQuery(searchRequest, tenantId);

  const accounts = pageResult?.items || [];
  const totalElements = pageResult?.totalElements ?? 0;
  const totalPages = pageResult?.totalPages ?? 0;

  // Tree Expansion State: default expand all parents
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (accounts.length > 0) {
      const parentIds = getAllParentNodeIds(accounts);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        parentIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [accounts]);

  const handleToggleExpand = useCallback((accountId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const parentIds = getAllParentNodeIds(accounts);
    setExpandedIds(new Set(parentIds));
  }, [accounts]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Delete Target State
  const [deleteTarget, setDeleteTarget] = useState<AccountSummaryResponse | AccountResponse | null>(null);
  const deleteMutation = useDeleteAccountMutation(tenantId);

  // Filter change handlers
  const handleFilterChange = useCallback(
    (newFilters: Partial<AccountFilterState>) => {
      setSearchParams((prev) => {
        return serializeAccountSearchParams(
          {
            q: newFilters.q !== undefined ? newFilters.q : urlState.q,
            accountType:
              newFilters.accountType !== undefined
                ? newFilters.accountType
                : urlState.accountType,
            lifecycleStage:
              newFilters.lifecycleStage !== undefined
                ? newFilters.lifecycleStage
                : urlState.lifecycleStage,
            ownership:
              newFilters.ownership !== undefined
                ? newFilters.ownership
                : urlState.ownership,
            viewMode:
              newFilters.viewMode !== undefined
                ? newFilters.viewMode
                : urlState.viewMode,
            page: newFilters.page !== undefined ? newFilters.page : urlState.page,
            size: newFilters.size !== undefined ? newFilters.size : urlState.size,
          },
          prev
        );
      });
    },
    [setSearchParams, urlState]
  );

  const handleResetFilters = useCallback(() => {
    setSearchParams((prev) =>
      serializeAccountSearchParams(
        {
          q: '',
          accountType: 'ALL',
          lifecycleStage: 'ALL',
          ownership: 'ALL',
          page: 1,
        },
        prev
      )
    );
  }, [setSearchParams]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams((prev) =>
        serializeAccountSearchParams({ page: newPage }, prev)
      );
    },
    [setSearchParams]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setSearchParams((prev) =>
        serializeAccountSearchParams({ size: newSize, page: 1 }, prev)
      );
    },
    [setSearchParams]
  );

  // Sheet Navigation Handlers
  const handleOpenCreate = useCallback(() => {
    setSearchParams((prev) =>
      serializeAccountSearchParams({ mode: 'create', account: undefined, parentId: undefined }, prev)
    );
  }, [setSearchParams]);

  const handleOpenEdit = useCallback(
    (acc: AccountSummaryResponse) => {
      setSearchParams((prev) =>
        serializeAccountSearchParams({ mode: 'edit', account: acc.id, parentId: undefined }, prev)
      );
    },
    [setSearchParams]
  );

  const handleOpenAddSubsidiary = useCallback(
    (acc: AccountSummaryResponse) => {
      setSearchParams((prev) =>
        serializeAccountSearchParams({ mode: 'subsidiary', account: undefined, parentId: acc.id }, prev)
      );
    },
    [setSearchParams]
  );

  const handleCloseSheet = useCallback(() => {
    setSearchParams((prev) =>
      serializeAccountSearchParams({ mode: undefined, account: undefined, parentId: undefined }, prev)
    );
  }, [setSearchParams]);

  // Delete Action Handler
  const handleConfirmDelete = async (acc: AccountSummaryResponse | AccountResponse) => {
    try {
      await deleteMutation.mutateAsync({ id: acc.id, version: acc.version });
      toast.success('Account deleted');
      setDeleteTarget(null);
      if (urlState.account === acc.id) {
        handleCloseSheet();
      }
    } catch (err: any) {
      const errorMapping = mapAccountError(err);
      toast.error(errorMapping.title, {
        description: errorMapping.description,
      });
    }
  };

  const hasActiveFilters = Boolean(
    urlState.q.trim() ||
      urlState.accountType !== 'ALL' ||
      urlState.lifecycleStage !== 'ALL' ||
      urlState.ownership !== 'ALL'
  );

  const isEditorSheetOpen = Boolean(urlState.mode);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Header */}
      <StandardPageHeader
        title="Accounts"
        subtitle="Manage enterprise customer organizations, subsidiaries, and classifications."
        badgeLabel="accounts"
        badgeCount={totalElements}
        actions={
          <div className="flex items-center gap-2">
            <ActionTooltip label="Refresh account list">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border-slate-200 rounded-[3px] gap-1.5"
                aria-label="Refresh accounts"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </ActionTooltip>

            {canWrite && (
              <Button
                size="sm"
                onClick={handleOpenCreate}
                className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
                aria-label="Create new account"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Account</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Toolbar */}
      <AccountsToolbar
        filters={{
          q: urlState.q,
          accountType: urlState.accountType,
          lifecycleStage: urlState.lifecycleStage,
          ownership: urlState.ownership,
          viewMode: urlState.viewMode,
          page: urlState.page,
          size: urlState.size,
        }}
        hasSessionTeam={Boolean(currentTeamId)}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />

      {/* Collection */}
      <AccountsCollection
        accounts={accounts}
        viewMode={urlState.viewMode}
        expandedIds={expandedIds}
        totalElements={totalElements}
        totalPages={totalPages}
        page={urlState.page}
        pageSize={urlState.size}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasActiveFilters={hasActiveFilters}
        canWrite={canWrite}
        onToggleExpand={handleToggleExpand}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={() => refetch()}
        onResetFilters={handleResetFilters}
        onCreateClick={handleOpenCreate}
        onEdit={handleOpenEdit}
        onAddSubsidiary={handleOpenAddSubsidiary}
        onDelete={(acc) => setDeleteTarget(acc)}
      />

      {/* Create / Edit / Subsidiary Form Sheet */}
      <AccountEditorSheet
        isOpen={isEditorSheetOpen}
        mode={urlState.mode || 'create'}
        accountId={urlState.account}
        parentId={urlState.parentId}
        tenantId={tenantId}
        onClose={handleCloseSheet}
      />

      {/* Version-Safe Delete Confirmation Dialog */}
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