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
import { useAutoAssignMutation } from '../hooks/leadQueries';
import { mapLeadError } from '../model/leadErrors';
import { toast } from 'sonner';
import { UserCheck, Loader2, AlertCircle } from 'lucide-react';

interface LeadAutoAssignDialogProps {
  isOpen: boolean;
  lead: LeadSummaryResponse | LeadResponse | null;
  tenantId?: string;
  onClose: () => void;
}

export const LeadAutoAssignDialog: React.FC<LeadAutoAssignDialogProps> = ({
  isOpen,
  lead,
  tenantId = 'default',
  onClose,
}) => {
  const { mutateAsync: autoAssign, isPending } = useAutoAssignMutation(tenantId);

  if (!lead) return null;

  const handleConfirmAssign = async () => {
    try {
      const updated = await autoAssign(lead.id);
      toast.success(
        `Lead assigned to ${updated.owner?.type === 'USER' ? 'User' : 'Team'}: ${
          updated.owner?.id ? updated.owner.id.slice(0, 8) + '…' : 'eligible owner'
        }`
      );
      onClose();
    } catch (err: any) {
      const errorMapping = mapLeadError(err);
      toast.error(errorMapping.title, {
        description: errorMapping.description,
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <AlertDialogContent className="max-w-md font-sans">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="p-2 rounded-[4px] bg-indigo-50 border border-indigo-100">
              <UserCheck className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Auto-Assign Lead Ownership
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-slate-600 space-y-2">
            <span>
              Trigger automated round-robin assignment for{' '}
              <strong className="text-slate-900 font-semibold">{lead.displayName}</strong>{' '}
              (<span className="font-mono text-slate-700">{lead.leadNumber}</span>).
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Current Owner:</span>
            <span className="font-medium text-slate-800">
              {lead.owner
                ? `${lead.owner.type === 'USER' ? 'User' : 'Team'}: ${lead.owner.id.slice(0, 8)}…`
                : 'Unassigned'}
            </span>
          </div>

          <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              The system will assign this lead to the next active, eligible sales team member based on organizational distribution rules.
            </span>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={onClose}
            className="h-8 text-xs font-semibold rounded-[3px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={handleConfirmAssign}
            className="h-8 text-xs font-semibold rounded-[3px] bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-none"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Assigning…</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Confirm Assignment</span>
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
