import React from 'react';
import { ShieldCheck, MapPin, Mail, Phone, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { QuoteCustomerSnapshot } from '../model/quoteTypes';

interface QuoteCustomerSnapshotSectionProps {
  snapshot: QuoteCustomerSnapshot;
  onChange?: (snapshot: QuoteCustomerSnapshot) => void;
  isReadOnly?: boolean;
}

export const QuoteCustomerSnapshotSection: React.FC<QuoteCustomerSnapshotSectionProps> = ({
  snapshot,
  onChange,
  isReadOnly = false,
}) => {
  const handleChange = (field: keyof QuoteCustomerSnapshot, value: string) => {
    if (!onChange) return;
    onChange({
      ...snapshot,
      [field]: value || null,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Customer Legal & Billing Snapshot
          </h2>
        </div>
        <span className="text-[10px] text-slate-400">
          Frozen for commercial document accuracy
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {/* Legal Name */}
        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <label className="font-semibold text-slate-700">Customer Legal / Display Name</label>
          <Input
            value={snapshot.legalName || ''}
            onChange={(e) => handleChange('legalName', e.target.value)}
            disabled={isReadOnly}
            placeholder="Official company name for commercial document"
            className="h-8.5 rounded-[3px] border-slate-200"
          />
        </div>

        {/* Address 1 */}
        <div className="space-y-1 sm:col-span-2">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>Billing Address Line 1</span>
          </label>
          <Input
            value={snapshot.addressLine1 || ''}
            onChange={(e) => handleChange('addressLine1', e.target.value)}
            disabled={isReadOnly}
            placeholder="Street address, building, suite..."
            className="h-8.5 rounded-[3px] border-slate-200"
          />
        </div>

        {/* Address 2 */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Address Line 2 (Optional)</label>
          <Input
            value={snapshot.addressLine2 || ''}
            onChange={(e) => handleChange('addressLine2', e.target.value)}
            disabled={isReadOnly}
            placeholder="Floor, unit, tower..."
            className="h-8.5 rounded-[3px] border-slate-200"
          />
        </div>

        {/* City */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700">City / Locality</label>
          <Input
            value={snapshot.locality || ''}
            onChange={(e) => handleChange('locality', e.target.value)}
            disabled={isReadOnly}
            placeholder="e.g. San Francisco"
            className="h-8.5 rounded-[3px] border-slate-200"
          />
        </div>

        {/* State / Province */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700">State / Province / Region</label>
          <Input
            value={snapshot.region || ''}
            onChange={(e) => handleChange('region', e.target.value)}
            disabled={isReadOnly}
            placeholder="e.g. CA"
            className="h-8.5 rounded-[3px] border-slate-200"
          />
        </div>

        {/* Postal Code & Country */}
        <div className="space-y-1 grid grid-cols-2 gap-2">
          <div>
            <label className="font-semibold text-slate-700 block">Postal Code</label>
            <Input
              value={snapshot.postalCode || ''}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              disabled={isReadOnly}
              placeholder="e.g. 94105"
              className="h-8.5 rounded-[3px] border-slate-200"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block">Country Code</label>
            <Input
              value={snapshot.countryCode || ''}
              onChange={(e) => handleChange('countryCode', e.target.value)}
              disabled={isReadOnly}
              placeholder="e.g. US"
              className="h-8.5 rounded-[3px] border-slate-200"
            />
          </div>
        </div>

        {/* Contact Name */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-slate-400" />
            <span>Recipient Contact Name</span>
          </label>
          <Input
            value={snapshot.contactName || ''}
            onChange={(e) => handleChange('contactName', e.target.value)}
            disabled={isReadOnly}
            placeholder="Attention to..."
            className="h-8.5 rounded-[3px] border-slate-200"
          />
        </div>

        {/* Contact Email */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>Contact Email</span>
          </label>
          <Input
            value={snapshot.contactEmail || ''}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            disabled={isReadOnly}
            placeholder="billing@customer.com"
            className="h-8.5 rounded-[3px] border-slate-200"
          />
        </div>

        {/* Contact Phone */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>Contact Phone</span>
          </label>
          <Input
            value={snapshot.contactPhone || ''}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            disabled={isReadOnly}
            placeholder="+1 (555) 000-0000"
            className="h-8.5 rounded-[3px] border-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
