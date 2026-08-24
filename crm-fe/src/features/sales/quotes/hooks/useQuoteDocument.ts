import { useQuery } from '@tanstack/react-query';
import { quoteApi } from '@/services/api/quoteApi';

export function useQuoteDocument(id: string | undefined) {
  return useQuery({
    queryKey: ['quotes', 'document', id],
    queryFn: ({ signal }) => (id ? quoteApi.getQuoteDocument(id, signal) : Promise.reject(new Error('No Quote ID'))),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
