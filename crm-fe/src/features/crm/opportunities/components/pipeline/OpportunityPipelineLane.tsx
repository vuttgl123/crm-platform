import React from 'react';
import { Button } from '@/components/ui/button';
import { OpportunityCard } from './OpportunityCard';
import {
  PipelineStageItem,
  OpportunitySummaryResponse,
} from '../../model/opportunityTypes';
import { useOpportunityLaneQuery } from '../../hooks/opportunityQueries';
import { Loader2 } from 'lucide-react';

interface OpportunityPipelineLaneProps {
  pipelineId: string;
  stage: PipelineStageItem;
  accountsMap: Map<string, { displayName: string }>;
  canWrite: boolean;
  onEdit: (opp: OpportunitySummaryResponse) => void;
  onTransition: (opp: OpportunitySummaryResponse, action?: string) => void;
}

export const OpportunityPipelineLane: React.FC<OpportunityPipelineLaneProps> = ({
  pipelineId,
  stage,
  accountsMap,
  canWrite,
  onEdit,
  onTransition,
}) => {
  const [page, setPage] = React.useState(0);
  const [allOpportunities, setAllOpportunities] = React.useState<OpportunitySummaryResponse[]>([]);

  const status =
    stage.stageCategory === 'WON' ? 'WON' : stage.stageCategory === 'LOST' ? 'LOST' : 'OPEN';

  const { data, isLoading, isFetching } = useOpportunityLaneQuery(
    pipelineId,
    stage.id,
    status,
    page,
    20,
    true
  );

  React.useEffect(() => {
    if (data?.items) {
      if (page === 0) {
        setAllOpportunities(data.items);
      } else {
        setAllOpportunities((prev) => {
          const existingIds = new Set(prev.map((o) => o.id));
          const newItems = data.items.filter((o) => !existingIds.has(o.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [data, page]);

  // Reset pagination when pipeline changes
  React.useEffect(() => {
    setPage(0);
    setAllOpportunities([]);
  }, [pipelineId, stage.id]);

  const totalCount = data?.totalElements ?? allOpportunities.length;
  const hasMore = (data?.totalPages ?? 1) > page + 1;

  // Lane accent border color based on category
  const laneAccentColor =
    stage.stageCategory === 'WON'
      ? 'border-t-emerald-500'
      : stage.stageCategory === 'LOST'
      ? 'border-t-rose-500'
      : stage.displayOrder === 1
      ? 'border-t-purple-500'
      : 'border-t-blue-500';

  return (
    <div
      className={`w-[290px] shrink-0 bg-[#F7F8F9] border border-slate-200 border-t-2 ${laneAccentColor} rounded-[4px] flex flex-col max-h-[calc(100vh-240px)] min-h-[450px] font-sans`}
    >
      {/* Lane Header */}
      <div className="p-3 border-b border-slate-200 bg-white rounded-t-[3px] flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-xs text-slate-800 truncate" title={stage.name}>
              {stage.name}
            </h3>
            <span className="font-mono text-[10px] text-slate-400 font-semibold shrink-0">
              {stage.defaultProbability}%
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mt-0.5">
            {stage.stageCategory} Stage
          </span>
        </div>

        <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-[3px] shrink-0">
          {totalCount}
        </span>
      </div>

      {/* Cards Container */}
      <div className="p-2 space-y-2 overflow-y-auto flex-1 scrollbar-thin">
        {isLoading && page === 0 ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs">Loading opportunities…</span>
          </div>
        ) : allOpportunities.length === 0 ? (
          <div className="py-12 px-3 text-center text-slate-400 italic text-xs">
            No opportunities in this stage
          </div>
        ) : (
          allOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              accountName={accountsMap.get(opp.accountId)?.displayName}
              canWrite={canWrite}
              onEdit={onEdit}
              onTransition={onTransition}
            />
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="pt-2 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={isFetching}
              className="w-full h-7 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-white rounded-[3px]"
            >
              {isFetching ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading…
                </span>
              ) : (
                'Load more cards'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
