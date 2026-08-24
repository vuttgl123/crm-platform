import React from 'react';
import { OpportunityPipelineLane } from './OpportunityPipelineLane';
import {
  PipelineItem,
  OpportunitySummaryResponse,
} from '../../model/opportunityTypes';
import { AlertCircle, Kanban } from 'lucide-react';

interface OpportunityPipelineBoardProps {
  pipeline: PipelineItem | null;
  accountsMap: Map<string, { displayName: string }>;
  canWrite: boolean;
  onEdit: (opp: OpportunitySummaryResponse) => void;
  onTransition: (opp: OpportunitySummaryResponse, action?: string) => void;
}

export const OpportunityPipelineBoard: React.FC<OpportunityPipelineBoardProps> = ({
  pipeline,
  accountsMap,
  canWrite,
  onEdit,
  onTransition,
}) => {
  if (!pipeline) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center space-y-3 font-sans w-full shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Kanban className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900">No active sales pipeline</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            An active pipeline with open stages is required before opportunities can be tracked on the board.
          </p>
        </div>
      </div>
    );
  }

  const sortedStages = React.useMemo(() => {
    if (!pipeline.stages) return [];
    return [...pipeline.stages]
      .filter((st) => st.active !== false)
      .sort((a, b) => a.displayOrder - b.displayOrder || a.id.localeCompare(b.id));
  }, [pipeline.stages]);

  if (sortedStages.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center space-y-3 font-sans w-full shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900">Pipeline has no configured stages</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please configure stages for pipeline &quot;{pipeline.name}&quot; in Pipeline Settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-4 pt-1 font-sans">
      <div className="flex items-start gap-4 min-w-max">
        {sortedStages.map((stage) => (
          <OpportunityPipelineLane
            key={stage.id}
            pipelineId={pipeline.id}
            stage={stage}
            accountsMap={accountsMap}
            canWrite={canWrite}
            onEdit={onEdit}
            onTransition={onTransition}
          />
        ))}
      </div>
    </div>
  );
};
