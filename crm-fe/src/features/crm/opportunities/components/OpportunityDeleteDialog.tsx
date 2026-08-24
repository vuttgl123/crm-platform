import React from 'react';
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
import { OpportunitySummaryResponse, OpportunityResponse } from '../model/opportunityTypes';
import { Loader2, Trash2 } from 'lucide-react';

interface OpportunityDeleteDialogProps {
  isOpen: boolean;
  opportunity: OpportunitySummaryResponse | OpportunityResponse | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const OpportunityDeleteDialog: React.FC<OpportunityDeleteDialogProps> = ({
  isOpen,
  opportunity,
  isDeleting,
  onConfirm,
  onClose,
}) => {
  if (!opportunity) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="rounded-[4px] max-w-md font-sans">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5 text-rose-600 mb-1">
            <div className="p-2 rounded-[4px] bg-rose-50 border border-rose-200">
              <Trash2 className="w-4 h-4" />
            </div>
            <AlertDialogTitle className="text-sm font-bold text-slate-900">
              Delete opportunity?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-slate-600 space-y-2 pt-1">
            <p>
              Are you sure you want to delete <span className="font-semibold text-slate-900">&quot;{opportunity.name}&quot;</span> ({opportunity.opportunityNumber})?
            </p>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-[3px] border border-slate-200">
              This removes the opportunity from active CRM views. Use <strong>Cancel opportunity</strong> when the deal was intentionally stopped.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 pt-2">
          <AlertDialogCancel
            onClick={onClose}
            disabled={isDeleting}
            className="h-8 text-xs font-semibold rounded-[3px]"
          >
            Keep Opportunity
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[3px] gap-1.5 shadow-none"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              <span>Delete Opportunity</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
