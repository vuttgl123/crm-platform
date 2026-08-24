import React, { useEffect, useState } from 'react';
import { Building, User, Target, BookOpen, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { accountApi } from '@/services/api/accountApi';
import { contactApi } from '@/services/api/contactApi';
import { opportunityApi } from '@/services/api/opportunityApi';
import { catalogApi } from '@/services/api/catalogApi';
import type { QuoteFormState } from '../model/quoteTypes';

interface QuoteContextSectionProps {
  formState: QuoteFormState;
  onChange: (updates: Partial<QuoteFormState>) => void;
  isReadOnly?: boolean;
}

export const QuoteContextSection: React.FC<QuoteContextSectionProps> = ({
  formState,
  onChange,
  isReadOnly = false,
}) => {
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [opportunities, setOpportunities] = useState<{ id: string; title: string; accountId?: string }[]>([]);
  const [priceBooks, setPriceBooks] = useState<{ id: string; name: string; currencyCode: string }[]>([]);

  useEffect(() => {
    accountApi.search({ size: 100 }).then((res) => {
      setAccounts(res.items.map((a) => ({ id: a.id, name: a.displayName || a.legalName || 'Account' })));
    }).catch(() => {});

    catalogApi.listPriceBooks().then((res) => {
      setPriceBooks(res.map((pb) => ({
        id: pb.id,
        name: pb.name,
        currencyCode: pb.currency || pb.currencyCode || 'USD',
      })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (formState.accountId) {
      contactApi.search({ accountId: formState.accountId, size: 50 }).then((res) => {
        setContacts(res.items.map((c) => ({
          id: c.id,
          name: c.displayName || 'Contact',
        })));
      }).catch(() => {});

      opportunityApi.search({ accountId: formState.accountId, size: 50 }).then((res) => {
        setOpportunities(res.items.map((o) => ({ id: o.id, title: o.name || 'Opportunity', accountId: o.accountId })));
      }).catch(() => {});
    } else {
      setContacts([]);
      setOpportunities([]);
    }
  }, [formState.accountId]);

  const handleAccountChange = (accountId: string) => {
    const acc = accounts.find((a) => a.id === accountId);
    onChange({
      accountId,
      accountLabel: acc?.name || '',
      contactId: null,
      contactLabel: '',
      opportunityId: null,
      opportunityLabel: '',
      customerSnapshot: {
        ...formState.customerSnapshot,
        legalName: acc?.name || formState.customerSnapshot.legalName,
      },
    });
  };

  const handlePriceBookChange = (priceBookId: string) => {
    const pb = priceBooks.find((p) => p.id === priceBookId);
    onChange({
      priceBookId,
      priceBookLabel: pb?.name || '',
      currencyCode: pb?.currencyCode || formState.currencyCode || 'USD',
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          <span>Quote Context & Customer Reference</span>
        </h2>
        <span className="text-[11px] text-slate-400 font-mono">
          Currency: <strong className="text-slate-800 font-bold">{formState.currencyCode || 'USD'}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Quote Name */}
        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <label className="font-semibold text-slate-700">
            Quote Title / Proposal Name <span className="text-rose-500">*</span>
          </label>
          <Input
            value={formState.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Enterprise Software License & Implementation"
            disabled={isReadOnly}
            className="h-8.5 rounded-[3px] border-slate-200"
          />
        </div>

        {/* Account Selector */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-400" />
            <span>Account (Customer)</span> <span className="text-rose-500">*</span>
          </label>
          <Select
            value={formState.accountId || ''}
            onValueChange={handleAccountChange}
            disabled={isReadOnly}
          >
            <SelectTrigger className="h-8.5 rounded-[3px] border-slate-200 text-xs">
              <SelectValue placeholder="Select Account..." />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs max-h-60">
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Primary Contact */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span>Primary Contact</span>
          </label>
          <Select
            value={formState.contactId || 'none'}
            onValueChange={(val) => {
              const contactId = val === 'none' ? null : val;
              const ct = contacts.find((c) => c.id === contactId);
              onChange({
                contactId,
                contactLabel: ct?.name || '',
                customerSnapshot: {
                  ...formState.customerSnapshot,
                  contactName: ct?.name || formState.customerSnapshot.contactName,
                },
              });
            }}
            disabled={isReadOnly || !formState.accountId}
          >
            <SelectTrigger className="h-8.5 rounded-[3px] border-slate-200 text-xs">
              <SelectValue placeholder={formState.accountId ? 'Select Contact...' : 'Select Account first'} />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="none">None / Direct Org</SelectItem>
              {contacts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Related Opportunity */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <Target className="w-3 h-3 text-slate-400" />
            <span>Related Opportunity</span>
          </label>
          <Select
            value={formState.opportunityId || 'none'}
            onValueChange={(val) => {
              const opportunityId = val === 'none' ? null : val;
              const opp = opportunities.find((o) => o.id === opportunityId);
              onChange({
                opportunityId,
                opportunityLabel: opp?.title || '',
              });
            }}
            disabled={isReadOnly || !formState.accountId}
          >
            <SelectTrigger className="h-8.5 rounded-[3px] border-slate-200 text-xs">
              <SelectValue placeholder={formState.accountId ? 'Select Opportunity...' : 'Select Account first'} />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              <SelectItem value="none">None / Standalone Quote</SelectItem>
              {opportunities.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Book (Locked if Lines exist) */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-slate-400" />
            <span>Price Book</span> <span className="text-rose-500">*</span>
          </label>
          <Select
            value={formState.priceBookId || ''}
            onValueChange={handlePriceBookChange}
            disabled={isReadOnly || formState.lines.length > 0}
          >
            <SelectTrigger className="h-8.5 rounded-[3px] border-slate-200 text-xs">
              <SelectValue placeholder="Select Price Book..." />
            </SelectTrigger>
            <SelectContent className="rounded-[3px] text-xs">
              {priceBooks.map((pb) => (
                <SelectItem key={pb.id} value={pb.id}>
                  {pb.name} ({pb.currencyCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formState.lines.length > 0 && !isReadOnly && (
            <p className="text-[10px] text-slate-500 italic">
              Price book is locked while quote contains lines.
            </p>
          )}
        </div>

        {/* Issue Date */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Issue Date</span> <span className="text-rose-500">*</span>
          </label>
          <Input
            type="date"
            value={formState.issueDate}
            onChange={(e) => onChange({ issueDate: e.target.value })}
            disabled={isReadOnly}
            className="h-8.5 rounded-[3px] border-slate-200"
          />
        </div>

        {/* Valid Until */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Valid Until (Expiry)</span>
          </label>
          <Input
            type="date"
            value={formState.validUntil}
            onChange={(e) => onChange({ validUntil: e.target.value })}
            disabled={isReadOnly}
            className="h-8.5 rounded-[3px] border-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
