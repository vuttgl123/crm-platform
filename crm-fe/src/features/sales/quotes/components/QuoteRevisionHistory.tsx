import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { renderQuoteStatusBadge } from '@/config/crmStatusConfig';
import type { QuoteRevisionItem } from '../model/quoteTypes';

interface QuoteRevisionHistoryProps {
  revisions: QuoteRevisionItem[];
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export const QuoteRevisionHistory: React.FC<QuoteRevisionHistoryProps> = ({ revisions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs animate-pulse">
        <div className="h-4 w-32 bg-slate-100 rounded-[2px] mb-3" />
        <div className="h-20 bg-slate-50 rounded-[3px]" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800">
          <Layers className="w-4 h-4 text-slate-500" />
          <span>Revision Chain ({revisions.length})</span>
        </div>
        <span className="text-[11px] text-slate-400">Preserved commercial versions</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Revision</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Grand Total</th>
              <th className="py-2.5 px-3">Created Date</th>
              <th className="py-2.5 px-3 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {revisions.map((rev) => (
              <tr
                key={rev.id}
                className={`hover:bg-slate-50/60 ${rev.isCurrent ? 'bg-blue-50/30' : ''}`}
              >
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                    <span>Rev {rev.revisionNumber}</span>
                    {rev.isCurrent && (
                      <Badge className="bg-blue-600 text-white text-[9px] px-1.5 py-0 rounded-[2px] font-sans font-semibold">
                        Viewing
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  {renderQuoteStatusBadge(rev.status, rev.effectiveStatus)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                  {formatCurrency(rev.grandTotal, rev.currencyCode)}
                </td>
                <td className="py-2.5 px-3 text-slate-500">{formatDate(rev.createdAt)}</td>
                <td className="py-2.5 px-3 text-right">
                  {!rev.isCurrent && (
                    <Link
                      to={`/app/sales/quotes/${rev.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
