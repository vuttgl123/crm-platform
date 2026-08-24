import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardPagination } from '@/components/common/StandardPagination';
import { Button } from '@/components/ui/button';
import { useQuotes } from '../hooks/useQuotes';
import { useQuoteSummary } from '../hooks/useQuoteSummary';
import { useQuoteUrlState } from '../hooks/useQuoteUrlState';
import { useQuoteMutations } from '../hooks/useQuoteMutations';
import { QuotePulse } from '../components/QuotePulse';
import { QuoteFilterBar } from '../components/QuoteFilterBar';
import { QuoteTable } from '../components/QuoteTable';
import { QuoteCompactList } from '../components/QuoteCompactList';
import { QuoteActionDialogs, type ActionDialogState } from '../components/QuoteActionDialogs';
import {
  QuoteListSkeleton,
  QuoteEmptyState,
  QuoteErrorState,
} from '../components/QuotePageStates';
import type { QuoteAction, QuoteSummaryItem } from '../model/quoteTypes';

export const QuotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { filters, setFilters, resetFilters, currentView, setOperationalView } = useQuoteUrlState();

  const {
    data: quotePage,
    isLoading: isListLoading,
    isFetching: isListFetching,
    error: listError,
    refetch: refetchList,
  } = useQuotes(filters);

  const {
    data: pulseData,
    isLoading: isPulseLoading,
    refetch: refetchPulse,
  } = useQuoteSummary(filters);

  const {
    submitMutation,
    approveMutation,
    requestChangesMutation,
    markSentMutation,
    acceptMutation,
    rejectMutation,
    cancelMutation,
    reviseMutation,
    deleteDraftMutation,
    convertToOrderMutation,
  } = useQuoteMutations();

  const [dialogState, setDialogState] = useState<ActionDialogState | null>(null);

  const handleTriggerAction = (action: QuoteAction, quote: QuoteSummaryItem) => {
    if (action === 'EDIT_DRAFT') {
      navigate(`/app/sales/quotes/${quote.id}/edit`);
      return;
    }
    if (action === 'PRINT') {
      window.open(`/app/sales/quotes/${quote.id}/print`, '_blank');
      return;
    }

    setDialogState({
      type: action,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      revisionNumber: quote.revisionNumber,
      version: quote.version,
    });
  };

  const handleCloseDialog = () => setDialogState(null);

  const quotes = quotePage?.items || [];
  const totalElements = quotePage?.totalElements || 0;
  const totalPages = quotePage?.totalPages || 0;

  const isFiltered =
    Boolean(filters.q) ||
    filters.statuses.length > 0 ||
    Boolean(filters.accountId) ||
    Boolean(filters.opportunityId) ||
    Boolean(filters.currencyCode) ||
    filters.validity !== 'ALL' ||
    Boolean(filters.issueFrom) ||
    Boolean(filters.issueTo) ||
    Boolean(filters.validFrom) ||
    Boolean(filters.validTo) ||
    !filters.latestOnly;

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Role Governance Header */}
      <StandardPageHeader
        title="Quotes"
        subtitle="Manage commercial proposals, line item pricing, customer approvals, and sales order handoffs."
        badgeLabel="quotes"
        badgeCount={totalElements}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchList();
                refetchPulse();
              }}
              disabled={isListFetching}
              className="h-8.5 rounded-[3px] text-xs font-semibold border-slate-200 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isListFetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/app/sales/quotes/new')}
              className="h-8.5 rounded-[3px] text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Quote</span>
            </Button>
          </div>
        }
      />

      {/* Quote Pulse Operational Summary */}
      <QuotePulse pulse={pulseData} isLoading={isPulseLoading} />

      {/* Filter Bar */}
      <QuoteFilterBar
        filters={filters}
        onFilterChange={(updates) => setFilters(updates)}
        onReset={resetFilters}
        currentView={currentView}
        onViewChange={setOperationalView}
      />

      {/* Content Area */}
      {isListLoading ? (
        <QuoteListSkeleton />
      ) : listError ? (
        <QuoteErrorState error={listError as Error} onRetry={() => refetchList()} />
      ) : quotes.length === 0 ? (
        <QuoteEmptyState
          isFiltered={isFiltered}
          onResetFilters={resetFilters}
          onCreateNew={() => navigate('/app/sales/quotes/new')}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <QuoteTable quotes={quotes} onTriggerAction={handleTriggerAction} />
          </div>

          {/* Mobile Stacked Card View */}
          <div className="block md:hidden">
            <QuoteCompactList quotes={quotes} onTriggerAction={handleTriggerAction} />
          </div>

          {/* Standard Pagination */}
          <div className="bg-white border border-slate-200 rounded-[4px] px-4 py-2 shadow-2xs">
            <StandardPagination
              currentPage={filters.page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={filters.size}
              onPageChange={(page) => setFilters({ page })}
              onPageSizeChange={(size) => setFilters({ size, page: 0 })}
            />
          </div>
        </div>
      )}

      {/* Lifecycle Action Confirmation Dialogs */}
      <QuoteActionDialogs
        dialogState={dialogState}
        onClose={handleCloseDialog}
        onSubmit={(id, version) => submitMutation.mutate({ id, version })}
        onApprove={(id, version) => approveMutation.mutate({ id, version })}
        onRequestChanges={(id, version, reason) => requestChangesMutation.mutate({ id, version, reason })}
        onMarkSent={(id, version) => markSentMutation.mutate({ id, version })}
        onAccept={(id, version, customerReference) => acceptMutation.mutate({ id, version, customerReference })}
        onReject={(id, version, reason) => rejectMutation.mutate({ id, version, reason })}
        onCancel={(id, version, reason) => cancelMutation.mutate({ id, version, reason })}
        onRevise={(id, version) =>
          reviseMutation.mutate(
            { id, version },
            {
              onSuccess: (data) => navigate(`/app/sales/quotes/${data.id}/edit`),
            }
          )
        }
        onDeleteDraft={(id, version) => deleteDraftMutation.mutate({ id, version })}
        onConvertToOrder={(id, version) =>
          convertToOrderMutation.mutate(
            { id, version },
            {
              onSuccess: (data) => navigate(`/app/sales/orders/${data.orderId}`),
            }
          )
        }
        isPending={
          submitMutation.isPending ||
          approveMutation.isPending ||
          requestChangesMutation.isPending ||
          markSentMutation.isPending ||
          acceptMutation.isPending ||
          rejectMutation.isPending ||
          cancelMutation.isPending ||
          reviseMutation.isPending ||
          deleteDraftMutation.isPending ||
          convertToOrderMutation.isPending
        }
      />
    </div>
  );
};
