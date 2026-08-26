import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ContactEditorMode, ContactFormValues } from '../model/contactTypes';
import {
  useContactDetailQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
} from '../hooks/contactQueries';
import {
  contactResponseToFormValues,
  createDefaultContactFormValues,
  formValuesToCreateRequest,
  formValuesToUpdateRequest,
} from '../model/contactMappers';
import { mapContactError } from '../model/contactErrors';
import { ContactForm } from './ContactForm';
import { ContactDetails } from './ContactDetails';
import { toast } from 'sonner';
import { Users, Loader2, AlertTriangle, Edit, AlertCircle } from 'lucide-react';
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

interface ContactEditorSheetProps {
  isOpen: boolean;
  mode: ContactEditorMode;
  contactId?: string | null;
  tenantId?: string;
  canWrite?: boolean;
  onClose: () => void;
  onSwitchMode?: (newMode: ContactEditorMode) => void;
}

export const ContactEditorSheet: React.FC<ContactEditorSheetProps> = ({
  isOpen,
  mode,
  contactId,
  tenantId = 'default',
  canWrite = true,
  onClose,
  onSwitchMode,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const isDetailNeeded = Boolean(isOpen && contactId && (mode === 'edit' || mode === 'view'));
  const {
    data: contactDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useContactDetailQuery(contactId, tenantId, isDetailNeeded);

  const createMutation = useCreateContactMutation(tenantId);
  const updateMutation = useUpdateContactMutation(tenantId);

  useEffect(() => {
    setIsDirty(false);
  }, [isOpen, mode, contactId]);

  const handleRequestClose = useCallback(() => {
    if (isDirty && mode !== 'view') {
      setShowDiscardDialog(true);
    } else {
      onClose();
    }
  }, [isDirty, mode, onClose]);

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    setIsDirty(false);
    onClose();
  };

  const handleSaveContact = async (values: ContactFormValues) => {
    try {
      if (mode === 'create') {
        const payload = formValuesToCreateRequest(values);
        await createMutation.mutateAsync(payload);
        toast.success('Contact created');
        setIsDirty(false);
        onClose();
      } else if (mode === 'edit' && contactDetail) {
        const payload = formValuesToUpdateRequest(values, contactDetail.version);
        await updateMutation.mutateAsync({ id: contactDetail.id, data: payload });
        toast.success('Contact updated');
        setIsDirty(false);
        onClose();
      }
    } catch (err: any) {
      const errorMapping = mapContactError(err);
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
          <SheetHeader className="px-6 py-4 bg-white border-b border-slate-200 shrink-0 pr-12">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-slate-900">
                    {mode === 'create'
                      ? 'Create New Contact'
                      : mode === 'view'
                      ? `Contact Profile: ${contactDetail?.displayName || ''}`
                      : `Edit Contact: ${contactDetail?.displayName || ''}`}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-slate-500 mt-0.5">
                    {mode === 'create'
                      ? 'Add a new stakeholder or business contact to your CRM directory'
                      : mode === 'view'
                      ? 'Comprehensive stakeholder background and account linkages'
                      : 'Update contact details, account affiliation, and preferences'}
                  </SheetDescription>
                </div>
              </div>

              {mode === 'view' && canWrite && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSwitchMode?.('edit')}
                  className="h-8 px-3 text-xs font-semibold rounded-[3px] border-slate-200 hover:bg-slate-50 gap-1.5 shrink-0"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit Contact</span>
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoadingDetail && (mode === 'edit' || mode === 'view') && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Loading contact details…</span>
              </div>
            )}

            {isDetailError && (mode === 'edit' || mode === 'view') && (
              <div className="py-12 p-6 bg-white rounded-[4px] border border-rose-200 text-center space-y-3 shadow-2xs">
                <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">Could not load contact</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {(detailError as any)?.message || 'The contact details could not be loaded.'}
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

            {mode === 'view' && contactDetail && !isLoadingDetail && !isDetailError && (
              <ContactDetails contact={contactDetail} />
            )}

            {mode === 'create' && (
              <ContactForm
                mode="create"
                initialValues={createDefaultContactFormValues()}
                isSubmitting={isSubmitting}
                onSave={handleSaveContact}
                onCancel={handleRequestClose}
                onDirtyChange={setIsDirty}
              />
            )}

            {!isLoadingDetail && !isDetailError && mode === 'edit' && contactDetail && (
              <ContactForm
                mode="edit"
                initialValues={contactResponseToFormValues(contactDetail)}
                isSubmitting={isSubmitting}
                onSave={handleSaveContact}
                onCancel={handleRequestClose}
                onDirtyChange={setIsDirty}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Discard Confirmation Modal */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="max-w-md font-sans rounded-[4px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <AlertCircle className="w-5 h-5" />
              <AlertDialogTitle className="text-base font-bold text-slate-900">
                Discard unsaved changes?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-slate-600">
              You have unsaved changes in this contact draft. Closing now will discard all pending edits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="h-8 text-xs font-semibold rounded-[3px] border-slate-200">
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
