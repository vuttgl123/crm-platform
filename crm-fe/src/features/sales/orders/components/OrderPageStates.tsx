import React from 'react';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const OrderDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse font-sans w-full">
      <div className="h-24 bg-slate-200 rounded-[4px]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-slate-200 rounded-[4px]" />
          <div className="h-48 bg-slate-200 rounded-[4px]" />
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-slate-200 rounded-[4px]" />
          <div className="h-48 bg-slate-200 rounded-[4px]" />
        </div>
      </div>
    </div>
  );
};

export const OrderTableSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-[4px] p-4 space-y-3 animate-pulse">
      <div className="h-10 bg-slate-100 rounded-[3px]" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-50 rounded-[3px]" />
      ))}
    </div>
  );
};

export const OrderEmptyState: React.FC<{
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({
  title = 'No orders found',
  description = 'There are no sales orders matching the current filter criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-[4px] py-16 px-6 text-center space-y-3">
      <div className="w-12 h-12 rounded-[4px] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
        <ShoppingCart className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button
            size="sm"
            onClick={onAction}
            className="h-8 text-xs font-semibold rounded-[3px] bg-blue-600 hover:bg-blue-700 text-white"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export const OrderErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({
  title = 'Failed to load order',
  message = 'An unexpected error occurred while loading the order data.',
  onRetry,
}) => {
  return (
    <div className="w-full bg-white border border-rose-200 rounded-[4px] p-6 text-center space-y-3">
      <div className="w-10 h-10 rounded-[4px] bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="h-8 text-xs font-semibold rounded-[3px]"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
