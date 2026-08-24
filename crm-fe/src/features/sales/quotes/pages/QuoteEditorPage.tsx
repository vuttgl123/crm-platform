import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuote } from '../hooks/useQuote';
import { useQuoteMutations } from '../hooks/useQuoteMutations';
import { QuoteContextSection } from '../components/QuoteContextSection';
import { QuoteCustomerSnapshotSection } from '../components/QuoteCustomerSnapshotSection';
import { QuoteLineEditor } from '../components/QuoteLineEditor';
import { QuoteTotalsRail } from '../components/QuoteTotalsRail';
import { QuoteTermsPanel } from '../components/QuoteTermsPanel';
import { QuoteDetailSkeleton } from '../components/QuotePageStates';
import type { QuoteFormState, QuoteFormLineItem } from '../model/quoteTypes';

const INITIAL_FORM_STATE: QuoteFormState = {
  name: '',
  accountId: '',
  accountLabel: '',
  contactId: null,
  contactLabel: '',
  opportunityId: null,
  opportunityLabel: '',
  priceBookId: '',
  priceBookLabel: '',
  currencyCode: 'USD',
  ownerType: 'USER',
  ownerId: '',
  issueDate: new Date().toISOString().split('T')[0],
  validUntil: '',
  customerSnapshot: {
    legalName: '',
    addressLine1: null,
    addressLine2: null,
    locality: null,
    region: null,
    postalCode: null,
    countryCode: null,
    contactName: null,
    contactEmail: null,
    contactPhone: null,
  },
  paymentTerms: 'Net 30 Days',
  deliveryTerms: 'Standard Delivery',
  customerReference: '',
  internalNotes: '',
  shippingTotal: 0,
  lines: [],
};

export const QuoteEditorPage: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const isEditing = Boolean(quoteId);
  const navigate = useNavigate();

  const { data: quote, isLoading: isQuoteLoading } = useQuote(quoteId);
  const { createMutation, saveDraftMutation, submitMutation } = useQuoteMutations();

  const [formState, setFormState] = useState<QuoteFormState>(INITIAL_FORM_STATE);
  const [version, setVersion] = useState<number>(1);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (quote && isEditing) {
      setVersion(quote.version);
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

      const shipping = typeof quote.amounts?.shippingTotal === 'string'
        ? parseFloat(quote.amounts.shippingTotal)
        : (quote.amounts?.shippingTotal || 0);

      setFormState({
        name: quote.name || '',
        accountId: quote.account?.id || '',
        accountLabel: quote.account?.label || '',
        contactId: quote.contact?.id || null,
        contactLabel: quote.contact?.label || '',
        opportunityId: quote.opportunity?.id || null,
        opportunityLabel: quote.opportunity?.label || '',
        priceBookId: quote.priceBook?.id || '',
        priceBookLabel: quote.priceBook?.label || '',
        currencyCode: quote.amounts?.currencyCode || 'USD',
        ownerType: quote.owner?.type || 'USER',
        ownerId: quote.owner?.id || '',
        issueDate: quote.issueDate || new Date().toISOString().split('T')[0],
        validUntil: quote.validUntil || '',
        customerSnapshot: quote.customerSnapshot || INITIAL_FORM_STATE.customerSnapshot,
        paymentTerms: quote.paymentTerms || '',
        deliveryTerms: quote.deliveryTerms || '',
        customerReference: quote.customerReference || '',
        internalNotes: quote.notes || '',
        shippingTotal: shipping,
        lines,
      });
      setIsDirty(false);
    }
  }, [quote, isEditing]);

  const handleUpdateForm = (updates: Partial<QuoteFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!formState.name.trim() || !formState.accountId || !formState.priceBookId) {
      alert('Please fill in required fields: Quote Name, Account, and Price Book.');
      return;
    }

    if (!isEditing) {
      createMutation.mutate(
        {
          name: formState.name.trim(),
          accountId: formState.accountId,
          contactId: formState.contactId,
          opportunityId: formState.opportunityId,
          priceBookId: formState.priceBookId,
          owner: formState.ownerId ? { type: formState.ownerType, id: formState.ownerId } : null,
          issueDate: formState.issueDate,
          validUntil: formState.validUntil || null,
        },
        {
          onSuccess: (created) => {
            setIsDirty(false);
            navigate(`/app/sales/quotes/${created.id}/edit`);
          },
        }
      );
    } else if (quoteId) {
      saveDraftMutation.mutate(
        {
          id: quoteId,
          version,
          payload: {
            name: formState.name.trim(),
            accountId: formState.accountId,
            contactId: formState.contactId,
            opportunityId: formState.opportunityId,
            priceBookId: formState.priceBookId,
            owner: formState.ownerId ? { type: formState.ownerType, id: formState.ownerId } : null,
            issueDate: formState.issueDate,
            validUntil: formState.validUntil || null,
            customerSnapshot: formState.customerSnapshot,
            paymentTerms: formState.paymentTerms || null,
            deliveryTerms: formState.deliveryTerms || null,
            customerReference: formState.customerReference || null,
            internalNotes: formState.internalNotes || null,
            shippingTotal: formState.shippingTotal,
            lines: formState.lines.map((l) => ({
              id: l.id || null,
              position: l.position,
              productId: l.productId,
              priceBookItemId: l.priceBookItemId,
              quantity: l.quantity,
              salesUnitPrice: l.salesUnitPrice,
              discountPercent: l.discountPercent,
              taxPercent: l.taxPercent,
              description: l.description || null,
            })),
          },
        },
        {
          onSuccess: (updated) => {
            setVersion(updated.version);
            setIsDirty(false);
          },
        }
      );
    }
  };

  const handleSubmitForApproval = () => {
    if (!quoteId) return;
    if (isDirty) {
      handleSave();
    }
    submitMutation.mutate(
      { id: quoteId, version },
      {
        onSuccess: () => navigate(`/app/sales/quotes/${quoteId}`),
      }
    );
  };

  if (isEditing && isQuoteLoading) {
    return <QuoteDetailSkeleton />;
  }

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Editor Header Bar */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={isEditing ? `/app/sales/quotes/${quoteId}` : '/app/sales/quotes'}
            className="p-1.5 rounded-[3px] border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {isEditing ? `Edit Quote: ${formState.name || 'Draft'}` : 'New Commercial Quote'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEditing
                ? `Revision ${quote?.revisionNumber || 1} • Version ${version}`
                : 'Configure commercial proposal context, line items, and customer snapshots.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(isEditing ? `/app/sales/quotes/${quoteId}` : '/app/sales/quotes')}
            className="h-8.5 rounded-[3px] text-xs font-medium border-slate-200"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={createMutation.isPending || saveDraftMutation.isPending}
            className="h-8.5 rounded-[3px] text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>
              {createMutation.isPending || saveDraftMutation.isPending ? 'Saving...' : 'Save Draft'}
            </span>
          </Button>

          {isEditing && (
            <Button
              size="sm"
              onClick={handleSubmitForApproval}
              disabled={submitMutation.isPending || formState.lines.length === 0}
              className="h-8.5 rounded-[3px] text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Submit for Approval</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left Column: Context, Line Items, Customer Snapshot, Terms */}
        <div className="lg:col-span-2 space-y-4">
          <QuoteContextSection formState={formState} onChange={handleUpdateForm} />
          <QuoteLineEditor
            lines={formState.lines}
            onChange={(lines) => handleUpdateForm({ lines })}
            priceBookId={formState.priceBookId}
            currencyCode={formState.currencyCode}
          />
          <QuoteCustomerSnapshotSection
            snapshot={formState.customerSnapshot}
            onChange={(snap) => handleUpdateForm({ customerSnapshot: snap })}
          />
          <QuoteTermsPanel
            paymentTerms={formState.paymentTerms}
            deliveryTerms={formState.deliveryTerms}
            customerReference={formState.customerReference}
            internalNotes={formState.internalNotes}
            onChange={(terms) => handleUpdateForm(terms)}
          />
        </div>

        {/* Right Column: Sticky Totals Summary Rail */}
        <div className="space-y-4">
          <QuoteTotalsRail
            lines={formState.lines}
            shippingTotal={formState.shippingTotal}
            onShippingChange={(val) => handleUpdateForm({ shippingTotal: val })}
            currencyCode={formState.currencyCode}
            onSaveDraft={handleSave}
            onSubmitForApproval={isEditing ? handleSubmitForApproval : undefined}
            onCancel={() => navigate(isEditing ? `/app/sales/quotes/${quoteId}` : '/app/sales/quotes')}
            isSaving={createMutation.isPending || saveDraftMutation.isPending}
            isSubmitting={submitMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};
