import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { QuoteAction } from '../model/quoteTypes';

export interface ActionDialogState {
  type: QuoteAction | null;
  quoteId: string;
  quoteNumber: string;
  revisionNumber: number;
  version: number;
}

interface QuoteActionDialogsProps {
  dialogState: ActionDialogState | null;
  onClose: () => void;
  onSubmit: (id: string, version: number) => void;
  onApprove: (id: string, version: number) => void;
  onRequestChanges: (id: string, version: number, reason: string) => void;
  onMarkSent: (id: string, version: number) => void;
  onAccept: (id: string, version: number, customerReference?: string) => void;
  onReject: (id: string, version: number, reason: string) => void;
  onCancel: (id: string, version: number, reason: string) => void;
  onRevise: (id: string, version: number) => void;
  onDeleteDraft: (id: string, version: number) => void;
  onConvertToOrder: (id: string, version: number) => void;
  isPending?: boolean;
}

export const QuoteActionDialogs: React.FC<QuoteActionDialogsProps> = ({
  dialogState,
  onClose,
  onSubmit,
  onApprove,
  onRequestChanges,
  onMarkSent,
  onAccept,
  onReject,
  onCancel,
  onRevise,
  onDeleteDraft,
  onConvertToOrder,
  isPending,
}) => {
  const [reason, setReason] = useState('');
  const [customerReference, setCustomerReference] = useState('');

  if (!dialogState || !dialogState.type) {
    return null;
  }

  const handleClose = () => {
    setReason('');
    setCustomerReference('');
    onClose();
  };

  const handleConfirm = () => {
    const { type, quoteId, version } = dialogState;
    switch (type) {
      case 'SUBMIT':
        onSubmit(quoteId, version);
        break;
      case 'APPROVE':
        onApprove(quoteId, version);
        break;
      case 'REQUEST_CHANGES':
        if (!reason.trim()) return;
        onRequestChanges(quoteId, version, reason.trim());
        break;
      case 'MARK_SENT':
        onMarkSent(quoteId, version);
        break;
      case 'ACCEPT':
        onAccept(quoteId, version, customerReference.trim() || undefined);
        break;
      case 'REJECT':
        if (!reason.trim()) return;
        onReject(quoteId, version, reason.trim());
        break;
      case 'CANCEL':
        if (!reason.trim()) return;
        onCancel(quoteId, version, reason.trim());
        break;
      case 'REVISE':
        onRevise(quoteId, version);
        break;
      case 'DELETE_DRAFT':
        onDeleteDraft(quoteId, version);
        break;
      case 'CREATE_ORDER':
        onConvertToOrder(quoteId, version);
        break;
      default:
        break;
    }
    handleClose();
  };

  const renderDialogContent = () => {
    const { type, quoteNumber, revisionNumber } = dialogState;

    switch (type) {
      case 'SUBMIT':
        return {
          title: 'Submit Quote for Approval',
          description: `Are you sure you want to submit Quote ${quoteNumber} (Rev ${revisionNumber}) for internal review? The record will become read-only until reviewed.`,
          confirmLabel: 'Submit for Approval',
          confirmVariant: 'default',
        };
      case 'APPROVE':
        return {
          title: 'Approve Sales Quote',
          description: `Approve Quote ${quoteNumber} (Rev ${revisionNumber})? This confirms internal pricing and commercial compliance, allowing the quote to be marked as sent.`,
          confirmLabel: 'Approve Quote',
          confirmVariant: 'default',
        };
      case 'REQUEST_CHANGES':
        return {
          title: 'Request Changes on Quote',
          description: `Return Quote ${quoteNumber} (Rev ${revisionNumber}) to Draft status for revision. Please provide clear feedback to the quote creator:`,
          confirmLabel: 'Request Changes',
          confirmVariant: 'default',
          showReason: true,
          reasonPlaceholder: 'Specify required pricing, terms, or line item modifications...',
        };
      case 'MARK_SENT':
        return {
          title: 'Mark Quote as Sent',
          description: `Mark Quote ${quoteNumber} (Rev ${revisionNumber}) as sent to the customer? This transitions the record to active customer evaluation.`,
          confirmLabel: 'Mark as Sent',
          confirmVariant: 'default',
        };
      case 'ACCEPT':
        return {
          title: 'Record Customer Acceptance',
          description: `Confirm that the customer has accepted Quote ${quoteNumber} (Rev ${revisionNumber})? You can optionally record their Purchase Order reference:`,
          confirmLabel: 'Accept Quote',
          confirmVariant: 'default',
          showCustRef: true,
        };
      case 'REJECT':
        return {
          title: 'Record Customer Rejection',
          description: `Record that the customer declined Quote ${quoteNumber} (Rev ${revisionNumber})? Please provide the decision reason:`,
          confirmLabel: 'Record Rejection',
          confirmVariant: 'destructive',
          showReason: true,
          reasonPlaceholder: 'Competitor pricing, budget cancelled, scope changed...',
        };
      case 'CANCEL':
        return {
          title: 'Cancel Quote',
          description: `Cancel Quote ${quoteNumber} (Rev ${revisionNumber})? Cancelled quotes cannot be reactivated. Reason for cancellation:`,
          confirmLabel: 'Cancel Quote',
          confirmVariant: 'destructive',
          showReason: true,
          reasonPlaceholder: 'Reason for withdrawing this commercial proposal...',
        };
      case 'REVISE':
        return {
          title: 'Create New Revision',
          description: `Create Revision ${revisionNumber + 1} for Quote ${quoteNumber}? The current revision will be locked as Superseded, and a new editable Draft will be opened with copied line items.`,
          confirmLabel: 'Create Revision',
          confirmVariant: 'default',
        };
      case 'DELETE_DRAFT':
        return {
          title: 'Delete Draft Quote',
          description: `Permanently remove Draft Quote ${quoteNumber}? This action cannot be undone.`,
          confirmLabel: 'Delete Draft',
          confirmVariant: 'destructive',
        };
      case 'CREATE_ORDER':
        return {
          title: 'Convert Accepted Quote to Order',
          description: `Convert Quote ${quoteNumber} into a confirmed Sales Order? An active order will be created preserving the commercial snapshot and line items.`,
          confirmLabel: 'Create Sales Order',
          confirmVariant: 'default',
        };
      default:
        return null;
    }
  };

  const content = renderDialogContent();
  if (!content) return null;

  const isReasonRequired = dialogState.type === 'REQUEST_CHANGES' || dialogState.type === 'REJECT' || dialogState.type === 'CANCEL';
  const isSubmitDisabled = isPending || (isReasonRequired && !reason.trim());

  return (
    <AlertDialog open={Boolean(dialogState.type)} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent className="rounded-[4px] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-bold text-slate-900">
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-600 space-y-3">
            <span>{content.description}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {content.showReason && (
          <div className="py-2">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={content.reasonPlaceholder}
              rows={3}
              className="text-xs rounded-[3px] border-slate-200"
            />
          </div>
        )}

        {content.showCustRef && (
          <div className="py-2 space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700">
              Customer Purchase Order # (Optional)
            </label>
            <Input
              value={customerReference}
              onChange={(e) => setCustomerReference(e.target.value)}
              placeholder="e.g. PO-2026-9811"
              className="h-8.5 text-xs rounded-[3px] border-slate-200"
            />
          </div>
        )}

        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel onClick={handleClose} className="rounded-[3px] text-xs h-8.5">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitDisabled}
            className={`rounded-[3px] text-xs h-8.5 font-semibold ${
              content.confirmVariant === 'destructive'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {content.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
