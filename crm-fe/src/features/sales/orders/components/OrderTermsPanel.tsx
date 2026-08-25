import React from 'react';
import { FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { OrderFormState } from '../model/orderTypes';

interface OrderTermsPanelProps {
  formState: OrderFormState;
  onChange: (updates: Partial<OrderFormState>) => void;
  isEditable?: boolean;
}

export const OrderTermsPanel: React.FC<OrderTermsPanelProps> = ({
  formState,
  onChange,
  isEditable = true,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3 font-sans w-full">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
        <FileText className="w-4 h-4 text-slate-500" />
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Commercial Terms & Internal Notes
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-semibold text-slate-700">Payment Terms</label>
          <Input
            value={formState.paymentTerms}
            onChange={(e) => onChange({ paymentTerms: e.target.value })}
            placeholder="e.g. Net 30 Days, 50% Advance"
            className="h-8 text-xs rounded-[3px] mt-1"
            disabled={!isEditable}
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700">Delivery Terms / Incoterms</label>
          <Input
            value={formState.deliveryTerms}
            onChange={(e) => onChange({ deliveryTerms: e.target.value })}
            placeholder="e.g. FOB Origin, DAP Destination"
            className="h-8 text-xs rounded-[3px] mt-1"
            disabled={!isEditable}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="font-semibold text-slate-700">Operational & Delivery Instructions</label>
          <Textarea
            value={formState.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Specific packaging, dock hours, or handover notes..."
            className="text-xs rounded-[3px] min-h-[60px] mt-1"
            disabled={!isEditable}
          />
        </div>
      </div>
    </div>
  );
};
