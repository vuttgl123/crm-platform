import type { OrderResponse, OrderSummaryResponse, OrderAction } from '@/services/api/orderApi';

export function canPerformOrderAction(
  order: OrderResponse | OrderSummaryResponse | null | undefined,
  action: OrderAction
): boolean {
  if (!order || !order.availableActions) return false;
  return order.availableActions.includes(action);
}

export function isOrderEditable(order: OrderResponse | null | undefined): boolean {
  return Boolean(order && order.status === 'DRAFT');
}

export function isOrderProcessingOrPartiallyFulfilled(order: OrderResponse | null | undefined): boolean {
  return Boolean(order && (order.status === 'PROCESSING' || order.status === 'PARTIALLY_FULFILLED'));
}
