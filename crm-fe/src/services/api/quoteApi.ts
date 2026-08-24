import { apiFetch } from './apiClient';
import type { PageResult } from './accountApi';
export type { PageResult };

export type QuoteStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'SUPERSEDED';

export type QuoteAction =
  | 'EDIT_DRAFT'
  | 'DELETE_DRAFT'
  | 'SUBMIT'
  | 'APPROVE'
  | 'REQUEST_CHANGES'
  | 'MARK_SENT'
  | 'ACCEPT'
  | 'REJECT'
  | 'CANCEL'
  | 'REVISE'
  | 'PRINT'
  | 'CREATE_ORDER';

export type QuotePricingMode = 'LINE_ITEM' | 'LEGACY_AMOUNT_ONLY';

export interface QuoteReference {
  id: string;
  label: string;
  routeAvailable: boolean;
}

export interface QuoteOwnerReference {
  type: 'USER' | 'TEAM';
  id: string;
  label: string;
}

export interface QuoteAmountsResponse {
  currencyCode: string;
  subtotal: string | number;
  discountTotal: string | number;
  taxTotal: string | number;
  shippingTotal: string | number;
  grandTotal: string | number;
}

export interface QuoteCustomerSnapshot {
  legalName: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  locality?: string | null;
  region?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface QuoteLineResponse {
  id: string;
  position: number;
  productId: string;
  priceBookItemId: string;
  sku: string;
  productName: string;
  unit?: string | null;
  description?: string | null;
  quantity: string | number;
  listUnitPrice: string | number;
  salesUnitPrice: string | number;
  discountPercent: string | number;
  taxPercent: string | number;
  lineSubtotal: string | number;
  lineDiscount: string | number;
  lineTax: string | number;
  lineTotal: string | number;
}

export interface QuoteSummaryItem {
  id: string;
  quoteNumber: string;
  revisionNumber: number;
  name: string;
  latestRevision: boolean;
  legacyAmountOnly: boolean;
  effectiveStatus: QuoteStatus;
  account: QuoteReference;
  opportunity?: QuoteReference | null;
  owner?: QuoteOwnerReference | null;
  amounts: QuoteAmountsResponse;
  lineCount: number;
  issueDate: string;
  validUntil?: string | null;
  updatedAt: string;
  version: number;
  availableActions: QuoteAction[];
}

export interface QuoteDetailResponse {
  id: string;
  quoteNumber: string;
  revisionNumber: number;
  previousQuoteId?: string | null;
  name: string;
  latestRevision: boolean;
  legacyAmountOnly: boolean;
  effectiveStatus: QuoteStatus;
  storedStatus: QuoteStatus;
  pricingMode: QuotePricingMode;
  account: QuoteReference;
  contact?: QuoteReference | null;
  opportunity?: QuoteReference | null;
  priceBook?: QuoteReference | null;
  owner?: QuoteOwnerReference | null;
  amounts: QuoteAmountsResponse;
  customerSnapshot: QuoteCustomerSnapshot;
  lines: QuoteLineResponse[];
  exchangeRateToTenantCurrency?: number | null;
  issueDate: string;
  validUntil?: string | null;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  customerReference?: string | null;
  notes?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  sentAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  relatedOrderId?: string | null;
  availableActions: QuoteAction[];
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
}

export interface QuoteDocumentResponse {
  quoteId: string;
  quoteNumber: string;
  revisionNumber: number;
  name: string;
  effectiveStatus: QuoteStatus;
  storedStatus: QuoteStatus;
  issueDate: string;
  validUntil?: string | null;
  customerSnapshot: QuoteCustomerSnapshot;
  lines: QuoteLineResponse[];
  amounts: QuoteAmountsResponse;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  customerReference?: string | null;
}

export interface QuotePulseCurrencyGroup {
  currencyCode: string;
  draftCount: number;
  pendingApprovalCount: number;
  sentAmount: string | number;
  sentCount: number;
  acceptedAmount: string | number;
  acceptedCount: number;
  expiringSoonAmount: string | number;
  expiringSoonCount: number;
}

export interface QuotePulseResponse {
  revisionScope: 'LATEST_ONLY';
  asOf: string;
  tenantTimezone: string;
  currencyGroups: QuotePulseCurrencyGroup[];
}

export interface QuoteRevisionItem {
  id: string;
  quoteNumber: string;
  revisionNumber: number;
  status: QuoteStatus;
  effectiveStatus: QuoteStatus;
  grandTotal: string | number;
  currencyCode: string;
  createdAt: string;
  createdBy?: string | null;
  isCurrent: boolean;
}

export interface QuoteStatusHistoryItem {
  id: string;
  quoteId: string;
  quoteRevisionNumber: number;
  action: string;
  previousStoredStatus?: QuoteStatus | null;
  newStoredStatus: QuoteStatus;
  actorId?: string | null;
  reason?: string | null;
  quoteVersionBefore: number;
  quoteVersionAfter: number;
  occurredAt: string;
}

export interface QuoteSearchParams {
  q?: string;
  status?: string | string[];
  accountId?: string;
  opportunityId?: string;
  ownerType?: 'USER' | 'TEAM';
  ownerId?: string;
  currencyCode?: string;
  validity?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  issueFrom?: string;
  issueTo?: string;
  validFrom?: string;
  validTo?: string;
  latestOnly?: boolean;
  sort?: string;
  direction?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface CreateQuotePayload {
  name: string;
  accountId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  priceBookId: string;
  owner?: { type: string; id: string } | null;
  issueDate: string;
  validUntil?: string | null;
}

export interface QuoteLineInputPayload {
  id?: string | null;
  position: number;
  productId: string;
  priceBookItemId: string;
  quantity: number | string;
  salesUnitPrice: number | string;
  discountPercent?: number | string;
  taxPercent?: number | string;
  description?: string | null;
}

export interface SaveQuoteDraftPayload {
  name: string;
  accountId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  priceBookId: string;
  owner?: { type: string; id: string } | null;
  issueDate: string;
  validUntil?: string | null;
  customerSnapshot: QuoteCustomerSnapshot;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  customerReference?: string | null;
  internalNotes?: string | null;
  shippingTotal?: number | string;
  lines: QuoteLineInputPayload[];
}

function buildSearchParams(params?: Record<string, unknown>): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (!params) return searchParams;

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          searchParams.append(key, String(item));
        }
      });
    } else {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}

export const quoteApi = {
  searchQuotes: async (params?: QuoteSearchParams, signal?: AbortSignal): Promise<PageResult<QuoteSummaryItem>> => {
    const sp = buildSearchParams(params as Record<string, unknown>);
    const queryString = sp.toString() ? `?${sp.toString()}` : '';
    return apiFetch<PageResult<QuoteSummaryItem>>(`/api/quotes${queryString}`, { signal });
  },

  getQuotePulse: async (params?: QuoteSearchParams, signal?: AbortSignal): Promise<QuotePulseResponse> => {
    const sp = buildSearchParams(params as Record<string, unknown>);
    const queryString = sp.toString() ? `?${sp.toString()}` : '';
    return apiFetch<QuotePulseResponse>(`/api/quotes/summary${queryString}`, { signal });
  },

  getQuote: async (id: string, signal?: AbortSignal): Promise<QuoteDetailResponse> => {
    return apiFetch<QuoteDetailResponse>(`/api/quotes/${id}`, { signal });
  },

  getQuoteDocument: async (id: string, signal?: AbortSignal): Promise<QuoteDocumentResponse> => {
    return apiFetch<QuoteDocumentResponse>(`/api/quotes/${id}/document`, { signal });
  },

  getQuoteHistory: async (id: string, page = 0, size = 20, signal?: AbortSignal): Promise<PageResult<QuoteStatusHistoryItem>> => {
    return apiFetch<PageResult<QuoteStatusHistoryItem>>(`/api/quotes/${id}/history?page=${page}&size=${size}`, { signal });
  },

  getQuoteRevisions: async (id: string, signal?: AbortSignal): Promise<QuoteRevisionItem[]> => {
    return apiFetch<QuoteRevisionItem[]>(`/api/quotes/${id}/revisions`, { signal });
  },

  createQuote: async (payload: CreateQuotePayload): Promise<QuoteDetailResponse> => {
    return apiFetch<QuoteDetailResponse>('/api/quotes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  saveQuoteDraft: async (id: string, version: number, payload: SaveQuoteDraftPayload): Promise<QuoteDetailResponse> => {
    return apiFetch<QuoteDetailResponse>(`/api/quotes/${id}`, {
      method: 'PUT',
      headers: {
        'If-Match': `"${version}"`,
      },
      body: JSON.stringify(payload),
    });
  },

  submitQuote: async (id: string, version: number): Promise<QuoteDetailResponse> => {
    return apiFetch<QuoteDetailResponse>(`/api/quotes/${id}/submit`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  approveQuote: async (id: string, version: number): Promise<QuoteDetailResponse> => {
    return apiFetch<QuoteDetailResponse>(`/api/quotes/${id}/approve`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  requestQuoteChanges: async (id: string, version: number, reason: string): Promise<QuoteDetailResponse> => {
    return apiFetch<QuoteDetailResponse>(`/api/quotes/${id}/request-changes`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
      body: JSON.stringify({ reason }),
    });
  },

  markQuoteSent: async (id: string, version: number): Promise<QuoteDetailResponse> => {
    return apiFetch<QuoteDetailResponse>(`/api/quotes/${id}/mark-sent`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  acceptQuote: async (id: string, version: number, customerReference?: string): Promise<QuoteDetailResponse> => {
    return apiFetch<QuoteDetailResponse>(`/api/quotes/${id}/accept`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
      body: customerReference ? JSON.stringify({ customerReference }) : undefined,
    });
  },

  rejectQuote: async (id: string, version: number, reason: string): Promise<QuoteDetailResponse> => {
    return apiFetch<QuoteDetailResponse>(`/api/quotes/${id}/reject`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
      body: JSON.stringify({ reason }),
    });
  },

  cancelQuote: async (id: string, version: number, reason: string): Promise<QuoteDetailResponse> => {
    return apiFetch<QuoteDetailResponse>(`/api/quotes/${id}/cancel`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
      body: JSON.stringify({ reason }),
    });
  },

  reviseQuote: async (id: string, version: number): Promise<QuoteDetailResponse> => {
    return apiFetch<QuoteDetailResponse>(`/api/quotes/${id}/revise`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  deleteQuoteDraft: async (id: string, version: number): Promise<void> => {
    return apiFetch<void>(`/api/quotes/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  convertQuoteToOrder: async (id: string, version: number): Promise<{ orderId: string }> => {
    return apiFetch<{ orderId: string }>(`/api/quotes/${id}/convert-to-order`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
