import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadFormSchema, LeadFormSchemaValues } from '../model/leadSchemas';
import {
  LeadFormValues,
  LeadEditorMode,
  LeadStatusItem,
  LeadSourceItem,
} from '../model/leadTypes';
import { useAuth } from '@/core/session/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Globe,
  Loader2,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';

interface LeadFormProps {
  mode: LeadEditorMode;
  initialValues: LeadFormValues;
  statuses: LeadStatusItem[];
  sources: LeadSourceItem[];
  isSubmitting: boolean;
  onSave: (values: LeadFormValues) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  mode,
  initialValues,
  statuses,
  sources,
  isSubmitting,
  onSave,
  onCancel,
  onDirtyChange,
}) => {
  const { session } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<LeadFormSchemaValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: initialValues as any,
  });

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const watchOwner = watch('owner');

  const currentUserId = session?.user?.id;
  const currentTeamId = session?.assignedTeam?.id;
  const currentTeamName = session?.assignedTeam?.name || 'My Team';

  const isInitialOwnerExternal = Boolean(
    initialValues.owner?.id &&
      initialValues.owner.id !== currentUserId &&
      initialValues.owner.id !== currentTeamId
  );

  const handleFormSubmit = (data: LeadFormSchemaValues) => {
    onSave(data as LeadFormValues);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 text-xs font-sans">
      {/* SECTION 1: IDENTITY & NAMING */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-xs uppercase tracking-wider">Identity & Lead Number</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Lead Number */}
          <div className="space-y-1">
            <Label htmlFor="leadNumber" className="text-xs font-semibold text-slate-800">
              Lead Number <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="leadNumber"
              {...register('leadNumber')}
              disabled={mode === 'edit' || isSubmitting}
              placeholder="e.g. LD-2026-001"
              className="h-8 text-xs font-mono font-bold bg-white rounded-[3px]"
            />
            {errors.leadNumber && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.leadNumber.message}</p>
            )}
            {mode === 'edit' && (
              <p className="text-[10px] text-slate-400">Lead number is permanent and immutable.</p>
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
              placeholder="e.g. Jane Doe"
              className="h-8 text-xs font-semibold bg-white rounded-[3px]"
            />
            {errors.displayName && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.displayName.message}</p>
            )}
          </div>
        </div>

        {/* Optional Person Name Parts */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-50">
          <div className="space-y-1">
            <Label htmlFor="honorific" className="text-[11px] font-medium text-slate-600">
              Honorific
            </Label>
            <Input
              id="honorific"
              {...register('honorific')}
              disabled={isSubmitting}
              placeholder="Ms. / Mr."
              className="h-8 text-xs rounded-[3px]"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="givenName" className="text-[11px] font-medium text-slate-600">
              Given Name
            </Label>
            <Input
              id="givenName"
              {...register('givenName')}
              disabled={isSubmitting}
              placeholder="First name"
              className="h-8 text-xs rounded-[3px]"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="familyName" className="text-[11px] font-medium text-slate-600">
              Family Name
            </Label>
            <Input
              id="familyName"
              {...register('familyName')}
              disabled={isSubmitting}
              placeholder="Last name"
              className="h-8 text-xs rounded-[3px]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: COMPANY & ROLE */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span className="text-xs uppercase tracking-wider">Company & Position</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="companyName" className="text-xs font-semibold text-slate-800">
              Company Name
            </Label>
            <Input
              id="companyName"
              {...register('companyName')}
              disabled={isSubmitting}
              placeholder="e.g. Acme Corporation"
              className="h-8 text-xs rounded-[3px]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="jobTitle" className="text-xs font-semibold text-slate-800">
              Job Title
            </Label>
            <Input
              id="jobTitle"
              {...register('jobTitle')}
              disabled={isSubmitting}
              placeholder="e.g. Procurement Lead"
              className="h-8 text-xs rounded-[3px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <Label htmlFor="website" className="text-xs font-semibold text-slate-800">
              Website
            </Label>
            <Input
              id="website"
              {...register('website')}
              disabled={isSubmitting}
              placeholder="https://example.com"
              className="h-8 text-xs rounded-[3px]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="accountName" className="text-xs font-semibold text-slate-800">
              Account Reference Name
            </Label>
            <Input
              id="accountName"
              {...register('accountName')}
              disabled={isSubmitting}
              placeholder="e.g. Acme Enterprise"
              className="h-8 text-xs rounded-[3px]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: CONTACT CHANNELS */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <Mail className="w-4 h-4 text-blue-600" />
          <span className="text-xs uppercase tracking-wider">Contact Channels</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-800">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              disabled={isSubmitting}
              placeholder="jane.doe@example.com"
              className="h-8 text-xs rounded-[3px]"
            />
            {errors.email && (
              <p className="text-[11px] text-rose-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="phoneE164" className="text-xs font-semibold text-slate-800">
              Phone Number (E.164)
            </Label>
            <Input
              id="phoneE164"
              {...register('phoneE164')}
              disabled={isSubmitting}
              placeholder="+12025550123"
              className="h-8 text-xs font-mono rounded-[3px]"
            />
            {errors.phoneE164 && (
              <p className="text-[11px] text-rose-600">{errors.phoneE164.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <Label htmlFor="countryCode" className="text-xs font-semibold text-slate-800">
              Country Code (2 Letters)
            </Label>
            <Input
              id="countryCode"
              {...register('countryCode')}
              disabled={isSubmitting}
              placeholder="e.g. US, VN, SG"
              className="h-8 text-xs font-mono uppercase rounded-[3px]"
            />
            {errors.countryCode && (
              <p className="text-[11px] text-rose-600">{errors.countryCode.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="preferredLanguageCode" className="text-xs font-semibold text-slate-800">
              Preferred Language Tag
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

      {/* SECTION 4: QUALIFICATION & COMMERCIAL */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <Globe className="w-4 h-4 text-purple-600" />
          <span className="text-xs uppercase tracking-wider">Pipeline & Qualification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Status */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-800">
              Status <span className="text-rose-500">*</span>
            </Label>
            <Controller
              control={control}
              name="statusId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-8 text-xs bg-white rounded-[3px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="text-xs rounded-[3px]">
                    {statuses
                      .filter((s) => s.active || s.id === field.value)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.statusId && (
              <p className="text-[11px] text-rose-600">{errors.statusId.message}</p>
            )}
          </div>

          {/* Source */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-800">
              Lead Source
            </Label>
            <Controller
              control={control}
              name="sourceId"
              render={({ field }) => (
                <Select
                  value={field.value || 'NONE'}
                  onValueChange={(val) => field.onChange(val === 'NONE' ? null : val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-8 text-xs bg-white rounded-[3px]">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent className="text-xs rounded-[3px]">
                    <SelectItem value="NONE">None specified</SelectItem>
                    {sources
                      .filter((src) => src.active || src.id === field.value)
                      .map((src) => (
                        <SelectItem key={src.id} value={src.id}>
                          {src.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Rating */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-800">
              Priority Rating
            </Label>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <Select
                  value={field.value || 'NONE'}
                  onValueChange={(val) => field.onChange(val === 'NONE' ? null : val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-8 text-xs bg-white rounded-[3px]">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent className="text-xs rounded-[3px]">
                    <SelectItem value="NONE">None specified</SelectItem>
                    <SelectItem value="HOT">Hot</SelectItem>
                    <SelectItem value="WARM">Warm</SelectItem>
                    <SelectItem value="COLD">Cold</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Estimated Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <Label htmlFor="estimatedValueAmount" className="text-xs font-semibold text-slate-800">
              Estimated Value Amount
            </Label>
            <Controller
              control={control}
              name="estimatedValueAmount"
              render={({ field }) => (
                <Input
                  id="estimatedValueAmount"
                  type="number"
                  step="any"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? null : Number(e.target.value))
                  }
                  disabled={isSubmitting}
                  placeholder="e.g. 50000"
                  className="h-8 text-xs font-mono rounded-[3px]"
                />
              )}
            />
            {errors.estimatedValueAmount && (
              <p className="text-[11px] text-rose-600">{errors.estimatedValueAmount.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="estimatedValueCurrency" className="text-xs font-semibold text-slate-800">
              Currency Code
            </Label>
            <Input
              id="estimatedValueCurrency"
              {...register('estimatedValueCurrency')}
              disabled={isSubmitting}
              placeholder="USD, EUR, VND"
              className="h-8 text-xs font-mono uppercase rounded-[3px]"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1 pt-1">
          <Label htmlFor="qualificationNotes" className="text-xs font-semibold text-slate-800">
            Qualification Notes
          </Label>
          <textarea
            id="qualificationNotes"
            {...register('qualificationNotes')}
            disabled={isSubmitting}
            rows={2}
            placeholder="Commercial qualification history, customer background, or sales notes…"
            className="w-full p-2.5 text-xs bg-white rounded-[3px] border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        {/* Disqualification Reason in Edit mode */}
        {mode === 'edit' && (
          <div className="space-y-1 pt-1">
            <Label htmlFor="disqualificationReason" className="text-xs font-semibold text-slate-800">
              Disqualification Reason (Optional)
            </Label>
            <Input
              id="disqualificationReason"
              {...register('disqualificationReason')}
              disabled={isSubmitting}
              placeholder="e.g. Budget cancelled / Not right fit"
              className="h-8 text-xs rounded-[3px]"
            />
          </div>
        )}
      </div>

      {/* SECTION 5: OWNERSHIP */}
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
              <span>Assign to Me</span>
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
                Retain {initialValues.owner.type === 'USER' ? 'User' : 'Team'} Owner (
                {initialValues.owner.id.slice(0, 8)}…)
              </span>
            </label>
          )}
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
          <span>{mode === 'create' ? 'Create Lead' : 'Save Changes'}</span>
        </Button>
      </div>
    </form>
  );
};
