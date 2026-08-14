import { apiFetch } from './apiClient';

export type QuoteStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface QuoteAmounts {
  currencyCode: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal?: number;
}

export interface QuoteSummaryResponse {
  id: string;
  quoteNumber: string;
  revisionNumber: number;
  accountId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  ownerUserId?: string | null;
  status: QuoteStatus;
  amounts: QuoteAmounts;
  issueDate?: string | null;
  validUntil?: string | null;
  updatedAt: string;
  version: number;
}

export interface QuoteResponse {
  id: string;
  quoteNumber: string;
  revisionNumber: number;
  previousQuoteId?: string | null;
  accountId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  priceBookId?: string | null;
  ownerUserId?: string | null;
  status: QuoteStatus;
  amounts: QuoteAmounts;
  exchangeRateToTenantCurrency?: number | null;
  issueDate: string;
  validUntil?: string | null;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  customerReference?: string | null;
  notes?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
}

export interface CreateQuoteRequest {
  quoteNumber: string;
  accountId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  priceBookId?: string | null;
  ownerUserId?: string | null;
  amounts: QuoteAmounts;
  issueDate?: string | null;
  validUntil?: string | null;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  customerReference?: string | null;
  notes?: string | null;
}

export interface UpdateQuoteRequest {
  version: number;
  accountId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  priceBookId?: string | null;
  ownerUserId?: string | null;
  status?: QuoteStatus;
  amounts: QuoteAmounts;
  issueDate?: string | null;
  validUntil?: string | null;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  customerReference?: string | null;
  notes?: string | null;
}

export interface QuoteSearchRequest {
  q?: string;
  accountId?: string;
  opportunityId?: string;
  status?: QuoteStatus;
  ownerUserId?: string;
  page?: number;
  size?: number;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const quoteApi = {
  async list(params: QuoteSearchRequest = {}): Promise<PageResult<QuoteSummaryResponse>> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.accountId) query.append('accountId', params.accountId);
    if (params.opportunityId) query.append('opportunityId', params.opportunityId);
    if (params.status) query.append('status', params.status);
    if (params.ownerUserId) query.append('ownerUserId', params.ownerUserId);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/quotes${queryString ? `?${queryString}` : ''}`;
    return apiFetch<PageResult<QuoteSummaryResponse>>(endpoint, { method: 'GET' });
  },

  async getById(id: string): Promise<QuoteResponse> {
    return apiFetch<QuoteResponse>(`/quotes/${id}`, { method: 'GET' });
  },

  async create(request: CreateQuoteRequest): Promise<QuoteResponse> {
    return apiFetch<QuoteResponse>('/quotes', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async update(id: string, request: UpdateQuoteRequest): Promise<QuoteResponse> {
    return apiFetch<QuoteResponse>(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async approve(id: string, version: number): Promise<QuoteResponse> {
    return apiFetch<QuoteResponse>(`/quotes/${id}/approve`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  async delete(id: string, version: number): Promise<void> {
    return apiFetch<void>(`/quotes/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
