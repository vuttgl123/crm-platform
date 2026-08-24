import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Printer,
  Edit3,
  FileText,
  CheckCircle2,
  Send,
  XCircle,
  RotateCcw,
  ShoppingBag,
  Trash2,
  Building,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { renderQuoteStatusBadge } from '@/config/crmStatusConfig';
import type { QuoteAction, QuoteDetailResponse } from '../model/quoteTypes';

interface QuoteDetailHeaderProps {
  quote: QuoteDetailResponse;
  onTriggerAction: (action: QuoteAction) => void;
}

export const QuoteDetailHeader: React.FC<QuoteDetailHeaderProps> = ({ quote, onTriggerAction }) => {
  const actions = quote.availableActions || [];

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/sales/quotes"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Quotes</span>
        </Link>

        {/* Print / Output Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 rounded-[3px] text-xs font-medium border-slate-200 gap-1.5"
          >
            <Link to={`/app/sales/quotes/${quote.id}/print`} target="_blank">
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print / Save PDF</span>
            </Link>
          </Button>

          {/* Primary Action Button */}
          {actions.includes('EDIT_DRAFT') && (
            <Button
              size="sm"
              asChild
              className="h-8 rounded-[3px] text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
            >
              <Link to={`/app/sales/quotes/${quote.id}/edit`}>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Draft</span>
              </Link>
            </Button>
          )}

          {actions.includes('SUBMIT') && (
            <Button
              size="sm"
              onClick={() => onTriggerAction('SUBMIT')}
              className="h-8 rounded-[3px] text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Submit for Approval</span>
            </Button>
          )}

          {actions.includes('APPROVE') && (
            <Button
              size="sm"
              onClick={() => onTriggerAction('APPROVE')}
              className="h-8 rounded-[3px] text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Quote</span>
            </Button>
          )}

          {actions.includes('MARK_SENT') && (
            <Button
              size="sm"
              onClick={() => onTriggerAction('MARK_SENT')}
              className="h-8 rounded-[3px] text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Mark as Sent</span>
            </Button>
          )}

          {actions.includes('ACCEPT') && (
            <Button
              size="sm"
              onClick={() => onTriggerAction('ACCEPT')}
              className="h-8 rounded-[3px] text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Customer Accepted</span>
            </Button>
          )}

          {actions.includes('CREATE_ORDER') && (
            <Button
              size="sm"
              onClick={() => onTriggerAction('CREATE_ORDER')}
              className="h-8 rounded-[3px] text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Create Order</span>
            </Button>
          )}

          {/* Overflow Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 rounded-[3px] text-xs border-slate-200 px-2.5">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs rounded-[4px]">
              {actions.includes('REQUEST_CHANGES') && (
                <DropdownMenuItem
                  onClick={() => onTriggerAction('REQUEST_CHANGES')}
                  className="flex items-center gap-2 cursor-pointer text-amber-700 font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Request Changes</span>
                </DropdownMenuItem>
              )}

              {actions.includes('REVISE') && (
                <DropdownMenuItem
                  onClick={() => onTriggerAction('REVISE')}
                  className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Create Revision</span>
                </DropdownMenuItem>
              )}

              {actions.includes('REJECT') && (
                <DropdownMenuItem
                  onClick={() => onTriggerAction('REJECT')}
                  className="flex items-center gap-2 cursor-pointer text-rose-700"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Customer Rejected</span>
                </DropdownMenuItem>
              )}

              {actions.includes('CANCEL') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onTriggerAction('CANCEL')}
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
                    onClick={() => onTriggerAction('DELETE_DRAFT')}
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

      {/* Main Title & Status Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {quote.name || quote.quoteNumber}
            </h1>
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-[3px] border border-slate-200">
              {quote.quoteNumber}
            </span>
            <Badge variant="outline" className="text-xs font-mono font-bold bg-slate-50 text-slate-800 rounded-[3px]">
              Rev {quote.revisionNumber}
            </Badge>
            {renderQuoteStatusBadge(quote.storedStatus, quote.effectiveStatus)}
            {quote.legacyAmountOnly && (
              <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 rounded-[2px]">
                Legacy Mode
              </Badge>
            )}
            {!quote.latestRevision && (
              <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200 rounded-[2px]">
                Superseded Version
              </Badge>
            )}
          </div>
        </div>

        {/* Related Entity Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {quote.account && (
            <Link
              to={`/app/crm/accounts/${quote.account.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium truncate max-w-[150px]">{quote.account.label}</span>
            </Link>
          )}

          {quote.opportunity && (
            <Link
              to={`/app/crm/opportunities/${quote.opportunity.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              <Target className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium truncate max-w-[150px]">{quote.opportunity.label}</span>
            </Link>
          )}

          {quote.relatedOrderId && (
            <Link
              to={`/app/sales/orders/${quote.relatedOrderId}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-emerald-50 border border-emerald-200 text-emerald-800 hover:underline font-semibold"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Related Order</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
