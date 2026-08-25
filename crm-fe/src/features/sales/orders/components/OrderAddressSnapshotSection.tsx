import React from 'react';
import { MapPin, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { OrderFormState } from '../model/orderTypes';

interface OrderAddressSnapshotSectionProps {
  formState: OrderFormState;
  onChange: (updates: Partial<OrderFormState>) => void;
}

export const OrderAddressSnapshotSection: React.FC<OrderAddressSnapshotSectionProps> = ({
  formState,
  onChange,
}) => {
  const handleCopyBillingToShipping = () => {
    onChange({
      shippingAddressSnapshot: { ...formState.billingAddressSnapshot },
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans w-full">
      {/* 1. Billing Address Snapshot */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <MapPin className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Billing Address Snapshot
          </h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Legal Entity Name *</label>
            <Input
              value={formState.billingAddressSnapshot.legalName}
              onChange={(e) =>
                onChange({
                  billingAddressSnapshot: {
                    ...formState.billingAddressSnapshot,
                    legalName: e.target.value,
                  },
                })
              }
              className="h-8 text-xs rounded-[3px] mt-1"
              placeholder="e.g. Acme Corp LLC"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Address Line 1</label>
            <Input
              value={formState.billingAddressSnapshot.addressLine1}
              onChange={(e) =>
                onChange({
                  billingAddressSnapshot: {
                    ...formState.billingAddressSnapshot,
                    addressLine1: e.target.value,
                  },
                })
              }
              className="h-8 text-xs rounded-[3px] mt-1"
              placeholder="Street address, building, suite"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700">City / Locality</label>
              <Input
                value={formState.billingAddressSnapshot.locality}
                onChange={(e) =>
                  onChange({
                    billingAddressSnapshot: {
                      ...formState.billingAddressSnapshot,
                      locality: e.target.value,
                    },
                  })
                }
                className="h-8 text-xs rounded-[3px] mt-1"
                placeholder="City"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">State / Region</label>
              <Input
                value={formState.billingAddressSnapshot.region}
                onChange={(e) =>
                  onChange({
                    billingAddressSnapshot: {
                      ...formState.billingAddressSnapshot,
                      region: e.target.value,
                    },
                  })
                }
                className="h-8 text-xs rounded-[3px] mt-1"
                placeholder="Region"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700">Contact Person</label>
              <Input
                value={formState.billingAddressSnapshot.contactName}
                onChange={(e) =>
                  onChange({
                    billingAddressSnapshot: {
                      ...formState.billingAddressSnapshot,
                      contactName: e.target.value,
                    },
                  })
                }
                className="h-8 text-xs rounded-[3px] mt-1"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Phone</label>
              <Input
                value={formState.billingAddressSnapshot.contactPhone}
                onChange={(e) =>
                  onChange({
                    billingAddressSnapshot: {
                      ...formState.billingAddressSnapshot,
                      contactPhone: e.target.value,
                    },
                  })
                }
                className="h-8 text-xs rounded-[3px] mt-1"
                placeholder="+1 555-0199"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Shipping Address Snapshot */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Shipping / Handover Address
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyBillingToShipping}
            className="h-6 text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-2 gap-1"
          >
            <Copy className="w-3 h-3" />
            <span>Copy Billing</span>
          </Button>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Recipient / Delivery Site *</label>
            <Input
              value={formState.shippingAddressSnapshot.legalName}
              onChange={(e) =>
                onChange({
                  shippingAddressSnapshot: {
                    ...formState.shippingAddressSnapshot,
                    legalName: e.target.value,
                  },
                })
              }
              className="h-8 text-xs rounded-[3px] mt-1"
              placeholder="e.g. Acme Warehouse Site 3"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Delivery Address</label>
            <Input
              value={formState.shippingAddressSnapshot.addressLine1}
              onChange={(e) =>
                onChange({
                  shippingAddressSnapshot: {
                    ...formState.shippingAddressSnapshot,
                    addressLine1: e.target.value,
                  },
                })
              }
              className="h-8 text-xs rounded-[3px] mt-1"
              placeholder="Street address, bay, dock number"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700">City / Locality</label>
              <Input
                value={formState.shippingAddressSnapshot.locality}
                onChange={(e) =>
                  onChange({
                    shippingAddressSnapshot: {
                      ...formState.shippingAddressSnapshot,
                      locality: e.target.value,
                    },
                  })
                }
                className="h-8 text-xs rounded-[3px] mt-1"
                placeholder="City"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">State / Region</label>
              <Input
                value={formState.shippingAddressSnapshot.region}
                onChange={(e) =>
                  onChange({
                    shippingAddressSnapshot: {
                      ...formState.shippingAddressSnapshot,
                      region: e.target.value,
                    },
                  })
                }
                className="h-8 text-xs rounded-[3px] mt-1"
                placeholder="Region"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700">Recipient Contact</label>
              <Input
                value={formState.shippingAddressSnapshot.contactName}
                onChange={(e) =>
                  onChange({
                    shippingAddressSnapshot: {
                      ...formState.shippingAddressSnapshot,
                      contactName: e.target.value,
                    },
                  })
                }
                className="h-8 text-xs rounded-[3px] mt-1"
                placeholder="Receiving Manager"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Contact Phone</label>
              <Input
                value={formState.shippingAddressSnapshot.contactPhone}
                onChange={(e) =>
                  onChange({
                    shippingAddressSnapshot: {
                      ...formState.shippingAddressSnapshot,
                      contactPhone: e.target.value,
                    },
                  })
                }
                className="h-8 text-xs rounded-[3px] mt-1"
                placeholder="+1 555-0199"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
