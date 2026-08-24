import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LeadSummaryResponse, LeadResponse } from '../model/leadTypes';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface LeadDeleteDialogProps {
  isOpen: boolean;
  lead: LeadSummaryResponse | LeadResponse | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirmDelete: (lead: LeadSummaryResponse | LeadResponse) => void;
}

export const LeadDeleteDialog: React.FC<LeadDeleteDialogProps> = ({
  isOpen,
  lead,
  isDeleting,
  onClose,
  onConfirmDelete,
}) => {
  if (!lead) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <AlertDialogContent className="max-w-md font-sans">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-rose-600">
            <div className="p-2 rounded-[4px] bg-rose-50 border border-rose-100">
              <Trash2 className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Lead
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-slate-600 space-y-2">
            <span>
              Are you sure you want to permanently delete the lead record for{' '}
              <strong className="text-slate-900 font-semibold">{lead.displayName}</strong>{' '}
              (<span className="font-mono text-slate-700">{lead.leadNumber}</span>)?
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-[4px] space-y-1 text-xs text-amber-800">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Destructive Action</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            This lead and its qualification data will be permanently removed. This action cannot be undone.
          </p>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDeleting}
            onClick={onClose}
            className="h-8 text-xs font-semibold rounded-[3px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isDeleting}
            onClick={() => onConfirmDelete(lead)}
            className="h-8 text-xs font-semibold rounded-[3px] bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-none"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
