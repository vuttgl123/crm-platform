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
import {
  ActivitySummary,
  ActivityDetail,
  ActivityScheduleRequest,
} from '../../model/activityTypes';
import {
  ActivityRescheduleSchemaValues,
  activityRescheduleSchema,
} from '../../model/activitySchemas';
import { Calendar, Loader2 } from 'lucide-react';

interface ActivityRescheduleDialogProps {
  isOpen: boolean;
  activity: ActivitySummary | ActivityDetail | null;
  isSubmitting: boolean;
  onConfirm: (payload: ActivityScheduleRequest) => void;
  onClose: () => void;
}

export const ActivityRescheduleDialog: React.FC<ActivityRescheduleDialogProps> = ({
  isOpen,
  activity,
  isSubmitting,
  onConfirm,
  onClose,
}) => {
  const parseDateTime = (isoStr?: string | null) => {
    if (!isoStr) return { date: '', time: '' };
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return { date: '', time: '' };
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return { date, time };
    } catch {
      return { date: '', time: '' };
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<ActivityRescheduleSchemaValues>({
    resolver: zodResolver(activityRescheduleSchema),
  });

  React.useEffect(() => {
    if (isOpen && activity) {
      const start = parseDateTime(activity.scheduledStartAt);
      const end = parseDateTime(activity.scheduledEndAt);
      reset({
        scheduledStartDate: start.date,
        scheduledStartTime: start.time || '09:00',
        scheduledEndDate: end.date || start.date,
        scheduledEndTime: end.time || '10:00',
      });
    }
  }, [isOpen, activity, reset]);

  if (!activity) return null;

  const handleQuickShift = (days: number) => {
    const startVal = watch('scheduledStartDate');
    const base = startVal ? new Date(startVal) : new Date();
    base.setDate(base.getDate() + days);
    const newDateStr = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
    setValue('scheduledStartDate', newDateStr, { shouldDirty: true });
    setValue('scheduledEndDate', newDateStr, { shouldDirty: true });
  };

  const handleFormSubmit = (data: ActivityRescheduleSchemaValues) => {
    let startIso: string | null = null;
    let endIso: string | null = null;

    if (data.scheduledStartDate) {
      const timeStr = data.scheduledStartTime || '09:00';
      startIso = new Date(`${data.scheduledStartDate}T${timeStr}:00`).toISOString();
    }

    if (data.scheduledEndDate) {
      const timeStr = data.scheduledEndTime || '10:00';
      endIso = new Date(`${data.scheduledEndDate}T${timeStr}:00`).toISOString();
    }

    onConfirm({
      version: activity.version,
      scheduledStartAt: startIso,
      scheduledEndAt: endIso,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-[4px] max-w-md p-0 overflow-hidden font-sans">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-[4px] bg-white border border-slate-200 shadow-2xs text-indigo-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-slate-900">
                  Reschedule Activity
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 line-clamp-1">
                  Adjust date and time for &quot;{activity.subject}&quot;
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-4 text-xs">
            {/* Quick Shift Presets */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Quick adjust:</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickShift(0)}
                className="h-6 px-2 text-[11px] rounded-[2px]"
              >
                Today
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickShift(1)}
                className="h-6 px-2 text-[11px] rounded-[2px]"
              >
                +1 Day
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickShift(7)}
                className="h-6 px-2 text-[11px] rounded-[2px]"
              >
                +1 Week
              </Button>
            </div>

            {/* Start Date & Time */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-800">
                Start Date & Time
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  {...register('scheduledStartDate')}
                  className="h-8 text-xs bg-white border-slate-200 rounded-[3px] font-mono flex-1"
                />
                <Input
                  type="time"
                  {...register('scheduledStartTime')}
                  className="h-8 w-28 text-xs bg-white border-slate-200 rounded-[3px] font-mono"
                />
              </div>
            </div>

            {/* End Date & Time */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-800">
                End Date & Time
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  {...register('scheduledEndDate')}
                  className="h-8 text-xs bg-white border-slate-200 rounded-[3px] font-mono flex-1"
                />
                <Input
                  type="time"
                  {...register('scheduledEndTime')}
                  className="h-8 w-28 text-xs bg-white border-slate-200 rounded-[3px] font-mono"
                />
              </div>
            </div>
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
                  <span>Saving…</span>
                </>
              ) : (
                <span>Update Schedule</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
