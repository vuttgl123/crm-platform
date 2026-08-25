import React from 'react';
import { PackageCheck, AlertCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OrderFulfillmentResponse } from '@/services/api/orderApi';

interface OrderFulfillmentLedgerProps {
  fulfillments: OrderFulfillmentResponse[];
  onVoidClick: (event: OrderFulfillmentResponse) => void;
  canVoid?: boolean;
}

export const OrderFulfillmentLedger: React.FC<OrderFulfillmentLedgerProps> = ({
  fulfillments,
  onVoidClick,
  canVoid = true,
}) => {
  if (fulfillments.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-6 text-center space-y-2 font-sans w-full">
        <PackageCheck className="w-6 h-6 text-slate-300 mx-auto" />
        <h3 className="text-xs font-bold text-slate-800">No Fulfillment Events Recorded</h3>
        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
          No operational handovers or deliveries have been logged yet for this order.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs overflow-hidden font-sans w-full space-y-0">
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Fulfillment History Ledger ({fulfillments.length})
          </h2>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {fulfillments.map((ev) => {
          const isVoided = ev.status === 'VOIDED';

          return (
            <div
              key={ev.id}
              className={`p-4 space-y-3 transition-colors ${
                isVoided ? 'bg-slate-50/50 opacity-75' : 'hover:bg-slate-50/40'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {ev.eventNumber}
                    </span>
                    {isVoided ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded-[2px]">
                        <Ban className="w-3 h-3" />
                        <span>VOIDED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-[2px]">
                        <span>RECORDED</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    Handover Date: <strong className="text-slate-700 font-mono">{ev.fulfillmentDate}</strong>
                    {ev.referenceNumber && (
                      <span> • Ref: <span className="font-mono text-slate-700">{ev.referenceNumber}</span></span>
                    )}
                  </div>
                </div>

                {!isVoided && canVoid && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVoidClick(ev)}
                    className="h-7 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-[3px] gap-1"
                  >
                    <Ban className="w-3 h-3" />
                    <span>Void Event</span>
                  </Button>
                )}
              </div>

              {/* Note */}
              {ev.note && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-[3px] border border-slate-100 italic">
                  "{ev.note}"
                </p>
              )}

              {/* Void details if voided */}
              {isVoided && ev.voidReason && (
                <div className="bg-rose-50/70 border border-rose-100 rounded-[3px] p-2 text-xs text-rose-700 flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <div>
                    <span className="font-bold">Void Reason:</span> {ev.voidReason}
                  </div>
                </div>
              )}

              {/* Items Fulfilled in this event */}
              <div className="border border-slate-100 rounded-[3px] overflow-hidden bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/60 text-slate-500 font-medium">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2 text-right w-24">Quantity Fulfilled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ev.lines.map((l) => (
                      <tr key={l.id}>
                        <td className="p-2 text-slate-800">
                          {l.lineName}
                          {l.lineSku && <span className="text-[10px] font-mono text-slate-400 ml-1.5">({l.lineSku})</span>}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          {l.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
