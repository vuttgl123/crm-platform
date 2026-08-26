import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/core/session/useAuth';
import { can } from '@/core/permissions/evaluator';
import {
  ContactSummaryResponse,
  ContactSearchRequest,
} from '@/services/api/contactApi';
import {
  parseContactSearchParams,
  serializeContactSearchParams,
} from './contactSearchParams';
import {
  ContactEditorMode,
  ContactFilterState,
} from './model/contactTypes';
import {
  useContactsQuery,
  useDeleteContactMutation,
} from './hooks/contactQueries';
import { mapContactError } from './model/contactErrors';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { ContactsToolbar } from './components/ContactsToolbar';
import { ContactsCollection } from './components/ContactsCollection';
import { ContactEditorSheet } from './components/ContactEditorSheet';
import { ContactDeleteDialog } from './components/ContactDeleteDialog';
import { Button } from '@/components/ui/button';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import { Plus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export const ContactsPage: React.FC = () => {
  const { session } = useAuth();
  const tenantId = session?.tenant?.id || 'default';
  const currentUserId = session?.user?.id;
  const currentTeamId = session?.assignedTeam?.id;

  const canWrite = can('crm_contact.write', session);

  // URL state synchronization
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = useMemo(() => parseContactSearchParams(searchParams), [searchParams]);

  // Convert UI URL state to backend Search Request
  const searchRequest: ContactSearchRequest = useMemo(() => {
    const req: ContactSearchRequest = {
      q: urlState.q || undefined,
      accountId: urlState.account || undefined,
      lifecycleStage: urlState.stage !== 'ALL' ? urlState.stage : undefined,
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

  // Query contacts list
  const {
    data: pageResult,
    isLoading,
    isError,
    error,
    refetch,
  } = useContactsQuery(searchRequest, tenantId);

  const contacts = pageResult?.items || [];
  const totalElements = pageResult?.totalElements ?? 0;
  const totalPages = pageResult?.totalPages ?? 0;

  // Delete Dialog state
  const [deleteTarget, setDeleteTarget] = useState<ContactSummaryResponse | null>(null);
  const deleteMutation = useDeleteContactMutation(tenantId);

  // Filter change handlers updating URL search params
  const handleFilterChange = useCallback(
    (newFilters: Partial<ContactFilterState>) => {
      setSearchParams((prev) => {
        return serializeContactSearchParams(
          {
            q: newFilters.q !== undefined ? newFilters.q : urlState.q,
            stage: newFilters.stage !== undefined ? newFilters.stage : urlState.stage,
            ownership:
              newFilters.ownership !== undefined
                ? newFilters.ownership
                : urlState.ownership,
            account:
              newFilters.accountId !== undefined
                ? newFilters.accountId
                : urlState.account,
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
      serializeContactSearchParams(
        {
          q: '',
          stage: 'ALL',
          ownership: 'ALL',
          account: undefined,
          page: 1,
        },
        prev
      )
    );
  }, [setSearchParams]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams((prev) =>
        serializeContactSearchParams({ page: newPage }, prev)
      );
    },
    [setSearchParams]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setSearchParams((prev) =>
        serializeContactSearchParams({ size: newSize, page: 1 }, prev)
      );
    },
    [setSearchParams]
  );

  // Sheet open/close handlers via URL state
  const handleOpenCreate = useCallback(() => {
    setSearchParams((prev) =>
      serializeContactSearchParams({ mode: 'create', contact: undefined }, prev)
    );
  }, [setSearchParams]);

  const handleOpenView = useCallback(
    (c: ContactSummaryResponse) => {
      setSearchParams((prev) =>
        serializeContactSearchParams({ mode: 'view', contact: c.id }, prev)
      );
    },
    [setSearchParams]
  );

  const handleOpenEdit = useCallback(
    (c: ContactSummaryResponse) => {
      setSearchParams((prev) =>
        serializeContactSearchParams({ mode: 'edit', contact: c.id }, prev)
      );
    },
    [setSearchParams]
  );

  const handleCloseSheet = useCallback(() => {
    setSearchParams((prev) =>
      serializeContactSearchParams({ mode: undefined, contact: undefined }, prev)
    );
  }, [setSearchParams]);

  const handleSwitchSheetMode = useCallback(
    (newMode: ContactEditorMode) => {
      setSearchParams((prev) =>
        serializeContactSearchParams({ mode: newMode }, prev)
      );
    },
    [setSearchParams]
  );

  // Delete Action Handlers
  const handleOpenDelete = useCallback((c: ContactSummaryResponse) => {
    setDeleteTarget(c);
  }, []);

  const handleConfirmDelete = async (c: ContactSummaryResponse) => {
    try {
      await deleteMutation.mutateAsync({ id: c.id, version: c.version });
      toast.success('Contact deleted');
      setDeleteTarget(null);
      // Close sheet if open for this contact
      if (urlState.contact === c.id) {
        handleCloseSheet();
      }
    } catch (err: any) {
      const errorMapping = mapContactError(err);
      toast.error(errorMapping.title, {
        description: errorMapping.description,
      });
    }
  };

  const hasActiveFilters = Boolean(
    urlState.q.trim() ||
      urlState.stage !== 'ALL' ||
      urlState.ownership !== 'ALL' ||
      urlState.account
  );

  const isSheetOpen = Boolean(urlState.mode);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Header */}
      <StandardPageHeader
        title="Contacts"
        subtitle="Manage stakeholder profiles, organizational affiliations, and communication preferences."
        badgeLabel="contacts"
        badgeCount={totalElements}
        actions={
          <div className="flex items-center gap-2">
            <ActionTooltip label="Refresh contact list">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border-slate-200 rounded-[3px] gap-1.5"
                aria-label="Refresh contacts"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </ActionTooltip>

            {canWrite && (
              <Button
                size="sm"
                onClick={handleOpenCreate}
                className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
                aria-label="Create new contact"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Contact</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Toolbar */}
      <ContactsToolbar
        filters={{
          q: urlState.q,
          stage: urlState.stage,
          ownership: urlState.ownership,
          accountId: urlState.account,
          page: urlState.page,
          size: urlState.size,
        }}
        hasSessionTeam={Boolean(currentTeamId)}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Collection (Table / Mobile List / Empty / Loading / Error) */}
      <ContactsCollection
        contacts={contacts}
        totalElements={totalElements}
        totalPages={totalPages}
        page={urlState.page}
        pageSize={urlState.size}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasActiveFilters={hasActiveFilters}
        canWrite={canWrite}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={() => refetch()}
        onResetFilters={handleResetFilters}
        onCreateClick={handleOpenCreate}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Slide-over Detail & Editor Sheet */}
      <ContactEditorSheet
        isOpen={isSheetOpen}
        mode={urlState.mode || 'view'}
        contactId={urlState.contact}
        tenantId={tenantId}
        canWrite={canWrite}
        onClose={handleCloseSheet}
        onSwitchMode={handleSwitchSheetMode}
      />

      {/* Version-Safe Delete Confirmation Dialog */}
      <ContactDeleteDialog
        isOpen={Boolean(deleteTarget)}
        contact={deleteTarget}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
