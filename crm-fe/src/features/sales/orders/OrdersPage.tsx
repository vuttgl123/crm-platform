import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardPagination } from '@/components/common/StandardPagination';
import { OrderPulse } from './components/OrderPulse';
import { OrderFilterBar } from './components/OrderFilterBar';
import { OrderTable } from './components/OrderTable';
import { OrderCompactList } from './components/OrderCompactList';
import {
  OrderActionDialogs,
  type OrderActionDialogState,
} from './components/OrderActionDialogs';
import { RecordFulfillmentDialog } from './components/RecordFulfillmentDialog';
import {
  OrderTableSkeleton,
  OrderEmptyState,
  OrderErrorState,
} from './components/OrderPageStates';
import { useOrders } from './hooks/useOrders';
import { useOrderSummary } from './hooks/useOrderSummary';
import { useOrderMutations } from './hooks/useOrderMutations';
import { useOrderUrlState } from './model/orderUrlState';
import { orderApi } from '@/services/api/orderApi';
import type {
  OrderSummaryResponse,
  OrderResponse,
  OrderAction,
  RecordOrderFulfillmentRequest,
} from '@/services/api/orderApi';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { filters, updateFilters, resetFilters, toApiParams } = useOrderUrlState();

  const { data: orderPage, isLoading, isError, refetch } = useOrders(toApiParams());
  const { data: pulseData, isLoading: isPulseLoading } = useOrderSummary();
  const mutations = useOrderMutations();

  // Action Dialog State
  const [actionDialog, setActionDialog] = useState<OrderActionDialogState>({
    isOpen: false,
    action: null,
    order: null,
  });

  // Fulfillment Dialog State
  const [fulfillmentTarget, setFulfillmentTarget] = useState<OrderResponse | null>(null);
  const [isFulfillmentOpen, setIsFulfillmentOpen] = useState(false);

  const handleTriggerAction = async (
    action: OrderAction,
    order: OrderSummaryResponse
  ) => {
    if (action === 'RECORD_FULFILLMENT') {
      try {
        const fullOrder = await orderApi.get(order.id);
        setFulfillmentTarget(fullOrder);
        setIsFulfillmentOpen(true);
      } catch (err) {
        // error handled by apiFetch
      }
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
    if (!actionDialog.order) return;
    const orderId = actionDialog.order.id;
    const version = actionDialog.order.version;

    switch (action) {
      case 'CONFIRM':
        await mutations.confirm.mutateAsync({ id: orderId, version });
        break;
      case 'START_PROCESSING':
        await mutations.startProcessing.mutateAsync({ id: orderId, version });
        break;
      case 'CLOSE_REMAINING':
        await mutations.closeRemaining.mutateAsync({
          id: orderId,
          reason: reason || 'Closed remainder',
          version,
        });
        break;
      case 'CANCEL':
        await mutations.cancel.mutateAsync({
          id: orderId,
          reason: reason || 'Cancelled by user',
          version,
        });
        break;
      case 'DELETE_DRAFT':
        await mutations.deleteDraft.mutateAsync({ id: orderId, version });
        break;
      default:
        break;
    }
  };

  const handleRecordFulfillment = async (data: RecordOrderFulfillmentRequest) => {
    if (!fulfillmentTarget) return;
    await mutations.recordFulfillment.mutateAsync({
      id: fulfillmentTarget.id,
      data,
      version: fulfillmentTarget.version,
    });
    setIsFulfillmentOpen(false);
    setFulfillmentTarget(null);
  };

  const totalElements = orderPage?.totalElements || 0;
  const totalPages = orderPage?.totalPages || 0;
  const orders = orderPage?.items || [];

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* 1. Header Standard */}
      <StandardPageHeader
        title="Sales Orders"
        subtitle="Manage commercial order commitments, execution workflows, and multi-line fulfillment ledgers."
        badgeLabel="orders"
        badgeCount={totalElements}
        actions={
          <Button
            size="sm"
            onClick={() => navigate('/app/sales/orders/new')}
            className="h-8 text-xs font-semibold rounded-[3px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Direct Order</span>
          </Button>
        }
      />

      {/* 2. Horizontal KPI Pulse */}
      <OrderPulse pulse={pulseData} isLoading={isPulseLoading} />

      {/* 3. Operational Filter & Tab Bar */}
      <OrderFilterBar
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
      />

      {/* 4. Table / List Content */}
      {isLoading ? (
        <OrderTableSkeleton />
      ) : isError ? (
        <OrderErrorState onRetry={() => refetch()} />
      ) : orders.length === 0 ? (
        <OrderEmptyState
          title="No Sales Orders Found"
          description={
            filters.q || filters.status || filters.tab !== 'all'
              ? 'No orders match your current filters. Try resetting the filters.'
              : 'You have not created any sales orders yet. Click below to draft your first direct order.'
          }
          actionLabel="Create Direct Order"
          onAction={() => navigate('/app/sales/orders/new')}
        />
      ) : (
        <div className="space-y-3">
          <div className="hidden md:block">
            <OrderTable orders={orders} onTriggerAction={handleTriggerAction} />
          </div>
          <div className="block md:hidden">
            <OrderCompactList orders={orders} onTriggerAction={handleTriggerAction} />
          </div>

          {/* 5. Pagination */}
          <StandardPagination
            currentPage={filters.page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={filters.size}
            onPageChange={(p) => updateFilters({ page: p })}
            onPageSizeChange={(s) => updateFilters({ size: s, page: 0 })}
          />
        </div>
      )}

      {/* 6. Lifecycle Action Dialogs */}
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

      {/* 7. Record Fulfillment Dialog */}
      <RecordFulfillmentDialog
        isOpen={isFulfillmentOpen}
        order={fulfillmentTarget}
        onClose={() => {
          setIsFulfillmentOpen(false);
          setFulfillmentTarget(null);
        }}
        onRecord={handleRecordFulfillment}
        isLoading={mutations.recordFulfillment.isPending}
      />
    </div>
  );
};
