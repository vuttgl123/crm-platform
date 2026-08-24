import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountFormSchema, AccountFormSchemaValues } from '../model/accountSchemas';
import { AccountFormValues, AccountEditorMode } from '../model/accountTypes';
import { useAuth } from '@/core/session/useAuth';
import { useParentAccountOptionsQuery } from '../hooks/accountQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Check,
  ChevronsUpDown,
  DollarSign,
  Globe,
  Loader2,
  Search,
  ShieldCheck,
  User,
  X,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOwnerResolver } from '../hooks/useOwnerResolver';

interface AccountFormProps {
  mode: AccountEditorMode;
  initialValues: AccountFormValues;
  accountId?: string | null;
  isSubmitting: boolean;
  onSave: (values: AccountFormValues) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  mode,
  initialValues,
  accountId,
  isSubmitting,
  onSave,
  onCancel,
  onDirtyChange,
}) => {
  const { session } = useAuth();
  const { resolveOwner } = useOwnerResolver();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AccountFormSchemaValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: initialValues as any,
  });

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const watchDoNotContact = watch('doNotContact');
  const watchOwner = watch('owner');
  const watchParentId = watch('parentAccountId');

  // Parent Account Picker State
  const [parentPickerOpen, setParentPickerOpen] = React.useState(false);
  const [parentSearch, setParentSearch] = React.useState('');
  const { data: parentOptions = [], isLoading: isLoadingParents } =
    useParentAccountOptionsQuery(parentSearch, accountId);

  const selectedParentName =
    parentOptions.find((p) => p.id === watchParentId)?.displayName ||
    (watchParentId ? `Account (${watchParentId.slice(0, 8)}…)` : null);

  const currentUserId = session?.user?.id;
  const currentTeamId = session?.assignedTeam?.id;
  const currentTeamName = session?.assignedTeam?.name || 'My Team';

  const isInitialOwnerExternal = Boolean(
    initialValues.owner?.id &&
      initialValues.owner.id !== currentUserId &&
      initialValues.owner.id !== currentTeamId
  );

  const handleFormSubmit = (data: AccountFormSchemaValues) => {
    onSave(data as AccountFormValues);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 text-xs font-sans">
      {/* SECTION 1: IDENTITY & NAMING */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="text-xs uppercase tracking-wider">Identity & Naming</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Account Number */}
          <div className="space-y-1">
            <Label htmlFor="accountNumber" className="text-xs font-semibold text-slate-800">
              Account Number <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="accountNumber"
              {...register('accountNumber')}
              disabled={mode === 'edit' || isSubmitting}
              placeholder="e.g. ACC-2026-001"
              className="h-8 text-xs font-mono font-bold bg-white rounded-[3px]"
            />
            {errors.accountNumber && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.accountNumber.message}</p>
            )}
            {mode === 'edit' && (
              <p className="text-[10px] text-slate-400">Account number is permanent and immutable.</p>
            )}
          </div>

          {/* Display Name */}
          <div className="space-y-1">
            <Label htmlFor="displayName" className="text-xs font-semibold text-slate-800">
              Display Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="displayName"
              {...register('displayName')}
              disabled={isSubmitting}
              placeholder="e.g. Acme Corporation"
              className="h-8 text-xs font-semibold bg-white rounded-[3px]"
            />
            {errors.displayName && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.displayName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Legal Name */}
          <div className="space-y-1">
            <Label htmlFor="legalName" className="text-xs font-semibold text-slate-800">
              Legal Registered Name
            </Label>
            <Input
              id="legalName"
              {...register('legalName')}
              disabled={isSubmitting}
              placeholder="e.g. Acme Holdings Inc."
              className="h-8 text-xs rounded-[3px]"
            />
          </div>

          {/* Account Type */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-800">
              Account Type <span className="text-rose-500">*</span>
            </Label>
            <Controller
              control={control}
              name="accountType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-8 text-xs bg-white rounded-[3px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="text-xs rounded-[3px]">
                    <SelectItem value="ORGANIZATION">Organization</SelectItem>
                    <SelectItem value="PERSON">Person</SelectItem>
                    <SelectItem value="PARTNER">Partner</SelectItem>
                    <SelectItem value="RESELLER">Reseller</SelectItem>
                    <SelectItem value="SUPPLIER">Supplier</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.accountType && (
              <p className="text-[11px] text-rose-600">{errors.accountType.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: CLASSIFICATION & HIERARCHY */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <Globe className="w-4 h-4 text-purple-600" />
          <span className="text-xs uppercase tracking-wider">Classification & Hierarchy</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Lifecycle Stage */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-800">
              Lifecycle Stage <span className="text-rose-500">*</span>
            </Label>
            <Controller
              control={control}
              name="lifecycleStage"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-8 text-xs bg-white rounded-[3px]">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent className="text-xs rounded-[3px]">
                    <SelectItem value="PROSPECT">Prospect</SelectItem>
                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="CHURNED">Churned</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.lifecycleStage && (
              <p className="text-[11px] text-rose-600">{errors.lifecycleStage.message}</p>
            )}
          </div>

          {/* Industry Code */}
          <div className="space-y-1">
            <Label htmlFor="industryCode" className="text-xs font-semibold text-slate-800">
              Industry Code / Sector
            </Label>
            <Input
              id="industryCode"
              {...register('industryCode')}
              disabled={isSubmitting}
              placeholder="e.g. SAAS, FINTECH, MANUFACTURING"
              className="h-8 text-xs font-mono uppercase rounded-[3px]"
            />
          </div>
        </div>

        {/* Parent Account Association */}
        <div className="space-y-1 pt-1">
          <Label className="text-xs font-semibold text-slate-800">
            Parent Account (Hierarchy)
          </Label>
          <Popover open={parentPickerOpen} onOpenChange={setParentPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={parentPickerOpen}
                disabled={isSubmitting}
                className={cn(
                  'w-full justify-between h-8 text-xs font-normal bg-white border-slate-200 rounded-[3px] hover:bg-slate-50',
                  !watchParentId && 'text-slate-400'
                )}
              >
                <span className="truncate">
                  {selectedParentName || 'None (Root Account)'}
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {watchParentId && !isSubmitting && (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setValue('parentAccountId', null, { shouldDirty: true });
                      }}
                      className="p-0.5 rounded-[2px] hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                      title="Clear parent"
                    >
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0 shadow-lg border-slate-200 rounded-[4px]" align="start">
              <div className="p-2 border-b border-slate-100 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <Input
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  placeholder="Search parent accounts…"
                  className="h-8 text-xs border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 shadow-none rounded-[3px]"
                  autoFocus
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto p-1 text-xs">
                {isLoadingParents ? (
                  <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching parent accounts…</span>
                  </div>
                ) : parentOptions.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 italic">
                    No matching accounts found
                  </div>
                ) : (
                  parentOptions.map((opt) => {
                    const isSelected = watchParentId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setValue('parentAccountId', opt.id, { shouldDirty: true });
                          setParentPickerOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-2.5 py-1.5 rounded-[3px] text-left transition-colors',
                          isSelected
                            ? 'bg-blue-50 text-blue-900 font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        )}
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="truncate">{opt.displayName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {opt.accountNumber}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
          {errors.parentAccountId && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.parentAccountId.message}</p>
          )}
        </div>
      </div>

      {/* SECTION 3: OWNERSHIP */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs uppercase tracking-wider">Ownership Assignment</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
            <input
              type="radio"
              name="ownershipOption"
              checked={!watchOwner}
              onChange={() => setValue('owner', null, { shouldDirty: true })}
              disabled={isSubmitting}
              className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
            />
            <span>Unassigned</span>
          </label>

          {currentUserId && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="radio"
                name="ownershipOption"
                checked={watchOwner?.type === 'USER' && watchOwner?.id === currentUserId}
                onChange={() =>
                  setValue('owner', { type: 'USER', id: currentUserId }, { shouldDirty: true })
                }
                disabled={isSubmitting}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span>
                Assign to Me{' '}
                {session?.user?.display_name || (session?.user as any)?.displayName
                  ? `(${session?.user?.display_name || (session?.user as any)?.displayName})`
                  : ''}
              </span>
            </label>
          )}

          {currentTeamId && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="radio"
                name="ownershipOption"
                checked={watchOwner?.type === 'TEAM' && watchOwner?.id === currentTeamId}
                onChange={() =>
                  setValue('owner', { type: 'TEAM', id: currentTeamId }, { shouldDirty: true })
                }
                disabled={isSubmitting}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span>Assign to {currentTeamName}</span>
            </label>
          )}

          {isInitialOwnerExternal && initialValues.owner && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="radio"
                name="ownershipOption"
                checked={
                  watchOwner?.type === initialValues.owner.type &&
                  watchOwner?.id === initialValues.owner.id
                }
                onChange={() => setValue('owner', initialValues.owner, { shouldDirty: true })}
                disabled={isSubmitting}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span>
                Retain Assigned Owner: {resolveOwner(initialValues.owner).label}
              </span>
            </label>
          )}
        </div>
      </div>

      {/* SECTION 4: COMMERCIAL & FINANCIAL */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span className="text-xs uppercase tracking-wider">Commercial & Financial</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Annual Revenue Amount */}
          <div className="space-y-1">
            <Label htmlFor="annualRevenueAmount" className="text-xs font-semibold text-slate-800">
              Annual Revenue Amount
            </Label>
            <Controller
              control={control}
              name="annualRevenueAmount"
              render={({ field }) => (
                <Input
                  id="annualRevenueAmount"
                  type="number"
                  step="any"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? null : Number(e.target.value))
                  }
                  disabled={isSubmitting}
                  placeholder="e.g. 1000000"
                  className="h-8 text-xs font-mono rounded-[3px]"
                />
              )}
            />
            {errors.annualRevenueAmount && (
              <p className="text-[11px] text-rose-600">{errors.annualRevenueAmount.message}</p>
            )}
          </div>

          {/* Revenue Currency Code */}
          <div className="space-y-1">
            <Label htmlFor="annualRevenueCurrency" className="text-xs font-semibold text-slate-800">
              Revenue Currency Code
            </Label>
            <Input
              id="annualRevenueCurrency"
              {...register('annualRevenueCurrency')}
              disabled={isSubmitting}
              placeholder="USD, EUR, VND"
              className="h-8 text-xs font-mono uppercase rounded-[3px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Tax Identifier */}
          <div className="space-y-1">
            <Label htmlFor="taxIdentifier" className="text-xs font-semibold text-slate-800">
              Tax ID / VAT Number
            </Label>
            <Input
              id="taxIdentifier"
              {...register('taxIdentifier')}
              disabled={isSubmitting}
              placeholder="e.g. 0101234567"
              className="h-8 text-xs font-mono rounded-[3px]"
            />
          </div>

          {/* Registration Number */}
          <div className="space-y-1">
            <Label htmlFor="registrationNumber" className="text-xs font-semibold text-slate-800">
              Business Reg. Number
            </Label>
            <Input
              id="registrationNumber"
              {...register('registrationNumber')}
              disabled={isSubmitting}
              placeholder="e.g. REG-98765"
              className="h-8 text-xs font-mono rounded-[3px]"
            />
          </div>

          {/* Employee Count */}
          <div className="space-y-1">
            <Label htmlFor="employeeCount" className="text-xs font-semibold text-slate-800">
              Employee Count
            </Label>
            <Controller
              control={control}
              name="employeeCount"
              render={({ field }) => (
                <Input
                  id="employeeCount"
                  type="number"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))
                  }
                  disabled={isSubmitting}
                  placeholder="e.g. 250"
                  className="h-8 text-xs font-mono rounded-[3px]"
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Website */}
          <div className="space-y-1">
            <Label htmlFor="website" className="text-xs font-semibold text-slate-800">
              Website URL
            </Label>
            <Input
              id="website"
              {...register('website')}
              disabled={isSubmitting}
              placeholder="https://example.com"
              className="h-8 text-xs rounded-[3px]"
            />
          </div>

          {/* Preferred Language */}
          <div className="space-y-1">
            <Label htmlFor="preferredLanguageCode" className="text-xs font-semibold text-slate-800">
              Language Tag
            </Label>
            <Input
              id="preferredLanguageCode"
              {...register('preferredLanguageCode')}
              disabled={isSubmitting}
              placeholder="e.g. en, vi, en-US"
              className="h-8 text-xs font-mono rounded-[3px]"
            />
            {errors.preferredLanguageCode && (
              <p className="text-[11px] text-rose-600">{errors.preferredLanguageCode.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: CONTACT PREFERENCE & DESCRIPTION */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-xs uppercase tracking-wider">Preferences & Description</span>
        </div>

        <div className="space-y-2">
          <Controller
            control={control}
            name="doNotContact"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="doNotContact"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="doNotContact"
                  className="text-xs font-bold text-slate-900 cursor-pointer select-none"
                >
                  Do Not Contact (DNC Global Account Suppression)
                </label>
              </div>
            )}
          />

          {watchDoNotContact && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 py-2.5 rounded-[4px]">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <AlertDescription className="text-xs leading-relaxed font-medium">
                Flagging this account as <strong>Do Not Contact (DNC)</strong> requests active marketing and sales outreach suppression across all organizational touchpoints.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-1 pt-1">
          <Label htmlFor="description" className="text-xs font-semibold text-slate-800">
            Account Description & Commercial Background
          </Label>
          <textarea
            id="description"
            {...register('description')}
            disabled={isSubmitting}
            rows={3}
            placeholder="Commercial background, organizational overview, or relationship notes…"
            className="w-full p-2.5 text-xs bg-white rounded-[3px] border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-8 px-4 text-xs font-semibold rounded-[3px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="h-8 px-5 bg-[#0C66E4] hover:bg-[#0052CC] text-white text-xs font-semibold rounded-[3px] gap-1.5 shadow-none"
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>
            {mode === 'create'
              ? 'Create Account'
              : mode === 'subsidiary'
              ? 'Create Subsidiary'
              : 'Save Changes'}
          </span>
        </Button>
      </div>
    </form>
  );
};
