import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DEFAULT_QUOTE_FILTERS,
  mapOperationalViewToFilters,
  parseQuoteFilters,
  serializeQuoteFilters,
} from '../model/quoteUrlState';
import type { QuoteFilters, QuoteOperationalView } from '../model/quoteTypes';

export function useQuoteUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseQuoteFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (updater: Partial<QuoteFilters> | ((prev: QuoteFilters) => Partial<QuoteFilters>)) => {
      setSearchParams(
        (prev) => {
          const current = parseQuoteFilters(prev);
          const nextUpdates = typeof updater === 'function' ? updater(current) : updater;
          const merged = { ...current, ...nextUpdates };
          // If search/filter changed, reset page to 0 unless page is explicitly updated
          if ('page' in nextUpdates) {
            merged.page = nextUpdates.page ?? 0;
          } else if (
            'q' in nextUpdates ||
            'statuses' in nextUpdates ||
            'accountId' in nextUpdates ||
            'opportunityId' in nextUpdates ||
            'ownerId' in nextUpdates ||
            'currencyCode' in nextUpdates ||
            'validity' in nextUpdates ||
            'issueFrom' in nextUpdates ||
            'issueTo' in nextUpdates ||
            'validFrom' in nextUpdates ||
            'validTo' in nextUpdates ||
            'latestOnly' in nextUpdates
          ) {
            merged.page = 0;
          }
          return serializeQuoteFilters(merged);
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(serializeQuoteFilters(DEFAULT_QUOTE_FILTERS), { replace: true });
  }, [setSearchParams]);

  const setOperationalView = useCallback(
    (view: QuoteOperationalView) => {
      const viewFilters = mapOperationalViewToFilters(view);
      setFilters(viewFilters);
    },
    [setFilters]
  );

  const currentView = useMemo<QuoteOperationalView>(() => {
    if (filters.validity === 'EXPIRING_SOON') return 'EXPIRING';
    if (filters.statuses.length === 1) {
      if (filters.statuses[0] === 'PENDING_APPROVAL') return 'NEEDS_APPROVAL';
      if (filters.statuses[0] === 'DRAFT') return 'DRAFTS';
      if (filters.statuses[0] === 'SENT') return 'SENT';
      if (filters.statuses[0] === 'ACCEPTED') return 'ACCEPTED';
    }
    return 'ALL';
  }, [filters.statuses, filters.validity]);

  return {
    filters,
    setFilters,
    resetFilters,
    currentView,
    setOperationalView,
  };
}
