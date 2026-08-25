import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/services/api/orderApi';

export function useOrder(orderId?: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => {
      if (!orderId) throw new Error('orderId is required');
      return orderApi.get(orderId);
    },
    enabled: Boolean(orderId),
  });
}

export function useOrderHistory(orderId?: string) {
  return useQuery({
    queryKey: ['order', orderId, 'history'],
    queryFn: () => {
      if (!orderId) throw new Error('orderId is required');
      return orderApi.getStatusHistory(orderId);
    },
    enabled: Boolean(orderId),
  });
}

export function useOrderFulfillments(orderId?: string) {
  return useQuery({
    queryKey: ['order', orderId, 'fulfillments'],
    queryFn: () => {
      if (!orderId) throw new Error('orderId is required');
      return orderApi.getFulfillments(orderId);
    },
    enabled: Boolean(orderId),
  });
}
