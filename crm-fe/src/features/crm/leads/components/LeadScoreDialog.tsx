import React, { useEffect } from 'react';
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
import { useCalculateScoreMutation } from '../hooks/leadQueries';
import { Sparkles, Loader2, CheckCircle, AlertTriangle, Flame, Sun, Snowflake } from 'lucide-react';

interface LeadScoreDialogProps {
  isOpen: boolean;
  lead: LeadSummaryResponse | LeadResponse | null;
  onClose: () => void;
}

export const LeadScoreDialog: React.FC<LeadScoreDialogProps> = ({
  isOpen,
  lead,
  onClose,
}) => {
  const {
    mutate: calculateScore,
    data: scoreResult,
    isPending,
    isError,
    error,
    reset,
  } = useCalculateScoreMutation();

  useEffect(() => {
    if (isOpen && lead?.id) {
      reset();
      calculateScore(lead.id);
    }
  }, [isOpen, lead?.id, calculateScore, reset]);

  if (!lead) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md font-sans">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="p-2 rounded-[4px] bg-blue-50 border border-blue-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Rule-Based Lead Score
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-slate-600">
            Automated qualification calculation for{' '}
            <strong className="text-slate-900 font-semibold">{lead.displayName}</strong>{' '}
            (<span className="font-mono text-slate-700">{lead.leadNumber}</span>).
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isPending && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Calculating qualification score…</span>
          </div>
        )}

        {isError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-[4px] text-xs text-rose-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Calculation Failed</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {(error as any)?.message || 'Could not calculate score for this lead.'}
            </p>
          </div>
        )}

        {!isPending && !isError && scoreResult && (
          <div className="space-y-4 text-xs">
            {/* Score & Grade Hero */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Score
                </span>
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {scoreResult.score}
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Grade Rating
                </span>
                {scoreResult.grade === 'HOT' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-[2px]">
                    <Flame className="w-3.5 h-3.5" />
                    <span>HOT LEAD</span>
                  </span>
                ) : scoreResult.grade === 'WARM' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-[2px]">
                    <Sun className="w-3.5 h-3.5" />
                    <span>WARM LEAD</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded-[2px]">
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>COLD LEAD</span>
                  </span>
                )}
              </div>
            </div>

            {/* Recommended Action */}
            {scoreResult.recommendedAction && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-[4px] space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">
                  Recommended Next Action
                </span>
                <p className="text-xs font-medium text-blue-900">
                  {scoreResult.recommendedAction}
                </p>
              </div>
            )}

            {/* Factors Breakdown */}
            {scoreResult.scoringFactors && scoreResult.scoringFactors.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Scoring Criteria Breakdown
                </span>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {scoreResult.scoringFactors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white border border-slate-200 rounded-[3px] flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{factor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter className="pt-2">
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs font-semibold rounded-[3px] bg-slate-800 hover:bg-slate-900 text-white"
          >
            Close
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
