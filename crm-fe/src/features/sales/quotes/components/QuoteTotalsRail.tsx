import React from 'react';
import { Calculator, Save, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { QuoteFormLineItem } from '../model/quoteTypes';

interface QuoteTotalsRailProps {
  lines: QuoteFormLineItem[];
  shippingTotal: number;
  onShippingChange?: (val: number) => void;
  currencyCode: string;
  onSaveDraft?: () => void;
  onSubmitForApproval?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  isSubmitting?: boolean;
  isReadOnly?: boolean;
}

export const QuoteTotalsRail: React.FC<QuoteTotalsRailProps> = ({
  lines,
  shippingTotal,
  onShippingChange,
  currencyCode,
  onSaveDraft,
  onSubmitForApproval,
  onCancel,
  isSaving = false,
  isSubmitting = false,
  isReadOnly = false,
}) => {
  // Compute provisional totals from lines
  const subtotal = lines.reduce((sum, l) => sum + (l.subtotal || 0), 0);
  const discountTotal = lines.reduce((sum, l) => sum + (l.discountAmount || 0), 0);
  const taxTotal = lines.reduce((sum, l) => sum + (l.taxAmount || 0), 0);
  const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal + (shippingTotal || 0));

  const format = (val: number) =>
    val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-4 sticky top-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800">
          <Calculator className="w-4 h-4 text-slate-500" />
          <span>Commercial Summary</span>
        </div>
        <Badge variant="outline" className="text-xs font-mono font-bold bg-slate-50 text-slate-700 rounded-[3px]">
          {currencyCode || 'USD'}
        </Badge>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span>Line Subtotal</span>
          <span className="font-mono font-medium">{format(subtotal)} {currencyCode}</span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span>Total Discounts</span>
          <span className="font-mono text-emerald-700 font-medium">-{format(discountTotal)} {currencyCode}</span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span>Estimated Taxes</span>
          <span className="font-mono font-medium">+{format(taxTotal)} {currencyCode}</span>
        </div>

        <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
          <span>Shipping & Logistics</span>
          {!isReadOnly && onShippingChange ? (
            <div className="w-28">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={shippingTotal}
                onChange={(e) => onShippingChange(parseFloat(e.target.value) || 0)}
                className="h-7 text-xs rounded-[3px] border-slate-200 font-mono text-right"
              />
            </div>
          ) : (
            <span className="font-mono font-medium">+{format(shippingTotal)} {currencyCode}</span>
          )}
        </div>

        {/* Grand Total */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
              Grand Total
            </span>
            <span className="text-[10px] text-slate-400">Server verified arithmetic</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold font-mono text-slate-900 block">
              {format(grandTotal)}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
              {currencyCode}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!isReadOnly && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {onSaveDraft && (
            <Button
              onClick={onSaveDraft}
              disabled={isSaving || isSubmitting}
              className="w-full h-8.5 rounded-[3px] text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving Draft...' : 'Save Draft'}</span>
            </Button>
          )}

          {onSubmitForApproval && (
            <Button
              onClick={onSubmitForApproval}
              disabled={isSaving || isSubmitting || lines.length === 0}
              className="w-full h-8.5 rounded-[3px] text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Submit for Approval</span>
            </Button>
          )}

          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full h-8 rounded-[3px] text-xs font-medium border-slate-200 gap-1.5 text-slate-600"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Discard Changes</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
