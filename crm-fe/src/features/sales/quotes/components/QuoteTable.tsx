import React from 'react';
import { Link } from 'react-router-dom';
import {
  MoreHorizontal,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Printer,
  ShoppingBag,
  Trash2,
  Edit3,
  ExternalLink,
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

interface QuoteTableProps {
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

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export const QuoteTable: React.FC<QuoteTableProps> = ({ quotes, onTriggerAction }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Quote & Revision</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4">Opportunity</th>
              <th className="py-3 px-4 text-right">Grand Total</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Valid Until</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {quotes.map((quote) => {
              const actions = quote.availableActions || [];

              return (
                <tr
                  key={quote.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Quote & Revision */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/app/sales/quotes/${quote.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {quote.name || quote.quoteNumber}
                        </Link>
                        {quote.legacyAmountOnly && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 rounded-[2px] bg-slate-100 text-slate-500 font-normal"
                          >
                            Legacy
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="font-mono">{quote.quoteNumber}</span>
                        <span>•</span>
                        <span className="font-mono font-medium text-slate-600">
                          Rev {quote.revisionNumber}
                        </span>
                        {!quote.latestRevision && (
                          <span className="text-[10px] text-slate-400 italic">
                            (Superseded)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Account */}
                  <td className="py-3 px-4">
                    {quote.account ? (
                      <Link
                        to={`/app/crm/accounts/${quote.account.id}`}
                        className="font-medium text-slate-800 hover:text-blue-600 transition-colors truncate block max-w-[160px]"
                      >
                        {quote.account.label}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Opportunity */}
                  <td className="py-3 px-4">
                    {quote.opportunity ? (
                      <Link
                        to={`/app/crm/opportunities/${quote.opportunity.id}`}
                        className="text-slate-600 hover:text-blue-600 transition-colors truncate block max-w-[140px]"
                      >
                        {quote.opportunity.label}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Grand Total */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(quote.amounts?.grandTotal || 0, quote.amounts?.currencyCode || 'USD')}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    {renderQuoteStatusBadge(quote.effectiveStatus)}
                  </td>

                  {/* Valid Until */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-slate-700">{formatDate(quote.validUntil)}</span>
                  </td>

                  {/* Owner */}
                  <td className="py-3 px-4 text-slate-600 truncate max-w-[120px]">
                    {quote.owner?.label || 'Unassigned'}
                  </td>

                  {/* Updated At */}
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {formatDate(quote.updatedAt)}
                  </td>

                  {/* Action Menu */}
                  <td className="py-3 px-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-[3px] text-slate-500 hover:text-slate-900"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 text-xs rounded-[4px]">
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/app/sales/quotes/${quote.id}`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Details</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            to={`/app/sales/quotes/${quote.id}/print`}
                            target="_blank"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            <span>Print / Save PDF</span>
                          </Link>
                        </DropdownMenuItem>

                        {actions.includes('EDIT_DRAFT') && (
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/app/sales/quotes/${quote.id}/edit`}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit Draft</span>
                            </Link>
                          </DropdownMenuItem>
                        )}

                        {actions.includes('SUBMIT') && (
                          <DropdownMenuItem
                            onClick={() => onTriggerAction('SUBMIT', quote)}
                            className="flex items-center gap-2 cursor-pointer text-slate-800"
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
