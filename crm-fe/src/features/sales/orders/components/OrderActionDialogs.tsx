import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2,
  PlayCircle,
  StopCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import type { OrderSummaryResponse, OrderResponse, OrderAction } from '@/services/api/orderApi';

export interface OrderActionDialogState {
  isOpen: boolean;
  action: OrderAction | null;
  order: OrderSummaryResponse | OrderResponse | null;
}

interface OrderActionDialogsProps {
  dialogState: OrderActionDialogState;
  onClose: () => void;
  onConfirmAction: (action: OrderAction, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export const OrderActionDialogs: React.FC<OrderActionDialogsProps> = ({
  dialogState,
  onClose,
  onConfirmAction,
  isLoading,
}) => {
  const [reason, setReason] = useState('');
  const { isOpen, action, order } = dialogState;

  if (!isOpen || !action || !order) return null;

  const handleConfirm = async () => {
    await onConfirmAction(action, reason);
    setReason('');
    onClose();
  };

  const getDialogConfig = () => {
    switch (action) {
      case 'CONFIRM':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
          iconBg: 'bg-blue-50 border-blue-100',
          title: 'Confirm Sales Order',
          description: `Are you sure you want to confirm order ${order.orderNumber}? This commercially locks the order lines and pricing.`,
          confirmLabel: 'Confirm Order',
          confirmVariant: 'bg-blue-600 hover:bg-blue-700 text-white',
          needsReason: false,
        };
      case 'START_PROCESSING':
        return {
          icon: <PlayCircle className="w-5 h-5 text-purple-600" />,
          iconBg: 'bg-purple-50 border-purple-100',
          title: 'Start Order Processing',
          description: `Move order ${order.orderNumber} to PROCESSING status so line-level fulfillment events can be recorded?`,
          confirmLabel: 'Start Processing',
          confirmVariant: 'bg-purple-600 hover:bg-purple-700 text-white',
          needsReason: false,
        };
      case 'CLOSE_REMAINING':
        return {
          icon: <StopCircle className="w-5 h-5 text-amber-600" />,
          iconBg: 'bg-amber-50 border-amber-100',
          title: 'Close Order Remainder',
          description: `Close order ${order.orderNumber} with unfulfilled items cancelled? This action will set the order status to CLOSED_PARTIAL.`,
          confirmLabel: 'Close Remainder',
          confirmVariant: 'bg-amber-600 hover:bg-amber-700 text-white',
          needsReason: true,
          reasonPlaceholder: 'Reason for closing remainder (required)...',
        };
      case 'CANCEL':
        return {
          icon: <XCircle className="w-5 h-5 text-rose-600" />,
          iconBg: 'bg-rose-50 border-rose-100',
          title: 'Cancel Sales Order',
          description: `Are you sure you want to cancel order ${order.orderNumber}? This will terminate the order lifecycle.`,
          confirmLabel: 'Cancel Order',
          confirmVariant: 'bg-rose-600 hover:bg-rose-700 text-white',
          needsReason: true,
          reasonPlaceholder: 'Reason for cancellation (required)...',
        };
      case 'DELETE_DRAFT':
        return {
          icon: <Trash2 className="w-5 h-5 text-rose-600" />,
          iconBg: 'bg-rose-50 border-rose-100',
          title: 'Delete Draft Order',
          description: `Are you sure you want to permanently delete draft order ${order.orderNumber}? This action cannot be undone.`,
          confirmLabel: 'Delete Draft',
          confirmVariant: 'bg-rose-600 hover:bg-rose-700 text-white',
          needsReason: false,
        };
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-slate-600" />,
          iconBg: 'bg-slate-50 border-slate-100',
          title: 'Confirm Action',
          description: `Are you sure you want to perform this action on order ${order.orderNumber}?`,
          confirmLabel: 'Confirm',
          confirmVariant: 'bg-slate-900 hover:bg-slate-800 text-white',
          needsReason: false,
        };
    }
  };

  const config = getDialogConfig();
  const isSubmitDisabled = isLoading || (config.needsReason && !reason.trim());

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <AlertDialogContent className="max-w-md font-sans rounded-[4px]">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-[4px] border ${config.iconBg}`}>
              {config.icon}
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              {config.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-slate-600">
            {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {config.needsReason && (
          <div className="pt-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Reason Note *</label>
            <Textarea
              placeholder={config.reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-xs rounded-[3px] min-h-[72px]"
            />
          </div>
        )}

        <AlertDialogFooter className="gap-2 sm:gap-0 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onClose}
            className="h-8 text-xs font-semibold rounded-[3px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitDisabled}
            onClick={handleConfirm}
            className={`h-8 text-xs font-semibold rounded-[3px] gap-1.5 ${config.confirmVariant}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{config.confirmLabel}</span>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
