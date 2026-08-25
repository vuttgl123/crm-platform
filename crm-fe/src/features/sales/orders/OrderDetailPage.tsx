import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderDetailHeader } from './components/OrderDetailHeader';
import { OrderLineFulfillmentTable } from './components/OrderLineFulfillmentTable';
import { OrderFulfillmentLedger } from './components/OrderFulfillmentLedger';
import { OrderTotalsRail } from './components/OrderTotalsRail';
import { OrderStatusHistory } from './components/OrderStatusHistory';
import {
  OrderActionDialogs,
  type OrderActionDialogState,
} from './components/OrderActionDialogs';
import { RecordFulfillmentDialog } from './components/RecordFulfillmentDialog';
import { VoidFulfillmentDialog } from './components/VoidFulfillmentDialog';
import { OrderDetailSkeleton, OrderErrorState } from './components/OrderPageStates';
import { useOrder, useOrderHistory, useOrderFulfillments } from './hooks/useOrder';
import { useOrderMutations } from './hooks/useOrderMutations';
import { MapPin, FileText } from 'lucide-react';
import type {
  OrderAction,
  OrderFulfillmentResponse,
  RecordOrderFulfillmentRequest,
} from '@/services/api/orderApi';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { data: history = [] } = useOrderHistory(id);
  const { data: fulfillments = [] } = useOrderFulfillments(id);
  const mutations = useOrderMutations();

  // Action Dialog State
  const [actionDialog, setActionDialog] = useState<OrderActionDialogState>({
    isOpen: false,
    action: null,
    order: null,
  });

  // Fulfillment Dialog State
  const [isFulfillmentOpen, setIsFulfillmentOpen] = useState(false);

  // Void Dialog State
  const [voidTarget, setVoidTarget] = useState<OrderFulfillmentResponse | null>(null);
  const [isVoidOpen, setIsVoidOpen] = useState(false);

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (isError || !order) {
    return <OrderErrorState onRetry={() => refetch()} />;
  }

  const handleTriggerAction = (action: OrderAction) => {
    if (action === 'RECORD_FULFILLMENT') {
      setIsFulfillmentOpen(true);
      return;
    }
    if (action === 'EDIT_DRAFT') {
      navigate(`/app/sales/orders/${order.id}/edit`);
      return;
    }

    setActionDialog({
      isOpen: true,
      action,
      order,
    });
  };

  const handleExecuteAction = async (action: OrderAction, reason?: string) => {
    switch (action) {
      case 'CONFIRM':
        await mutations.confirm.mutateAsync({ id: order.id, version: order.version });
        break;
      case 'START_PROCESSING':
        await mutations.startProcessing.mutateAsync({ id: order.id, version: order.version });
        break;
      case 'CLOSE_REMAINING':
        await mutations.closeRemaining.mutateAsync({
          id: order.id,
          reason: reason || 'Closed remainder',
          version: order.version,
        });
        break;
      case 'CANCEL':
        await mutations.cancel.mutateAsync({
          id: order.id,
          reason: reason || 'Cancelled by user',
          version: order.version,
        });
        break;
      case 'DELETE_DRAFT':
        await mutations.deleteDraft.mutateAsync({ id: order.id, version: order.version });
        navigate('/app/sales/orders');
        break;
      default:
        break;
    }
  };

  const handleRecordFulfillment = async (data: RecordOrderFulfillmentRequest) => {
    await mutations.recordFulfillment.mutateAsync({
      id: order.id,
      data,
      version: order.version,
    });
    setIsFulfillmentOpen(false);
  };

  const handleOpenVoid = (event: OrderFulfillmentResponse) => {
    setVoidTarget(event);
    setIsVoidOpen(true);
  };

  const handleConfirmVoid = async (reason: string) => {
    if (!voidTarget) return;
    await mutations.voidFulfillment.mutateAsync({
      id: order.id,
      eventId: voidTarget.id,
      reason,
      version: order.version,
    });
    setIsVoidOpen(false);
    setVoidTarget(null);
  };

  const canVoidEvents = order.status === 'PROCESSING' || order.status === 'PARTIALLY_FULFILLED' || order.status === 'FULFILLED';

  return (
    <div className="space-y-4 pb-16 font-sans w-full">
      {/* 1. Header with Status, CTAs, and Context */}
      <OrderDetailHeader
        order={order}
        onTriggerAction={handleTriggerAction}
        isLoading={
          mutations.confirm.isPending ||
          mutations.startProcessing.isPending ||
          mutations.closeRemaining.isPending ||
          mutations.cancel.isPending ||
          mutations.deleteDraft.isPending
        }
      />

      {/* 2. Main Grid: Details Left (2 cols), Totals & Status Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left Column: Items, Ledger, Snapshots, Terms */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items & Fulfillment Table */}
          <OrderLineFulfillmentTable
            lines={order.lines}
            currencyCode={order.amounts.currencyCode}
          />

          {/* Fulfillment History Ledger */}
          <OrderFulfillmentLedger
            fulfillments={fulfillments}
            onVoidClick={handleOpenVoid}
            canVoid={canVoidEvents}
          />

          {/* Address Snapshots (Read-only on detail) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans w-full">
            {/* Billing */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-2 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 uppercase tracking-wider">
                  Billing Address Snapshot
                </h3>
              </div>
              <div className="font-semibold text-slate-900">
                {order.billingAddressSnapshot?.legalName || 'N/A'}
              </div>
              <div className="text-slate-600">
                {order.billingAddressSnapshot?.addressLine1 && (
                  <div>{order.billingAddressSnapshot.addressLine1}</div>
                )}
                {order.billingAddressSnapshot?.locality && (
                  <div>
                    {order.billingAddressSnapshot.locality},{' '}
                    {order.billingAddressSnapshot.region}{' '}
                    {order.billingAddressSnapshot.postalCode}
                  </div>
                )}
              </div>
              {order.billingAddressSnapshot?.contactName && (
                <div className="text-slate-500 pt-1 border-t border-slate-50">
                  Contact: {order.billingAddressSnapshot.contactName}{' '}
                  {order.billingAddressSnapshot.contactPhone && (
                    <span>({order.billingAddressSnapshot.contactPhone})</span>
                  )}
                </div>
              )}
            </div>

            {/* Shipping */}
            <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-2 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 uppercase tracking-wider">
                  Shipping / Delivery Snapshot
                </h3>
              </div>
              <div className="font-semibold text-slate-900">
                {order.shippingAddressSnapshot?.legalName || 'N/A'}
              </div>
              <div className="text-slate-600">
                {order.shippingAddressSnapshot?.addressLine1 && (
                  <div>{order.shippingAddressSnapshot.addressLine1}</div>
                )}
                {order.shippingAddressSnapshot?.locality && (
                  <div>
                    {order.shippingAddressSnapshot.locality},{' '}
                    {order.shippingAddressSnapshot.region}{' '}
                    {order.shippingAddressSnapshot.postalCode}
                  </div>
                )}
              </div>
              {order.shippingAddressSnapshot?.contactName && (
                <div className="text-slate-500 pt-1 border-t border-slate-50">
                  Contact: {order.shippingAddressSnapshot.contactName}{' '}
                  {order.shippingAddressSnapshot.contactPhone && (
                    <span>({order.shippingAddressSnapshot.contactPhone})</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Terms & Notes */}
          {(order.paymentTerms || order.deliveryTerms || order.notes || order.customerReference) && (
            <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3 font-sans w-full text-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 uppercase tracking-wider">
                  Commercial Terms & Instructions
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.customerReference && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Customer PO Ref</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {order.customerReference}
                    </span>
                  </div>
                )}
                {order.paymentTerms && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Payment Terms</span>
                    <span className="font-semibold text-slate-900">{order.paymentTerms}</span>
                  </div>
                )}
                {order.deliveryTerms && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Delivery Terms</span>
                    <span className="font-semibold text-slate-900">{order.deliveryTerms}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Delivery Instructions</span>
                    <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Totals Rail & Audit Trail */}
        <div className="space-y-4">
          <OrderTotalsRail amounts={order.amounts} isEditable={false} />

          <OrderStatusHistory history={history} />
        </div>
      </div>

      {/* Action Dialogs */}
      <OrderActionDialogs
        dialogState={actionDialog}
        onClose={() => setActionDialog({ isOpen: false, action: null, order: null })}
        onConfirmAction={handleExecuteAction}
        isLoading={
          mutations.confirm.isPending ||
          mutations.startProcessing.isPending ||
          mutations.closeRemaining.isPending ||
          mutations.cancel.isPending ||
          mutations.deleteDraft.isPending
        }
      />

      {/* Record Fulfillment Dialog */}
      <RecordFulfillmentDialog
        isOpen={isFulfillmentOpen}
        order={order}
        onClose={() => setIsFulfillmentOpen(false)}
        onRecord={handleRecordFulfillment}
        isLoading={mutations.recordFulfillment.isPending}
      />

      {/* Void Fulfillment Dialog */}
      <VoidFulfillmentDialog
        isOpen={isVoidOpen}
        event={voidTarget}
        onClose={() => {
          setIsVoidOpen(false);
          setVoidTarget(null);
        }}
        onConfirmVoid={handleConfirmVoid}
        isLoading={mutations.voidFulfillment.isPending}
      />
    </div>
  );
};
