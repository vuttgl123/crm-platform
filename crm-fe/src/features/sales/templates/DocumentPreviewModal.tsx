import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Printer,
  X,
  FileText,
  FileCheck,
} from 'lucide-react';

interface DocumentLineItem {
  id?: string;
  name: string;
  sku?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
}

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  documentType: 'QUOTE' | 'CONTRACT';
  documentNumber: string;
  documentDate: string;
  validUntilDate?: string;
  clientName: string;
  clientTaxCode?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientRepresentative?: string;
  items: DocumentLineItem[];
  subtotal: number;
  discountTotal?: number;
  taxTotal?: number;
  grandTotal: number;
  terms?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  open,
  onClose,
  documentType,
  documentNumber,
  documentDate,
  validUntilDate,
  clientName,
  clientTaxCode,
  clientAddress,
  clientPhone,
  clientRepresentative,
  items,
  subtotal,
  discountTotal = 0,
  taxTotal = 0,
  grandTotal,
  terms,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  const isContract = documentType === 'CONTRACT';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              {isContract ? <FileCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {isContract ? 'Enterprise Service & Solution Agreement' : 'Commercial CPQ Quotation & Services'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Reference No: {documentNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-8 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable A4 Paper Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70 flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-[800px] bg-white border border-slate-200 shadow-lg p-8 sm:p-10 space-y-6 text-slate-900 rounded-sm"
          >
            {/* Header: Company Letterhead */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-blue-700 text-white font-black text-xs flex items-center justify-center">
                    CRM
                  </div>
                  <h1 className="font-black text-lg uppercase tracking-tight text-slate-900">
                    ENTERPRISE SMARTCRM SOLUTIONS CORP
                  </h1>
                </div>
                <p className="text-[11px] text-slate-600">Level 18, Landmark Tower, Central Tech District</p>
                <p className="text-[11px] text-slate-600">Tax ID: <strong className="font-mono">0108999888</strong> | Hotline: +1 800 6868 | Email: contact@smartcrm.com</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isContract ? 'COMMERCIAL CONTRACT' : 'QUOTATION PROPOSAL'}
                </div>
                <div className="text-sm font-black font-mono text-blue-700">{documentNumber}</div>
                <div className="text-[11px] text-slate-500 mt-1">Date: {documentDate}</div>
                {validUntilDate && (
                  <div className="text-[11px] text-slate-500">Valid Until: {validUntilDate}</div>
                )}
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center py-2">
              <h2 className="text-xl font-black uppercase tracking-wide text-slate-900">
                {isContract ? 'SOFTWARE SOLUTION & SUPPORT AGREEMENT' : 'CRM PRODUCTS & PROFESSIONAL SERVICES PROPOSAL'}
              </h2>
            </div>

            {/* Party Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 uppercase text-[11px] text-blue-800 border-b border-slate-200 pb-1 mb-1.5">
                  Vendor (Party A):
                </div>
                <div>Representative: <strong>SMARTCRM ENTERPRISE CORP</strong></div>
                <div>Tax ID: <strong>0108999888</strong></div>
                <div>Hotline: <strong>+1 800 6868</strong></div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-900 uppercase text-[11px] text-blue-800 border-b border-slate-200 pb-1 mb-1.5">
                  Client / Buyer (Party B):
                </div>
                <div>Company Name: <strong className="text-slate-900">{clientName}</strong></div>
                <div>Tax ID: <strong>{clientTaxCode || 'N/A'}</strong></div>
                <div>Billing Address: <strong>{clientAddress || 'Corporate Address'}</strong></div>
                <div>Telephone: <strong>{clientPhone || '+1 555 0192'}</strong></div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-300 p-2 text-center w-10">#</th>
                    <th className="border border-slate-300 p-2 text-left">Item Description</th>
                    <th className="border border-slate-300 p-2 text-center w-16">Unit</th>
                    <th className="border border-slate-300 p-2 text-right w-16">Qty</th>
                    <th className="border border-slate-300 p-2 text-right w-28">Unit Price (₫)</th>
                    <th className="border border-slate-300 p-2 text-right w-28">Total Amount (₫)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border border-slate-300 p-4 text-center text-slate-400">
                        No product or service line items specified in this document
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                        <td className="border border-slate-300 p-2">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          {item.sku && <div className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</div>}
                        </td>
                        <td className="border border-slate-300 p-2 text-center">{item.unit || 'Package'}</td>
                        <td className="border border-slate-300 p-2 text-right font-mono font-semibold">{item.quantity}</td>
                        <td className="border border-slate-300 p-2 text-right font-mono">
                          {item.unitPrice.toLocaleString('en-US')}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-900">
                          {item.totalAmount.toLocaleString('en-US')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary & Totals */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-xs pt-2">
              <div className="space-y-1.5 flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-700 uppercase text-[10px]">Payment Currency:</div>
                <div className="font-bold text-blue-900 text-xs leading-relaxed">
                  VND (Vietnamese Dong) - Official Bank Transfer Rate
                </div>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{subtotal.toLocaleString('en-US')} ₫</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Commercial Discount:</span>
                    <span>-{discountTotal.toLocaleString('en-US')} ₫</span>
                  </div>
                )}
                {taxTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>VAT / Tax (10%):</span>
                    <span>+{taxTotal.toLocaleString('en-US')} ₫</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                  <span>GRAND TOTAL:</span>
                  <span className="text-blue-700">{grandTotal.toLocaleString('en-US')} ₫</span>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-1 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
              <div className="font-bold text-slate-800 uppercase text-[10px]">Terms, Conditions &amp; Warranties:</div>
              {terms ? (
                <p className="whitespace-pre-line">{terms}</p>
              ) : (
                <>
                  <p>1. Proposal includes 12 months standard enterprise software licensing and 24/7 technical assistance.</p>
                  <p>2. Payment Terms: 100% electronic bank transfer settlement within 15 days of final acceptance milestone.</p>
                  <p>3. All disputes arising shall be resolved through good-faith negotiation and applicable governing laws.</p>
                </>
              )}
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 text-center pt-8 text-xs">
              <div className="space-y-14">
                <div>
                  <div className="font-bold uppercase text-slate-900">AUTHORIZATION: CLIENT (PARTY B)</div>
                  <div className="text-[11px] text-slate-400 italic">(Signed, sealed and dated)</div>
                </div>
                <div className="font-bold text-slate-800">{clientRepresentative || clientName}</div>
              </div>

              <div className="space-y-14">
                <div>
                  <div className="font-bold uppercase text-slate-900">AUTHORIZATION: VENDOR (PARTY A)</div>
                  <div className="text-[11px] text-slate-400 italic">(Signed, sealed and dated)</div>
                </div>
                <div className="font-bold text-slate-800">Executive Managing Director</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
