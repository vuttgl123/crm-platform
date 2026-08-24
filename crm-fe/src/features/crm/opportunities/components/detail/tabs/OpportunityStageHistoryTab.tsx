import React from 'react';
import {
  OpportunityStageHistoryEntry,
  PipelineItem,
} from '../../../model/opportunityTypes';
import { formatDateTime } from '@/lib/formatters';
import {
  renderOpportunityStatusBadge,
  renderOpportunityStageBadge,
} from '@/config/crmStatusConfig';
import {
  History,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Clock,
  User,
} from 'lucide-react';

interface OpportunityStageHistoryTabProps {
  historyEntries: OpportunityStageHistoryEntry[];
  pipelines: PipelineItem[];
  isLoading: boolean;
}

export const OpportunityStageHistoryTab: React.FC<OpportunityStageHistoryTabProps> = ({
  historyEntries,
  pipelines,
  isLoading,
}) => {
  const stageMap = React.useMemo(() => {
    const map = new Map<string, { name: string; category?: string }>();
    pipelines.forEach((p) => {
      p.stages?.forEach((st) => {
        map.set(st.id, { name: st.name, category: st.stageCategory });
      });
    });
    return map;
  }, [pipelines]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 font-sans">
        Loading stage audit history…
      </div>
    );
  }

  if (historyEntries.length === 0) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-[4px] text-center space-y-2 font-sans shadow-2xs">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <History className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-slate-700">No stage history recorded</p>
        <p className="text-[11px] text-slate-400">
          Stage and lifecycle transitions will be immutably recorded here.
        </p>
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'MARKED_WON':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'MARKED_LOST':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'CANCELLED':
        return <Ban className="w-4 h-4 text-slate-600" />;
      case 'REOPENED':
        return <RotateCcw className="w-4 h-4 text-blue-600" />;
      default:
        return <ArrowRight className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-4">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <History className="w-4 h-4 text-purple-600" />
          <span className="text-xs uppercase tracking-wider">
            Lifecycle & Stage Audit Trail
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {historyEntries.map((entry) => {
            const fromStage = entry.fromStageId ? stageMap.get(entry.fromStageId) : null;
            const toStage = entry.toStageId ? stageMap.get(entry.toStageId) : null;

            return (
              <div key={entry.id} className="relative space-y-1">
                {/* Node icon indicator */}
                <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-white border border-slate-300 flex items-center justify-center">
                  {getEventIcon(entry.eventType)}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      {entry.eventType.replace('_', ' ')}
                    </span>
                    {entry.fromStatus && entry.toStatus && entry.fromStatus !== entry.toStatus && (
                      <div className="flex items-center gap-1">
                        {renderOpportunityStatusBadge(entry.fromStatus)}
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        {renderOpportunityStatusBadge(entry.toStatus)}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDateTime(entry.changedAt)}
                  </span>
                </div>

                {/* Stage transition representation */}
                {(fromStage || toStage) && (
                  <div className="flex items-center gap-2 pt-0.5">
                    {fromStage && (
                      <span className="text-slate-600">
                        {renderOpportunityStageBadge(fromStage.name, fromStage.category)}
                      </span>
                    )}
                    {fromStage && toStage && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                    {toStage && (
                      <span className="text-slate-800 font-medium">
                        {renderOpportunityStageBadge(toStage.name, toStage.category)}
                      </span>
                    )}
                  </div>
                )}

                {/* Reason notes */}
                {entry.reason && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-[3px] border border-slate-100 mt-1">
                    {entry.reason}
                  </p>
                )}

                {/* Changed by */}
                {entry.changedBy && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-0.5">
                    <User className="w-3 h-3" />
                    <span>Actor: {entry.changedBy}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
