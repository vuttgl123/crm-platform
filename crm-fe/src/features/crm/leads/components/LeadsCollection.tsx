import React from 'react';
import {
  LeadSummaryResponse,
  LeadStatusItem,
  LeadSourceItem,
} from '../model/leadTypes';
import { LeadsTable } from './LeadsTable';
import { LeadCompactList } from './LeadCompactList';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { StandardPagination } from '@/components/common/StandardPagination';
import { Target, FilterX, Loader2 } from 'lucide-react';

interface LeadsCollectionProps {
  leads: LeadSummaryResponse[];
  statuses: LeadStatusItem[];
  sources: LeadSourceItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  error?: any;
  hasActiveFilters: boolean;
  canWrite: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onRefresh: () => void;
  onResetFilters: () => void;
  onCreateClick: () => void;
  onView: (lead: LeadSummaryResponse) => void;
  onEdit: (lead: LeadSummaryResponse) => void;
  onDelete: (lead: LeadSummaryResponse) => void;
  onCalculateScore: (lead: LeadSummaryResponse) => void;
  onAutoAssign: (lead: LeadSummaryResponse) => void;
  onConvert: (lead: LeadSummaryResponse) => void;
}

export const LeadsCollection: React.FC<LeadsCollectionProps> = ({
  leads,
  statuses,
  sources,
  totalElements,
  totalPages,
  page,
  pageSize,
  isLoading,
  isError,
  error,
  hasActiveFilters,
  canWrite,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  onResetFilters,
  onCreateClick,
  onView,
  onEdit,
  onDelete,
  onCalculateScore,
  onAutoAssign,
  onConvert,
}) => {
  // Error state
  if (isError) {
    return (
      <div className="py-8 bg-white border border-slate-200 rounded-[4px]">
        <ErrorState
          title="Failed to load leads"
          description={
            error?.message ||
            'An unexpected error occurred while communicating with the Lead service.'
          }
          onRetry={onRefresh}
        />
      </div>
    );
  }

  // Initial loading skeleton
  if (isLoading && leads.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white border border-slate-200 rounded-[4px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Loading sales leads…</span>
      </div>
    );
  }

  // Empty state: No records found
  if (leads.length === 0) {
    if (hasActiveFilters) {
      return (
        <div className="py-12 bg-white rounded-[4px] border border-slate-200 shadow-2xs">
          <EmptyState
            icon={FilterX}
            title="No matching leads found"
            description="No leads matched the active search or filter criteria. Try adjusting or clearing your filters."
            actionLabel="Clear all filters"
            onAction={onResetFilters}
          />
        </div>
      );
    }

    return (
      <div className="py-12 bg-white rounded-[4px] border border-slate-200 shadow-2xs">
        <EmptyState
          icon={Target}
          title="No leads yet"
          description="Capture new commercial opportunities by creating your organization's first lead record."
          actionLabel={canWrite ? 'Create Lead' : undefined}
          onAction={canWrite ? onCreateClick : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <LeadsTable
          leads={leads}
          statuses={statuses}
          sources={sources}
          canWrite={canWrite}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onCalculateScore={onCalculateScore}
          onAutoAssign={onAutoAssign}
          onConvert={onConvert}
        />
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden">
        <LeadCompactList
          leads={leads}
          statuses={statuses}
          sources={sources}
          canWrite={canWrite}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onCalculateScore={onCalculateScore}
          onAutoAssign={onAutoAssign}
          onConvert={onConvert}
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
          itemLabel="leads"
        />
      )}
    </div>
  );
};
