import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Edit3,
  CheckCircle2,
  PlayCircle,
  PackageCheck,
  StopCircle,
  XCircle,
  Trash2,
  Building,
  User,
  Target,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { renderOrderStatusBadge } from '@/config/crmStatusConfig';
import { canPerformOrderAction } from '../model/orderCapabilities';
import type { OrderResponse, OrderAction } from '@/services/api/orderApi';

interface OrderDetailHeaderProps {
  order: OrderResponse;
  onTriggerAction: (action: OrderAction) => void;
  isLoading?: boolean;
}

export const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({
  order,
  onTriggerAction,
  isLoading,
}) => {
  const navigate = useNavigate();
  const progress = order.progressPercent || 0;

  const canEdit = canPerformOrderAction(order, 'EDIT_DRAFT');
  const canConfirm = canPerformOrderAction(order, 'CONFIRM');
  const canStartProcessing = canPerformOrderAction(order, 'START_PROCESSING');
  const canFulfill = canPerformOrderAction(order, 'RECORD_FULFILLMENT');
  const canCloseRemaining = canPerformOrderAction(order, 'CLOSE_REMAINING');
  const canCancel = canPerformOrderAction(order, 'CANCEL');
  const canDelete = canPerformOrderAction(order, 'DELETE_DRAFT');

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-4 font-sans w-full">
      {/* Top row: Back button, Order #, Status, and Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/sales/orders')}
            className="h-8 w-8 rounded-[3px] text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                {order.orderNumber}
              </h1>
              {renderOrderStatusBadge(order.status)}
              {order.sourceType === 'QUOTE_CONVERTED' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-[3px]">
                  QUOTE CONVERTED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Order Date: <span className="font-mono text-slate-700">{order.orderDate}</span>
              {order.requestedDeliveryDate && (
                <span> • Delivery Due: <strong className="font-mono text-slate-700">{order.requestedDeliveryDate}</strong></span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs font-semibold rounded-[3px] gap-1.5"
          >
            <Link to={`/app/sales/orders/${order.id}/print`} target="_blank">
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </Link>
          </Button>

          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs font-semibold rounded-[3px] text-blue-600 gap-1.5 border-blue-200 bg-blue-50/40 hover:bg-blue-50"
            >
              <Link to={`/app/sales/orders/${order.id}/edit`}>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Draft</span>
              </Link>
            </Button>
          )}

          {canConfirm && (
            <Button
              size="sm"
              disabled={isLoading}
              onClick={() => onTriggerAction('CONFIRM')}
              className="h-8 text-xs font-semibold rounded-[3px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Order</span>
            </Button>
          )}

          {canStartProcessing && (
            <Button
              size="sm"
              disabled={isLoading}
              onClick={() => onTriggerAction('START_PROCESSING')}
              className="h-8 text-xs font-semibold rounded-[3px] bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Start Processing</span>
            </Button>
          )}

          {canFulfill && (
            <Button
              size="sm"
              disabled={isLoading}
              onClick={() => onTriggerAction('RECORD_FULFILLMENT')}
              className="h-8 text-xs font-semibold rounded-[3px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Record Fulfillment</span>
            </Button>
          )}

          {canCloseRemaining && (
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => onTriggerAction('CLOSE_REMAINING')}
              className="h-8 text-xs font-semibold rounded-[3px] text-amber-700 border-amber-200 hover:bg-amber-50 gap-1.5"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Close Remainder</span>
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => onTriggerAction('CANCEL')}
              className="h-8 text-xs font-semibold rounded-[3px] text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </Button>
          )}

          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => onTriggerAction('DELETE_DRAFT')}
              className="h-8 text-xs font-semibold rounded-[3px] text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar (if processing / active) */}
      {order.status !== 'DRAFT' && order.status !== 'CANCELLED' && (
        <div className="bg-slate-50 border border-slate-100 rounded-[3px] p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Fulfillment Progress</span>
            <span className="font-mono font-bold text-slate-900">{progress}% Completed</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-200" />
        </div>
      )}

      {/* Context Chips */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
        {/* Account */}
        <div className="flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Account:</span>
          <Link
            to={`/app/crm/accounts/${order.account?.id}`}
            className="font-semibold text-blue-600 hover:underline"
          >
            {order.account?.name || 'Account'}
          </Link>
        </div>

        {/* Contact */}
        {order.contact && (
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Contact:</span>
            <span className="font-medium text-slate-800">{order.contact.name}</span>
          </div>
        )}

        {/* Opportunity */}
        {order.opportunity && (
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Opportunity:</span>
            <Link
              to={`/app/crm/opportunities/${order.opportunity.id}`}
              className="font-medium text-blue-600 hover:underline"
            >
              {order.opportunity.name}
            </Link>
          </div>
        )}

        {/* Quote */}
        {order.quote && (
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Quote:</span>
            <Link
              to={`/app/sales/quotes/${order.quote.id}`}
              className="font-mono font-semibold text-purple-600 hover:underline"
            >
              {order.quote.name}
            </Link>
          </div>
        )}

        {/* Owner */}
        {order.owner && (
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Owner:</span>
            <span className="font-medium text-slate-800">{order.owner.name}</span>
            <span className="text-[10px] text-slate-400 uppercase">({order.owner.type})</span>
          </div>
        )}
      </div>
    </div>
  );
};
