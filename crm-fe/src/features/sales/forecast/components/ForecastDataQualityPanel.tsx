import React from 'react';
import {
  AlertTriangle,
  CalendarOff,
  UserX,
  ShieldAlert,
  ArrowRight,
  EyeOff,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  ForecastCategory,
  ForecastCurrencySummary,
  ForecastQualityCode,
} from '../model/forecastTypes';

interface ForecastDataQualityPanelProps {
  summary?: ForecastCurrencySummary;
  currencyCode: string;
  onSelectQuality: (quality: ForecastQualityCode) => void;
  onSelectCategory: (category: ForecastCategory) => void;
}

export const ForecastDataQualityPanel: React.FC<ForecastDataQualityPanelProps> = ({
  summary,
  currencyCode,
  onSelectQuality,
  onSelectCategory,
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

  const qualityMap = React.useMemo(() => {
    const map = new Map<ForecastQualityCode, { amount: string; count: number }>();
    (summary?.quality || []).forEach((q) => {
      map.set(q.code, { amount: q.amount, count: q.opportunityCount });
    });
    return map;
  }, [summary]);

  const unscheduled = qualityMap.get('UNSCHEDULED') || { amount: '0', count: 0 };
  const conflict = qualityMap.get('STATUS_STAGE_CONFLICT') || { amount: '0', count: 0 };
  const missingOwner = qualityMap.get('MISSING_OWNER') || { amount: '0', count: 0 };

  const omittedCat = (summary?.categories || []).find((c) => c.category === 'OMITTED') || {
    amount: '0',
    opportunityCount: 0,
  };

  const totalIssues = unscheduled.count + conflict.count + missingOwner.count;

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs p-4 space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Forecast Data Quality & Risk Audit</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify opportunities with missing dates, owner gaps, or stage anomalies impacting revenue rollups.
          </p>
        </div>

        <Badge
          variant="outline"
          className={`rounded-[3px] text-xs font-bold px-2 py-0.5 ${
            totalIssues === 0
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {totalIssues === 0 ? 'Healthy Data' : `${totalIssues} Quality Anomalies`}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Unscheduled Card */}
        <div
          onClick={() => onSelectQuality('UNSCHEDULED')}
          className="cursor-pointer bg-[#F8FAFC] border border-slate-200 hover:border-amber-400 hover:bg-amber-50/20 p-3 rounded-[4px] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <CalendarOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Unscheduled Deals</span>
              </div>
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200 rounded-[2px] text-[10px] font-bold"
              >
                {unscheduled.count}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Open opportunities missing expected close date.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 font-sans">
              {formatCurrency(unscheduled.amount)}
            </span>
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5 hover:text-slate-900">
              Audit <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* Stage Conflict Card */}
        <div
          onClick={() => onSelectQuality('STATUS_STAGE_CONFLICT')}
          className="cursor-pointer bg-[#F8FAFC] border border-slate-200 hover:border-rose-400 hover:bg-rose-50/20 p-3 rounded-[4px] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Status & Stage Conflict</span>
              </div>
              <Badge
                variant="outline"
                className="bg-rose-50 text-rose-700 border-rose-200 rounded-[2px] text-[10px] font-bold"
              >
                {conflict.count}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Mismatches between opportunity status and stage category.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 font-sans">
              {formatCurrency(conflict.amount)}
            </span>
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5 hover:text-slate-900">
              Audit <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* Missing Owner Card */}
        <div
          onClick={() => onSelectQuality('MISSING_OWNER')}
          className="cursor-pointer bg-[#F8FAFC] border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 p-3 rounded-[4px] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <UserX className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Missing Owner</span>
              </div>
              <Badge
                variant="outline"
                className="bg-indigo-50 text-indigo-700 border-indigo-200 rounded-[2px] text-[10px] font-bold"
              >
                {missingOwner.count}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Deals without an assigned user or team.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 font-sans">
              {formatCurrency(missingOwner.amount)}
            </span>
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5 hover:text-slate-900">
              Audit <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* Omitted Category Deals Card */}
        <div
          onClick={() => onSelectCategory('OMITTED')}
          className="cursor-pointer bg-[#F8FAFC] border border-slate-200 hover:border-slate-400 hover:bg-slate-100 p-3 rounded-[4px] transition-all flex flex-col justify-between opacity-90"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Omitted Forecast Deals</span>
              </div>
              <Badge
                variant="outline"
                className="bg-slate-100 text-slate-700 border-slate-200 rounded-[2px] text-[10px] font-bold"
              >
                {omittedCat.opportunityCount}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Excluded from live rollups by stage configuration.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 font-sans">
              {formatCurrency(omittedCat.amount)}
            </span>
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5 hover:text-slate-900">
              View <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
