import React from 'react';
import { DollarSign, HelpCircle, CheckCircle2, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  ForecastCategory,
  ForecastCurrencySummary,
} from '../model/forecastTypes';
import { renderForecastCategoryBadge } from '@/config/crmStatusConfig';

interface ForecastLedgerProps {
  summary?: ForecastCurrencySummary;
  selectedCategory: ForecastCategory | 'ALL' | null;
  onSelectCategory: (category: ForecastCategory | 'ALL' | null) => void;
  currencyCode: string;
}

export const ForecastLedger: React.FC<ForecastLedgerProps> = ({
  summary,
  selectedCategory,
  onSelectCategory,
  currencyCode,
}) => {
  const formatCurrency = (val?: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : (val || 0);
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      maximumFractionDigits: currencyCode === 'VND' ? 0 : 2,
    }).format(num);
  };

  const categories = React.useMemo(() => {
    const map = new Map<ForecastCategory, { amount: string; count: number }>();
    (summary?.categories || []).forEach((c) => {
      map.set(c.category, { amount: c.amount, count: c.opportunityCount });
    });
    return map;
  }, [summary]);

  const closed = categories.get('CLOSED') || { amount: '0', count: 0 };
  const commit = categories.get('COMMIT') || { amount: '0', count: 0 };
  const bestCase = categories.get('BEST_CASE') || { amount: '0', count: 0 };
  const pipeline = categories.get('PIPELINE') || { amount: '0', count: 0 };
  const omitted = categories.get('OMITTED') || { amount: '0', count: 0 };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs overflow-hidden w-full">
      {/* Top Banner: Primary Rollup Metrics */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-6">
        {/* Weighted Revenue */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <span>WEIGHTED REVENUE FORECAST</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-slate-400 hover:text-white">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 text-white text-xs border border-slate-700 max-w-xs p-2.5 rounded-[3px]">
                  <p className="font-semibold mb-1">Expected Revenue Formula:</p>
                  <p className="text-slate-300">
                    Closed Won (100%) + Sum of (Amount &times; Probability%) for all open Pipeline, Best Case, and Commit opportunities closing in this period.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-3xl font-extrabold tracking-tight font-sans text-emerald-400">
            {formatCurrency(summary?.weightedForecastAmount)}
          </div>
          <div className="text-xs text-slate-400">
            Currency: <span className="font-bold text-slate-200">{currencyCode}</span> &bull; {summary?.eligibleOpportunityCount || 0} active period deals
          </div>
        </div>

        {/* Secondary Headline Stats */}
        <div className="flex items-center gap-8 border-l border-slate-700/80 pl-8">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-medium">OPEN PIPELINE VALUE</div>
            <div className="text-xl font-bold text-white font-sans">
              {formatCurrency(summary?.openPipelineAmount)}
            </div>
            <div className="text-[11px] text-slate-400">Commit + Best Case + Pipeline</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-medium">CLOSED REVENUE</div>
            <div className="text-xl font-bold text-emerald-400 font-sans">
              {formatCurrency(closed.amount)}
            </div>
            <div className="text-[11px] text-slate-400">{closed.count} won deals</div>
          </div>
        </div>
      </div>

      {/* Category Rollup Ledger Tiles */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-[#F8FAFC]">
        {/* Closed Won */}
        <div
          onClick={() => onSelectCategory(selectedCategory === 'CLOSED' ? null : 'CLOSED')}
          className={`cursor-pointer bg-white p-3.5 rounded-[4px] border transition-all hover:shadow-xs flex flex-col justify-between ${
            selectedCategory === 'CLOSED'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            {renderForecastCategoryBadge('CLOSED')}
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-bold rounded-[2px] px-1.5">
              {closed.count} deals
            </Badge>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">
              {formatCurrency(closed.amount)}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>100% Probability</span>
            </div>
          </div>
        </div>

        {/* Commit */}
        <div
          onClick={() => onSelectCategory(selectedCategory === 'COMMIT' ? null : 'COMMIT')}
          className={`cursor-pointer bg-white p-3.5 rounded-[4px] border transition-all hover:shadow-xs flex flex-col justify-between ${
            selectedCategory === 'COMMIT'
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            {renderForecastCategoryBadge('COMMIT')}
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-bold rounded-[2px] px-1.5">
              {commit.count} deals
            </Badge>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">
              {formatCurrency(commit.amount)}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 text-blue-600 shrink-0" />
              <span>High Probability</span>
            </div>
          </div>
        </div>

        {/* Best Case */}
        <div
          onClick={() => onSelectCategory(selectedCategory === 'BEST_CASE' ? null : 'BEST_CASE')}
          className={`cursor-pointer bg-white p-3.5 rounded-[4px] border transition-all hover:shadow-xs flex flex-col justify-between ${
            selectedCategory === 'BEST_CASE'
              ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            {renderForecastCategoryBadge('BEST_CASE')}
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-bold rounded-[2px] px-1.5">
              {bestCase.count} deals
            </Badge>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">
              {formatCurrency(bestCase.amount)}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <ArrowUpRight className="w-3 h-3 text-purple-600 shrink-0" />
              <span>Upside Potential</span>
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div
          onClick={() => onSelectCategory(selectedCategory === 'PIPELINE' ? null : 'PIPELINE')}
          className={`cursor-pointer bg-white p-3.5 rounded-[4px] border transition-all hover:shadow-xs flex flex-col justify-between ${
            selectedCategory === 'PIPELINE'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            {renderForecastCategoryBadge('PIPELINE')}
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-bold rounded-[2px] px-1.5">
              {pipeline.count} deals
            </Badge>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">
              {formatCurrency(pipeline.amount)}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <DollarSign className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Early Stage Deals</span>
            </div>
          </div>
        </div>

        {/* Omitted */}
        <div
          onClick={() => onSelectCategory(selectedCategory === 'OMITTED' ? null : 'OMITTED')}
          className={`cursor-pointer bg-white p-3.5 rounded-[4px] border transition-all hover:shadow-xs flex flex-col justify-between opacity-80 ${
            selectedCategory === 'OMITTED'
              ? 'border-slate-500 ring-2 ring-slate-500/20 bg-slate-50'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            {renderForecastCategoryBadge('OMITTED')}
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-bold rounded-[2px] px-1.5">
              {omitted.count} deals
            </Badge>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-700 tracking-tight">
              {formatCurrency(omitted.amount)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Excluded from Rollup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
