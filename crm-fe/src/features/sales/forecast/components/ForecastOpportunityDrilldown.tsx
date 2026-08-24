import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Target,
  Calendar,
  FilterX,
  User,
  Shield,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StandardPagination } from '@/components/common/StandardPagination';
import {
  ForecastCategory,
  ForecastQualityCode,
} from '../model/forecastTypes';
import {
  renderForecastCategoryBadge,
  renderOpportunityStatusBadge,
} from '@/config/crmStatusConfig';
import { useOwnerResolver } from '@/features/crm/opportunities/hooks/useOwnerResolver';
import { PageResult } from '@/services/api/accountApi';
import { OpportunitySummaryResponse } from '@/services/api/opportunityApi';

interface ForecastOpportunityDrilldownProps {
  drilldownResult?: PageResult<OpportunitySummaryResponse>;
  isLoading: boolean;
  selectedCategory: ForecastCategory | 'ALL' | null;
  selectedQuality: ForecastQualityCode | null;
  currencyCode: string;
  onClearDrilldown: () => void;
  onPageChange: (page: number) => void;
}

export const ForecastOpportunityDrilldown: React.FC<ForecastOpportunityDrilldownProps> = ({
  drilldownResult,
  isLoading,
  selectedCategory,
  selectedQuality,
  currencyCode,
  onClearDrilldown,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const { resolveOwner } = useOwnerResolver();

  const formatCurrency = (val?: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : (val || 0);
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      maximumFractionDigits: currencyCode === 'VND' ? 0 : 2,
    }).format(num);
  };

  const opportunities = drilldownResult?.items || [];

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs p-4 space-y-4 w-full">
      {/* Header & Active Predicate Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Opportunity Forecast Drilldown
            </h3>
            {drilldownResult && (
              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 rounded-[3px] text-xs font-bold px-2 py-0.5">
                {drilldownResult.totalElements} {drilldownResult.totalElements === 1 ? 'deal' : 'deals'}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs text-slate-500">Filtered by:</span>
            {selectedCategory && (
              <div className="inline-flex items-center gap-1">
                {renderForecastCategoryBadge(selectedCategory)}
              </div>
            )}
            {selectedQuality && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 rounded-[3px] text-[11px] font-bold">
                Quality: {selectedQuality.replace('_', ' ')}
              </Badge>
            )}
            {!selectedCategory && !selectedQuality && (
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 rounded-[3px] text-[11px]">
                All Eligible Period Deals
              </Badge>
            )}
          </div>
        </div>

        {(selectedCategory || selectedQuality) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearDrilldown}
            className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 border-slate-200 rounded-[3px]"
          >
            <FilterX className="w-3.5 h-3.5 mr-1" />
            Clear Drilldown Filter
          </Button>
        )}
      </div>

      {/* Drilldown Table */}
      <div className="border border-slate-200 rounded-[4px] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600">
              <th className="text-left font-bold py-2.5 px-3">Opportunity</th>
              <th className="text-left font-bold py-2.5 px-3">Status</th>
              <th className="text-right font-bold py-2.5 px-3">Amount</th>
              <th className="text-right font-bold py-2.5 px-3">Probability</th>
              <th className="text-right font-bold py-2.5 px-3">Weighted Value</th>
              <th className="text-left font-bold py-2.5 px-3">Forecast Close Date</th>
              <th className="text-left font-bold py-2.5 px-3">Owner</th>
              <th className="text-right font-bold py-2.5 px-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Loading opportunity drilldown...
                </td>
              </tr>
            ) : opportunities.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No opportunities match the selected forecast criteria.
                </td>
              </tr>
            ) : (
              opportunities.map((opp: OpportunitySummaryResponse) => {
                const resolvedOwner = resolveOwner(opp.owner);
                const amountNum = typeof opp.amount?.amount === 'number' ? opp.amount.amount : 0;
                const prob = opp.probability || 0;
                const weightedNum = opp.status === 'WON' ? amountNum : (amountNum * prob) / 100;
                const closeDate = opp.status === 'WON' ? opp.expectedCloseDate : opp.expectedCloseDate;

                return (
                  <tr
                    key={opp.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded-[2px]">
                            {opp.opportunityNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate(`/app/crm/opportunities/${opp.id}`)}
                            className="font-semibold text-slate-900 hover:text-indigo-600 text-left transition-colors truncate max-w-[220px]"
                          >
                            {opp.name}
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      {renderOpportunityStatusBadge(opp.status)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-sans">
                      {formatCurrency(amountNum)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="font-semibold text-slate-700">{prob}%</span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 font-sans">
                      {formatCurrency(weightedNum)}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className={closeDate ? 'font-mono' : 'text-amber-600 italic'}>
                          {closeDate || 'Unscheduled'}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        {resolvedOwner.type === 'USER' ? (
                          <User className="w-3 h-3 text-indigo-500 shrink-0" />
                        ) : resolvedOwner.type === 'TEAM' ? (
                          <Shield className="w-3 h-3 text-sky-500 shrink-0" />
                        ) : (
                          <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate max-w-[130px]">{resolvedOwner.label}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/app/crm/opportunities/${opp.id}`)}
                        className="h-7 px-2 text-[11px] text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-[3px]"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Standard Pagination */}
      {drilldownResult && drilldownResult.totalPages > 1 && (
        <div className="pt-2">
          <StandardPagination
            currentPage={drilldownResult.page}
            totalPages={drilldownResult.totalPages}
            totalElements={drilldownResult.totalElements}
            pageSize={drilldownResult.size}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
