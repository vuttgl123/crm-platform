import type { QuoteAction, QuoteDetailResponse, QuoteSummaryItem } from './quoteTypes';

export interface QuoteCapabilities {
  canEditDraft: boolean;
  canDeleteDraft: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canRequestChanges: boolean;
  canMarkSent: boolean;
  canAccept: boolean;
  canReject: boolean;
  canCancel: boolean;
  canRevise: boolean;
  canPrint: boolean;
  canConvertToOrder: boolean;
}

export function evaluateQuoteCapabilities(
  quote: QuoteDetailResponse | QuoteSummaryItem,
  permissions?: {
    canWriteQuote?: boolean;
    canApproveQuote?: boolean;
    canWriteOrder?: boolean;
  }
): QuoteCapabilities {
  const actions: QuoteAction[] = quote.availableActions || [];
  const canWriteQuote = permissions?.canWriteQuote ?? true;
  const canApproveQuote = permissions?.canApproveQuote ?? true;
  const canWriteOrder = permissions?.canWriteOrder ?? true;

  return {
    canEditDraft: canWriteQuote && actions.includes('EDIT_DRAFT'),
    canDeleteDraft: canWriteQuote && actions.includes('DELETE_DRAFT'),
    canSubmit: canWriteQuote && actions.includes('SUBMIT'),
    canApprove: canApproveQuote && actions.includes('APPROVE'),
    canRequestChanges: canApproveQuote && actions.includes('REQUEST_CHANGES'),
    canMarkSent: canWriteQuote && actions.includes('MARK_SENT'),
    canAccept: canWriteQuote && actions.includes('ACCEPT'),
    canReject: canWriteQuote && actions.includes('REJECT'),
    canCancel: canWriteQuote && actions.includes('CANCEL'),
    canRevise: canWriteQuote && actions.includes('REVISE'),
    canPrint: actions.includes('PRINT'),
    canConvertToOrder: canWriteQuote && canWriteOrder && actions.includes('CREATE_ORDER'),
  };
}
