import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  AccountEditorMode,
  AccountFormValues,
} from '../model/accountTypes';
import {
  useAccountDetailQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
} from '../hooks/accountQueries';
import {
  accountResponseToFormValues,
  createDefaultAccountFormValues,
  formValuesToCreateRequest,
  formValuesToUpdateRequest,
} from '../model/accountMappers';
import { mapAccountError } from '../model/accountErrors';
import { AccountForm } from './AccountForm';
import { toast } from 'sonner';
import { Building2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AccountEditorSheetProps {
  isOpen: boolean;
  mode: AccountEditorMode;
  accountId?: string | null;
  parentId?: string | null;
  tenantId?: string;
  onClose: () => void;
}

export const AccountEditorSheet: React.FC<AccountEditorSheetProps> = ({
  isOpen,
  mode,
  accountId,
  parentId,
  tenantId = 'default',
  onClose,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const isDetailNeeded = Boolean(isOpen && accountId && mode === 'edit');
  const {
    data: accountDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useAccountDetailQuery(accountId, tenantId, isDetailNeeded);

  const createMutation = useCreateAccountMutation(tenantId);
  const updateMutation = useUpdateAccountMutation(tenantId);

  useEffect(() => {
    setIsDirty(false);
  }, [isOpen, mode, accountId]);

  const handleRequestClose = useCallback(() => {
    if (isDirty) {
      setShowDiscardDialog(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    setIsDirty(false);
    onClose();
  };

  const handleSaveAccount = async (values: AccountFormValues) => {
    try {
      if (mode === 'create' || mode === 'subsidiary') {
        const payload = formValuesToCreateRequest(values);
        await createMutation.mutateAsync(payload);
        toast.success(
          mode === 'subsidiary'
            ? 'Subsidiary account created'
            : 'Account created'
        );
        setIsDirty(false);
        onClose();
      } else if (mode === 'edit' && accountDetail) {
        const payload = formValuesToUpdateRequest(values, accountDetail.version);
        await updateMutation.mutateAsync({ id: accountDetail.id, data: payload });
        toast.success('Account updated');
        setIsDirty(false);
        onClose();
      }
    } catch (err: any) {
      const errorMapping = mapAccountError(err);
      toast.error(errorMapping.title, {
        description: errorMapping.description,
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleRequestClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl p-0 flex flex-col bg-[#F7F8F9] z-50 border-l border-slate-200 font-sans"
        >
          {/* Header */}
          <SheetHeader className="px-6 py-4 bg-white border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-slate-900">
                  {mode === 'create'
                    ? 'Create New Account'
                    : mode === 'subsidiary'
                    ? 'Add Subsidiary Account'
                    : `Edit Account: ${accountDetail?.displayName || ''}`}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 mt-0.5">
                  {mode === 'create'
                    ? 'Register a new enterprise customer or commercial organization'
                    : mode === 'subsidiary'
                    ? 'Register an organizational subsidiary under parent hierarchy'
                    : 'Update account profile, classification, and preferences'}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoadingDetail && mode === 'edit' && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Loading account details…</span>
              </div>
            )}

            {isDetailError && mode === 'edit' && (
              <div className="py-12 p-6 bg-white rounded-[4px] border border-rose-200 text-center space-y-3 shadow-2xs">
                <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">Could not load account</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {(detailError as any)?.message || 'The account details could not be loaded.'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => refetchDetail()} className="rounded-[3px]">
                    Retry
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose} className="rounded-[3px]">
                    Close
                  </Button>
                </div>
              </div>
            )}

            {(mode === 'create' || mode === 'subsidiary') && (
              <AccountForm
                mode={mode}
                initialValues={createDefaultAccountFormValues(parentId)}
                isSubmitting={isSubmitting}
                onSave={handleSaveAccount}
                onCancel={handleRequestClose}
                onDirtyChange={setIsDirty}
              />
            )}

            {!isLoadingDetail && !isDetailError && mode === 'edit' && accountDetail && (
              <AccountForm
                mode="edit"
                accountId={accountDetail.id}
                initialValues={accountResponseToFormValues(accountDetail)}
                isSubmitting={isSubmitting}
                onSave={handleSaveAccount}
                onCancel={handleRequestClose}
                onDirtyChange={setIsDirty}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Discard Confirmation Modal */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="max-w-md font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Discard unsaved changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              You have unsaved changes in this account draft. Closing now will discard all pending edits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="h-8 text-xs font-semibold rounded-[3px]">
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDiscard}
              className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[3px]"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
