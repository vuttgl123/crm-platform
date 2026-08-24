import { useQuery } from '@tanstack/react-query';
import { quoteApi } from '@/services/api/quoteApi';
import type { QuoteFilters, QuoteSearchParams } from '../model/quoteTypes';

export function useQuoteSummary(filters: QuoteFilters) {
  // Summary accepts same filters without page, size, and sort
  const summaryParams: QuoteSearchParams = {
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
  };

  return useQuery({
    queryKey: ['quotes', 'summary', summaryParams],
    queryFn: ({ signal }) => quoteApi.getQuotePulse(summaryParams, signal),
    staleTime: 15_000,
  });
}
