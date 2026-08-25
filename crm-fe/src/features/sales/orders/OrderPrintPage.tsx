import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderDocument } from './hooks/useOrderDocument';
import { renderOrderStatusBadge } from '@/config/crmStatusConfig';

function formatCurrency(amount: string | number | undefined, currencyCode: string = 'USD'): string {
  if (amount === undefined || amount === null) return '0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
  }).format(num);
}

export const OrderPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { data: order, isLoading, isError } = useOrderDocument(id);

  useEffect(() => {
    if (order && searchParams.get('auto') === 'true') {
      window.print();
    }
  }, [order, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 font-sans">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">
          Generating printable order document...
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 font-sans">
        <div className="text-sm font-semibold text-rose-600">
          Failed to load order document for printing.
        </div>
      </div>
    );
  }

  const currency = order.amounts.currencyCode || 'USD';

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans print:p-0 print:bg-white text-slate-900">
      {/* Print Control Toolbar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.close()}
          className="h-8 text-xs font-semibold rounded-[3px] gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Close</span>
        </Button>

        <Button
          size="sm"
          onClick={() => window.print()}
          className="h-8 text-xs font-semibold rounded-[3px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Document</span>
        </Button>
      </div>

      {/* Main Printable Document */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-[4px] p-8 sm:p-12 shadow-sm print:border-0 print:shadow-none print:p-0 space-y-8">
        {/* Document Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-xl font-black tracking-tight text-slate-900">
              ACME ENTERPRISE CRM
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sales Order & Commercial Commitment Document
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-2">
              <span className="text-base font-bold font-mono text-slate-900">
                {order.orderNumber}
              </span>
              {renderOrderStatusBadge(order.status)}
            </div>
            <div className="text-xs text-slate-500">
              Order Date: <span className="font-mono text-slate-700">{order.orderDate}</span>
            </div>
            {order.requestedDeliveryDate && (
              <div className="text-xs text-slate-500">
                Delivery Due: <span className="font-mono text-slate-700">{order.requestedDeliveryDate}</span>
              </div>
            )}
            {order.customerReference && (
              <div className="text-xs text-slate-500">
                PO Ref: <span className="font-mono font-semibold text-slate-900">{order.customerReference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer & Billing / Shipping Parties */}
        <div className="grid grid-cols-2 gap-8 text-xs">
          {/* Bill To */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Bill To / Buyer
            </h4>
            <div className="text-sm font-bold text-slate-900">
              {order.billingAddressSnapshot?.legalName || order.account?.name || 'Customer'}
            </div>
            {order.billingAddressSnapshot?.addressLine1 && (
              <div className="text-slate-600">{order.billingAddressSnapshot.addressLine1}</div>
            )}
            {order.billingAddressSnapshot?.locality && (
              <div className="text-slate-600">
                {order.billingAddressSnapshot.locality},{' '}
                {order.billingAddressSnapshot.region}{' '}
                {order.billingAddressSnapshot.postalCode}
              </div>
            )}
            {order.billingAddressSnapshot?.contactName && (
              <div className="text-slate-500 pt-1">
                Attn: {order.billingAddressSnapshot.contactName}{' '}
                {order.billingAddressSnapshot.contactPhone && (
                  <span>({order.billingAddressSnapshot.contactPhone})</span>
                )}
              </div>
            )}
          </div>

          {/* Ship To */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Ship / Handover To
            </h4>
            <div className="text-sm font-bold text-slate-900">
              {order.shippingAddressSnapshot?.legalName || order.account?.name || 'Delivery Site'}
            </div>
            {order.shippingAddressSnapshot?.addressLine1 && (
              <div className="text-slate-600">{order.shippingAddressSnapshot.addressLine1}</div>
            )}
            {order.shippingAddressSnapshot?.locality && (
              <div className="text-slate-600">
                {order.shippingAddressSnapshot.locality},{' '}
                {order.shippingAddressSnapshot.region}{' '}
                {order.shippingAddressSnapshot.postalCode}
              </div>
            )}
            {order.shippingAddressSnapshot?.contactName && (
              <div className="text-slate-500 pt-1">
                Attn: {order.shippingAddressSnapshot.contactName}{' '}
                {order.shippingAddressSnapshot.contactPhone && (
                  <span>({order.shippingAddressSnapshot.contactPhone})</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-[4px] overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-8 text-center">#</th>
                <th className="p-3">Item & Specification</th>
                <th className="p-3 text-right w-20">Qty</th>
                <th className="p-3 text-right w-24">Unit Price</th>
                <th className="p-3 text-right w-20">Discount</th>
                <th className="p-3 text-right w-20">Tax</th>
                <th className="p-3 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.lines.map((line) => (
                <tr key={line.id}>
                  <td className="p-3 text-center font-mono text-slate-400">{line.lineNumber}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{line.nameSnapshot}</div>
                    {line.skuSnapshot && (
                      <div className="text-[10px] font-mono text-slate-400">
                        SKU: {line.skuSnapshot}
                      </div>
                    )}
                    {line.descriptionSnapshot && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {line.descriptionSnapshot}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono font-medium text-slate-800">
                    {line.quantity}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-700">
                    {formatCurrency(line.unitPrice, currency)}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-600">
                    {parseFloat(String(line.discountAmount || 0)) > 0
                      ? `-${formatCurrency(line.discountAmount, currency)}`
                      : '—'}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-600">
                    {parseFloat(String(line.taxAmount || 0)) > 0
                      ? `+${formatCurrency(line.taxAmount, currency)}`
                      : '—'}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(line.lineTotal, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Commercial Breakdown */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-mono">{formatCurrency(order.amounts.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Itemized Discounts</span>
              <span className="font-mono text-emerald-600">
                -{formatCurrency(order.amounts.discountTotal, currency)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taxes & Duties</span>
              <span className="font-mono">{formatCurrency(order.amounts.taxTotal, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping & Handling</span>
              <span className="font-mono">{formatCurrency(order.amounts.shippingTotal, currency)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
              <span>Grand Total</span>
              <span className="font-mono">{formatCurrency(order.amounts.grandTotal, currency)}</span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        {(order.paymentTerms || order.deliveryTerms || order.notes) && (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-[4px] space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
              Commercial Terms & Notes
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {order.paymentTerms && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Terms:</span>
                  <span className="font-semibold text-slate-800">{order.paymentTerms}</span>
                </div>
              )}
              {order.deliveryTerms && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Delivery Terms:</span>
                  <span className="font-semibold text-slate-800">{order.deliveryTerms}</span>
                </div>
              )}
            </div>
            {order.notes && (
              <div className="pt-1">
                <span className="text-slate-400 block text-[10px]">Instructions:</span>
                <p className="text-slate-700 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Signature Authorization Block */}
        <div className="pt-12 grid grid-cols-2 gap-12 text-xs">
          <div className="space-y-12">
            <div className="border-t border-slate-300 pt-2">
              <div className="font-semibold text-slate-900">Authorized Commercial Representative</div>
              <div className="text-[11px] text-slate-400">Signature & Date</div>
            </div>
          </div>
          <div className="space-y-12">
            <div className="border-t border-slate-300 pt-2">
              <div className="font-semibold text-slate-900">Customer Acceptance & Handover</div>
              <div className="text-[11px] text-slate-400">Signature & Date</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
