import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ActivitySummary,
  ActivityDetail,
  ActivityTransitionAction,
  ActivityTransitionRequest,
} from '../../model/activityTypes';
import {
  ActivityTransitionSchemaValues,
  activityTransitionSchema,
} from '../../model/activitySchemas';
import {
  Play,
  CheckCircle2,
  Pause,
  RotateCcw,
  Ban,
  Loader2,
} from 'lucide-react';

interface ActivityTransitionDialogProps {
  isOpen: boolean;
  activity: ActivitySummary | ActivityDetail | null;
  defaultAction?: ActivityTransitionAction;
  isSubmitting: boolean;
  onConfirm: (payload: ActivityTransitionRequest) => void;
  onClose: () => void;
}

export const ActivityTransitionDialog: React.FC<ActivityTransitionDialogProps> = ({
  isOpen,
  activity,
  defaultAction = 'COMPLETE',
  isSubmitting,
  onConfirm,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
  } = useForm<ActivityTransitionSchemaValues>({
    resolver: zodResolver(activityTransitionSchema),
    defaultValues: {
      action: defaultAction,
      completedAt: new Date().toISOString(),
      outcomeCode: '',
      outcomeNotes: '',
      reason: '',
    },
  });

  const watchAction = watch('action');

  React.useEffect(() => {
    if (isOpen && activity) {
      reset({
        action: defaultAction,
        completedAt: new Date().toISOString(),
        outcomeCode: '',
        outcomeNotes: '',
        reason: '',
      });
    }
  }, [isOpen, activity, defaultAction, reset]);

  if (!activity) return null;

  const handleFormSubmit = (data: ActivityTransitionSchemaValues) => {
    onConfirm({
      version: activity.version,
      action: data.action as ActivityTransitionAction,
      outcomeCode: data.outcomeCode || null,
      outcomeNotes: data.outcomeNotes || null,
      completedAt: data.action === 'COMPLETE' ? data.completedAt || new Date().toISOString() : null,
      reason: data.reason || null,
    });
  };

  const getActionTitle = () => {
    switch (watchAction) {
      case 'START':
        return 'Start Activity';
      case 'COMPLETE':
        return 'Complete Activity';
      case 'DEFER':
        return 'Defer Activity';
      case 'RESUME':
        return 'Resume Activity';
      case 'CANCEL':
        return 'Cancel Activity';
      case 'REOPEN':
        return 'Reopen Activity';
      default:
        return 'Transition Activity';
    }
  };

  const getActionIcon = () => {
    switch (watchAction) {
      case 'START':
      case 'RESUME':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'COMPLETE':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'DEFER':
        return <Pause className="w-5 h-5 text-amber-600" />;
      case 'CANCEL':
        return <Ban className="w-5 h-5 text-slate-600" />;
      case 'REOPEN':
        return <RotateCcw className="w-5 h-5 text-blue-600" />;
      default:
        return <Play className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-[4px] max-w-md p-0 overflow-hidden font-sans">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-[4px] bg-white border border-slate-200 shadow-2xs">
                {getActionIcon()}
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-slate-900">
                  {getActionTitle()}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 line-clamp-1">
                  Subject: <span className="font-semibold text-slate-700">{activity.subject}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-4 text-xs">
            {/* ACTION: COMPLETE */}
            {watchAction === 'COMPLETE' && (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[3px] text-emerald-800">
                  <p className="font-semibold">Completion Record</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Marking this activity complete records the final closure timestamp.
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Outcome Summary / Notes (Optional)
                  </Label>
                  <Textarea
                    {...register('outcomeNotes')}
                    rows={2}
                    placeholder="e.g. Client agreed to review quotation next Tuesday"
                    className="text-xs bg-white border-slate-200 rounded-[3px]"
                  />
                </div>
              </div>
            )}

            {/* ACTION: DEFER */}
            {watchAction === 'DEFER' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Deferring puts this activity on hold. You can resume or reschedule it at any time.
                </p>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Reason for Deferral (Optional)
                  </Label>
                  <Input
                    {...register('reason')}
                    placeholder="e.g. Waiting for client requirements document"
                    className="h-8 text-xs bg-white border-slate-200 rounded-[3px]"
                  />
                </div>
              </div>
            )}

            {/* ACTION: CANCEL */}
            {watchAction === 'CANCEL' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Cancelling marks this activity as aborted. Cancelled activities remain in audit records.
                </p>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Reason for Cancellation (Optional)
                  </Label>
                  <Input
                    {...register('reason')}
                    placeholder="e.g. Meeting superseded by executive workshop"
                    className="h-8 text-xs bg-white border-slate-200 rounded-[3px]"
                  />
                </div>
              </div>
            )}

            {/* ACTION: START / RESUME / REOPEN */}
            {['START', 'RESUME', 'REOPEN'].includes(watchAction) && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Are you ready to {watchAction.toLowerCase()} work on &quot;{activity.subject}&quot;?
                </p>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Note / Reason (Optional)
                  </Label>
                  <Input
                    {...register('reason')}
                    placeholder="Add optional notes…"
                    className="h-8 text-xs bg-white border-slate-200 rounded-[3px]"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-200 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-8 text-xs font-semibold rounded-[3px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-8 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing…</span>
                </>
              ) : (
                <span>Confirm</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
