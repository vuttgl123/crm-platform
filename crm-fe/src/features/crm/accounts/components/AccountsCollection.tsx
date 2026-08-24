import { AccountSummaryResponse, AccountViewMode } from '../model/accountTypes';
import { AccountsTable } from './AccountsTable';
import { AccountCompactList } from './AccountCompactList';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { StandardPagination } from '@/components/common/StandardPagination';
import { Building2, FilterX, Loader2 } from 'lucide-react';

interface AccountsCollectionProps {
  accounts: AccountSummaryResponse[];
  viewMode: AccountViewMode;
  expandedIds: Set<string>;
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  error?: any;
  hasActiveFilters: boolean;
  canWrite: boolean;
  onToggleExpand: (accountId: string) => void;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onRefresh: () => void;
  onResetFilters: () => void;
  onCreateClick: () => void;
  onEdit: (account: AccountSummaryResponse) => void;
  onAddSubsidiary: (account: AccountSummaryResponse) => void;
  onDelete: (account: AccountSummaryResponse) => void;
}

export const AccountsCollection: React.FC<AccountsCollectionProps> = ({
  accounts,
  viewMode,
  expandedIds,
  totalElements,
  totalPages,
  page,
  pageSize,
  isLoading,
  isError,
  error,
  hasActiveFilters,
  canWrite,
  onToggleExpand,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  onResetFilters,
  onCreateClick,
  onEdit,
  onAddSubsidiary,
  onDelete,
}) => {
  // Error state
  if (isError) {
    return (
      <div className="py-8 bg-white border border-slate-200 rounded-[4px]">
        <ErrorState
          title="Failed to load accounts"
          description={
            error?.message ||
            'An unexpected error occurred while communicating with the Account service.'
          }
          onRetry={onRefresh}
        />
      </div>
    );
  }

  // Initial loading skeleton
  if (isLoading && accounts.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white border border-slate-200 rounded-[4px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Loading organizational accounts…</span>
      </div>
    );
  }

  // Empty state: No records found
  if (accounts.length === 0) {
    if (hasActiveFilters) {
      return (
        <div className="py-12 bg-white rounded-[4px] border border-slate-200 shadow-2xs">
          <EmptyState
            icon={FilterX}
            title="No matching accounts found"
            description="No accounts matched the active search or filter criteria. Try adjusting or clearing your filters."
            actionLabel="Clear all filters"
            onAction={onResetFilters}
          />
        </div>
      );
    }

    return (
      <div className="py-12 bg-white rounded-[4px] border border-slate-200 shadow-2xs">
        <EmptyState
          icon={Building2}
          title="No accounts yet"
          description="Start building your enterprise account directory by creating your organization's first commercial account."
          actionLabel={canWrite ? 'Create Account' : undefined}
          onAction={canWrite ? onCreateClick : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <AccountsTable
          accounts={accounts}
          viewMode={viewMode}
          expandedIds={expandedIds}
          canWrite={canWrite}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          onAddSubsidiary={onAddSubsidiary}
          onDelete={onDelete}
        />
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden">
        <AccountCompactList
          accounts={accounts}
          canWrite={canWrite}
          onEdit={onEdit}
          onAddSubsidiary={onAddSubsidiary}
          onDelete={onDelete}
        />
      </div>

      {/* Pagination Bar */}
      {totalPages > 0 && (
        <StandardPagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          itemLabel="accounts"
        />
      )}
    </div>
  );
};
