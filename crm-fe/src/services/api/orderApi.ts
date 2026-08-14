import { apiFetch } from './apiClient';

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CANCELLED';

export interface OrderAmounts {
  currencyCode: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal?: number;
}

export interface OrderSummaryResponse {
  id: string;
  orderNumber: string;
  accountId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  quoteId?: string | null;
  ownerUserId?: string | null;
  status: OrderStatus;
  amounts: OrderAmounts;
  orderDate?: string | null;
  requestedDeliveryDate?: string | null;
  updatedAt: string;
  version: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  accountId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  quoteId?: string | null;
  ownerUserId?: string | null;
  status: OrderStatus;
  amounts: OrderAmounts;
  orderDate: string;
  requestedDeliveryDate?: string | null;
  customerReference?: string | null;
  confirmedAt?: string | null;
  fulfilledAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
}

export interface CreateOrderRequest {
  orderNumber: string;
  accountId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  quoteId?: string | null;
  ownerUserId?: string | null;
  amounts: OrderAmounts;
  orderDate?: string | null;
  requestedDeliveryDate?: string | null;
  customerReference?: string | null;
}

export interface UpdateOrderRequest {
  version: number;
  accountId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  quoteId?: string | null;
  ownerUserId?: string | null;
  status?: OrderStatus;
  amounts: OrderAmounts;
  orderDate?: string | null;
  requestedDeliveryDate?: string | null;
  customerReference?: string | null;
}

export interface CancelOrderRequest {
  reason?: string;
}

export interface OrderSearchRequest {
  q?: string;
  accountId?: string;
  opportunityId?: string;
  quoteId?: string;
  status?: OrderStatus;
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

export const orderApi = {
  async list(params: OrderSearchRequest = {}): Promise<PageResult<OrderSummaryResponse>> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.accountId) query.append('accountId', params.accountId);
    if (params.opportunityId) query.append('opportunityId', params.opportunityId);
    if (params.quoteId) query.append('quoteId', params.quoteId);
    if (params.status) query.append('status', params.status);
    if (params.ownerUserId) query.append('ownerUserId', params.ownerUserId);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
    return apiFetch<PageResult<OrderSummaryResponse>>(endpoint, { method: 'GET' });
  },

  async getById(id: string): Promise<OrderResponse> {
    return apiFetch<OrderResponse>(`/orders/${id}`, { method: 'GET' });
  },

  async create(request: CreateOrderRequest): Promise<OrderResponse> {
    return apiFetch<OrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async update(id: string, request: UpdateOrderRequest): Promise<OrderResponse> {
    return apiFetch<OrderResponse>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async confirm(id: string, version: number): Promise<OrderResponse> {
    return apiFetch<OrderResponse>(`/orders/${id}/confirm`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  async cancel(id: string, reason: string | undefined, version: number): Promise<OrderResponse> {
    return apiFetch<OrderResponse>(`/orders/${id}/cancel`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
      body: JSON.stringify({ reason }),
    });
  },

  async delete(id: string, version: number): Promise<void> {
    return apiFetch<void>(`/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
