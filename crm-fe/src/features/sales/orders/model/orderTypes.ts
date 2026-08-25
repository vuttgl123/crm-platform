export type {
  OrderStatus,
  OrderSourceType,
  OrderPricingMode,
  OrderAction,
  OrderFulfillmentStatus,
  OrderAmounts,
  OrderAddressSnapshot,
  OrderReference,
  OrderOwnerReference,
  OrderLineResponse,
  OrderLineInput,
  OrderSummaryResponse,
  OrderResponse,
  CreateDirectOrderRequest,
  SaveOrderDraftRequest,
  FulfillmentLineInput,
  RecordOrderFulfillmentRequest,
  OrderFulfillmentLineResponse,
  OrderFulfillmentResponse,
  OrderStatusHistoryResponse,
  OrderPulseCurrencyGroup,
  OrderPulseResponse,
  OrderDocumentResponse,
  OrderSearchParams,
} from '@/services/api/orderApi';

export interface OrderFormLineItem {
  id: string;
  lineNumber: number;
  productId?: string | null;
  quoteItemId?: string | null;
  skuSnapshot?: string;
  nameSnapshot: string;
  descriptionSnapshot?: string;
  unitOfMeasureSnapshot?: string;
  quantity: string;
  unitPrice: string;
  discountPercent: string;
  discountAmount: string;
  taxPercent: string;
  taxAmount: string;
  lineTotal: string;
}

export interface OrderFormState {
  accountId: string;
  contactId: string;
  opportunityId: string;
  priceBookId: string;
  ownerType: 'USER' | 'TEAM';
  ownerId: string;
  currencyCode: string;
  orderDate: string;
  requestedDeliveryDate: string;
  customerReference: string;
  paymentTerms: string;
  deliveryTerms: string;
  notes: string;
  shippingTotal: string;
  billingAddressSnapshot: {
    legalName: string;
    addressLine1: string;
    addressLine2: string;
    locality: string;
    region: string;
    postalCode: string;
    countryCode: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  };
  shippingAddressSnapshot: {
    legalName: string;
    addressLine1: string;
    addressLine2: string;
    locality: string;
    region: string;
    postalCode: string;
    countryCode: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  };
  lines: OrderFormLineItem[];
}
