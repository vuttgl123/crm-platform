import type { QuoteFilters, QuoteOperationalView, QuoteStatus, QuoteValidityFilter } from './quoteTypes';

export const DEFAULT_QUOTE_FILTERS: QuoteFilters = {
  q: '',
  statuses: [],
  accountId: null,
  opportunityId: null,
  ownerType: null,
  ownerId: null,
  currencyCode: null,
  validity: 'ALL',
  issueFrom: null,
  issueTo: null,
  validFrom: null,
  validTo: null,
  latestOnly: true,
  sort: 'updatedAt',
  direction: 'desc',
  page: 0,
  size: 20,
};

const VALID_STATUSES: QuoteStatus[] = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'SENT',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
  'SUPERSEDED',
];

export function parseQuoteFilters(searchParams: URLSearchParams): QuoteFilters {
  const q = searchParams.get('q') || '';

  const rawStatuses = searchParams.getAll('status');
  const statuses: QuoteStatus[] = [];
  rawStatuses.forEach((st) => {
    const upper = st.toUpperCase() as QuoteStatus;
    if (VALID_STATUSES.includes(upper) && !statuses.includes(upper)) {
      statuses.push(upper);
    }
  });

  const accountId = searchParams.get('accountId') || null;
  const opportunityId = searchParams.get('opportunityId') || null;

  const rawOwnerType = searchParams.get('ownerType')?.toUpperCase();
  const ownerType = rawOwnerType === 'USER' || rawOwnerType === 'TEAM' ? (rawOwnerType as 'USER' | 'TEAM') : null;
  const ownerId = searchParams.get('ownerId') || null;

  const currencyCode = searchParams.get('currencyCode') || null;

  const rawValidity = searchParams.get('validity')?.toUpperCase();
  const validity: QuoteValidityFilter =
    rawValidity === 'ACTIVE' || rawValidity === 'EXPIRING_SOON' || rawValidity === 'EXPIRED'
      ? (rawValidity as QuoteValidityFilter)
      : 'ALL';

  const issueFrom = searchParams.get('issueFrom') || null;
  const issueTo = searchParams.get('issueTo') || null;
  const validFrom = searchParams.get('validFrom') || null;
  const validTo = searchParams.get('validTo') || null;

  const latestOnlyParam = searchParams.get('latestOnly');
  const latestOnly = latestOnlyParam !== null ? latestOnlyParam === 'true' : true;

  const sort = searchParams.get('sort') || 'updatedAt';
  const rawDirection = searchParams.get('direction')?.toLowerCase();
  const direction: 'asc' | 'desc' = rawDirection === 'asc' ? 'asc' : 'desc';

  const page = Math.max(0, parseInt(searchParams.get('page') || '0', 10) || 0);
  const size = Math.min(100, Math.max(1, parseInt(searchParams.get('size') || '20', 10) || 20));

  return {
    q,
    statuses,
    accountId,
    opportunityId,
    ownerType: ownerId ? ownerType : null,
    ownerId: ownerType ? ownerId : null,
    currencyCode,
    validity,
    issueFrom,
    issueTo,
    validFrom,
    validTo,
    latestOnly,
    sort,
    direction,
    page,
    size,
  };
}

export function serializeQuoteFilters(filters: Partial<QuoteFilters>): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.q && filters.q.trim()) {
    params.set('q', filters.q.trim());
  }

  if (filters.statuses && filters.statuses.length > 0) {
    // Sort statuses in canonical lifecycle order
    const ordered = [...filters.statuses].sort(
      (a, b) => VALID_STATUSES.indexOf(a) - VALID_STATUSES.indexOf(b)
    );
    ordered.forEach((s) => params.append('status', s));
  }

  if (filters.accountId) {
    params.set('accountId', filters.accountId);
  }

  if (filters.opportunityId) {
    params.set('opportunityId', filters.opportunityId);
  }

  if (filters.ownerType && filters.ownerId) {
    params.set('ownerType', filters.ownerType);
    params.set('ownerId', filters.ownerId);
  }

  if (filters.currencyCode) {
    params.set('currencyCode', filters.currencyCode.toUpperCase());
  }

  if (filters.validity && filters.validity !== 'ALL') {
    params.set('validity', filters.validity);
  }

  if (filters.issueFrom) {
    params.set('issueFrom', filters.issueFrom);
  }
  if (filters.issueTo) {
    params.set('issueTo', filters.issueTo);
  }
  if (filters.validFrom) {
    params.set('validFrom', filters.validFrom);
  }
  if (filters.validTo) {
    params.set('validTo', filters.validTo);
  }

  if (filters.latestOnly === false) {
    params.set('latestOnly', 'false');
  }

  if (filters.sort && filters.sort !== DEFAULT_QUOTE_FILTERS.sort) {
    params.set('sort', filters.sort);
  }
  if (filters.direction && filters.direction !== DEFAULT_QUOTE_FILTERS.direction) {
    params.set('direction', filters.direction);
  }

  if (filters.page && filters.page > 0) {
    params.set('page', String(filters.page));
  }
  if (filters.size && filters.size !== DEFAULT_QUOTE_FILTERS.size) {
    params.set('size', String(filters.size));
  }

  return params;
}

export function mapOperationalViewToFilters(view: QuoteOperationalView): Partial<QuoteFilters> {
  switch (view) {
    case 'NEEDS_APPROVAL':
      return { statuses: ['PENDING_APPROVAL'], validity: 'ALL', page: 0 };
    case 'DRAFTS':
      return { statuses: ['DRAFT'], validity: 'ALL', page: 0 };
    case 'SENT':
      return { statuses: ['SENT'], validity: 'ALL', page: 0 };
    case 'ACCEPTED':
      return { statuses: ['ACCEPTED'], validity: 'ALL', page: 0 };
    case 'EXPIRING':
      return { statuses: ['SENT'], validity: 'EXPIRING_SOON', page: 0 };
    case 'ALL':
    default:
      return { statuses: [], validity: 'ALL', page: 0 };
  }
}
