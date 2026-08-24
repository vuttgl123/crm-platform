import React from 'react';
import { History, MessageSquare } from 'lucide-react';
import { renderQuoteStatusBadge } from '@/config/crmStatusConfig';
import type { QuoteStatusHistoryItem } from '../model/quoteTypes';

interface QuoteStatusHistoryProps {
  history: QuoteStatusHistoryItem[];
  isLoading?: boolean;
}

function formatTimestamp(ts?: string): string {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return ts;
  }
}

export const QuoteStatusHistory: React.FC<QuoteStatusHistoryProps> = ({ history, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs animate-pulse">
        <div className="h-4 w-32 bg-slate-100 rounded-[2px] mb-3" />
        <div className="space-y-3">
          <div className="h-10 bg-slate-50 rounded-[3px]" />
          <div className="h-10 bg-slate-50 rounded-[3px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800">
          <History className="w-4 h-4 text-slate-500" />
          <span>Status & Audit History ({history.length})</span>
        </div>
        <span className="text-[11px] text-slate-400">Append-only compliance log</span>
      </div>

      {history.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">
          No status history transitions recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-slate-50/60 border border-slate-200 rounded-[3px] space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-mono text-[11px]">
                    {entry.action}
                  </span>
                  <div className="flex items-center gap-1">
                    {entry.previousStoredStatus && (
                      <>
                        {renderQuoteStatusBadge(entry.previousStoredStatus)}
                        <span className="text-slate-400">→</span>
                      </>
                    )}
                    {renderQuoteStatusBadge(entry.newStoredStatus)}
                  </div>
                </div>
                <span className="text-[11px] text-slate-500">{formatTimestamp(entry.occurredAt)}</span>
              </div>

              {entry.reason && (
                <div className="flex items-start gap-1.5 text-slate-700 bg-white p-2 rounded-[2px] border border-slate-200 mt-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] italic leading-relaxed">{entry.reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
