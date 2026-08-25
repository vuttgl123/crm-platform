import { useQuery } from '@tanstack/react-query';
import { orderApi, type OrderSearchParams } from '@/services/api/orderApi';

export function useOrders(params?: OrderSearchParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.search(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}
