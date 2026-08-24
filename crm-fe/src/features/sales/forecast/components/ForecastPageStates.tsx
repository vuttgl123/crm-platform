import React from 'react';
import { AlertOctagon, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ForecastPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {/* Context Bar Skeleton */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 h-24" />

      {/* Ledger Skeleton */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-6 h-64" />

      {/* Grid Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-[4px] p-4 h-80" />
        <div className="bg-white border border-slate-200 rounded-[4px] p-4 h-80" />
      </div>

      {/* Breakdown Skeleton */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 h-96" />
    </div>
  );
};

interface ForecastErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export const ForecastErrorState: React.FC<ForecastErrorStateProps> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="bg-white border border-rose-200 rounded-[4px] p-12 text-center shadow-2xs space-y-4 max-w-xl mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900">
          Unable to Load Revenue Forecast
        </h3>
        <p className="text-xs text-slate-500">
          {error?.message || 'An error occurred while computing live forecast rollups.'}
        </p>
      </div>
      <Button
        onClick={onRetry}
        variant="outline"
        size="sm"
        className="rounded-[3px] border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
      >
        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
        Retry Calculation
      </Button>
    </div>
  );
};

interface ForecastEmptyStateProps {
  onResetFilters?: () => void;
  isFiltered?: boolean;
}

export const ForecastEmptyState: React.FC<ForecastEmptyStateProps> = ({
  onResetFilters,
  isFiltered,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center shadow-2xs space-y-3">
      <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
        <TrendingUp className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900">
          No Forecast Data Found
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {isFiltered
            ? 'No opportunities match your current period, pipeline, or owner filters.'
            : 'Get started by creating opportunities with expected close dates and pipeline stages.'}
        </p>
      </div>
      {isFiltered && onResetFilters && (
        <Button
          onClick={onResetFilters}
          variant="outline"
          size="sm"
          className="rounded-[3px] border-slate-200 text-xs font-semibold"
        >
          Reset All Filters
        </Button>
      )}
    </div>
  );
};
