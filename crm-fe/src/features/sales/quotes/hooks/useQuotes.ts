import { useQuery } from '@tanstack/react-query';
import { quoteApi } from '@/services/api/quoteApi';
import type { QuoteFilters, QuoteSearchParams } from '../model/quoteTypes';

export function useQuotes(filters: QuoteFilters) {
  const searchParams: QuoteSearchParams = {
    q: filters.q || undefined,
    status: filters.statuses.length > 0 ? filters.statuses : undefined,
    accountId: filters.accountId || undefined,
    opportunityId: filters.opportunityId || undefined,
    ownerType: filters.ownerType || undefined,
    ownerId: filters.ownerId || undefined,
    currencyCode: filters.currencyCode || undefined,
    validity: filters.validity !== 'ALL' ? filters.validity : undefined,
    issueFrom: filters.issueFrom || undefined,
    issueTo: filters.issueTo || undefined,
    validFrom: filters.validFrom || undefined,
    validTo: filters.validTo || undefined,
    latestOnly: filters.latestOnly,
    sort: filters.sort,
    direction: filters.direction,
    page: filters.page,
    size: filters.size,
  };

  return useQuery({
    queryKey: ['quotes', 'list', searchParams],
    queryFn: ({ signal }) => quoteApi.searchQuotes(searchParams, signal),
    staleTime: 10_000,
  });
}
