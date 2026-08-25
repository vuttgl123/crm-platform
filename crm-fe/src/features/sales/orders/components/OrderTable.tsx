import React from 'react';
import { Link } from 'react-router-dom';
import {
  MoreHorizontal,
  FileText,
  PlayCircle,
  CheckCircle2,
  PackageCheck,
  Printer,
  StopCircle,
  XCircle,
  Trash2,
  Edit3,
} from 'lucide-react';
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

interface OrderTableProps {
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

export const OrderTable: React.FC<OrderTableProps> = ({ orders, onTriggerAction }) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-[4px] shadow-2xs overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3">Order Number</th>
              <th className="p-3">Account & Context</th>
              <th className="p-3">Status & Progress</th>
              <th className="p-3">Schedule</th>
              <th className="p-3 text-right">Grand Total</th>
              <th className="p-3">Owner</th>
              <th className="p-3 text-right w-12">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
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
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* 1. Order Number */}
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/app/sales/orders/${order.id}`}
                        className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      {order.sourceType === 'QUOTE_CONVERTED' && (
                        <span className="text-[9px] font-bold px-1 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded-[2px]">
                          QUOTE
                        </span>
                      )}
                    </div>
                    {order.quote && (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span>From:</span>
                        <Link
                          to={`/app/sales/quotes/${order.quote.id}`}
                          className="font-mono text-slate-700 hover:underline"
                        >
                          {order.quote.name}
                        </Link>
                      </div>
                    )}
                  </td>

                  {/* 2. Account & Opportunity */}
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 line-clamp-1">
                      {order.account?.name || 'Unknown Account'}
                    </div>
                    {order.opportunity && (
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        Opp: {order.opportunity.name}
                      </div>
                    )}
                  </td>

                  {/* 3. Status & Progress */}
                  <td className="p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      {renderOrderStatusBadge(order.status)}
                    </div>
                    {order.status !== 'DRAFT' && order.status !== 'CANCELLED' && (
                      <div className="space-y-0.5 max-w-[140px]">
                        <Progress value={progress} className="h-1.5 bg-slate-100" />
                        <div className="text-[10px] text-slate-400 font-mono">
                          {progress}% fulfilled ({order.lineCount} items)
                        </div>
                      </div>
                    )}
                  </td>

                  {/* 4. Dates */}
                  <td className="p-3 text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400">Date:</span>{' '}
                      <span className="font-mono">{order.orderDate}</span>
                    </div>
                    {order.requestedDeliveryDate && (
                      <div className="text-[11px] text-slate-500">
                        <span className="text-[10px] text-slate-400">Due:</span>{' '}
                        <span className="font-mono">{order.requestedDeliveryDate}</span>
                      </div>
                    )}
                  </td>

                  {/* 5. Total */}
                  <td className="p-3 text-right">
                    <div className="font-mono font-bold text-slate-900">
                      {formatCurrency(order.amounts.grandTotal, order.amounts.currencyCode)}
                    </div>
                    {parseFloat(String(order.amounts.discountTotal || 0)) > 0 && (
                      <div className="text-[10px] text-emerald-600 font-mono">
                        Save {formatCurrency(order.amounts.discountTotal, order.amounts.currencyCode)}
                      </div>
                    )}
                  </td>

                  {/* 6. Owner */}
                  <td className="p-3 text-slate-600">
                    <div className="font-medium text-slate-800">
                      {order.owner?.name || 'Unassigned'}
                    </div>
                    {order.owner?.type && (
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {order.owner.type}
                      </div>
                    )}
                  </td>

                  {/* 7. Actions */}
                  <td className="p-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-[3px] text-slate-500 hover:text-slate-900"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-[3px]">
                        <DropdownMenuItem asChild className="text-xs gap-2">
                          <Link to={`/app/sales/orders/${order.id}`}>
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Order</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="text-xs gap-2">
                          <Link to={`/app/sales/orders/${order.id}/print`} target="_blank">
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            <span>Print / Save PDF</span>
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
                            <StopCircle className="w-3.5 h-3.5 text-amber-600" />
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
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onTriggerAction('DELETE_DRAFT', order)}
                              className="text-xs gap-2 text-rose-600 font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete Draft</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
