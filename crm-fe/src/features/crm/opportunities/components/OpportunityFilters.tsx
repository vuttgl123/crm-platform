import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  OpportunityParsedSearchParams,
} from '../model/opportunitySearchParams';
import {
  PipelineItem,
  OpportunityStatus,
  OpportunityType,
} from '../model/opportunityTypes';
import {
  Search,
  RotateCcw,
  ListFilter,
  Kanban,
  Table as TableIcon,
} from 'lucide-react';

interface OpportunityFiltersProps {
  params: OpportunityParsedSearchParams;
  pipelines: PipelineItem[];
  selectedPipeline?: PipelineItem | null;
  onUpdateParams: (newParams: Partial<OpportunityParsedSearchParams>) => void;
  onResetFilters: () => void;
}

export const OpportunityFilters: React.FC<OpportunityFiltersProps> = ({
  params,
  pipelines,
  selectedPipeline,
  onUpdateParams,
  onResetFilters,
}) => {
  const [searchInput, setSearchInput] = React.useState(params.q || '');

  React.useEffect(() => {
    setSearchInput(params.q || '');
  }, [params.q]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateParams({ q: searchInput.trim() });
  };

  const hasActiveFilters = Boolean(
    params.q ||
      params.accountId ||
      params.stageId ||
      params.status ||
      params.opportunityType ||
      params.ownerId
  );

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-3 space-y-3 shadow-2xs font-sans w-full">
      {/* Row 1: View Mode Switcher, Search Input, and Pipeline Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: View Mode Segmented Switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-[4px] border border-slate-200 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => onUpdateParams({ view: 'list' })}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[3px] transition-colors ${
              params.view === 'list'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            type="button"
            onClick={() => onUpdateParams({ view: 'pipeline' })}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[3px] transition-colors ${
              params.view === 'pipeline'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Pipeline Board</span>
          </button>
        </div>

        {/* Right / Middle: Search & Pipeline Dropdown */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onBlur={() => {
                if (searchInput.trim() !== params.q) {
                  onUpdateParams({ q: searchInput.trim() });
                }
              }}
              placeholder="Search by name, number, or next step…"
              className="pl-8 h-8 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-[3px]"
            />
          </form>

          {/* Pipeline Selector (Required for Pipeline View, Optional Filter for List View) */}
          <div className="min-w-[180px]">
            <Select
              value={params.pipelineId || 'ALL'}
              onValueChange={(val) =>
                onUpdateParams({
                  pipelineId: val === 'ALL' ? undefined : val,
                  stageId: undefined, // Clear stage when pipeline changes
                })
              }
            >
              <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200 rounded-[3px]">
                <SelectValue placeholder="All Pipelines" />
              </SelectTrigger>
              <SelectContent className="text-xs font-sans">
                {params.view === 'list' && (
                  <SelectItem value="ALL">All Pipelines</SelectItem>
                )}
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.defaultPipeline ? '(Default)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Filters (List View Only) */}
      {params.view === 'list' && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <ListFilter className="w-3 h-3" />
            <span>Filters:</span>
          </span>

          {/* Stage Selector (Dependent on Pipeline) */}
          {selectedPipeline?.stages && selectedPipeline.stages.length > 0 && (
            <div className="w-[160px]">
              <Select
                value={params.stageId || 'ALL'}
                onValueChange={(val) =>
                  onUpdateParams({ stageId: val === 'ALL' ? undefined : val })
                }
              >
                <SelectTrigger className="h-7 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent className="text-xs font-sans">
                  <SelectItem value="ALL">All Stages</SelectItem>
                  {selectedPipeline.stages.map((st) => (
                    <SelectItem key={st.id} value={st.id}>
                      {st.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status Dropdown */}
          <div className="w-[140px]">
            <Select
              value={params.status || 'ALL'}
              onValueChange={(val) =>
                onUpdateParams({
                  status: val === 'ALL' ? undefined : (val as OpportunityStatus),
                })
              }
            >
              <SelectTrigger className="h-7 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="text-xs font-sans">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open Only</SelectItem>
                <SelectItem value="WON">Closed Won</SelectItem>
                <SelectItem value="LOST">Closed Lost</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opportunity Type Dropdown */}
          <div className="w-[150px]">
            <Select
              value={params.opportunityType || 'ALL'}
              onValueChange={(val) =>
                onUpdateParams({
                  opportunityType: val === 'ALL' ? undefined : (val as OpportunityType),
                })
              }
            >
              <SelectTrigger className="h-7 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="text-xs font-sans">
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="NEW_BUSINESS">New Business</SelectItem>
                <SelectItem value="UPSELL">Upsell</SelectItem>
                <SelectItem value="CROSS_SELL">Cross Sell</SelectItem>
                <SelectItem value="RENEWAL">Renewal</SelectItem>
                <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900 rounded-[3px] gap-1 shrink-0 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
