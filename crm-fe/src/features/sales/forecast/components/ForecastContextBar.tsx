import React from 'react';
import { RefreshCw, FilterX, Calendar, Layers, User, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ForecastOwnerType,
  ForecastPeriodPreset,
  ForecastUrlState,
  SalesForecastSummaryResponse,
} from '../model/forecastTypes';
import { usePipelinesQuery } from '@/features/crm/opportunities/hooks/opportunityQueries';
import { useOwnerResolver } from '@/features/crm/opportunities/hooks/useOwnerResolver';

interface ForecastContextBarProps {
  state: ForecastUrlState;
  summaryData?: SalesForecastSummaryResponse;
  isLoading: boolean;
  onPeriodChange: (period: ForecastPeriodPreset) => void;
  onPipelineChange: (pipelineId: string | null) => void;
  onOwnerChange: (ownerType: ForecastOwnerType | null, ownerId: string | null) => void;
  onCurrencyChange: (currencyCode: string | null) => void;
  onRefresh: () => void;
  onClearFilters: () => void;
}

export const ForecastContextBar: React.FC<ForecastContextBarProps> = ({
  state,
  summaryData,
  isLoading,
  onPeriodChange,
  onPipelineChange,
  onOwnerChange,
  onCurrencyChange,
  onRefresh,
  onClearFilters,
}) => {
  const { data: pipelines = [] } = usePipelinesQuery();
  const { userList, teamList, resolveOwner } = useOwnerResolver();

  const isFiltered =
    state.period !== 'THIS_MONTH' ||
    Boolean(state.pipelineId) ||
    Boolean(state.ownerId) ||
    Boolean(state.currencyCode) ||
    Boolean(state.category) ||
    Boolean(state.quality);

  const availableCurrencies = React.useMemo(() => {
    if (!summaryData?.currencyGroups) return [];
    return summaryData.currencyGroups.map((g) => g.currencyCode);
  }, [summaryData]);

  const activeCurrency = state.currencyCode || availableCurrencies[0] || 'USD';

  const periodContext = summaryData?.period;

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs space-y-3 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Preset */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <Select
              value={state.period}
              onValueChange={(val) => onPeriodChange(val as ForecastPeriodPreset)}
            >
              <SelectTrigger className="w-[145px] h-8 text-xs font-semibold rounded-[3px] border-slate-200 bg-white">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent className="rounded-[3px]">
                <SelectItem value="THIS_MONTH">This Month</SelectItem>
                <SelectItem value="THIS_QUARTER">This Quarter</SelectItem>
                <SelectItem value="THIS_YEAR">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pipeline Selector */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
            <Select
              value={state.pipelineId || 'ALL'}
              onValueChange={(val) => onPipelineChange(val === 'ALL' ? null : val)}
            >
              <SelectTrigger className="w-[170px] h-8 text-xs font-semibold rounded-[3px] border-slate-200 bg-white">
                <SelectValue placeholder="All Pipelines" />
              </SelectTrigger>
              <SelectContent className="rounded-[3px]">
                <SelectItem value="ALL">All Pipelines</SelectItem>
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Owner Selector */}
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <Select
              value={
                state.ownerId && state.ownerType
                  ? `${state.ownerType}:${state.ownerId}`
                  : 'ALL'
              }
              onValueChange={(val) => {
                if (val === 'ALL') {
                  onOwnerChange(null, null);
                } else {
                  const [type, id] = val.split(':');
                  onOwnerChange(type as ForecastOwnerType, id);
                }
              }}
            >
              <SelectTrigger className="w-[190px] h-8 text-xs font-semibold rounded-[3px] border-slate-200 bg-white">
                <SelectValue placeholder="All Owners" />
              </SelectTrigger>
              <SelectContent className="rounded-[3px]">
                <SelectItem value="ALL">All Owners</SelectItem>
                {userList.length > 0 && (
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Users
                  </div>
                )}
                {userList.map((u: { id: string; displayName: string }) => {
                  const resolved = resolveOwner({ type: 'USER', id: u.id });
                  return (
                    <SelectItem key={`USER:${u.id}`} value={`USER:${u.id}`}>
                      {resolved.label}
                    </SelectItem>
                  );
                })}
                {teamList.length > 0 && (
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Teams
                  </div>
                )}
                {teamList.map((t: { id: string; name: string }) => (
                  <SelectItem key={`TEAM:${t.id}`} value={`TEAM:${t.id}`}>
                    Team: {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency Switcher */}
          {availableCurrencies.length > 1 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <Coins className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="inline-flex rounded-[3px] p-0.5 bg-slate-100 border border-slate-200">
                {availableCurrencies.map((curr) => {
                  const isSelected = curr === activeCurrency;
                  return (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => onCurrencyChange(curr)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-[2px] transition-colors ${
                        isSelected
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {curr}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions & Reset */}
        <div className="flex items-center gap-2">
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2.5 text-xs text-slate-600 hover:text-rose-600 hover:border-rose-200 border-slate-200 rounded-[3px]"
            >
              <FilterX className="w-3.5 h-3.5 mr-1" />
              Reset Filters
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 px-3 text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 rounded-[3px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Period context badge */}
      {periodContext && (
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">Calculated Period:</span>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 rounded-[3px] font-mono text-[11px] px-2 py-0.5">
              {periodContext.fromDate} &rarr; {periodContext.toDate}
            </Badge>
            <span className="text-slate-400">({periodContext.timezone})</span>
          </div>

          {summaryData?.asOf && (
            <div className="text-[11px] text-slate-400">
              As of: <span className="font-mono">{new Date(summaryData.asOf).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
