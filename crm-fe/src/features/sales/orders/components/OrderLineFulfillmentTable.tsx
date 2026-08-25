import React from 'react';
import { Package, CheckCircle2, Clock } from 'lucide-react';
import type { OrderLineResponse } from '@/services/api/orderApi';

interface OrderLineFulfillmentTableProps {
  lines: OrderLineResponse[];
  currencyCode: string;
}

function formatCurrency(amount: string | number, currencyCode: string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
  }).format(num);
}

export const OrderLineFulfillmentTable: React.FC<OrderLineFulfillmentTableProps> = ({
  lines,
  currencyCode,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs overflow-hidden font-sans w-full">
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-500" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Order Items & Line Fulfillment ({lines.length})
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3">Product / Service</th>
              <th className="p-3 text-right">Ordered</th>
              <th className="p-3 text-right">Fulfilled</th>
              <th className="p-3 text-right">Remaining</th>
              <th className="p-3 text-center">Fulfillment Status</th>
              <th className="p-3 text-right">Unit Price</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((line) => {
              const ordered = parseFloat(String(line.quantity || '0'));
              const fulfilled = parseFloat(String(line.fulfilledQuantity || '0'));
              const remaining = parseFloat(String(line.remainingQuantity || '0'));
              const isFulfilled = remaining <= 0 && ordered > 0;
              const isPartial = fulfilled > 0 && remaining > 0;

              return (
                <tr key={line.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 text-center font-mono text-slate-400">{line.lineNumber}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{line.nameSnapshot}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      {line.skuSnapshot && <span className="font-mono">SKU: {line.skuSnapshot}</span>}
                      {line.unitOfMeasureSnapshot && <span>Unit: {line.unitOfMeasureSnapshot}</span>}
                    </div>
                    {line.descriptionSnapshot && (
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {line.descriptionSnapshot}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono font-medium text-slate-700">{ordered}</td>
                  <td className="p-3 text-right font-mono font-semibold text-emerald-600">
                    {fulfilled}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-blue-600">{remaining}</td>
                  <td className="p-3 text-center">
                    {isFulfilled ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-[3px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>FULFILLED</span>
                      </span>
                    ) : isPartial ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-[3px]">
                        <Clock className="w-3 h-3" />
                        <span>PARTIAL</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-[3px]">
                        <span>UNFULFILLED</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700">
                    {formatCurrency(line.unitPrice, currencyCode)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(line.lineTotal, currencyCode)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
