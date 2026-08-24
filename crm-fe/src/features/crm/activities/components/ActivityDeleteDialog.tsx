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
import { ActivitySummary, ActivityDetail } from '../model/activityTypes';
import { Loader2, Trash2 } from 'lucide-react';

interface ActivityDeleteDialogProps {
  isOpen: boolean;
  activity: ActivitySummary | ActivityDetail | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ActivityDeleteDialog: React.FC<ActivityDeleteDialogProps> = ({
  isOpen,
  activity,
  isDeleting,
  onConfirm,
  onClose,
}) => {
  if (!activity) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="rounded-[4px] max-w-md font-sans">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5 text-rose-600 mb-1">
            <div className="p-2 rounded-[4px] bg-rose-50 border border-rose-200">
              <Trash2 className="w-4 h-4" />
            </div>
            <AlertDialogTitle className="text-sm font-bold text-slate-900">
              Delete activity?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-slate-600 space-y-2 pt-1">
            <p>
              Are you sure you want to delete <span className="font-semibold text-slate-900">&quot;{activity.subject}&quot;</span>?
            </p>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-[3px] border border-slate-200">
              This removes the activity from operational views and work queues. Use <strong>Cancel activity</strong> if the task was intentionally stopped or superseded.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 pt-2">
          <AlertDialogCancel
            onClick={onClose}
            disabled={isDeleting}
            className="h-8 text-xs font-semibold rounded-[3px]"
          >
            Keep Activity
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
              <span>Delete Activity</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
