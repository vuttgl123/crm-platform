import { useQuery } from '@tanstack/react-query';
import { quoteApi } from '@/services/api/quoteApi';

export function useQuote(id: string | undefined) {
  return useQuery({
    queryKey: ['quotes', 'detail', id],
    queryFn: ({ signal }) => (id ? quoteApi.getQuote(id, signal) : Promise.reject(new Error('No Quote ID'))),
    enabled: Boolean(id),
    staleTime: 10_000,
  });
}

export function useQuoteRevisions(id: string | undefined) {
  return useQuery({
    queryKey: ['quotes', 'revisions', id],
    queryFn: ({ signal }) => (id ? quoteApi.getQuoteRevisions(id, signal) : Promise.reject(new Error('No Quote ID'))),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}

export function useQuoteHistory(id: string | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: ['quotes', 'history', id, page, size],
    queryFn: ({ signal }) => (id ? quoteApi.getQuoteHistory(id, page, size, signal) : Promise.reject(new Error('No Quote ID'))),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}
