import React from 'react';
import { ShoppingCart, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { OrderPulseResponse } from '@/services/api/orderApi';

interface OrderPulseProps {
  pulse?: OrderPulseResponse;
  isLoading?: boolean;
}

function formatAmount(amount: string | number | undefined, currency: string = 'USD'): string {
  if (amount === undefined || amount === null) return '0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export const OrderPulse: React.FC<OrderPulseProps> = ({ pulse, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-white border border-slate-200 rounded-[4px]" />
        ))}
      </div>
    );
  }

  const primaryGroup = pulse?.currencyGroups?.[0];
  const primaryCurrency = primaryGroup?.currencyCode || 'USD';

  const totalOrders = pulse?.totalOrders || 0;
  const draftCount = primaryGroup?.draftCount || 0;
  const confirmedCount = primaryGroup?.confirmedCount || 0;
  const processingCount = primaryGroup?.processingCount || 0;
  const processingTotal = primaryGroup?.processingTotal || 0;
  const partialCount = primaryGroup?.partiallyFulfilledCount || 0;
  const partialTotal = primaryGroup?.partiallyFulfilledTotal || 0;
  const fulfilledCount = primaryGroup?.fulfilledCount || 0;
  const fulfilledTotal = primaryGroup?.fulfilledTotal || 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-sans">
      {/* 1. Total Volume */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Total Orders</span>
          <ShoppingCart className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-xl font-bold text-slate-900">{totalOrders}</div>
        <div className="text-[11px] text-slate-500">{draftCount} Drafts</div>
      </div>

      {/* 2. Needs Processing (Confirmed) */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-blue-600">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Ready to Start</span>
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-xl font-bold text-slate-900">{confirmedCount}</div>
        <div className="text-[11px] text-slate-500">Awaiting processing</div>
      </div>

      {/* 3. In Processing */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-purple-600">
          <span className="text-[11px] font-semibold uppercase tracking-wider">In Processing</span>
          <RefreshCw className="w-4 h-4 text-purple-500" />
        </div>
        <div className="text-xl font-bold text-slate-900">
          {formatAmount(processingTotal, primaryCurrency)}
        </div>
        <div className="text-[11px] text-slate-500">{processingCount} Active Orders</div>
      </div>

      {/* 4. Partial Fulfillment */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-amber-600">
          <span className="text-[11px] font-semibold uppercase tracking-wider">In Fulfillment</span>
          <RefreshCw className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-xl font-bold text-slate-900">
          {formatAmount(partialTotal, primaryCurrency)}
        </div>
        <div className="text-[11px] text-slate-500">{partialCount} Partially Fulfilled</div>
      </div>

      {/* 5. Fully Fulfilled */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-emerald-600">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Completed</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-xl font-bold text-slate-900">
          {formatAmount(fulfilledTotal, primaryCurrency)}
        </div>
        <div className="text-[11px] text-slate-500">{fulfilledCount} Orders Delivered</div>
      </div>
    </div>
  );
};
