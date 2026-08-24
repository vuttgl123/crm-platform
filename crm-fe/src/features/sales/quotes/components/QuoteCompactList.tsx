import React from 'react';
import { Link } from 'react-router-dom';
import {
  MoreHorizontal,
  ExternalLink,
  Edit3,
  Printer,
  FileText,
  CheckCircle2,
  Send,
  RotateCcw,
  ShoppingBag,
  XCircle,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { renderQuoteStatusBadge } from '@/config/crmStatusConfig';
import type { QuoteAction, QuoteSummaryItem } from '../model/quoteTypes';

interface QuoteCompactListProps {
  quotes: QuoteSummaryItem[];
  onTriggerAction: (action: QuoteAction, quote: QuoteSummaryItem) => void;
}

function formatCurrency(amount: string | number, currencyCode: string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
    maximumFractionDigits: 2,
  }).format(num);
}

export const QuoteCompactList: React.FC<QuoteCompactListProps> = ({ quotes, onTriggerAction }) => {
  return (
    <div className="space-y-2.5">
      {quotes.map((quote) => {
        const actions = quote.availableActions || [];

        return (
          <div
            key={quote.id}
            className="bg-white border border-slate-200 rounded-[4px] p-3.5 shadow-2xs space-y-2.5"
          >
            {/* Header: Title, Status, Action */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <Link
                  to={`/app/sales/quotes/${quote.id}`}
                  className="font-semibold text-slate-900 text-sm hover:text-blue-600 transition-colors block"
                >
                  {quote.name || quote.quoteNumber}
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <span>{quote.quoteNumber}</span>
                  <span>•</span>
                  <span>Rev {quote.revisionNumber}</span>
                  {quote.legacyAmountOnly && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 rounded-[2px] font-sans">
                      Legacy
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {renderQuoteStatusBadge(quote.effectiveStatus)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-[3px]">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 text-xs rounded-[4px]">
                    <DropdownMenuItem asChild>
                      <Link to={`/app/sales/quotes/${quote.id}`} className="flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Details</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/app/sales/quotes/${quote.id}/print`} target="_blank" className="flex items-center gap-2">
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print / Save PDF</span>
                      </Link>
                    </DropdownMenuItem>
                    {actions.includes('EDIT_DRAFT') && (
                      <DropdownMenuItem asChild>
                        <Link to={`/app/sales/quotes/${quote.id}/edit`} className="flex items-center gap-2">
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit Draft</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {actions.includes('SUBMIT') && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('SUBMIT', quote)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Submit for Approval</span>
                      </DropdownMenuItem>
                    )}
                    {actions.includes('APPROVE') && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('APPROVE', quote)}
                        className="flex items-center gap-2 cursor-pointer text-blue-700 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Approve Quote</span>
                      </DropdownMenuItem>
                    )}
                    {actions.includes('REQUEST_CHANGES') && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('REQUEST_CHANGES', quote)}
                        className="flex items-center gap-2 cursor-pointer text-amber-700 font-medium"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Request Changes</span>
                      </DropdownMenuItem>
                    )}
                    {actions.includes('MARK_SENT') && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('MARK_SENT', quote)}
                        className="flex items-center gap-2 cursor-pointer text-purple-700 font-medium"
                      >
                        <Send className="w-3.5 h-3.5 text-purple-600" />
                        <span>Mark as Sent</span>
                      </DropdownMenuItem>
                    )}
                    {actions.includes('ACCEPT') && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('ACCEPT', quote)}
                        className="flex items-center gap-2 cursor-pointer text-emerald-700 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Customer Accepted</span>
                      </DropdownMenuItem>
                    )}
                    {actions.includes('REJECT') && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('REJECT', quote)}
                        className="flex items-center gap-2 cursor-pointer text-rose-700"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Customer Rejected</span>
                      </DropdownMenuItem>
                    )}
                    {actions.includes('CREATE_ORDER') && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('CREATE_ORDER', quote)}
                        className="flex items-center gap-2 cursor-pointer text-emerald-800 font-semibold"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Create Order</span>
                      </DropdownMenuItem>
                    )}
                    {actions.includes('REVISE') && (
                      <DropdownMenuItem
                        onClick={() => onTriggerAction('REVISE', quote)}
                        className="flex items-center gap-2 cursor-pointer text-slate-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Create Revision</span>
                      </DropdownMenuItem>
                    )}
                    {actions.includes('CANCEL') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onTriggerAction('CANCEL', quote)}
                          className="flex items-center gap-2 cursor-pointer text-rose-600"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>Cancel Quote</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {actions.includes('DELETE_DRAFT') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onTriggerAction('DELETE_DRAFT', quote)}
                          className="flex items-center gap-2 cursor-pointer text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Delete Draft</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Account & Details */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Account</span>
                <span className="text-slate-800 font-medium truncate block">
                  {quote.account?.label || '—'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Grand Total</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(quote.amounts?.grandTotal || 0, quote.amounts?.currencyCode || 'USD')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
