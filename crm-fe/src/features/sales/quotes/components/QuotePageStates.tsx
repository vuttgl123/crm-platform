import React from 'react';
import { FileQuestion, AlertTriangle, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const QuoteListSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-20 bg-slate-100 rounded-[4px]" />
    <div className="h-12 bg-slate-100 rounded-[4px]" />
    <div className="h-64 bg-slate-100 rounded-[4px]" />
  </div>
);

export const QuoteDetailSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-24 bg-slate-100 rounded-[4px]" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-44 bg-slate-100 rounded-[4px]" />
        <div className="h-64 bg-slate-100 rounded-[4px]" />
      </div>
      <div className="space-y-4">
        <div className="h-64 bg-slate-100 rounded-[4px]" />
      </div>
    </div>
  </div>
);

interface QuoteEmptyStateProps {
  isFiltered?: boolean;
  onResetFilters?: () => void;
  onCreateNew?: () => void;
  canCreate?: boolean;
}

export const QuoteEmptyState: React.FC<QuoteEmptyStateProps> = ({
  isFiltered = false,
  onResetFilters,
  onCreateNew,
  canCreate = true,
}) => (
  <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center shadow-2xs space-y-4">
    <div className="w-12 h-12 rounded-[4px] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
      <FileQuestion className="w-6 h-6" />
    </div>

    <div className="max-w-sm mx-auto space-y-1">
      <h3 className="text-sm font-bold text-slate-900">
        {isFiltered ? 'No Matching Quotes Found' : 'No Quotes Created Yet'}
      </h3>
      <p className="text-xs text-slate-500">
        {isFiltered
          ? 'No commercial quotes match your active search and filter criteria. Try clearing or relaxing filters.'
          : 'Create your first commercial quote proposal with real products, price books, and approval workflows.'}
      </p>
    </div>

    <div className="flex items-center justify-center gap-2 pt-2">
      {isFiltered && onResetFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          className="h-8.5 rounded-[3px] text-xs font-semibold border-slate-200 gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </Button>
      )}

      {!isFiltered && canCreate && onCreateNew && (
        <Button
          size="sm"
          onClick={onCreateNew}
          className="h-8.5 rounded-[3px] text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Quote</span>
        </Button>
      )}
    </div>
  </div>
);

interface QuoteErrorStateProps {
  error?: Error | null;
  onRetry?: () => void;
}

export const QuoteErrorState: React.FC<QuoteErrorStateProps> = ({ error, onRetry }) => (
  <div className="bg-white border border-rose-200 rounded-[4px] p-8 text-center shadow-2xs space-y-3">
    <div className="w-10 h-10 rounded-[4px] bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
      <AlertTriangle className="w-5 h-5" />
    </div>
    <div className="space-y-1">
      <h3 className="text-sm font-bold text-slate-900">Failed to Load Quotes</h3>
      <p className="text-xs text-slate-500">
        {error?.message || 'An unexpected error occurred while communicating with the commercial quote service.'}
      </p>
    </div>
    {onRetry && (
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="h-8 rounded-[3px] text-xs font-semibold border-slate-200"
      >
        Retry Request
      </Button>
    )}
  </div>
);
