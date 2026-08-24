import React from 'react';
import { CheckCircle2, FileText, Send, AlertTriangle } from 'lucide-react';
import type { QuotePulseResponse } from '../model/quoteTypes';

interface QuotePulseProps {
  pulse?: QuotePulseResponse;
  isLoading?: boolean;
}

function formatCurrency(amount: string | number, currencyCode: string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
    maximumFractionDigits: 2,
  }).format(num);
}

export const QuotePulse: React.FC<QuotePulseProps> = ({ pulse, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs animate-pulse">
        <div className="h-4 w-32 bg-slate-100 rounded-[2px] mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-12 bg-slate-100 rounded-[3px]" />
          <div className="h-12 bg-slate-100 rounded-[3px]" />
          <div className="h-12 bg-slate-100 rounded-[3px]" />
          <div className="h-12 bg-slate-100 rounded-[3px]" />
        </div>
      </div>
    );
  }

  const currencyGroups = pulse?.currencyGroups || [];

  if (currencyGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {currencyGroups.map((group) => (
        <div
          key={group.currencyCode}
          className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          {/* Currency Indicator */}
          <div className="flex items-center gap-2 border-b md:border-b-0 md:border-r border-slate-200 pb-2 md:pb-0 md:pr-4">
            <span className="bg-slate-100 text-slate-700 text-xs font-bold font-mono px-2 py-1 rounded-[3px] border border-slate-200">
              {group.currencyCode}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Commercial Pulse
            </span>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            {/* Drafts & In Review */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-[3px] text-slate-600">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Draft & Review
                </p>
                <p className="text-sm font-bold text-slate-900 font-mono">
                  {group.draftCount + group.pendingApprovalCount}{' '}
                  <span className="text-[11px] font-normal text-slate-500 font-sans">quotes</span>
                </p>
              </div>
            </div>

            {/* Sent Pipeline */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 border border-purple-200 rounded-[3px] text-purple-600">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Sent Value ({group.sentCount})
                </p>
                <p className="text-sm font-bold text-purple-900 font-mono">
                  {formatCurrency(group.sentAmount, group.currencyCode)}
                </p>
              </div>
            </div>

            {/* Accepted Won */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-[3px] text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Accepted Value ({group.acceptedCount})
                </p>
                <p className="text-sm font-bold text-emerald-800 font-mono">
                  {formatCurrency(group.acceptedAmount, group.currencyCode)}
                </p>
              </div>
            </div>

            {/* Expiring Soon */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-[3px] text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Expiring Soon ({group.expiringSoonCount})
                </p>
                <p className="text-sm font-bold text-amber-800 font-mono">
                  {formatCurrency(group.expiringSoonAmount, group.currencyCode)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
