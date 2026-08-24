import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuote, useQuoteHistory, useQuoteRevisions } from '../hooks/useQuote';
import { useQuoteMutations } from '../hooks/useQuoteMutations';
import { QuoteDetailHeader } from '../components/QuoteDetailHeader';
import { QuoteLineEditor } from '../components/QuoteLineEditor';
import { QuoteCustomerSnapshotSection } from '../components/QuoteCustomerSnapshotSection';
import { QuoteTermsPanel } from '../components/QuoteTermsPanel';
import { QuoteTotalsRail } from '../components/QuoteTotalsRail';
import { QuoteStatusHistory } from '../components/QuoteStatusHistory';
import { QuoteRevisionHistory } from '../components/QuoteRevisionHistory';
import { QuoteActionDialogs, type ActionDialogState } from '../components/QuoteActionDialogs';
import { QuoteDetailSkeleton, QuoteErrorState } from '../components/QuotePageStates';
import type { QuoteAction, QuoteFormLineItem } from '../model/quoteTypes';

export const QuoteDetailPage: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();

  const {
    data: quote,
    isLoading: isQuoteLoading,
    error: quoteError,
    refetch: refetchQuote,
  } = useQuote(quoteId);

  const { data: historyPage, isLoading: isHistoryLoading } = useQuoteHistory(quoteId);
  const { data: revisions, isLoading: isRevisionsLoading } = useQuoteRevisions(quoteId);

  const {
    submitMutation,
    approveMutation,
    requestChangesMutation,
    markSentMutation,
    acceptMutation,
    rejectMutation,
    cancelMutation,
    reviseMutation,
    deleteDraftMutation,
    convertToOrderMutation,
  } = useQuoteMutations();

  const [dialogState, setDialogState] = useState<ActionDialogState | null>(null);

  if (isQuoteLoading) {
    return <QuoteDetailSkeleton />;
  }

  if (quoteError || !quote) {
    return <QuoteErrorState error={quoteError as Error} onRetry={() => refetchQuote()} />;
  }

  const handleTriggerAction = (action: QuoteAction) => {
    if (action === 'EDIT_DRAFT') {
      navigate(`/app/sales/quotes/${quote.id}/edit`);
      return;
    }
    if (action === 'PRINT') {
      window.open(`/app/sales/quotes/${quote.id}/print`, '_blank');
      return;
    }

    setDialogState({
      type: action,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      revisionNumber: quote.revisionNumber,
      version: quote.version,
    });
  };

  const handleCloseDialog = () => setDialogState(null);

  // Map response lines to form line items for table display
  const lines: QuoteFormLineItem[] = (quote.lines || []).map((l) => {
    const qty = typeof l.quantity === 'string' ? parseFloat(l.quantity) : l.quantity;
    const listPrice = typeof l.listUnitPrice === 'string' ? parseFloat(l.listUnitPrice) : l.listUnitPrice;
    const salesPrice = typeof l.salesUnitPrice === 'string' ? parseFloat(l.salesUnitPrice) : l.salesUnitPrice;
    const discPct = typeof l.discountPercent === 'string' ? parseFloat(l.discountPercent) : l.discountPercent;
    const taxPct = typeof l.taxPercent === 'string' ? parseFloat(l.taxPercent) : l.taxPercent;
    const sub = typeof l.lineSubtotal === 'string' ? parseFloat(l.lineSubtotal) : l.lineSubtotal;
    const discAmt = typeof l.lineDiscount === 'string' ? parseFloat(l.lineDiscount) : l.lineDiscount;
    const taxAmt = typeof l.lineTax === 'string' ? parseFloat(l.lineTax) : l.lineTax;
    const total = typeof l.lineTotal === 'string' ? parseFloat(l.lineTotal) : l.lineTotal;

    return {
      id: l.id,
      position: l.position,
      productId: l.productId,
      priceBookItemId: l.priceBookItemId,
      sku: l.sku,
      productName: l.productName,
      unit: l.unit || '',
      description: l.description || '',
      quantity: qty,
      listUnitPrice: listPrice,
      salesUnitPrice: salesPrice,
      discountPercent: discPct,
      taxPercent: taxPct,
      subtotal: sub,
      discountAmount: discAmt,
      taxAmount: taxAmt,
      lineTotal: total,
    };
  });

  const shipping =
    typeof quote.amounts?.shippingTotal === 'string'
      ? parseFloat(quote.amounts.shippingTotal)
      : (quote.amounts?.shippingTotal || 0);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Top Header Card */}
      <QuoteDetailHeader quote={quote} onTriggerAction={handleTriggerAction} />

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left 2 Columns: Lines, Snapshots, Terms, History */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quote Lines */}
          <QuoteLineEditor
            lines={lines}
            onChange={() => {}}
            priceBookId={quote.priceBook?.id || ''}
            currencyCode={quote.amounts?.currencyCode || 'USD'}
            isReadOnly
          />

          {/* Customer Snapshot */}
          <QuoteCustomerSnapshotSection snapshot={quote.customerSnapshot} isReadOnly />

          {/* Terms & Conditions */}
          <QuoteTermsPanel
            paymentTerms={quote.paymentTerms || ''}
            deliveryTerms={quote.deliveryTerms || ''}
            customerReference={quote.customerReference || ''}
            internalNotes={quote.notes || ''}
            isReadOnly
          />

          {/* Status & Audit History */}
          <QuoteStatusHistory history={historyPage?.items || []} isLoading={isHistoryLoading} />

          {/* Revision Chain */}
          <QuoteRevisionHistory revisions={revisions || []} isLoading={isRevisionsLoading} />
        </div>

        {/* Right 1 Column: Commercial Summary Rail & Metadata */}
        <div className="space-y-4">
          <QuoteTotalsRail
            lines={lines}
            shippingTotal={shipping}
            currencyCode={quote.amounts?.currencyCode || 'USD'}
            isReadOnly
          />

          {/* Commercial Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3 text-xs">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Proposal Metadata
            </div>

            <div className="space-y-2 text-slate-600">
              <div className="flex items-center justify-between">
                <span>Account</span>
                {quote.account ? (
                  <Link
                    to={`/app/crm/accounts/${quote.account.id}`}
                    className="font-medium text-slate-900 hover:text-blue-600 truncate max-w-[140px]"
                  >
                    {quote.account.label}
                  </Link>
                ) : (
                  <span>—</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Contact</span>
                <span className="font-medium text-slate-900 truncate max-w-[140px]">
                  {quote.contact?.label || 'Direct Org'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Price Book</span>
                <span className="font-medium text-slate-900 truncate max-w-[140px]">
                  {quote.priceBook?.label || 'Default'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Owner</span>
                <span className="font-medium text-slate-900 truncate max-w-[140px]">
                  {quote.owner?.label || 'Unassigned'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span>Issue Date</span>
                <span className="font-medium text-slate-900">{quote.issueDate}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Valid Until</span>
                <span className="font-medium text-slate-900">{quote.validUntil || 'Open'}</span>
              </div>

              {quote.relatedOrderId && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-semibold text-emerald-800">Converted Order</span>
                  <Link
                    to={`/app/sales/orders/${quote.relatedOrderId}`}
                    className="font-bold font-mono text-emerald-700 hover:underline"
                  >
                    View Order
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Dialogs */}
      <QuoteActionDialogs
        dialogState={dialogState}
        onClose={handleCloseDialog}
        onSubmit={(id, version) => submitMutation.mutate({ id, version })}
        onApprove={(id, version) => approveMutation.mutate({ id, version })}
        onRequestChanges={(id, version, reason) => requestChangesMutation.mutate({ id, version, reason })}
        onMarkSent={(id, version) => markSentMutation.mutate({ id, version })}
        onAccept={(id, version, customerReference) => acceptMutation.mutate({ id, version, customerReference })}
        onReject={(id, version, reason) => rejectMutation.mutate({ id, version, reason })}
        onCancel={(id, version, reason) => cancelMutation.mutate({ id, version, reason })}
        onRevise={(id, version) =>
          reviseMutation.mutate(
            { id, version },
            {
              onSuccess: (data) => navigate(`/app/sales/quotes/${data.id}/edit`),
            }
          )
        }
        onDeleteDraft={(id, version) =>
          deleteDraftMutation.mutate(
            { id, version },
            {
              onSuccess: () => navigate('/app/sales/quotes'),
            }
          )
        }
        onConvertToOrder={(id, version) =>
          convertToOrderMutation.mutate(
            { id, version },
            {
              onSuccess: (data) => navigate(`/app/sales/orders/${data.orderId}`),
            }
          )
        }
        isPending={
          submitMutation.isPending ||
          approveMutation.isPending ||
          requestChangesMutation.isPending ||
          markSentMutation.isPending ||
          acceptMutation.isPending ||
          rejectMutation.isPending ||
          cancelMutation.isPending ||
          reviseMutation.isPending ||
          deleteDraftMutation.isPending ||
          convertToOrderMutation.isPending
        }
      />
    </div>
  );
};
