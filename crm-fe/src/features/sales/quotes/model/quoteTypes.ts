import type {
  QuoteAction,
  QuoteAmountsResponse,
  QuoteCustomerSnapshot,
  QuoteDetailResponse,
  QuoteDocumentResponse,
  QuoteLineInputPayload,
  QuoteLineResponse,
  QuoteOwnerReference,
  QuotePricingMode,
  QuotePulseCurrencyGroup,
  QuotePulseResponse,
  QuoteReference,
  QuoteRevisionItem,
  QuoteSearchParams,
  QuoteStatus,
  QuoteStatusHistoryItem,
  QuoteSummaryItem,
  PageResult,
} from '@/services/api/quoteApi';

export type {
  QuoteAction,
  QuoteAmountsResponse,
  QuoteCustomerSnapshot,
  QuoteDetailResponse,
  QuoteDocumentResponse,
  QuoteLineInputPayload,
  QuoteLineResponse,
  QuoteOwnerReference,
  QuotePricingMode,
  QuotePulseCurrencyGroup,
  QuotePulseResponse,
  QuoteReference,
  QuoteRevisionItem,
  QuoteSearchParams,
  QuoteStatus,
  QuoteStatusHistoryItem,
  QuoteSummaryItem,
  PageResult,
};

export type QuoteValidityFilter = 'ALL' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export type QuoteOperationalView = 'ALL' | 'NEEDS_APPROVAL' | 'DRAFTS' | 'SENT' | 'ACCEPTED' | 'EXPIRING';

export interface QuoteFilters {
  q: string;
  statuses: QuoteStatus[];
  accountId: string | null;
  opportunityId: string | null;
  ownerType: 'USER' | 'TEAM' | null;
  ownerId: string | null;
  currencyCode: string | null;
  validity: QuoteValidityFilter;
  issueFrom: string | null;
  issueTo: string | null;
  validFrom: string | null;
  validTo: string | null;
  latestOnly: boolean;
  sort: string;
  direction: 'asc' | 'desc';
  page: number;
  size: number;
}

export interface QuoteFormLineItem {
  id?: string | null;
  position: number;
  productId: string;
  priceBookItemId: string;
  sku: string;
  productName: string;
  unit: string;
  description: string;
  quantity: number;
  listUnitPrice: number;
  salesUnitPrice: number;
  discountPercent: number;
  taxPercent: number;
  // Calculated provisional totals
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  lineTotal: number;
}

export interface QuoteFormState {
  name: string;
  accountId: string;
  accountLabel: string;
  contactId: string | null;
  contactLabel: string;
  opportunityId: string | null;
  opportunityLabel: string;
  priceBookId: string;
  priceBookLabel: string;
  currencyCode: string;
  ownerType: 'USER' | 'TEAM';
  ownerId: string;
  issueDate: string;
  validUntil: string;
  customerSnapshot: QuoteCustomerSnapshot;
  paymentTerms: string;
  deliveryTerms: string;
  customerReference: string;
  internalNotes: string;
  shippingTotal: number;
  lines: QuoteFormLineItem[];
}
