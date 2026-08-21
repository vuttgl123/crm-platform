import { apiFetch } from './apiClient';

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CANCELLED';

export type PaymentStatus = 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'REFUNDED';

export interface OrderAmounts {
  currencyCode: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal?: number;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  accountId: string;
  accountName?: string;
  contactName?: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryDate?: string;
  assignedTo?: string;
  notes?: string;
  itemsCount?: number;
  createdAt: string;
  version: number;
}

export interface CreateOrderRequest {
  orderNumber?: string;
  accountId?: string;
  accountName?: string;
  contactName?: string;
  totalAmount?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliveryDate?: string;
  assignedTo?: string;
  notes?: string;
}

export interface UpdateOrderRequest {
  version: number;
  accountId?: string;
  accountName?: string;
  contactName?: string;
  totalAmount?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  deliveryDate?: string;
  assignedTo?: string;
  notes?: string;
}

export interface OrderSearchRequest {
  q?: string;
  search?: string;
  status?: string;
  paymentStatus?: string;
  accountId?: string;
  opportunityId?: string;
  quoteId?: string;
  ownerUserId?: string;
  page?: number;
  size?: number;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  DRAFT: { label: 'DRAFT', className: 'bg-slate-100 text-slate-600 border-slate-300 font-semibold' },
  CONFIRMED: { label: 'CONFIRMED', className: 'bg-blue-50 text-blue-700 border-blue-200 font-bold' },
  PROCESSING: { label: 'PROCESSING', className: 'bg-purple-50 text-purple-700 border-purple-200 font-bold' },
  PARTIALLY_FULFILLED: { label: 'PARTIALLY FULFILLED', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' },
  FULFILLED: { label: 'FULFILLED', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  CANCELLED: { label: 'CANCELLED', className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  PAID: { label: 'PAID', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  PARTIALLY_PAID: { label: 'PARTIALLY PAID', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' },
  UNPAID: { label: 'UNPAID', className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
  REFUNDED: { label: 'REFUNDED', className: 'bg-slate-200 text-slate-700 border-slate-300' },
};

function normalizeOrder(o: any): OrderItem {
  const total = o.amounts?.subtotal ?? (o.totalAmount || 0);

  return {
    ...o,
    id: o.id || '',
    orderNumber: o.orderNumber || `DH-${o.id?.slice(-4) || '000'}`,
    accountId: o.accountId || 'acc-001',
    accountName: o.accountName || 'Khách hàng Doanh nghiệp',
    contactName: o.contactName || 'Người đại diện',
    totalAmount: total,
    status: o.status || 'CONFIRMED',
    paymentStatus: o.paymentStatus || 'PAID',
    deliveryDate: o.requestedDeliveryDate || o.deliveryDate || '2026-08-30',
    assignedTo: o.assignedTo || 'Phạm Tuấn Vũ',
    notes: o.notes || '',
    itemsCount: o.itemsCount || 2,
    createdAt: o.createdAt || new Date().toISOString(),
    version: o.version || 1,
  };
}

export const orderApi = {
  async list(params: OrderSearchRequest = {}): Promise<{ content: OrderItem[]; totalElements: number; totalPages: number; page: number; size: number }> {
    const query = new URLSearchParams();
    const q = params.q || params.search;
    if (q) query.append('q', q);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.accountId) query.append('accountId', params.accountId);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
    const res = await apiFetch<any>(endpoint, { method: 'GET' });

    const rawItems: any[] = Array.isArray(res) ? res : res.items || res.content || [];
    let content = rawItems.map(normalizeOrder);

    if (params.paymentStatus && params.paymentStatus !== 'ALL') {
      content = content.filter((o) => o.paymentStatus === params.paymentStatus);
    }

    return {
      content,
      totalElements: res.totalElements ?? content.length,
      totalPages: res.totalPages ?? 1,
      page: res.page ?? res.pageNumber ?? 0,
      size: res.size ?? res.pageSize ?? 10,
    };
  },

  async getById(id: string): Promise<OrderItem> {
    const res = await apiFetch<any>(`/orders/${id}`, { method: 'GET' });
    return normalizeOrder(res);
  },

  async create(request: CreateOrderRequest): Promise<OrderItem> {
    const total = request.totalAmount || 0;
    const payload = {
      orderNumber: request.orderNumber || `DH-2026-${Date.now().toString().slice(-4)}`,
      accountId: request.accountId || 'acc-001',
      amounts: {
        currencyCode: 'VND',
        subtotal: total,
        discountTotal: 0,
        taxTotal: 0,
        shippingTotal: 0,
      },
      requestedDeliveryDate: request.deliveryDate,
      notes: request.notes,
    };
    const res = await apiFetch<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeOrder({ ...res, ...request });
  },

  async update(id: string, request: UpdateOrderRequest): Promise<OrderItem> {
    const total = request.totalAmount || 0;
    const payload = {
      version: request.version || 1,
      accountId: request.accountId || 'acc-001',
      status: request.status || 'CONFIRMED',
      amounts: {
        currencyCode: 'VND',
        subtotal: total,
        discountTotal: 0,
        taxTotal: 0,
        shippingTotal: 0,
      },
      requestedDeliveryDate: request.deliveryDate,
      notes: request.notes,
    };
    const res = await apiFetch<any>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeOrder({ ...res, ...request });
  },

  async confirm(id: string, version: number = 1): Promise<OrderItem> {
    const res = await apiFetch<any>(`/orders/${id}/confirm`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
    return normalizeOrder(res);
  },

  async delete(id: string, version: number = 1): Promise<void> {
    return apiFetch<void>(`/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
