import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BarChart3, Table as TableIcon } from 'lucide-react';
import {
  ForecastCategory,
  ForecastCurrencySummary,
} from '../model/forecastTypes';
import { renderForecastCategoryBadge } from '@/config/crmStatusConfig';

interface ForecastCompositionPanelProps {
  summary?: ForecastCurrencySummary;
  currencyCode: string;
  onSelectCategory: (category: ForecastCategory) => void;
}

const CATEGORY_COLORS: Record<ForecastCategory, string> = {
  CLOSED: '#10B981', // Emerald
  COMMIT: '#3B82F6', // Blue
  BEST_CASE: '#8B5CF6', // Purple
  PIPELINE: '#F59E0B', // Amber
  OMITTED: '#94A3B8', // Slate
};

export const ForecastCompositionPanel: React.FC<ForecastCompositionPanelProps> = ({
  summary,
  currencyCode,
  onSelectCategory,
}) => {
  const [viewMode, setViewMode] = React.useState<'CHART' | 'TABLE'>('CHART');

  const formatCurrency = (val?: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : (val || 0);
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      maximumFractionDigits: currencyCode === 'VND' ? 0 : 2,
    }).format(num);
  };

  const chartData = React.useMemo(() => {
    if (!summary?.categories) return [];
    return summary.categories.map((c) => {
      const numAmount = parseFloat(c.amount) || 0;
      return {
        category: c.category,
        name: c.category.replace('_', ' '),
        amount: numAmount,
        count: c.opportunityCount,
        color: CATEGORY_COLORS[c.category] || '#94A3B8',
      };
    });
  }, [summary]);

  const totalAmount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + (curr.category !== 'OMITTED' ? curr.amount : 0), 0);
  }, [chartData]);

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs p-4 space-y-4 w-full">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>Forecast Category Composition</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribution of opportunities across pipeline forecast categories.
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex rounded-[3px] p-0.5 bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('CHART')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-[2px] flex items-center gap-1.5 transition-colors ${
              viewMode === 'CHART'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Chart</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('TABLE')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-[2px] flex items-center gap-1.5 transition-colors ${
              viewMode === 'TABLE'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Data Table</span>
          </button>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'CHART' ? (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={(val) =>
                  val >= 1_000_000_000
                    ? `${(val / 1_000_000_000).toFixed(1)}B`
                    : val >= 1_000_000
                    ? `${(val / 1_000_000).toFixed(1)}M`
                    : val >= 1_000
                    ? `${(val / 1_000).toFixed(0)}k`
                    : val.toString()
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs rounded-[3px] p-2.5 shadow-lg border border-slate-800 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                          <span>{data.name}</span>
                        </div>
                        <div className="text-emerald-400 font-bold font-sans">
                          {formatCurrency(data.amount)}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {data.count} {data.count === 1 ? 'deal' : 'deals'}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="amount"
                radius={[4, 4, 0, 0]}
                onClick={(entry: any) => onSelectCategory(entry.category)}
                className="cursor-pointer"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Accessible Exact-Value Data Table */
        <div className="border border-slate-200 rounded-[4px] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600">
                <th className="text-left font-bold py-2.5 px-3">Forecast Category</th>
                <th className="text-right font-bold py-2.5 px-3">Total Amount</th>
                <th className="text-right font-bold py-2.5 px-3">Deals Count</th>
                <th className="text-right font-bold py-2.5 px-3">Share of Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chartData.map((row) => {
                const share = totalAmount > 0 ? (row.amount / totalAmount) * 100 : 0;
                return (
                  <tr
                    key={row.category}
                    onClick={() => onSelectCategory(row.category)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        {renderForecastCategoryBadge(row.category)}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-sans">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-semibold">
                      {row.count}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 font-sans">
                      {row.category === 'OMITTED' ? 'N/A' : `${share.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
