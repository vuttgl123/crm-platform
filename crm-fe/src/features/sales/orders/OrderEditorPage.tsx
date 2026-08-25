import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { OrderContextSection } from './components/OrderContextSection';
import { OrderAddressSnapshotSection } from './components/OrderAddressSnapshotSection';
import { OrderLineEditor } from './components/OrderLineEditor';
import { OrderTermsPanel } from './components/OrderTermsPanel';
import { OrderTotalsRail } from './components/OrderTotalsRail';
import { OrderDetailSkeleton, OrderErrorState } from './components/OrderPageStates';
import { useOrder } from './hooks/useOrder';
import { useOrderMutations } from './hooks/useOrderMutations';
import { canPerformOrderAction } from './model/orderCapabilities';
import type { OrderFormState } from './model/orderTypes';
import type { OrderAmounts } from '@/services/api/orderApi';
import { toast } from 'sonner';

const initialFormState: OrderFormState = {
  accountId: '',
  contactId: '',
  opportunityId: '',
  priceBookId: '',
  ownerType: 'USER',
  ownerId: '',
  currencyCode: 'USD',
  orderDate: new Date().toISOString().split('T')[0],
  requestedDeliveryDate: '',
  customerReference: '',
  paymentTerms: '',
  deliveryTerms: '',
  notes: '',
  shippingTotal: '0',
  billingAddressSnapshot: {
    legalName: '',
    addressLine1: '',
    addressLine2: '',
    locality: '',
    region: '',
    postalCode: '',
    countryCode: 'US',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  },
  shippingAddressSnapshot: {
    legalName: '',
    addressLine1: '',
    addressLine2: '',
    locality: '',
    region: '',
    postalCode: '',
    countryCode: 'US',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  },
  lines: [],
};

export const OrderEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { data: existingOrder, isLoading, isError, refetch } = useOrder(id);
  const mutations = useOrderMutations();

  const [formState, setFormState] = useState<OrderFormState>(initialFormState);
  const [isDirty, setIsDirty] = useState(false);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  useEffect(() => {
    if (existingOrder && isEditing) {
      if (existingOrder.status !== 'DRAFT') {
        toast.error('Only draft orders can be edited');
        navigate(`/app/sales/orders/${existingOrder.id}`);
        return;
      }

      setFormState({
        accountId: existingOrder.account?.id || '',
        contactId: existingOrder.contact?.id || '',
        opportunityId: existingOrder.opportunity?.id || '',
        priceBookId: existingOrder.priceBook?.id || '',
        ownerType: existingOrder.owner?.type || 'USER',
        ownerId: existingOrder.owner?.id || '',
        currencyCode: existingOrder.amounts.currencyCode || 'USD',
        orderDate: existingOrder.orderDate || new Date().toISOString().split('T')[0],
        requestedDeliveryDate: existingOrder.requestedDeliveryDate || '',
        customerReference: existingOrder.customerReference || '',
        paymentTerms: existingOrder.paymentTerms || '',
        deliveryTerms: existingOrder.deliveryTerms || '',
        notes: existingOrder.notes || '',
        shippingTotal: String(existingOrder.amounts.shippingTotal || '0'),
        billingAddressSnapshot: {
          legalName: existingOrder.billingAddressSnapshot?.legalName || '',
          addressLine1: existingOrder.billingAddressSnapshot?.addressLine1 || '',
          addressLine2: existingOrder.billingAddressSnapshot?.addressLine2 || '',
          locality: existingOrder.billingAddressSnapshot?.locality || '',
          region: existingOrder.billingAddressSnapshot?.region || '',
          postalCode: existingOrder.billingAddressSnapshot?.postalCode || '',
          countryCode: existingOrder.billingAddressSnapshot?.countryCode || 'US',
          contactName: existingOrder.billingAddressSnapshot?.contactName || '',
          contactEmail: existingOrder.billingAddressSnapshot?.contactEmail || '',
          contactPhone: existingOrder.billingAddressSnapshot?.contactPhone || '',
        },
        shippingAddressSnapshot: {
          legalName: existingOrder.shippingAddressSnapshot?.legalName || '',
          addressLine1: existingOrder.shippingAddressSnapshot?.addressLine1 || '',
          addressLine2: existingOrder.shippingAddressSnapshot?.addressLine2 || '',
          locality: existingOrder.shippingAddressSnapshot?.locality || '',
          region: existingOrder.shippingAddressSnapshot?.region || '',
          postalCode: existingOrder.shippingAddressSnapshot?.postalCode || '',
          countryCode: existingOrder.shippingAddressSnapshot?.countryCode || 'US',
          contactName: existingOrder.shippingAddressSnapshot?.contactName || '',
          contactEmail: existingOrder.shippingAddressSnapshot?.contactEmail || '',
          contactPhone: existingOrder.shippingAddressSnapshot?.contactPhone || '',
        },
        lines: (existingOrder.lines || []).map((l) => ({
          id: l.id,
          lineNumber: l.lineNumber,
          productId: l.productId,
          quoteItemId: l.quoteItemId,
          skuSnapshot: l.skuSnapshot || undefined,
          nameSnapshot: l.nameSnapshot,
          descriptionSnapshot: l.descriptionSnapshot || undefined,
          unitOfMeasureSnapshot: l.unitOfMeasureSnapshot || undefined,
          quantity: String(l.quantity),
          unitPrice: String(l.unitPrice),
          discountPercent: String(l.discountPercent || '0'),
          discountAmount: String(l.discountAmount || '0'),
          taxPercent: String(l.taxPercent || '0'),
          taxAmount: String(l.taxAmount || '0'),
          lineTotal: String(l.lineTotal || '0'),
        })),
      });
      setIsDirty(false);
    }
  }, [existingOrder, isEditing, navigate]);

  const handleUpdateForm = (updates: Partial<OrderFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  // Compute live amounts
  const computedAmounts: OrderAmounts = React.useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    formState.lines.forEach((l) => {
      const qty = parseFloat(l.quantity || '0') || 0;
      const price = parseFloat(l.unitPrice || '0') || 0;
      const disc = parseFloat(l.discountAmount || '0') || 0;
      const tax = parseFloat(l.taxAmount || '0') || 0;

      subtotal += qty * price;
      discountTotal += disc;
      taxTotal += tax;
    });

    const shipping = parseFloat(formState.shippingTotal || '0') || 0;
    const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal + shipping);

    return {
      currencyCode: formState.currencyCode || 'USD',
      subtotal: subtotal.toFixed(2),
      discountTotal: discountTotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      shippingTotal: shipping.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };
  }, [formState.lines, formState.shippingTotal, formState.currencyCode]);

  const handleSaveDraft = async () => {
    if (!formState.accountId) {
      toast.error('Please select an Account');
      return;
    }

    try {
      if (isEditing && id && existingOrder) {
        const res = await mutations.saveDraft.mutateAsync({
          id,
          data: {
            accountId: formState.accountId,
            contactId: formState.contactId || undefined,
            opportunityId: formState.opportunityId || undefined,
            priceBookId: formState.priceBookId || undefined,
            billingAddressSnapshot: formState.billingAddressSnapshot,
            shippingAddressSnapshot: formState.shippingAddressSnapshot,
            orderDate: formState.orderDate,
            requestedDeliveryDate: formState.requestedDeliveryDate || undefined,
            customerReference: formState.customerReference || undefined,
            paymentTerms: formState.paymentTerms || undefined,
            deliveryTerms: formState.deliveryTerms || undefined,
            notes: formState.notes || undefined,
            shippingTotal: parseFloat(formState.shippingTotal || '0'),
            lines: formState.lines.map((l) => ({
              id: l.id,
              lineNumber: l.lineNumber,
              productId: l.productId || undefined,
              quoteItemId: l.quoteItemId || undefined,
              skuSnapshot: l.skuSnapshot || undefined,
              nameSnapshot: l.nameSnapshot,
              descriptionSnapshot: l.descriptionSnapshot || undefined,
              unitOfMeasureSnapshot: l.unitOfMeasureSnapshot || undefined,
              quantity: parseFloat(l.quantity || '1'),
              unitPrice: parseFloat(l.unitPrice || '0'),
              discountPercent: parseFloat(l.discountPercent || '0'),
              discountAmount: parseFloat(l.discountAmount || '0'),
              taxPercent: parseFloat(l.taxPercent || '0'),
              taxAmount: parseFloat(l.taxAmount || '0'),
            })),
          },
          version: existingOrder.version,
        });
        setIsDirty(false);
        navigate(`/app/sales/orders/${res.id}`);
      } else {
        const res = await mutations.createDirectDraft.mutateAsync({
          accountId: formState.accountId,
          contactId: formState.contactId || undefined,
          opportunityId: formState.opportunityId || undefined,
          priceBookId: formState.priceBookId || undefined,
          currencyCode: formState.currencyCode,
          billingAddressSnapshot: formState.billingAddressSnapshot,
          shippingAddressSnapshot: formState.shippingAddressSnapshot,
          orderDate: formState.orderDate,
          requestedDeliveryDate: formState.requestedDeliveryDate || undefined,
          customerReference: formState.customerReference || undefined,
          paymentTerms: formState.paymentTerms || undefined,
          deliveryTerms: formState.deliveryTerms || undefined,
          notes: formState.notes || undefined,
        });
        setIsDirty(false);
        navigate(`/app/sales/orders/${res.id}/edit`);
      }
    } catch (err) {
      // toast shown by hook
    }
  };

  const handleConfirmOrder = async () => {
    if (isEditing && id && existingOrder) {
      await handleSaveDraft();
      await mutations.confirm.mutateAsync({
        id,
        version: existingOrder.version,
      });
      navigate(`/app/sales/orders/${id}`);
    }
  };

  const handleAttemptLeave = () => {
    if (isDirty) {
      setIsDiscardOpen(true);
    } else {
      navigate(-1);
    }
  };

  if (isEditing && isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (isEditing && isError) {
    return <OrderErrorState onRetry={() => refetch()} />;
  }

  const isQuoteDerived = existingOrder?.sourceType === 'QUOTE_CONVERTED';
  const canConfirm = isEditing && existingOrder && canPerformOrderAction(existingOrder, 'CONFIRM');

  return (
    <div className="space-y-4 pb-16 font-sans w-full">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAttemptLeave}
            className="h-8 w-8 rounded-[3px] text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {isEditing ? `Edit Order ${existingOrder?.orderNumber}` : 'Create Direct Sales Order'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEditing
                ? 'Modify order line items, pricing, delivery schedule, and billing snapshots.'
                : 'Draft a direct commercial order without requiring an initial sales quote.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAttemptLeave}
            className="h-8 text-xs font-semibold rounded-[3px]"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={mutations.saveDraft.isPending || mutations.createDirectDraft.isPending}
            onClick={handleSaveDraft}
            className="h-8 text-xs font-semibold rounded-[3px] bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
          >
            {mutations.saveDraft.isPending || mutations.createDirectDraft.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isEditing ? 'Save Draft' : 'Create Draft'}</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Form Sections (Left 2 cols) & Commercial Rail (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-4">
          {/* Context Section */}
          <OrderContextSection
            formState={formState}
            onChange={handleUpdateForm}
            isQuoteDerived={isQuoteDerived}
          />

          {/* Line Items Editor (only in edit mode when draft exists) */}
          {isEditing && (
            <OrderLineEditor
              lines={formState.lines}
              onChange={(lines) => handleUpdateForm({ lines })}
              currencyCode={formState.currencyCode}
              isQuoteDerived={isQuoteDerived}
            />
          )}

          {/* Address Snapshot Section */}
          <OrderAddressSnapshotSection
            formState={formState}
            onChange={handleUpdateForm}
          />

          {/* Commercial Terms & Notes */}
          <OrderTermsPanel
            formState={formState}
            onChange={handleUpdateForm}
            isEditable={true}
          />
        </div>

        {/* Sticky Commercial Rail */}
        <div className="space-y-4">
          <OrderTotalsRail
            amounts={computedAmounts}
            shippingInput={formState.shippingTotal}
            onShippingChange={(val) => handleUpdateForm({ shippingTotal: val })}
            isEditable={true}
            onSaveDraft={handleSaveDraft}
            isSaving={mutations.saveDraft.isPending || mutations.createDirectDraft.isPending}
            onConfirm={handleConfirmOrder}
            isConfirming={mutations.confirm.isPending}
            canConfirm={Boolean(canConfirm)}
          />
        </div>
      </div>

      {/* Discard Warning Modal */}
      <AlertDialog open={isDiscardOpen} onOpenChange={setIsDiscardOpen}>
        <AlertDialogContent className="max-w-md rounded-[4px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Discard Unsaved Changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              You have unsaved edits in this order. If you leave now, your changes will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDiscardOpen(false)}
              className="h-8 text-xs font-semibold rounded-[3px]"
            >
              Keep Editing
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setIsDiscardOpen(false);
                navigate(-1);
              }}
              className="h-8 text-xs font-semibold rounded-[3px] bg-rose-600 hover:bg-rose-700"
            >
              Discard Changes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
