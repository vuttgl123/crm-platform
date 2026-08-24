import React from 'react';
import { FileCheck, Lock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface QuoteTermsPanelProps {
  paymentTerms: string;
  deliveryTerms: string;
  customerReference: string;
  internalNotes: string;
  onChange?: (updates: {
    paymentTerms?: string;
    deliveryTerms?: string;
    customerReference?: string;
    internalNotes?: string;
  }) => void;
  isReadOnly?: boolean;
}

export const QuoteTermsPanel: React.FC<QuoteTermsPanelProps> = ({
  paymentTerms,
  deliveryTerms,
  customerReference,
  internalNotes,
  onChange,
  isReadOnly = false,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <FileCheck className="w-3.5 h-3.5 text-slate-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Commercial Terms & Internal Audit Notes
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Payment Terms */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Payment Terms</label>
          <Input
            value={paymentTerms || ''}
            onChange={(e) => onChange?.({ paymentTerms: e.target.value })}
            disabled={isReadOnly}
            placeholder="e.g. Net 30 Days, 50% Upfront..."
            className="h-8.5 rounded-[3px] border-slate-200 text-xs"
          />
        </div>

        {/* Delivery Terms */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Delivery Terms</label>
          <Input
            value={deliveryTerms || ''}
            onChange={(e) => onChange?.({ deliveryTerms: e.target.value })}
            disabled={isReadOnly}
            placeholder="e.g. Digital Delivery, FOB Destination..."
            className="h-8.5 rounded-[3px] border-slate-200 text-xs"
          />
        </div>

        {/* Customer Reference */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Customer PO / Reference #</label>
          <Input
            value={customerReference || ''}
            onChange={(e) => onChange?.({ customerReference: e.target.value })}
            disabled={isReadOnly}
            placeholder="e.g. CUST-REQ-8831"
            className="h-8.5 rounded-[3px] border-slate-200 text-xs"
          />
        </div>

        {/* Internal Notes */}
        <div className="space-y-1 sm:col-span-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-700 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Internal Confidential Notes</span>
            </label>
            <span className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Never printed or shared with customer</span>
            </span>
          </div>
          <Textarea
            value={internalNotes || ''}
            onChange={(e) => onChange?.({ internalNotes: e.target.value })}
            disabled={isReadOnly}
            placeholder="Internal pricing rationale, approval prerequisites, partner commission notes..."
            rows={3}
            className="rounded-[3px] border-slate-200 text-xs"
          />
        </div>
      </div>
    </div>
  );
};
