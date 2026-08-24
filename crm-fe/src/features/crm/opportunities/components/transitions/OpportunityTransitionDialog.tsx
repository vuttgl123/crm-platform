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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  OpportunitySummaryResponse,
  OpportunityResponse,
  PipelineItem,
  OpportunityLostReasonItem,
  OpportunityTransitionRequest,
  OpportunityTransitionAction,
} from '../../model/opportunityTypes';
import {
  OpportunityTransitionSchemaValues,
  opportunityTransitionSchema,
} from '../../model/opportunitySchemas';
import {
  ArrowRightCircle,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface OpportunityTransitionDialogProps {
  isOpen: boolean;
  opportunity: OpportunitySummaryResponse | OpportunityResponse | null;
  defaultAction?: OpportunityTransitionAction;
  pipelines: PipelineItem[];
  lostReasons: OpportunityLostReasonItem[];
  isSubmitting: boolean;
  onConfirm: (payload: OpportunityTransitionRequest) => void;
  onClose: () => void;
}

export const OpportunityTransitionDialog: React.FC<OpportunityTransitionDialogProps> = ({
  isOpen,
  opportunity,
  defaultAction = 'MOVE_STAGE',
  pipelines,
  lostReasons,
  isSubmitting,
  onConfirm,
  onClose,
}) => {
  const currentPipeline = React.useMemo(() => {
    return pipelines.find((p) => p.id === opportunity?.pipelineId);
  }, [pipelines, opportunity?.pipelineId]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OpportunityTransitionSchemaValues>({
    resolver: zodResolver(opportunityTransitionSchema),
    defaultValues: {
      action: defaultAction,
      targetPipelineId: opportunity?.pipelineId,
      actualCloseDate: new Date().toISOString().split('T')[0],
    },
  });

  const watchAction = watch('action');
  const watchTargetPipelineId = watch('targetPipelineId');

  React.useEffect(() => {
    if (isOpen && opportunity) {
      reset({
        action: defaultAction,
        targetPipelineId: opportunity.pipelineId,
        targetStageId: '',
        actualCloseDate: new Date().toISOString().split('T')[0],
        lostReasonId: '',
        lostReasonNotes: '',
        reason: '',
      });
    }
  }, [isOpen, opportunity, defaultAction, reset]);

  if (!opportunity) return null;

  const targetPipeline =
    pipelines.find((p) => p.id === (watchTargetPipelineId || opportunity.pipelineId)) || currentPipeline;

  const openStages = React.useMemo(() => {
    return (targetPipeline?.stages || []).filter((s) => s.active !== false && s.stageCategory === 'OPEN');
  }, [targetPipeline]);

  const wonStages = React.useMemo(() => {
    return (currentPipeline?.stages || []).filter((s) => s.active !== false && s.stageCategory === 'WON');
  }, [currentPipeline]);

  const lostStages = React.useMemo(() => {
    return (currentPipeline?.stages || []).filter((s) => s.active !== false && s.stageCategory === 'LOST');
  }, [currentPipeline]);

  const handleFormSubmit = (data: OpportunityTransitionSchemaValues) => {
    onConfirm({
      version: opportunity.version,
      action: data.action as OpportunityTransitionAction,
      targetPipelineId: data.targetPipelineId,
      targetStageId: data.targetStageId,
      actualCloseDate: data.actualCloseDate,
      lostReasonId: data.lostReasonId,
      lostReasonNotes: data.lostReasonNotes,
      reason: data.reason,
    });
  };

  const getActionTitle = () => {
    switch (watchAction) {
      case 'MOVE_STAGE':
        return 'Move Opportunity Stage';
      case 'CHANGE_PIPELINE':
        return 'Change Opportunity Pipeline';
      case 'MARK_WON':
        return 'Mark Opportunity as Closed Won';
      case 'MARK_LOST':
        return 'Mark Opportunity as Closed Lost';
      case 'CANCEL':
        return 'Cancel Opportunity';
      case 'REOPEN':
        return 'Reopen Opportunity';
      default:
        return 'Transition Opportunity';
    }
  };

  const getActionIcon = () => {
    switch (watchAction) {
      case 'MARK_WON':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'MARK_LOST':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'CANCEL':
        return <Ban className="w-5 h-5 text-slate-600" />;
      case 'REOPEN':
        return <RotateCcw className="w-5 h-5 text-blue-600" />;
      default:
        return <ArrowRightCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-[4px] max-w-lg p-0 overflow-hidden font-sans">
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
                <DialogDescription className="text-xs text-slate-500">
                  Deal: <span className="font-semibold text-slate-700">{opportunity.name}</span> ({opportunity.opportunityNumber})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-4 text-xs">
            {/* Error summary */}
            {Object.keys(errors).length > 0 && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-[3px] flex items-start gap-2 text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  {Object.values(errors).map((err, idx) => (
                    <p key={idx}>{err?.message}</p>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION 1: MOVE STAGE */}
            {watchAction === 'MOVE_STAGE' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Destination Stage <span className="text-rose-600">*</span>
                  </Label>
                  <Select
                    value={watch('targetStageId')}
                    onValueChange={(val) => setValue('targetStageId', val, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                      <SelectValue placeholder="Select target stage" />
                    </SelectTrigger>
                    <SelectContent className="text-xs font-sans">
                      {openStages.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          {st.name} ({st.defaultProbability}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Transition Reason (Optional)
                  </Label>
                  <Input
                    {...register('reason')}
                    placeholder="e.g. Budget approved, moving to proposal phase"
                    className="h-8 text-xs bg-white border-slate-200 rounded-[3px]"
                  />
                </div>
              </div>
            )}

            {/* ACTION 2: CHANGE PIPELINE */}
            {watchAction === 'CHANGE_PIPELINE' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Destination Pipeline <span className="text-rose-600">*</span>
                  </Label>
                  <Select
                    value={watchTargetPipelineId}
                    onValueChange={(val) => {
                      setValue('targetPipelineId', val, { shouldValidate: true });
                      setValue('targetStageId', ''); // Reset stage
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                      <SelectValue placeholder="Select target pipeline" />
                    </SelectTrigger>
                    <SelectContent className="text-xs font-sans">
                      {pipelines.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Destination Stage <span className="text-rose-600">*</span>
                  </Label>
                  <Select
                    value={watch('targetStageId')}
                    onValueChange={(val) => setValue('targetStageId', val, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                      <SelectValue placeholder="Select target stage" />
                    </SelectTrigger>
                    <SelectContent className="text-xs font-sans">
                      {openStages.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          {st.name} ({st.defaultProbability}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* ACTION 3: MARK WON */}
            {watchAction === 'MARK_WON' && (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[3px] text-emerald-800">
                  <p className="font-semibold">Revenue Win Confirmation</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Marking this opportunity as Won will set probability to 100% and record victory closure.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-800">
                      Won Stage
                    </Label>
                    <Select
                      value={watch('targetStageId') || wonStages[0]?.id || ''}
                      onValueChange={(val) => setValue('targetStageId', val)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                        <SelectValue placeholder="Select won stage" />
                      </SelectTrigger>
                      <SelectContent className="text-xs font-sans">
                        {wonStages.map((st) => (
                          <SelectItem key={st.id} value={st.id}>
                            {st.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-800">
                      Actual Close Date <span className="text-rose-600">*</span>
                    </Label>
                    <Input
                      type="date"
                      {...register('actualCloseDate')}
                      className="h-8 text-xs bg-white border-slate-200 rounded-[3px] font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ACTION 4: MARK LOST */}
            {watchAction === 'MARK_LOST' && (
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-[3px] text-rose-800">
                  <p className="font-semibold">Deal Loss Recording</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Please specify the root cause lost reason to maintain sales intelligence accuracy.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-800">
                      Lost Reason <span className="text-rose-600">*</span>
                    </Label>
                    <Select
                      value={watch('lostReasonId')}
                      onValueChange={(val) => setValue('lostReasonId', val, { shouldValidate: true })}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                        <SelectValue placeholder="Select lost reason" />
                      </SelectTrigger>
                      <SelectContent className="text-xs font-sans">
                        {lostReasons.map((lr) => (
                          <SelectItem key={lr.id} value={lr.id}>
                            {lr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-800">
                      Actual Close Date <span className="text-rose-600">*</span>
                    </Label>
                    <Input
                      type="date"
                      {...register('actualCloseDate')}
                      className="h-8 text-xs bg-white border-slate-200 rounded-[3px] font-mono"
                    />
                  </div>

                  {lostStages.length > 0 && (
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs font-semibold text-slate-800">
                        Lost Stage (Optional)
                      </Label>
                      <Select
                        value={watch('targetStageId') || lostStages[0]?.id || ''}
                        onValueChange={(val) => setValue('targetStageId', val)}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                          <SelectValue placeholder="Select lost stage" />
                        </SelectTrigger>
                        <SelectContent className="text-xs font-sans">
                          {lostStages.map((st) => (
                            <SelectItem key={st.id} value={st.id}>
                              {st.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Lost Reason Notes (Optional)
                  </Label>
                  <Textarea
                    {...register('lostReasonNotes')}
                    rows={2}
                    placeholder="Details about competitor pricing, feature gap, or timing…"
                    className="text-xs bg-white border-slate-200 rounded-[3px]"
                  />
                </div>
              </div>
            )}

            {/* ACTION 5: CANCEL */}
            {watchAction === 'CANCEL' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Are you sure you want to cancel this opportunity? Cancelled deals are removed from active pipelines.
                </p>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Cancellation Date <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    type="date"
                    {...register('actualCloseDate')}
                    className="h-8 text-xs bg-white border-slate-200 rounded-[3px] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Reason for Cancellation
                  </Label>
                  <Input
                    {...register('reason')}
                    placeholder="e.g. Client cancelled project indefinitely"
                    className="h-8 text-xs bg-white border-slate-200 rounded-[3px]"
                  />
                </div>
              </div>
            )}

            {/* ACTION 6: REOPEN */}
            {watchAction === 'REOPEN' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Reopening this opportunity will reset its status back to <span className="font-semibold text-blue-700">OPEN</span> and clear historical close dates.
                </p>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Target Open Stage <span className="text-rose-600">*</span>
                  </Label>
                  <Select
                    value={watch('targetStageId')}
                    onValueChange={(val) => setValue('targetStageId', val, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                      <SelectValue placeholder="Select target open stage" />
                    </SelectTrigger>
                    <SelectContent className="text-xs font-sans">
                      {openStages.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          {st.name} ({st.defaultProbability}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <span>Confirm Transition</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
