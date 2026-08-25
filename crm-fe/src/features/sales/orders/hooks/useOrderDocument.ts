import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/services/api/orderApi';

export function useOrderDocument(orderId?: string) {
  return useQuery({
    queryKey: ['order', orderId, 'document'],
    queryFn: () => {
      if (!orderId) throw new Error('orderId is required');
      return orderApi.getDocument(orderId);
    },
    enabled: Boolean(orderId),
  });
}
