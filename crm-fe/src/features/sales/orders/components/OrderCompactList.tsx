import React from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, FileText, Printer, CheckCircle2, PlayCircle, PackageCheck, XCircle, Trash2, Edit3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { renderOrderStatusBadge } from '@/config/crmStatusConfig';
import { canPerformOrderAction } from '../model/orderCapabilities';
import type { OrderSummaryResponse, OrderAction } from '@/services/api/orderApi';

interface OrderCompactListProps {
  orders: OrderSummaryResponse[];
  onTriggerAction: (action: OrderAction, order: OrderSummaryResponse) => void;
}

function formatCurrency(amount: string | number, currencyCode: string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
  }).format(num);
}

export const OrderCompactList: React.FC<OrderCompactListProps> = ({ orders, onTriggerAction }) => {
  return (
    <div className="space-y-3 font-sans w-full">
      {orders.map((order) => {
        const progress = order.progressPercent || 0;
        const canEdit = canPerformOrderAction(order, 'EDIT_DRAFT');
        const canConfirm = canPerformOrderAction(order, 'CONFIRM');
        const canStartProcessing = canPerformOrderAction(order, 'START_PROCESSING');
        const canFulfill = canPerformOrderAction(order, 'RECORD_FULFILLMENT');
        const canCloseRemaining = canPerformOrderAction(order, 'CLOSE_REMAINING');
        const canCancel = canPerformOrderAction(order, 'CANCEL');
        const canDelete = canPerformOrderAction(order, 'DELETE_DRAFT');

        return (
          <div
            key={order.id}
            className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/app/sales/orders/${order.id}`}
                    className="font-mono font-bold text-sm text-blue-600 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  {order.sourceType === 'QUOTE_CONVERTED' && (
                    <span className="text-[9px] font-bold px-1 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded-[2px]">
                      QUOTE
                    </span>
                  )}
                </div>
                <div className="font-semibold text-xs text-slate-900 line-clamp-1 mt-0.5">
                  {order.account?.name || 'Unknown Account'}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {renderOrderStatusBadge(order.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-[3px] text-slate-500"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-[3px]">
                    <DropdownMenuItem asChild className="text-xs gap-2">
                      <Link to={`/app/sales/orders/${order.id}`}>
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Details</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="text-xs gap-2">
                      <Link to={`/app/sales/orders/${order.id}/print`} target="_blank">
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print</span>
                      </Link>
                    </DropdownMenuItem>

                    {canEdit && (
                      <DropdownMenuItem asChild className="text-xs gap-2">
                        <Link to={`/app/sales/orders/${order.id}/edit`}>
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Edit Draft</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {canConfirm && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('CONFIRM', order)}
                        className="text-xs gap-2 text-blue-700 font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Confirm Order</span>
                      </DropdownMenuItem>
                    )}

                    {canStartProcessing && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('START_PROCESSING', order)}
                        className="text-xs gap-2 text-purple-700 font-semibold"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-purple-600" />
                        <span>Start Processing</span>
                      </DropdownMenuItem>
                    )}

                    {canFulfill && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('RECORD_FULFILLMENT', order)}
                        className="text-xs gap-2 text-emerald-700 font-semibold"
                      >
                        <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Record Fulfillment</span>
                      </DropdownMenuItem>
                    )}

                    {canCloseRemaining && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('CLOSE_REMAINING', order)}
                        className="text-xs gap-2 text-amber-700"
                      >
                        <span>Close Remainder</span>
                      </DropdownMenuItem>
                    )}

                    {canCancel && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('CANCEL', order)}
                        className="text-xs gap-2 text-rose-600"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Cancel Order</span>
                      </DropdownMenuItem>
                    )}

                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('DELETE_DRAFT', order)}
                        className="text-xs gap-2 text-rose-600 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Delete Draft</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {order.status !== 'DRAFT' && order.status !== 'CANCELLED' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Fulfillment Progress</span>
                  <span className="font-mono font-bold text-slate-700">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5 bg-slate-100" />
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <div className="text-slate-500">
                <span className="text-[10px]">Date:</span> <span className="font-mono">{order.orderDate}</span>
              </div>
              <div className="font-mono font-bold text-sm text-slate-900">
                {formatCurrency(order.amounts.grandTotal, order.amounts.currencyCode)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
