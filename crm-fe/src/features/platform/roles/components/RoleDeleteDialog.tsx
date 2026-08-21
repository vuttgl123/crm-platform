import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { RoleSummaryResponse } from '@/services/api/roleApi';

interface RoleDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleSummaryResponse | null;
  onConfirmDelete: (role: RoleSummaryResponse) => Promise<void>;
  isDeleting: boolean;
}

export const RoleDeleteDialog: React.FC<RoleDeleteDialogProps> = ({
  isOpen,
  onClose,
  role,
  onConfirmDelete,
  isDeleting,
}) => {
  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="max-w-md rounded-[4px]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
            <Trash2 className="w-5 h-5" />
          </div>
          <DialogTitle className="text-sm font-bold text-slate-900">
            Delete Security Role?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 pt-1">
            Are you sure you want to permanently delete custom role{' '}
            <span className="font-bold text-slate-900">"{role.name}"</span> (
            <span className="font-mono font-bold text-slate-900">{role.roleCode}</span>)?
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-[3px] space-y-1 text-xs text-amber-800">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Destructive Action</span>
          </div>
          <p>
            Any users currently assigned this role will lose their granted capabilities upon their next authenticated action. This action cannot be undone.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
            onClick={() => onConfirmDelete(role)}
            className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[3px] gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Role</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
