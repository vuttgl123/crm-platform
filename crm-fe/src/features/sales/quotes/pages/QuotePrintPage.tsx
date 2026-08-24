import React from 'react';
import { useParams } from 'react-router-dom';
import { Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuoteDocument } from '../hooks/useQuoteDocument';
import { renderQuoteStatusBadge } from '@/config/crmStatusConfig';

function formatCurrency(amount: string | number, currencyCode: string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
    maximumFractionDigits: 2,
  }).format(num);
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export const QuotePrintPage: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const { data: doc, isLoading, error } = useQuoteDocument(quoteId);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-[4px] shadow-sm text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">Generating Printable Quote Document...</p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-[4px] shadow-sm text-center space-y-2 text-rose-600">
          <p className="text-sm font-bold">Failed to load commercial document projection.</p>
        </div>
      </div>
    );
  }

  const currencyCode = doc.amounts?.currencyCode || 'USD';
  const showWatermark =
    doc.effectiveStatus === 'DRAFT' ||
    doc.effectiveStatus === 'PENDING_APPROVAL' ||
    doc.effectiveStatus === 'CANCELLED' ||
    doc.effectiveStatus === 'REJECTED' ||
    doc.effectiveStatus === 'EXPIRED' ||
    doc.effectiveStatus === 'SUPERSEDED';

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans text-slate-900 print:bg-white print:p-0">
      {/* Top Floating Action Bar (Hidden during Print) */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Commercial Quote Print Preview</span>
          {renderQuoteStatusBadge(doc.storedStatus, doc.effectiveStatus)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handlePrint}
            className="h-8.5 rounded-[3px] text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.close()}
            className="h-8.5 rounded-[3px] text-xs font-medium border-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Printable Sheet (8.5 x 11 / A4 style) */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-[4px] shadow-sm p-10 print:p-0 print:border-none print:shadow-none relative overflow-hidden">
        {/* Status Watermark */}
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-30deg] select-none">
            <span className="text-8xl font-black uppercase tracking-widest text-slate-950 font-mono">
              {doc.effectiveStatus.replace('_', ' ')}
            </span>
          </div>
        )}

        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">COMMERCIAL QUOTATION</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">{doc.name}</p>
          </div>
          <div className="text-right space-y-1">
            <div className="text-sm font-bold font-mono text-slate-900">
              {doc.quoteNumber}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Revision: <span className="font-semibold text-slate-800">Rev {doc.revisionNumber}</span>
            </div>
            <div className="text-xs text-slate-500">
              Date: <span className="font-medium text-slate-800">{formatDate(doc.issueDate)}</span>
            </div>
            {doc.validUntil && (
              <div className="text-xs text-slate-500">
                Valid Until: <span className="font-medium text-slate-800">{formatDate(doc.validUntil)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recipient / Customer Snapshot */}
        <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-100 text-xs">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quoted To (Customer)
            </h3>
            <div className="space-y-1 text-slate-700">
              <p className="font-bold text-slate-900 text-sm">{doc.customerSnapshot?.legalName || 'Customer'}</p>
              {doc.customerSnapshot?.contactName && (
                <p>Attn: {doc.customerSnapshot.contactName}</p>
              )}
              {doc.customerSnapshot?.addressLine1 && <p>{doc.customerSnapshot.addressLine1}</p>}
              {doc.customerSnapshot?.addressLine2 && <p>{doc.customerSnapshot.addressLine2}</p>}
              {(doc.customerSnapshot?.locality || doc.customerSnapshot?.region) && (
                <p>
                  {[doc.customerSnapshot.locality, doc.customerSnapshot.region, doc.customerSnapshot.postalCode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {doc.customerSnapshot?.countryCode && <p>{doc.customerSnapshot.countryCode}</p>}
              {doc.customerSnapshot?.contactEmail && <p>{doc.customerSnapshot.contactEmail}</p>}
              {doc.customerSnapshot?.contactPhone && <p>{doc.customerSnapshot.contactPhone}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Commercial References
            </h3>
            <div className="space-y-1 text-slate-700">
              {doc.customerReference && (
                <p>
                  <strong className="text-slate-900">Customer PO #:</strong> {doc.customerReference}
                </p>
              )}
              {doc.paymentTerms && (
                <p>
                  <strong className="text-slate-900">Payment Terms:</strong> {doc.paymentTerms}
                </p>
              )}
              {doc.deliveryTerms && (
                <p>
                  <strong className="text-slate-900">Delivery Terms:</strong> {doc.deliveryTerms}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Lines Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-2 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-right w-16">Qty</th>
                <th className="py-2.5 px-3 text-right w-24">Unit Price</th>
                <th className="py-2.5 px-3 text-right w-16">Disc</th>
                <th className="py-2.5 px-3 text-right w-16">Tax</th>
                <th className="py-2.5 px-3 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(doc.lines || []).map((line) => (
                <tr key={line.id}>
                  <td className="py-3 px-2 text-center font-mono text-slate-400">{line.position}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{line.productName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">SKU: {line.sku}</p>
                    {line.description && <p className="text-[11px] text-slate-600 italic mt-0.5">{line.description}</p>}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">{line.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatCurrency(line.salesUnitPrice, currencyCode)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {Number(line.discountPercent) > 0 ? `${line.discountPercent}%` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {Number(line.taxPercent) > 0 ? `${line.taxPercent}%` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(line.lineTotal, currencyCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(doc.amounts?.subtotal || 0, currencyCode)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Discount Total:</span>
              <span className="font-mono">-{formatCurrency(doc.amounts?.discountTotal || 0, currencyCode)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Taxes:</span>
              <span className="font-mono">+{formatCurrency(doc.amounts?.taxTotal || 0, currencyCode)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping & Handling:</span>
              <span className="font-mono">+{formatCurrency(doc.amounts?.shippingTotal || 0, currencyCode)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-slate-900 font-bold text-sm text-slate-900">
              <span>Grand Total:</span>
              <span className="font-mono text-base">{formatCurrency(doc.amounts?.grandTotal || 0, currencyCode)}</span>
            </div>
          </div>
        </div>

        {/* Acceptance Signatures */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-xs">
          <div className="space-y-8">
            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Prepared By:</p>
            <div className="border-b border-slate-300 pt-8" />
            <p className="text-slate-500">Authorized Signature / Date</p>
          </div>
          <div className="space-y-8">
            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Accepted & Confirmed By (Client):</p>
            <div className="border-b border-slate-300 pt-8" />
            <p className="text-slate-500">Customer Signature / Date</p>
          </div>
        </div>
      </div>
    </div>
  );
};
