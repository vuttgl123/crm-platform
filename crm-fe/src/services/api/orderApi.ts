import { apiFetch } from './apiClient';
import type { PageResult } from './accountApi';

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CLOSED_PARTIAL'
  | 'CANCELLED';

export type OrderSourceType = 'DIRECT' | 'QUOTE_CONVERTED';
export type OrderPricingMode = 'LINE_ITEM' | 'LEGACY_AMOUNT_ONLY';

export type OrderAction =
  | 'CONFIRM'
  | 'START_PROCESSING'
  | 'RECORD_FULFILLMENT'
  | 'VOID_FULFILLMENT'
  | 'CLOSE_REMAINING'
  | 'CANCEL'
  | 'DELETE_DRAFT'
  | 'EDIT_DRAFT';

export type OrderFulfillmentStatus = 'RECORDED' | 'VOIDED';

export interface OrderAmounts {
  currencyCode: string;
  subtotal: string | number;
  discountTotal: string | number;
  taxTotal: string | number;
  shippingTotal: string | number;
  grandTotal: string | number;
}

export interface OrderAddressSnapshot {
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

export interface OrderReference {
  id: string;
  name: string;
  exists: boolean;
}

export interface OrderOwnerReference {
  type: 'USER' | 'TEAM';
  id: string;
  name: string;
}

export interface OrderLineResponse {
  id: string;
  lineNumber: number;
  productId?: string | null;
  quoteItemId?: string | null;
  skuSnapshot?: string | null;
  nameSnapshot: string;
  descriptionSnapshot?: string | null;
  unitOfMeasureSnapshot?: string | null;
  quantity: string | number;
  fulfilledQuantity: string | number;
  remainingQuantity: string | number;
  unitPrice: string | number;
  discountPercent: string | number;
  discountAmount: string | number;
  taxPercent: string | number;
  taxAmount: string | number;
  lineTotal: string | number;
}

export interface OrderLineInput {
  id?: string;
  lineNumber?: number;
  productId?: string | null;
  quoteItemId?: string | null;
  skuSnapshot?: string | null;
  nameSnapshot: string;
  descriptionSnapshot?: string | null;
  unitOfMeasureSnapshot?: string | null;
  quantity: string | number;
  unitPrice: string | number;
  discountPercent?: string | number;
  discountAmount?: string | number;
  taxPercent?: string | number;
  taxAmount?: string | number;
}

export interface OrderSummaryResponse {
  id: string;
  orderNumber: string;
  sourceType: OrderSourceType;
  pricingMode: OrderPricingMode;
  status: OrderStatus;
  account: OrderReference;
  opportunity?: OrderReference | null;
  quote?: OrderReference | null;
  owner?: OrderOwnerReference | null;
  amounts: OrderAmounts;
  lineCount: number;
  progressPercent: number;
  orderDate: string;
  requestedDeliveryDate?: string | null;
  updatedAt: string;
  version: number;
  availableActions: OrderAction[];
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  sourceType: OrderSourceType;
  pricingMode: OrderPricingMode;
  status: OrderStatus;
  account: OrderReference;
  contact?: OrderReference | null;
  opportunity?: OrderReference | null;
  quote?: OrderReference | null;
  priceBook?: OrderReference | null;
  owner?: OrderOwnerReference | null;
  amounts: OrderAmounts;
  billingAddressSnapshot: OrderAddressSnapshot;
  shippingAddressSnapshot: OrderAddressSnapshot;
  lines: OrderLineResponse[];
  progressPercent: number;
  orderDate: string;
  requestedDeliveryDate?: string | null;
  customerReference?: string | null;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  notes?: string | null;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
  fulfilledAt?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  closedAt?: string | null;
  closedBy?: string | null;
  closedReason?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  version: number;
  availableActions: OrderAction[];
}

export interface CreateDirectOrderRequest {
  accountId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  priceBookId?: string | null;
  ownerType?: string | null;
  ownerId?: string | null;
  currencyCode?: string | null;
  billingAddressSnapshot?: Partial<OrderAddressSnapshot> | null;
  shippingAddressSnapshot?: Partial<OrderAddressSnapshot> | null;
  orderDate?: string | null;
  requestedDeliveryDate?: string | null;
  customerReference?: string | null;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  notes?: string | null;
}

export interface SaveOrderDraftRequest {
  accountId: string;
  contactId?: string | null;
  opportunityId?: string | null;
  priceBookId?: string | null;
  ownerType?: string | null;
  ownerId?: string | null;
  billingAddressSnapshot?: Partial<OrderAddressSnapshot> | null;
  shippingAddressSnapshot?: Partial<OrderAddressSnapshot> | null;
  orderDate?: string | null;
  requestedDeliveryDate?: string | null;
  customerReference?: string | null;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  notes?: string | null;
  shippingTotal?: string | number | null;
  lines?: OrderLineInput[] | null;
}

export interface FulfillmentLineInput {
  orderLineId: string;
  quantity: string | number;
}

export interface RecordOrderFulfillmentRequest {
  referenceNumber?: string | null;
  fulfillmentDate?: string | null;
  note?: string | null;
  lines: FulfillmentLineInput[];
}

export interface OrderFulfillmentLineResponse {
  id: string;
  orderLineId: string;
  lineName: string;
  lineSku?: string | null;
  quantity: string | number;
}

export interface OrderFulfillmentResponse {
  id: string;
  eventNumber: string;
  referenceNumber?: string | null;
  fulfillmentDate: string;
  note?: string | null;
  status: OrderFulfillmentStatus;
  occurredAt: string;
  recordedBy?: string | null;
  voidedAt?: string | null;
  voidedBy?: string | null;
  voidReason?: string | null;
  lines: OrderFulfillmentLineResponse[];
  version: number;
}

export interface OrderStatusHistoryResponse {
  id: string;
  orderId: string;
  changedAt: string;
  changedBy?: string | null;
  action: string;
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  notes?: string | null;
}

export interface OrderPulseCurrencyGroup {
  currencyCode: string;
  draftCount: number;
  confirmedCount: number;
  processingTotal: string | number;
  processingCount: number;
  partiallyFulfilledTotal: string | number;
  partiallyFulfilledCount: number;
  fulfilledTotal: string | number;
  fulfilledCount: number;
  closedPartialCount: number;
  cancelledCount: number;
}

export interface OrderPulseResponse {
  totalOrders: number;
  activeProcessingCount: number;
  pendingFulfillmentCount: number;
  completedCount: number;
  currencyGroups: OrderPulseCurrencyGroup[];
}

export interface OrderStatsDto {
  totalOrders: number;
  draftOrders: number;
  confirmedOrders: number;
  inFulfillmentOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  fulfilledAmount: number | string;
  totalPipelineAmount: number | string;
}

export interface BulkChangeOrderStatusRequest {
  orderIds: string[];
  status: OrderStatus;
  reason?: string;
}

export interface OrderDocumentResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  account: OrderReference;
  contact?: OrderReference | null;
  opportunity?: OrderReference | null;
  quote?: OrderReference | null;
  owner?: OrderOwnerReference | null;
  amounts: OrderAmounts;
  billingAddressSnapshot: OrderAddressSnapshot;
  shippingAddressSnapshot: OrderAddressSnapshot;
  lines: OrderLineResponse[];
  progressPercent: number;
  orderDate: string;
  requestedDeliveryDate?: string | null;
  customerReference?: string | null;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  notes?: string | null;
  confirmedAt?: string | null;
  fulfilledAt?: string | null;
  createdAt: string;
}

export interface OrderSearchParams {
  q?: string;
  accountId?: string;
  contactId?: string;
  opportunityId?: string;
  quoteId?: string;
  status?: OrderStatus;
  statuses?: OrderStatus[];
  ownerType?: string;
  ownerId?: string;
  fromDate?: string;
  toDate?: string;
  currencyCode?: string;
  page?: number;
  size?: number;
}

export const orderApi = {
  createDirectDraft: (data: CreateDirectOrderRequest): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>('/api/sales/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  saveDraft: (id: string, data: SaveOrderDraftRequest, version: number): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/api/sales/orders/${id}`, {
      method: 'PUT',
      headers: {
        'If-Match': `"${version}"`,
      },
      body: JSON.stringify(data),
    });
  },

  get: (id: string): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/api/sales/orders/${id}`);
  },

  search: (params?: OrderSearchParams): Promise<PageResult<OrderSummaryResponse>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.q) searchParams.append('q', params.q);
      if (params.accountId) searchParams.append('accountId', params.accountId);
      if (params.contactId) searchParams.append('contactId', params.contactId);
      if (params.opportunityId) searchParams.append('opportunityId', params.opportunityId);
      if (params.quoteId) searchParams.append('quoteId', params.quoteId);
      if (params.status) searchParams.append('status', params.status);
      if (params.statuses && params.statuses.length > 0) {
        params.statuses.forEach((s) => searchParams.append('statuses', s));
      }
      if (params.ownerType) searchParams.append('ownerType', params.ownerType);
      if (params.ownerId) searchParams.append('ownerId', params.ownerId);
      if (params.fromDate) searchParams.append('fromDate', params.fromDate);
      if (params.toDate) searchParams.append('toDate', params.toDate);
      if (params.currencyCode) searchParams.append('currencyCode', params.currencyCode);
      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.size !== undefined) searchParams.append('size', params.size.toString());
    }
    const query = searchParams.toString();
    return apiFetch<PageResult<OrderSummaryResponse>>(`/api/sales/orders${query ? `?${query}` : ''}`);
  },

  getPulse: (): Promise<OrderPulseResponse> => {
    return apiFetch<OrderPulseResponse>('/api/sales/orders/summary');
  },

  getDocument: (id: string): Promise<OrderDocumentResponse> => {
    return apiFetch<OrderDocumentResponse>(`/api/sales/orders/${id}/document`);
  },

  getStatusHistory: (id: string): Promise<OrderStatusHistoryResponse[]> => {
    return apiFetch<OrderStatusHistoryResponse[]>(`/api/sales/orders/${id}/history`);
  },

  getFulfillments: (id: string): Promise<OrderFulfillmentResponse[]> => {
    return apiFetch<OrderFulfillmentResponse[]>(`/api/sales/orders/${id}/fulfillments`);
  },

  confirm: (id: string, version: number): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/api/sales/orders/${id}/confirm`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  complete: (id: string, version: number): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/api/sales/orders/${id}/complete`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  getStats: (): Promise<OrderStatsDto> => {
    return apiFetch<OrderStatsDto>('/api/sales/orders/stats');
  },

  bulkChangeStatus: (data: BulkChangeOrderStatusRequest): Promise<{ updatedCount: number }> => {
    return apiFetch<{ updatedCount: number }>('/api/sales/orders/bulk/status', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  startProcessing: (id: string, version: number): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/api/sales/orders/${id}/start-processing`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  recordFulfillment: (
    id: string,
    data: RecordOrderFulfillmentRequest,
    version: number,
    idempotencyKey?: string
  ): Promise<OrderResponse> => {
    const headers: Record<string, string> = {
      'If-Match': `"${version}"`,
    };
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return apiFetch<OrderResponse>(`/api/sales/orders/${id}/fulfillments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  },

  voidFulfillment: (
    id: string,
    eventId: string,
    reason: string,
    version: number
  ): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/api/sales/orders/${id}/fulfillments/${eventId}/void`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
      body: JSON.stringify({ reason }),
    });
  },

  closeRemaining: (id: string, reason: string, version: number): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/api/sales/orders/${id}/close-remaining`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
      body: JSON.stringify({ reason }),
    });
  },

  cancel: (id: string, reason: string, version: number): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/api/sales/orders/${id}/cancel`, {
      method: 'POST',
      headers: {
        'If-Match': `"${version}"`,
      },
      body: JSON.stringify({ reason }),
    });
  },

  deleteDraft: (id: string, version: number): Promise<void> => {
    return apiFetch<void>(`/api/sales/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
