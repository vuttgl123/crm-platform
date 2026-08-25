import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PackageCheck, Loader2 } from 'lucide-react';
import type { OrderResponse, RecordOrderFulfillmentRequest } from '@/services/api/orderApi';

interface RecordFulfillmentDialogProps {
  isOpen: boolean;
  order: OrderResponse | null;
  onClose: () => void;
  onRecord: (data: RecordOrderFulfillmentRequest) => Promise<void>;
  isLoading?: boolean;
}

export const RecordFulfillmentDialog: React.FC<RecordFulfillmentDialogProps> = ({
  isOpen,
  order,
  onClose,
  onRecord,
  isLoading,
}) => {
  const [fulfillmentDate, setFulfillmentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('');
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  useEffect(() => {
    if (order && isOpen) {
      const initial: Record<string, string> = {};
      order.lines.forEach((line) => {
        const remaining = parseFloat(String(line.remainingQuantity || '0'));
        initial[line.id] = remaining > 0 ? String(remaining) : '0';
      });
      setQuantities(initial);
      setFulfillmentDate(new Date().toISOString().split('T')[0]);
      setReferenceNumber('');
      setNote('');
    }
  }, [order, isOpen]);

  if (!order || !isOpen) return null;

  const handleFillAll = () => {
    const updated: Record<string, string> = {};
    order.lines.forEach((line) => {
      const rem = parseFloat(String(line.remainingQuantity || '0'));
      updated[line.id] = rem > 0 ? String(rem) : '0';
    });
    setQuantities(updated);
  };

  const handleClearAll = () => {
    const updated: Record<string, string> = {};
    order.lines.forEach((line) => {
      updated[line.id] = '0';
    });
    setQuantities(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lineInputs = Object.entries(quantities)
      .map(([orderLineId, qtyStr]) => ({
        orderLineId,
        quantity: parseFloat(qtyStr || '0'),
      }))
      .filter((l) => l.quantity > 0);

    if (lineInputs.length === 0) return;

    await onRecord({
      fulfillmentDate,
      referenceNumber: referenceNumber.trim() || undefined,
      note: note.trim() || undefined,
      lines: lineInputs,
    });
  };

  const totalSelectedQty = Object.values(quantities).reduce(
    (sum, val) => sum + (parseFloat(val || '0') || 0),
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="w-full sm:max-w-2xl p-0 flex flex-col bg-[#F7F8F9] z-50 border border-slate-200 rounded-[4px] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 bg-white border-b border-slate-200">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-[4px] bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-slate-900">
                    Record Fulfillment Event
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Order {order.orderNumber} • Enter quantities completed in this operational handover.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Metadata inputs */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-3 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Fulfillment Date *</label>
                <Input
                  type="date"
                  value={fulfillmentDate}
                  onChange={(e) => setFulfillmentDate(e.target.value)}
                  className="h-8 text-xs rounded-[3px] mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Reference (Optional)</label>
                <Input
                  placeholder="e.g. Delivery Slip #1024"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="h-8 text-xs rounded-[3px] mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Operational Note</label>
                <Textarea
                  placeholder="Notes regarding handover or delivery condition..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-xs rounded-[3px] min-h-[50px] mt-1"
                />
              </div>
            </div>

            {/* Line items fulfillment table */}
            <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Order Lines to Fulfill
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleFillAll}
                    className="h-6 text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-2"
                  >
                    Fill All Remaining
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-6 text-[11px] font-semibold text-slate-500 hover:text-slate-700 px-2"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-right w-20">Ordered</th>
                      <th className="p-2.5 text-right w-20">Fulfilled</th>
                      <th className="p-2.5 text-right w-20">Remaining</th>
                      <th className="p-2.5 text-right w-28">Fulfill Now</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.lines.map((line) => {
                      const ordered = parseFloat(String(line.quantity || '0'));
                      const fulfilled = parseFloat(String(line.fulfilledQuantity || '0'));
                      const remaining = parseFloat(String(line.remainingQuantity || '0'));
                      const currentVal = quantities[line.id] || '0';
                      const numVal = parseFloat(currentVal || '0');
                      const isOver = numVal > remaining;

                      return (
                        <tr key={line.id} className="hover:bg-slate-50/60">
                          <td className="p-2.5">
                            <div className="font-semibold text-slate-900">{line.nameSnapshot}</div>
                            {line.skuSnapshot && (
                              <div className="text-[10px] font-mono text-slate-400">
                                SKU: {line.skuSnapshot}
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-700">{ordered}</td>
                          <td className="p-2.5 text-right font-mono text-slate-500">{fulfilled}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-blue-600">
                            {remaining}
                          </td>
                          <td className="p-2.5 text-right">
                            <Input
                              type="number"
                              min="0"
                              max={remaining}
                              step="any"
                              value={currentVal}
                              onChange={(e) =>
                                setQuantities((prev) => ({
                                  ...prev,
                                  [line.id]: e.target.value,
                                }))
                              }
                              disabled={remaining <= 0}
                              className={`h-7 text-xs text-right font-mono rounded-[3px] ${
                                isOver ? 'border-rose-500 bg-rose-50' : ''
                              }`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Total quantity to record:{' '}
              <strong className="text-slate-900 font-bold font-mono">{totalSelectedQty}</strong>
            </div>
            <div className="flex items-center gap-2">
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
                type="submit"
                size="sm"
                disabled={isLoading || totalSelectedQty <= 0}
                className="h-8 text-xs font-semibold rounded-[3px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <span>Record Fulfillment</span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
