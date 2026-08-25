import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/services/api/orderApi';

export function useOrderSummary() {
  return useQuery({
    queryKey: ['orders', 'summary'],
    queryFn: () => orderApi.getPulse(),
    staleTime: 1000 * 60, // 1 minute
  });
}
