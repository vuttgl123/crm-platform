import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, ContactFormSchemaValues } from '../model/contactSchemas';
import { ContactFormValues, ContactEditorMode } from '../model/contactTypes';
import { ContactAccountPicker } from './ContactAccountPicker';
import { useAuth } from '@/core/session/useAuth';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  Building2,
  Globe,
  Loader2,
  ShieldCheck,
  User,
} from 'lucide-react';

interface ContactFormProps {
  mode: ContactEditorMode;
  initialValues: ContactFormValues;
  isSubmitting: boolean;
  onSave: (values: ContactFormValues) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  mode,
  initialValues,
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
  } = useForm<ContactFormSchemaValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: initialValues as any,
  });

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const watchDoNotContact = watch('doNotContact');
  const watchOwner = watch('owner');

  const currentUserId = session?.user?.id;
  const currentTeamId = session?.assignedTeam?.id;
  const currentTeamName = session?.assignedTeam?.name || 'My Team';

  const isInitialOwnerExternal = Boolean(
    initialValues.owner?.id &&
      initialValues.owner.id !== currentUserId &&
      initialValues.owner.id !== currentTeamId
  );

  const handleFormSubmit = (data: ContactFormSchemaValues) => {
    onSave(data as ContactFormValues);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 text-xs font-sans">
      {/* SECTION 1: IDENTITY */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-xs uppercase tracking-wider">Identity & Naming</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Contact Number */}
          <div className="space-y-1">
            <Label htmlFor="contactNumber" className="text-xs font-semibold text-slate-800">
              Contact Number <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="contactNumber"
              {...register('contactNumber')}
              disabled={mode === 'edit' || isSubmitting}
              placeholder="e.g. CT-2026-001"
              className="h-8 text-xs font-mono font-bold bg-white rounded-[3px]"
            />
            {errors.contactNumber && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.contactNumber.message}</p>
            )}
            {mode === 'edit' && (
              <p className="text-[10px] text-slate-400">Contact number is permanent and immutable.</p>
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
              placeholder="e.g. Alex Nguyen"
              className="h-8 text-xs font-semibold bg-white rounded-[3px]"
            />
            {errors.displayName && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.displayName.message}</p>
            )}
          </div>
        </div>

        {/* Optional Person Name Parts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-50">
          <div className="space-y-1">
            <Label htmlFor="honorific" className="text-[11px] font-medium text-slate-600">
              Honorific
            </Label>
            <Input
              id="honorific"
              {...register('honorific')}
              disabled={isSubmitting}
              placeholder="Mr. / Dr."
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
            <Label htmlFor="middleName" className="text-[11px] font-medium text-slate-600">
              Middle Name
            </Label>
            <Input
              id="middleName"
              {...register('middleName')}
              disabled={isSubmitting}
              placeholder="Middle name"
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

      {/* SECTION 2: ACCOUNT & BUSINESS ROLE */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="text-xs uppercase tracking-wider">Account & Business Role</span>
        </div>

        {/* Account Association */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-800">
            Account Affiliation
          </Label>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <ContactAccountPicker
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.accountId && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.accountId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <Label htmlFor="jobTitle" className="text-xs font-semibold text-slate-800">
              Job Title
            </Label>
            <Input
              id="jobTitle"
              {...register('jobTitle')}
              disabled={isSubmitting}
              placeholder="e.g. Chief Technology Officer"
              className="h-8 text-xs rounded-[3px]"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="department" className="text-xs font-semibold text-slate-800">
              Department
            </Label>
            <Input
              id="department"
              {...register('department')}
              disabled={isSubmitting}
              placeholder="e.g. Engineering & IT"
              className="h-8 text-xs rounded-[3px]"
            />
          </div>
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

      {/* SECTION 4: PREFERENCES & LIFECYCLE */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <Globe className="w-4 h-4 text-purple-600" />
          <span className="text-xs uppercase tracking-wider">Preferences & Lifecycle</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <SelectValue />
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

          {/* Preferred Channel */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-800">
              Preferred Channel
            </Label>
            <Controller
              control={control}
              name="preferredContactChannel"
              render={({ field }) => (
                <Select
                  value={field.value || 'NONE'}
                  onValueChange={(val) => field.onChange(val === 'NONE' ? null : val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-8 text-xs bg-white rounded-[3px]">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent className="text-xs rounded-[3px]">
                    <SelectItem value="NONE">None specified</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="PHONE">Phone Call</SelectItem>
                    <SelectItem value="MOBILE">Mobile</SelectItem>
                    <SelectItem value="SMS">SMS Message</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Preferred Language Code */}
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

        {/* Date of Birth & Do Not Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-50 items-center">
          <div className="space-y-1">
            <Label htmlFor="dateOfBirth" className="text-xs font-semibold text-slate-800">
              Date of Birth (Optional)
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...register('dateOfBirth')}
              disabled={isSubmitting}
              className="h-8 text-xs bg-white rounded-[3px]"
            />
          </div>

          <div className="pt-3">
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
                    Do Not Contact (DNC Suppression)
                  </label>
                </div>
              )}
            />
          </div>
        </div>

        {/* DNC Alert Warning */}
        {watchDoNotContact && (
          <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 py-2.5 rounded-[4px]">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <AlertDescription className="text-xs leading-relaxed font-medium">
              Flagging this contact as <strong>Do Not Contact (DNC)</strong> indicates active outreach suppression across sales, marketing, and commercial campaigns.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* SECTION 5: DESCRIPTION / NOTES */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-2 shadow-2xs">
        <Label htmlFor="description" className="text-xs font-semibold text-slate-800">
          Description & Notes
        </Label>
        <textarea
          id="description"
          {...register('description')}
          disabled={isSubmitting}
          rows={3}
          placeholder="Add background notes, relationship history, or customer context…"
          className="w-full p-2.5 text-xs bg-white rounded-[3px] border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
        />
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
          <span>{mode === 'create' ? 'Create Contact' : 'Save Changes'}</span>
        </Button>
      </div>
    </form>
  );
};
