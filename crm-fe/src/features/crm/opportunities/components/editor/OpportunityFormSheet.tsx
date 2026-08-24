import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
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
import { OpportunityForm } from './OpportunityForm';
import { OpportunityFormSchemaValues } from '../../model/opportunitySchemas';
import {
  OpportunityEditorMode,
  PipelineItem,
  LeadSourceItem,
} from '../../model/opportunityTypes';
import { TrendingUp, X } from 'lucide-react';

interface OpportunityFormSheetProps {
  isOpen: boolean;
  mode: OpportunityEditorMode;
  initialValues: OpportunityFormSchemaValues;
  pipelines: PipelineItem[];
  leadSources: LeadSourceItem[];
  campaigns: { id: string; name: string }[];
  isSubmitting: boolean;
  onSave: (values: OpportunityFormSchemaValues) => void;
  onClose: () => void;
}

export const OpportunityFormSheet: React.FC<OpportunityFormSheetProps> = ({
  isOpen,
  mode,
  initialValues,
  pipelines,
  leadSources,
  campaigns,
  isSubmitting,
  onSave,
  onClose,
}) => {
  const [isDirty, setIsDirty] = React.useState(false);
  const [showDiscardAlert, setShowDiscardAlert] = React.useState(false);

  const handleAttemptClose = () => {
    if (isDirty && !isSubmitting) {
      setShowDiscardAlert(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardAlert(false);
    setIsDirty(false);
    onClose();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleAttemptClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl p-0 flex flex-col bg-[#F7F8F9] z-50 border-l border-slate-200 font-sans"
        >
          {/* Header */}
          <SheetHeader className="p-4 bg-white border-b border-slate-200 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-left">
                <SheetTitle className="text-sm font-bold text-slate-900 leading-tight">
                  {mode === 'create' ? 'Create Opportunity' : 'Edit Opportunity'}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500">
                  {mode === 'create'
                    ? 'Register a new qualified revenue opportunity in the sales pipeline.'
                    : 'Update commercial values, timing, and stakeholder associations.'}
                </SheetDescription>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAttemptClose}
              className="p-1.5 rounded-[3px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </SheetHeader>

          {/* Form Scroll Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <OpportunityForm
              mode={mode}
              initialValues={initialValues}
              pipelines={pipelines}
              leadSources={leadSources}
              campaigns={campaigns}
              isSubmitting={isSubmitting}
              onSave={onSave}
              onCancel={handleAttemptClose}
              onDirtyChange={setIsDirty}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Discard Changes Warning Dialog */}
      <AlertDialog open={showDiscardAlert} onOpenChange={setShowDiscardAlert}>
        <AlertDialogContent className="rounded-[4px] max-w-md font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-slate-900">
              Discard unsaved changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              You have unsaved changes in this opportunity form. Closing now will discard all your edits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel
              onClick={() => setShowDiscardAlert(false)}
              className="h-8 text-xs font-semibold rounded-[3px]"
            >
              Continue Editing
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
