import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  LeadEditorMode,
  LeadFormValues,
  LeadStatusItem,
  LeadSourceItem,
} from '../model/leadTypes';
import {
  useLeadDetailQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
} from '../hooks/leadQueries';
import {
  leadResponseToFormValues,
  createDefaultLeadFormValues,
  formValuesToCreateRequest,
  formValuesToUpdateRequest,
} from '../model/leadMappers';
import { mapLeadError } from '../model/leadErrors';
import { LeadForm } from './LeadForm';
import { toast } from 'sonner';
import { Target, Loader2, AlertTriangle } from 'lucide-react';
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

interface LeadEditorSheetProps {
  isOpen: boolean;
  mode: LeadEditorMode;
  leadId?: string | null;
  tenantId?: string;
  statuses: LeadStatusItem[];
  sources: LeadSourceItem[];
  onClose: () => void;
}

export const LeadEditorSheet: React.FC<LeadEditorSheetProps> = ({
  isOpen,
  mode,
  leadId,
  tenantId = 'default',
  statuses,
  sources,
  onClose,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Default active status
  const defaultStatusId = statuses.find((s) => s.defaultStatus && s.active)?.id || statuses[0]?.id || '';

  const isDetailNeeded = Boolean(isOpen && leadId && mode === 'edit');
  const {
    data: leadDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useLeadDetailQuery(leadId, tenantId, isDetailNeeded);

  const createMutation = useCreateLeadMutation(tenantId);
  const updateMutation = useUpdateLeadMutation(tenantId);

  useEffect(() => {
    setIsDirty(false);
  }, [isOpen, mode, leadId]);

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

  const handleSaveLead = async (values: LeadFormValues) => {
    try {
      if (mode === 'create') {
        const payload = formValuesToCreateRequest(values);
        await createMutation.mutateAsync(payload);
        toast.success('Lead created');
        setIsDirty(false);
        onClose();
      } else if (mode === 'edit' && leadDetail) {
        const payload = formValuesToUpdateRequest(values, leadDetail.version);
        await updateMutation.mutateAsync({ id: leadDetail.id, data: payload });
        toast.success('Lead updated');
        setIsDirty(false);
        onClose();
      }
    } catch (err: any) {
      const errorMapping = mapLeadError(err);
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
                <Target className="w-4 h-4" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-slate-900">
                  {mode === 'create'
                    ? 'Create New Lead'
                    : `Edit Lead: ${leadDetail?.displayName || ''}`}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 mt-0.5">
                  {mode === 'create'
                    ? 'Capture a new commercial lead and qualification record'
                    : 'Update commercial qualification data and contact channels'}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoadingDetail && mode === 'edit' && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Loading lead details…</span>
              </div>
            )}

            {isDetailError && mode === 'edit' && (
              <div className="py-12 p-6 bg-white rounded-[4px] border border-rose-200 text-center space-y-3 shadow-2xs">
                <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">Could not load lead</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {(detailError as any)?.message || 'The lead details could not be loaded.'}
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

            {mode === 'create' && (
              <LeadForm
                mode="create"
                initialValues={createDefaultLeadFormValues(defaultStatusId)}
                statuses={statuses}
                sources={sources}
                isSubmitting={isSubmitting}
                onSave={handleSaveLead}
                onCancel={handleRequestClose}
                onDirtyChange={setIsDirty}
              />
            )}

            {!isLoadingDetail && !isDetailError && mode === 'edit' && leadDetail && (
              <LeadForm
                mode="edit"
                initialValues={leadResponseToFormValues(leadDetail)}
                statuses={statuses}
                sources={sources}
                isSubmitting={isSubmitting}
                onSave={handleSaveLead}
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
              You have unsaved changes in this lead draft. Closing now will discard all pending edits.
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
