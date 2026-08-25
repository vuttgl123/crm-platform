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
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { OrderFulfillmentResponse } from '@/services/api/orderApi';

interface VoidFulfillmentDialogProps {
  isOpen: boolean;
  event: OrderFulfillmentResponse | null;
  onClose: () => void;
  onConfirmVoid: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const VoidFulfillmentDialog: React.FC<VoidFulfillmentDialogProps> = ({
  isOpen,
  event,
  onClose,
  onConfirmVoid,
  isLoading,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !event) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    await onConfirmVoid(reason);
    setReason('');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <AlertDialogContent className="max-w-md font-sans rounded-[4px]">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-[4px] bg-rose-50 border border-rose-100 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Void Fulfillment Event
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-slate-600">
            Are you sure you want to void fulfillment event <strong className="text-slate-900 font-bold font-mono">{event.eventNumber}</strong>?
            This will reverse the fulfilled quantities on affected order lines and recompute the order status.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="pt-2 space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Reason for Voiding *</label>
          <Textarea
            placeholder="Explain why this fulfillment event is being voided (e.g. data entry error, returned handover)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="text-xs rounded-[3px] min-h-[72px]"
            required
          />
        </div>

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
            disabled={isLoading || !reason.trim()}
            onClick={handleConfirm}
            className="h-8 text-xs font-semibold rounded-[3px] bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Voiding...</span>
              </>
            ) : (
              <span>Void Event</span>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
