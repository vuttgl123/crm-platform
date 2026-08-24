import React from 'react';
import {
  Users,
  Layers,
  User,
  Shield,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { StandardPagination } from '@/components/common/StandardPagination';
import {
  ForecastBreakdownDimension,
  ForecastBreakdownResponse,
  ForecastBreakdownRow,
} from '../model/forecastTypes';
import { renderForecastCategoryBadge } from '@/config/crmStatusConfig';
import { useOwnerResolver } from '@/features/crm/opportunities/hooks/useOwnerResolver';

interface ForecastBreakdownPanelProps {
  breakdownData?: ForecastBreakdownResponse;
  dimension: ForecastBreakdownDimension;
  currencyCode: string;
  isLoading: boolean;
  onDimensionChange: (dim: ForecastBreakdownDimension) => void;
  onPageChange: (page: number) => void;
  onSelectSubject: (row: ForecastBreakdownRow) => void;
}

export const ForecastBreakdownPanel: React.FC<ForecastBreakdownPanelProps> = ({
  breakdownData,
  dimension,
  currencyCode,
  isLoading,
  onDimensionChange,
  onPageChange,
  onSelectSubject,
}) => {
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

  const rows = breakdownData?.items || [];

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs p-4 space-y-4 w-full">
      {/* Header with Dimension Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span>Revenue Forecast Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed distribution grouped by {dimension === 'OWNER' ? 'Owner / Team' : 'Pipeline Stage'}.
          </p>
        </div>

        {/* Dimension Switcher */}
        <div className="inline-flex rounded-[3px] p-0.5 bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => onDimensionChange('OWNER')}
            className={`px-3 py-1 text-xs font-semibold rounded-[2px] flex items-center gap-1.5 transition-colors ${
              dimension === 'OWNER'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>By Owner</span>
          </button>
          <button
            type="button"
            onClick={() => onDimensionChange('STAGE')}
            className={`px-3 py-1 text-xs font-semibold rounded-[2px] flex items-center gap-1.5 transition-colors ${
              dimension === 'STAGE'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>By Stage</span>
          </button>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="border border-slate-200 rounded-[4px] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600">
              {dimension === 'OWNER' ? (
                <>
                  <th className="text-left font-bold py-2.5 px-3">Owner / Team</th>
                  <th className="text-right font-bold py-2.5 px-3">Weighted Revenue</th>
                  <th className="text-right font-bold py-2.5 px-3">Closed Won</th>
                  <th className="text-right font-bold py-2.5 px-3">Commit</th>
                  <th className="text-right font-bold py-2.5 px-3">Best Case</th>
                  <th className="text-right font-bold py-2.5 px-3">Pipeline</th>
                  <th className="text-right font-bold py-2.5 px-3">Open Value</th>
                  <th className="text-right font-bold py-2.5 px-3">Total Deals</th>
                </>
              ) : (
                <>
                  <th className="text-left font-bold py-2.5 px-3">Stage Name</th>
                  <th className="text-left font-bold py-2.5 px-3">Pipeline</th>
                  <th className="text-left font-bold py-2.5 px-3">Category</th>
                  <th className="text-right font-bold py-2.5 px-3">Weighted Revenue</th>
                  <th className="text-right font-bold py-2.5 px-3">Total Stage Amount</th>
                  <th className="text-right font-bold py-2.5 px-3">Deals Count</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={dimension === 'OWNER' ? 8 : 6}
                  className="py-12 text-center text-slate-400"
                >
                  Loading breakdown data...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={dimension === 'OWNER' ? 8 : 6}
                  className="py-12 text-center text-slate-400"
                >
                  No breakdown items found for the current period and filters.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                if (dimension === 'OWNER') {
                  const resolved = row.subject.id
                    ? resolveOwner({ type: row.subject.kind as any, id: row.subject.id })
                    : { label: 'Unassigned', type: 'UNASSIGNED', isCurrentUser: false };

                  const closedCat = row.categories.find((c) => c.category === 'CLOSED');
                  const commitCat = row.categories.find((c) => c.category === 'COMMIT');
                  const bestCaseCat = row.categories.find((c) => c.category === 'BEST_CASE');
                  const pipelineCat = row.categories.find((c) => c.category === 'PIPELINE');

                  return (
                    <tr
                      key={row.subject.id || `unassigned-${idx}`}
                      onClick={() => onSelectSubject(row)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          {row.subject.kind === 'USER' ? (
                            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 text-[10px] font-bold shrink-0">
                              <User className="w-3 h-3" />
                            </div>
                          ) : row.subject.kind === 'TEAM' ? (
                            <div className="w-6 h-6 rounded-[3px] bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 text-[10px] font-bold shrink-0">
                              <Shield className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-[3px] bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold shrink-0">
                              <UserCheck className="w-3 h-3" />
                            </div>
                          )}
                          <span className="group-hover:text-indigo-600 font-semibold transition-colors">
                            {resolved.label || row.subject.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 font-sans">
                        {formatCurrency(row.weightedForecastAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-sans">
                        {formatCurrency(closedCat?.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-sans">
                        {formatCurrency(commitCat?.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-sans">
                        {formatCurrency(bestCaseCat?.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-sans">
                        {formatCurrency(pipelineCat?.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-sans">
                        {formatCurrency(row.openPipelineAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          {row.opportunityCount}
                          <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </span>
                      </td>
                    </tr>
                  );
                } else {
                  // STAGE dimension
                  return (
                    <tr
                      key={row.subject.id || `stage-${idx}`}
                      onClick={() => onSelectSubject(row)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <span className="group-hover:text-indigo-600 transition-colors">
                          {row.subject.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {row.subject.pipelineName || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        {renderForecastCategoryBadge(row.subject.forecastCategory || undefined)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 font-sans">
                        {formatCurrency(row.weightedForecastAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-sans">
                        {formatCurrency(row.categories[0]?.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          {row.opportunityCount}
                          <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </span>
                      </td>
                    </tr>
                  );
                }
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Standard Pagination */}
      {breakdownData && breakdownData.totalPages > 1 && (
        <div className="pt-2">
          <StandardPagination
            currentPage={breakdownData.page}
            totalPages={breakdownData.totalPages}
            totalElements={breakdownData.totalElements}
            pageSize={breakdownData.size}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
