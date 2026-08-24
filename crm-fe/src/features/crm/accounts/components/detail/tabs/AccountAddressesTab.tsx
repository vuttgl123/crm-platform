import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  accountAddressSchema,
  AccountAddressSchemaValues,
} from '../../../model/accountSchemas';
import {
  AccountAddressResponse,
  ACCOUNT_ADDRESS_TYPE_CONFIG,
} from '@/services/api/accountAddressApi';
import {
  useAccountAddressesQuery,
  useCreateAccountAddressMutation,
  useUpdateAccountAddressMutation,
  useEndAccountAddressMutation,
} from '../../../hooks/accountQueries';
import { mapAccountError } from '../../../model/accountErrors';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  MapPin,
  Plus,
  Edit,
  PowerOff,
  Star,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface AccountAddressesTabProps {
  accountId: string;
  canWrite: boolean;
}

export const AccountAddressesTab: React.FC<AccountAddressesTabProps> = ({
  accountId,
  canWrite,
}) => {
  const [includeHistory, setIncludeHistory] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AccountAddressResponse | null>(null);
  const [endTarget, setEndTarget] = useState<AccountAddressResponse | null>(null);

  const {
    data: addresses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAccountAddressesQuery(accountId, { includeHistory });

  const createMutation = useCreateAccountAddressMutation(accountId);
  const updateMutation = useUpdateAccountAddressMutation(accountId);
  const endMutation = useEndAccountAddressMutation(accountId);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<AccountAddressSchemaValues>({
    resolver: zodResolver(accountAddressSchema),
    defaultValues: {
      addressType: 'BILLING',
      addressLine1: '',
      addressLine2: '',
      locality: '',
      administrativeArea: '',
      postalCode: '',
      countryCode: '',
      isPrimary: false,
    },
  });

  const handleOpenCreate = () => {
    setEditingAddress(null);
    reset({
      addressType: 'BILLING',
      addressLine1: '',
      addressLine2: '',
      locality: '',
      administrativeArea: '',
      postalCode: '',
      countryCode: '',
      isPrimary: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: AccountAddressResponse) => {
    setEditingAddress(addr);
    reset({
      addressType: addr.addressType,
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      locality: addr.locality || '',
      administrativeArea: addr.administrativeArea || '',
      postalCode: addr.postalCode || '',
      countryCode: addr.countryCode || '',
      isPrimary: Boolean(addr.isPrimary),
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (data: AccountAddressSchemaValues) => {
    try {
      if (editingAddress) {
        await updateMutation.mutateAsync({
          addressId: editingAddress.id,
          version: editingAddress.version,
          data: {
            addressType: data.addressType,
            addressLine1: data.addressLine1 || null,
            addressLine2: data.addressLine2 || null,
            locality: data.locality || null,
            administrativeArea: data.administrativeArea || null,
            postalCode: data.postalCode || null,
            countryCode: data.countryCode.toUpperCase(),
            isPrimary: data.isPrimary,
          },
        });
        toast.success('Address updated');
      } else {
        await createMutation.mutateAsync({
          addressType: data.addressType,
          addressLine1: data.addressLine1 || null,
          addressLine2: data.addressLine2 || null,
          locality: data.locality || null,
          administrativeArea: data.administrativeArea || null,
          postalCode: data.postalCode || null,
          countryCode: data.countryCode.toUpperCase(),
          isPrimary: data.isPrimary,
        });
        toast.success('Address added');
      }
      setModalOpen(false);
    } catch (err: any) {
      const errorMapping = mapAccountError(err);
      toast.error(errorMapping.title, { description: errorMapping.description });
    }
  };

  const handleConfirmEnd = async () => {
    if (!endTarget) return;
    try {
      await endMutation.mutateAsync({
        addressId: endTarget.id,
        version: endTarget.version,
      });
      toast.success('Address marked as ended');
      setEndTarget(null);
    } catch (err: any) {
      const errorMapping = mapAccountError(err);
      toast.error(errorMapping.title, { description: errorMapping.description });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Tab Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-[4px]">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium select-none">
          <Checkbox
            checked={includeHistory}
            onCheckedChange={(checked) => setIncludeHistory(Boolean(checked))}
          />
          <span>Include historical / ended addresses</span>
        </label>

        {canWrite && (
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </Button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-12 bg-white rounded-[4px] border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Loading address records…</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="py-8 bg-white border border-slate-200 rounded-[4px] p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Failed to load addresses</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || 'An unexpected error occurred while loading addresses.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-[3px]">
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && addresses.length === 0 && (
        <div className="py-12 bg-white rounded-[4px] border border-slate-200 text-center space-y-2 shadow-2xs">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No addresses on file</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add billing, shipping, or office addresses for this account.
          </p>
          {canWrite && (
            <div className="pt-2">
              <Button size="sm" onClick={handleOpenCreate} className="rounded-[3px]">
                Add Address
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Address Cards Grid */}
      {!isLoading && !isError && addresses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const config = ACCOUNT_ADDRESS_TYPE_CONFIG[addr.addressType] || {
              label: addr.addressType,
              badge: addr.addressType,
              color: 'bg-slate-50 text-slate-700 border-slate-200',
            };

            const isEnded = Boolean(addr.validTo);

            return (
              <div
                key={addr.id}
                className={`p-4 rounded-[4px] border ${
                  isEnded ? 'bg-slate-50/70 border-slate-200 opacity-80' : 'bg-white border-slate-200 shadow-2xs'
                } space-y-3`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge className={`text-[10px] rounded-[2px] uppercase font-bold tracking-wider px-1.5 py-0.5 ${config.color}`}>
                      {config.badge}
                    </Badge>
                    {addr.isPrimary && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-[2px]">
                        <Star className="w-2.5 h-2.5 fill-blue-600 text-blue-600" />
                        PRIMARY
                      </span>
                    )}
                    {isEnded && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-[2px]">
                        ENDED
                      </span>
                    )}
                  </div>

                  {canWrite && !isEnded && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(addr)}
                        className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 rounded-[3px]"
                        aria-label="Edit address"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEndTarget(addr)}
                        className="h-7 w-7 p-0 text-slate-600 hover:text-rose-600 rounded-[3px]"
                        aria-label="End address"
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-slate-800">
                  {addr.addressLine1 && (
                    <p className="font-semibold text-xs text-slate-900">{addr.addressLine1}</p>
                  )}
                  {addr.addressLine2 && <p className="text-slate-600">{addr.addressLine2}</p>}
                  <p className="text-slate-700 font-medium">
                    {[addr.locality, addr.administrativeArea, addr.postalCode].filter(Boolean).join(', ')}
                  </p>
                  <p className="font-mono text-[11px] font-bold text-slate-900">
                    Country: {addr.countryCode}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Address Modal */}
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent className="max-w-md font-sans">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-slate-900">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-600">
                Specify official address details for commercial correspondence and billing.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">Address Type *</Label>
                  <Select
                    value={watch('addressType')}
                    onValueChange={(val) => setValue('addressType', val as any)}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="h-8 text-xs rounded-[3px] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs rounded-[3px]">
                      <SelectItem value="BILLING">Billing Address</SelectItem>
                      <SelectItem value="SHIPPING">Shipping Address</SelectItem>
                      <SelectItem value="OFFICE">Office / Branch</SelectItem>
                      <SelectItem value="REGISTERED">Registered Business Address</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="countryCode" className="text-xs font-semibold text-slate-800">
                    Country Code (2 Letters) *
                  </Label>
                  <Input
                    id="countryCode"
                    {...register('countryCode')}
                    disabled={isSaving}
                    placeholder="US, VN, SG, DE"
                    className="h-8 text-xs font-mono uppercase rounded-[3px]"
                  />
                  {errors.countryCode && (
                    <p className="text-[11px] text-rose-600">{errors.countryCode.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="addressLine1" className="text-xs font-semibold text-slate-800">
                  Address Line 1
                </Label>
                <Input
                  id="addressLine1"
                  {...register('addressLine1')}
                  disabled={isSaving}
                  placeholder="Street address, building, suite"
                  className="h-8 text-xs rounded-[3px]"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="addressLine2" className="text-xs font-semibold text-slate-800">
                  Address Line 2
                </Label>
                <Input
                  id="addressLine2"
                  {...register('addressLine2')}
                  disabled={isSaving}
                  placeholder="Apartment, unit, floor"
                  className="h-8 text-xs rounded-[3px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="locality" className="text-[11px] font-semibold text-slate-800">
                    City / Locality
                  </Label>
                  <Input
                    id="locality"
                    {...register('locality')}
                    disabled={isSaving}
                    placeholder="City"
                    className="h-8 text-xs rounded-[3px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="administrativeArea" className="text-[11px] font-semibold text-slate-800">
                    State / Region
                  </Label>
                  <Input
                    id="administrativeArea"
                    {...register('administrativeArea')}
                    disabled={isSaving}
                    placeholder="State"
                    className="h-8 text-xs rounded-[3px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="postalCode" className="text-[11px] font-semibold text-slate-800">
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    {...register('postalCode')}
                    disabled={isSaving}
                    placeholder="ZIP"
                    className="h-8 text-xs font-mono rounded-[3px]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 select-none">
                  <Checkbox
                    checked={watch('isPrimary')}
                    onCheckedChange={(checked) => setValue('isPrimary', Boolean(checked))}
                    disabled={isSaving}
                  />
                  <span>Mark as Primary Address</span>
                </label>
              </div>
            </div>

            <AlertDialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSaving}
                onClick={() => setModalOpen(false)}
                className="h-8 text-xs rounded-[3px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="h-8 px-4 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingAddress ? 'Save Changes' : 'Add Address'}</span>
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Address Confirmation Dialog */}
      <AlertDialog open={Boolean(endTarget)} onOpenChange={(open) => !open && setEndTarget(null)}>
        <AlertDialogContent className="max-w-md font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              End Address Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              This will transition this address to ended/historical status. It will no longer appear as active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={endMutation.isPending}
              onClick={() => setEndTarget(null)}
              className="h-8 text-xs rounded-[3px]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={endMutation.isPending}
              onClick={handleConfirmEnd}
              className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[3px]"
            >
              {endMutation.isPending ? 'Ending…' : 'End Address'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
