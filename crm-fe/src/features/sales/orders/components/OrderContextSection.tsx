import React, { useState, useEffect } from 'react';
import { Building, User, BookOpen, Calendar } from 'lucide-react';
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
import { catalogApi } from '@/services/api/catalogApi';
import type { OrderFormState } from '../model/orderTypes';

interface OrderContextSectionProps {
  formState: OrderFormState;
  onChange: (updates: Partial<OrderFormState>) => void;
  isQuoteDerived?: boolean;
}

export const OrderContextSection: React.FC<OrderContextSectionProps> = ({
  formState,
  onChange,
  isQuoteDerived = false,
}) => {
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string }>>([]);
  const [contacts, setContacts] = useState<Array<{ id: string; name: string }>>([]);
  const [priceBooks, setPriceBooks] = useState<Array<{ id: string; name: string; currencyCode: string }>>([]);

  useEffect(() => {
    accountApi
      .search({ size: 100 })
      .then((res) => {
        setAccounts(res.items.map((a) => ({ id: a.id, name: a.displayName || a.legalName || 'Account' })));
      })
      .catch(() => {});

    catalogApi
      .listPriceBooks()
      .then((res) => {
        setPriceBooks(
          res.map((pb) => ({
            id: pb.id,
            name: pb.name,
            currencyCode: pb.currency || pb.currencyCode || 'USD',
          }))
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (formState.accountId) {
      contactApi
        .search({ accountId: formState.accountId, size: 50 })
        .then((res) => {
          setContacts(
            res.items.map((c) => ({
              id: c.id,
              name: c.displayName || 'Contact',
            }))
          );
        })
        .catch(() => {});
    } else {
      setContacts([]);
    }
  }, [formState.accountId]);

  const handlePriceBookChange = (pbId: string) => {
    const selected = priceBooks.find((pb) => pb.id === pbId);
    onChange({
      priceBookId: pbId,
      currencyCode: selected?.currencyCode || 'USD',
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-4 font-sans w-full">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Building className="w-4 h-4 text-blue-600" />
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Customer & Commercial Context
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Account */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Account *</span>
          </label>
          <Select
            value={formState.accountId || ''}
            onValueChange={(val) => onChange({ accountId: val, contactId: '' })}
            disabled={isQuoteDerived}
          >
            <SelectTrigger className="h-8 text-xs rounded-[3px]">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px]">
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id} className="text-xs">
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 2. Contact */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Primary Contact</span>
          </label>
          <Select
            value={formState.contactId || ''}
            onValueChange={(val) => onChange({ contactId: val })}
            disabled={!formState.accountId}
          >
            <SelectTrigger className="h-8 text-xs rounded-[3px]">
              <SelectValue placeholder={formState.accountId ? 'Select Contact' : 'Select Account first'} />
            </SelectTrigger>
            <SelectContent className="rounded-[3px]">
              {contacts.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Price Book & Currency */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Price Book ({formState.currencyCode || 'USD'})</span>
          </label>
          <Select
            value={formState.priceBookId || ''}
            onValueChange={handlePriceBookChange}
            disabled={isQuoteDerived}
          >
            <SelectTrigger className="h-8 text-xs rounded-[3px]">
              <SelectValue placeholder="Select Price Book" />
            </SelectTrigger>
            <SelectContent className="rounded-[3px]">
              {priceBooks.map((pb) => (
                <SelectItem key={pb.id} value={pb.id} className="text-xs">
                  {pb.name} ({pb.currencyCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Order Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Order Date *</span>
          </label>
          <Input
            type="date"
            value={formState.orderDate}
            onChange={(e) => onChange({ orderDate: e.target.value })}
            className="h-8 text-xs rounded-[3px]"
            required
          />
        </div>

        {/* 5. Requested Delivery Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Requested Delivery Date</span>
          </label>
          <Input
            type="date"
            value={formState.requestedDeliveryDate}
            onChange={(e) => onChange({ requestedDeliveryDate: e.target.value })}
            className="h-8 text-xs rounded-[3px]"
          />
        </div>

        {/* 6. Customer Reference */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Customer PO / Reference</label>
          <Input
            placeholder="e.g. PO-987452"
            value={formState.customerReference}
            onChange={(e) => onChange({ customerReference: e.target.value })}
            className="h-8 text-xs rounded-[3px]"
          />
        </div>
      </div>
    </div>
  );
};
