import React from 'react';
import { ContactSummaryResponse } from '@/services/api/contactApi';
import { ContactsTable } from './ContactsTable';
import { ContactMobileList } from './ContactMobileList';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { StandardPagination } from '@/components/common/StandardPagination';
import { Users, FilterX, Loader2 } from 'lucide-react';

interface ContactsCollectionProps {
  contacts: ContactSummaryResponse[];
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
  onView: (contact: ContactSummaryResponse) => void;
  onEdit: (contact: ContactSummaryResponse) => void;
  onDelete: (contact: ContactSummaryResponse) => void;
}

export const ContactsCollection: React.FC<ContactsCollectionProps> = ({
  contacts,
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
}) => {
  // Error state
  if (isError) {
    return (
      <div className="py-8 bg-white border border-slate-200 rounded-[4px]">
        <ErrorState
          title="Failed to load contacts"
          description={
            error?.message ||
            'An unexpected error occurred while communicating with the Contact service.'
          }
          onRetry={onRefresh}
        />
      </div>
    );
  }

  // Initial loading skeleton
  if (isLoading && contacts.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white border border-slate-200 rounded-[4px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Loading stakeholder contacts…</span>
      </div>
    );
  }

  // Empty state: No records found
  if (contacts.length === 0) {
    if (hasActiveFilters) {
      return (
        <div className="py-12 bg-white rounded-[4px] border border-slate-200 shadow-2xs">
          <EmptyState
            icon={FilterX}
            title="No matching contacts found"
            description="No contacts matched the active search or filter criteria. Try adjusting or clearing your filters."
            actionLabel="Clear all filters"
            onAction={onResetFilters}
          />
        </div>
      );
    }

    return (
      <div className="py-12 bg-white rounded-[4px] border border-slate-200 shadow-2xs">
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description="Start building your stakeholder network by adding your organization's first contact record."
          actionLabel={canWrite ? 'Create Contact' : undefined}
          onAction={canWrite ? onCreateClick : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <ContactsTable
          contacts={contacts}
          canWrite={canWrite}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden">
        <ContactMobileList
          contacts={contacts}
          canWrite={canWrite}
          onView={onView}
          onEdit={onEdit}
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
          itemLabel="contacts"
        />
      )}
    </div>
  );
};
