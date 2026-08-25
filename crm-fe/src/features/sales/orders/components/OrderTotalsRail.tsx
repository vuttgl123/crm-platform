import React from 'react';
import { DollarSign, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OrderAmounts } from '@/services/api/orderApi';

interface OrderTotalsRailProps {
  amounts: OrderAmounts;
  shippingInput?: string;
  onShippingChange?: (val: string) => void;
  isEditable?: boolean;
  onSaveDraft?: () => void;
  isSaving?: boolean;
  onConfirm?: () => void;
  isConfirming?: boolean;
  canConfirm?: boolean;
}

function formatCurrency(amount: string | number | undefined, currencyCode: string = 'USD'): string {
  if (amount === undefined || amount === null) return '0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
  }).format(num);
}

export const OrderTotalsRail: React.FC<OrderTotalsRailProps> = ({
  amounts,
  shippingInput,
  onShippingChange,
  isEditable = false,
  onSaveDraft,
  isSaving = false,
  onConfirm,
  isConfirming = false,
  canConfirm = false,
}) => {
  const currency = amounts.currencyCode || 'USD';

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-4 font-sans sticky top-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="p-1.5 rounded-[4px] bg-blue-50 text-blue-600 border border-blue-100">
          <DollarSign className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Commercial Summary
        </h3>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-slate-600">
          <span>Items Subtotal</span>
          <span className="font-mono font-medium text-slate-900">
            {formatCurrency(amounts.subtotal, currency)}
          </span>
        </div>

        {/* Discount Total */}
        <div className="flex items-center justify-between text-slate-600">
          <span>Discount Total</span>
          <span className="font-mono font-medium text-emerald-600">
            -{formatCurrency(amounts.discountTotal, currency)}
          </span>
        </div>

        {/* Tax Total */}
        <div className="flex items-center justify-between text-slate-600">
          <span>Tax Total (VAT/Sales)</span>
          <span className="font-mono font-medium text-slate-900">
            +{formatCurrency(amounts.taxTotal, currency)}
          </span>
        </div>

        {/* Shipping Total */}
        <div className="flex items-center justify-between text-slate-600 pt-1">
          <span>Shipping & Logistics</span>
          {isEditable && onShippingChange ? (
            <div className="w-24">
              <Input
                type="number"
                min="0"
                step="any"
                value={shippingInput || '0'}
                onChange={(e) => onShippingChange(e.target.value)}
                className="h-7 text-xs text-right font-mono rounded-[3px]"
              />
            </div>
          ) : (
            <span className="font-mono font-medium text-slate-900">
              +{formatCurrency(amounts.shippingTotal, currency)}
            </span>
          )}
        </div>

        {/* Grand Total */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Grand Total</span>
            <span className="text-[10px] text-slate-400 font-mono">100% Tax & Shipping inclusive</span>
          </div>
          <div className="text-base font-bold font-mono text-slate-900">
            {formatCurrency(amounts.grandTotal, currency)}
          </div>
        </div>
      </div>

      {/* Action CTA buttons in edit mode */}
      {isEditable && (
        <div className="pt-2 space-y-2 border-t border-slate-100">
          {onSaveDraft && (
            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={onSaveDraft}
              className="w-full h-8 text-xs font-semibold rounded-[3px] bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Order Draft</span>
              )}
            </Button>
          )}

          {canConfirm && onConfirm && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isConfirming}
              onClick={onConfirm}
              className="w-full h-8 text-xs font-semibold rounded-[3px] text-blue-600 border-blue-200 hover:bg-blue-50 gap-1.5"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Confirm Order</span>
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
