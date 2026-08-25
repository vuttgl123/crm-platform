import React from 'react';
import { History, ArrowRight } from 'lucide-react';
import { renderOrderStatusBadge } from '@/config/crmStatusConfig';
import type { OrderStatusHistoryResponse } from '@/services/api/orderApi';

interface OrderStatusHistoryProps {
  history: OrderStatusHistoryResponse[];
}

export const OrderStatusHistory: React.FC<OrderStatusHistoryProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3 font-sans w-full">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
        <History className="w-4 h-4 text-slate-500" />
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Lifecycle & Status Audit Trail ({history.length})
        </h3>
      </div>

      <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {history.map((entry) => (
          <div key={entry.id} className="relative space-y-1">
            {/* Timeline Dot */}
            <div className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white" />

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-900">{entry.action}</span>
              <div className="flex items-center gap-1">
                {entry.fromStatus && (
                  <>
                    {renderOrderStatusBadge(entry.fromStatus)}
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </>
                )}
                {renderOrderStatusBadge(entry.toStatus)}
              </div>
              <span className="text-slate-400 text-[11px]">
                {new Date(entry.changedAt).toLocaleString()}
              </span>
            </div>

            {entry.notes && (
              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-[3px] border border-slate-100 italic">
                "{entry.notes}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
