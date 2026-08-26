import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/core/session/useAuth';
import { can } from '@/core/permissions/evaluator';
import {
  useAccountDetailQuery,
  useDeleteAccountMutation,
} from './hooks/accountQueries';
import { parseAccountDetailTab } from './accountSearchParams';
import { AccountDetailTab, AccountEditorMode } from './model/accountTypes';
import { mapAccountError } from './model/accountErrors';
import { AccountDetailHeader } from './components/detail/AccountDetailHeader';
import { AccountOverviewTab } from './components/detail/tabs/AccountOverviewTab';
import { AccountAddressesTab } from './components/detail/tabs/AccountAddressesTab';
import { AccountChannelsTab } from './components/detail/tabs/AccountChannelsTab';
import { AccountRelationshipsTab } from './components/detail/tabs/AccountRelationshipsTab';
import { AccountSubsidiariesTab } from './components/detail/tabs/AccountSubsidiariesTab';
import { AccountNotesTab } from './components/detail/tabs/AccountNotesTab';
import { AccountEditorSheet } from './components/AccountEditorSheet';
import { AccountDeleteDialog } from './components/AccountDeleteDialog';
import { StandardGlidingTabs, TabItem } from '@/components/common/StandardGlidingTabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  Mail,
  Network,
  GitFork,
  StickyNote,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export const AccountDetailPage: React.FC = () => {
  const { id: accountId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const tenantId = session?.tenant?.id || 'default';

  const canWrite = can('crm_account.write', session);

  // Tab State in URL
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = useMemo(
    () => parseAccountDetailTab(searchParams),
    [searchParams]
  );

  const handleTabChange = useCallback(
    (tab: AccountDetailTab) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (tab === 'overview') {
            next.delete('tab');
          } else {
            next.set('tab', tab);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Fetch Account Detail
  const {
    data: account,
    isLoading,
    isError,
    error,
    refetch,
  } = useAccountDetailQuery(accountId, tenantId, Boolean(accountId));

  // Editor Sheet State
  const [editorState, setEditorState] = useState<{
    open: boolean;
    mode: AccountEditorMode;
    parentId?: string;
  }>({
    open: false,
    mode: 'edit',
  });

  // Delete State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteAccountMutation(tenantId);

  const handleConfirmDelete = async () => {
    if (!account) return;
    try {
      await deleteMutation.mutateAsync({ id: account.id, version: account.version });
      toast.success('Account deleted');
      navigate('/app/crm/accounts', { replace: true });
    } catch (err: any) {
      const errorMapping = mapAccountError(err);
      toast.error(errorMapping.title, {
        description: errorMapping.description,
      });
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 font-sans w-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Loading account workspace…</span>
      </div>
    );
  }

  // Not Found / Error State
  if (isError || !account) {
    return (
      <div className="py-12 max-w-lg mx-auto font-sans">
        <div className="p-6 bg-white rounded-[4px] border border-slate-200 text-center space-y-3 shadow-2xs">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Account Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {(error as any)?.message ||
              'The requested account record could not be found or you do not have permission to view it.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-8 text-xs rounded-[3px]"
            >
              Retry
            </Button>
            <Button
              asChild
              size="sm"
              className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-[3px]"
            >
              <Link to="/app/crm/accounts">Back to Accounts</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: TabItem<AccountDetailTab>[] = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'subsidiaries', label: 'Subsidiaries', icon: GitFork },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'channels', label: 'Communication Channels', icon: Mail },
    { id: 'relationships', label: 'Commercial Relationships', icon: Network },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ];

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Account Workspace Identity Header */}
      <AccountDetailHeader
        account={account}
        canWrite={canWrite}
        onEdit={() => setEditorState({ open: true, mode: 'edit' })}
        onDelete={() => setDeleteOpen(true)}
      />

      {/* Reusable Standard Gliding Tabs Navigation Bar */}
      <StandardGlidingTabs
        tabs={tabs}
        activeTab={currentTab}
        onChange={handleTabChange}
      />

      {/* Active Tab Content Surface with smooth gliding entrance */}
      <div key={currentTab} className="pt-1 animate-tab-content">
        {currentTab === 'overview' && <AccountOverviewTab account={account} />}
        {currentTab === 'subsidiaries' && (
          <AccountSubsidiariesTab
            account={account}
            canWrite={canWrite}
            onAddSubsidiary={() =>
              setEditorState({ open: true, mode: 'subsidiary', parentId: account.id })
            }
          />
        )}
        {currentTab === 'addresses' && (
          <AccountAddressesTab accountId={account.id} canWrite={canWrite} />
        )}
        {currentTab === 'channels' && (
          <AccountChannelsTab accountId={account.id} canWrite={canWrite} />
        )}
        {currentTab === 'relationships' && (
          <AccountRelationshipsTab accountId={account.id} canWrite={canWrite} />
        )}
        {currentTab === 'notes' && (
          <AccountNotesTab accountId={account.id} canWrite={canWrite} />
        )}
      </div>

      {/* Edit / Subsidiary Sheet */}
      <AccountEditorSheet
        isOpen={editorState.open}
        mode={editorState.mode}
        accountId={account.id}
        parentId={editorState.parentId}
        tenantId={tenantId}
        onClose={() => setEditorState({ open: false, mode: 'edit' })}
      />

      {/* Delete Confirmation Dialog */}
      <AccountDeleteDialog
        isOpen={deleteOpen}
        account={account}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default AccountDetailPage;
