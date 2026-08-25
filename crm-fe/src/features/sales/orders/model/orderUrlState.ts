import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import type { OrderStatus, OrderSearchParams } from '@/services/api/orderApi';

export type OrderTabKey = 'all' | 'needs_processing' | 'in_fulfillment' | 'fulfilled' | 'closed_cancelled';

export interface OrderUrlFilters {
  tab: OrderTabKey;
  q: string;
  status?: OrderStatus;
  accountId?: string;
  contactId?: string;
  opportunityId?: string;
  quoteId?: string;
  currencyCode?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  size: number;
}

export function useOrderUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<OrderUrlFilters>(() => {
    const tab = (searchParams.get('tab') as OrderTabKey) || 'all';
    const q = searchParams.get('q') || '';
    const status = (searchParams.get('status') as OrderStatus) || undefined;
    const accountId = searchParams.get('accountId') || undefined;
    const contactId = searchParams.get('contactId') || undefined;
    const opportunityId = searchParams.get('opportunityId') || undefined;
    const quoteId = searchParams.get('quoteId') || undefined;
    const currencyCode = searchParams.get('currencyCode') || undefined;
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = parseInt(searchParams.get('size') || '20', 10);

    return {
      tab,
      q,
      status,
      accountId,
      contactId,
      opportunityId,
      quoteId,
      currencyCode,
      fromDate,
      toDate,
      page: isNaN(page) ? 0 : page,
      size: isNaN(size) ? 20 : size,
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (newFilters: Partial<OrderUrlFilters>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(newFilters).forEach(([key, val]) => {
          if (val === undefined || val === null || val === '') {
            next.delete(key);
          } else {
            next.set(key, String(val));
          }
        });
        return next;
      });
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams({ tab: 'all', page: '0', size: '20' }));
  }, [setSearchParams]);

  const toApiParams = useCallback((): OrderSearchParams => {
    const params: OrderSearchParams = {
      q: filters.q || undefined,
      accountId: filters.accountId,
      contactId: filters.contactId,
      opportunityId: filters.opportunityId,
      quoteId: filters.quoteId,
      status: filters.status,
      currencyCode: filters.currencyCode,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page: filters.page,
      size: filters.size,
    };

    if (filters.tab === 'needs_processing') {
      params.statuses = ['CONFIRMED'];
    } else if (filters.tab === 'in_fulfillment') {
      params.statuses = ['PROCESSING', 'PARTIALLY_FULFILLED'];
    } else if (filters.tab === 'fulfilled') {
      params.statuses = ['FULFILLED'];
    } else if (filters.tab === 'closed_cancelled') {
      params.statuses = ['CLOSED_PARTIAL', 'CANCELLED'];
    }

    return params;
  }, [filters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    toApiParams,
  };
}
