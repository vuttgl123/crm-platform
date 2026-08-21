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

export interface QuoteItem {
  id: string;
  quoteNumber: string;
  revisionNumber?: number;
  title?: string;
  accountId: string;
  accountName?: string;
  contactName?: string;
  totalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  grandTotal?: number;
  status: QuoteStatus;
  validUntil?: string | null;
  assignedTo?: string;
  notes?: string | null;
  itemsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  version: number;
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
  quoteNumber?: string;
  accountId?: string;
  accountName?: string;
  contactName?: string;
  title?: string;
  totalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  grandTotal?: number;
  status?: QuoteStatus;
  validUntil?: string | null;
  assignedTo?: string;
  notes?: string | null;
  amounts?: QuoteAmounts;
}

export interface UpdateQuoteRequest {
  version: number;
  title?: string;
  accountId?: string;
  accountName?: string;
  contactName?: string;
  totalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  grandTotal?: number;
  status?: QuoteStatus;
  validUntil?: string | null;
  assignedTo?: string;
  notes?: string | null;
  amounts?: QuoteAmounts;
}

export interface QuoteSearchRequest {
  q?: string;
  search?: string;
  status?: string;
  accountId?: string;
  opportunityId?: string;
  ownerUserId?: string;
  page?: number;
  size?: number;
}

export const QUOTE_STATUS_CONFIG: Record<QuoteStatus, { label: string; className: string }> = {
  DRAFT: { label: 'DRAFT', className: 'bg-slate-100 text-slate-600 border-slate-300 font-semibold' },
  PENDING_APPROVAL: { label: 'PENDING APPROVAL', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' },
  APPROVED: { label: 'APPROVED', className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold' },
  SENT: { label: 'SENT', className: 'bg-purple-50 text-purple-700 border-purple-200 font-bold' },
  ACCEPTED: { label: 'ACCEPTED', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  REJECTED: { label: 'REJECTED', className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
  EXPIRED: { label: 'EXPIRED', className: 'bg-slate-200 text-slate-700 border-slate-300' },
  CANCELLED: { label: 'CANCELLED', className: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold' },
};

function normalizeQuote(q: any): QuoteItem {
  const total = q.amounts?.subtotal ?? (q.totalAmount || 0);
  const discount = q.amounts?.discountTotal ?? (q.discountAmount || 0);
  const tax = q.amounts?.taxTotal ?? (q.taxAmount || 0);
  const grand = q.amounts?.grandTotal ?? (q.grandTotal || (total - discount + tax));

  return {
    ...q,
    id: q.id || '',
    quoteNumber: q.quoteNumber || `BG-${q.id?.slice(-4) || '000'}`,
    title: q.title || `Báo giá ${q.quoteNumber || ''}`,
    accountId: q.accountId || 'acc-001',
    accountName: q.accountName || 'Khách hàng Doanh nghiệp',
    contactName: q.contactName || 'Người đại diện',
    totalAmount: total,
    discountAmount: discount,
    taxAmount: tax,
    grandTotal: grand,
    status: q.status || 'DRAFT',
    validUntil: q.validUntil || '2026-08-31',
    assignedTo: q.assignedTo || 'Phạm Tuấn Vũ',
    notes: q.notes || '',
    itemsCount: q.itemsCount || 2,
    createdAt: q.createdAt || new Date().toISOString(),
    version: q.version || 1,
  };
}

export const quoteApi = {
  async list(params: QuoteSearchRequest = {}): Promise<{ content: QuoteItem[]; totalElements: number; totalPages: number; page: number; size: number }> {
    const query = new URLSearchParams();
    const q = params.q || params.search;
    if (q) query.append('q', q);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.accountId) query.append('accountId', params.accountId);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/quotes${queryString ? `?${queryString}` : ''}`;
    const res = await apiFetch<any>(endpoint, { method: 'GET' });

    const rawItems: any[] = Array.isArray(res) ? res : res.items || res.content || [];
    const content = rawItems.map(normalizeQuote);

    return {
      content,
      totalElements: res.totalElements ?? content.length,
      totalPages: res.totalPages ?? 1,
      page: res.page ?? res.pageNumber ?? 0,
      size: res.size ?? res.pageSize ?? 10,
    };
  },

  async getById(id: string): Promise<QuoteItem> {
    const res = await apiFetch<any>(`/quotes/${id}`, { method: 'GET' });
    return normalizeQuote(res);
  },

  async create(request: CreateQuoteRequest): Promise<QuoteItem> {
    const total = request.totalAmount || request.grandTotal || 0;
    const payload = {
      quoteNumber: request.quoteNumber || `BG-2026-${Date.now().toString().slice(-4)}`,
      accountId: request.accountId || 'acc-001',
      amounts: {
        currencyCode: 'VND',
        subtotal: total,
        discountTotal: request.discountAmount || 0,
        taxTotal: request.taxAmount || 0,
        shippingTotal: 0,
      },
      validUntil: request.validUntil,
      notes: request.notes,
    };
    const res = await apiFetch<any>('/quotes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeQuote({ ...res, ...request });
  },

  async update(id: string, request: UpdateQuoteRequest): Promise<QuoteItem> {
    const total = request.totalAmount || request.grandTotal || 0;
    const payload = {
      version: request.version || 1,
      accountId: request.accountId || 'acc-001',
      status: request.status || 'DRAFT',
      amounts: {
        currencyCode: 'VND',
        subtotal: total,
        discountTotal: request.discountAmount || 0,
        taxTotal: request.taxAmount || 0,
        shippingTotal: 0,
      },
      validUntil: request.validUntil,
      notes: request.notes,
    };
    const res = await apiFetch<any>(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeQuote({ ...res, ...request });
  },

  async approve(id: string, version: number = 1): Promise<QuoteItem> {
    const res = await apiFetch<any>(`/quotes/${id}/approve`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
    return normalizeQuote(res);
  },

  async delete(id: string, version: number = 1): Promise<void> {
    return apiFetch<void>(`/quotes/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
