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
import { AccountSummaryResponse, AccountResponse } from '../model/accountTypes';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface AccountDeleteDialogProps {
  isOpen: boolean;
  account: AccountSummaryResponse | AccountResponse | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirmDelete: (account: AccountSummaryResponse | AccountResponse) => void;
}

export const AccountDeleteDialog: React.FC<AccountDeleteDialogProps> = ({
  isOpen,
  account,
  isDeleting,
  onClose,
  onConfirmDelete,
}) => {
  if (!account) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <AlertDialogContent className="max-w-md font-sans">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-rose-600">
            <div className="p-2 rounded-[4px] bg-rose-50 border border-rose-100">
              <Trash2 className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Account
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-slate-600 space-y-2">
            <span>
              Are you sure you want to permanently delete the account record for{' '}
              <strong className="text-slate-900 font-semibold">{account.displayName}</strong>{' '}
              (<span className="font-mono text-slate-700">{account.accountNumber}</span>)?
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-[4px] space-y-1 text-xs text-amber-800">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Destructive Operation</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            This account will be permanently removed. If this account has active subsidiaries or child resources, please ensure they are reparented or resolved first.
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
            onClick={() => onConfirmDelete(account)}
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
                <span>Delete Account</span>
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
