import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  OpportunityFormSchemaValues,
  opportunityFormSchema,
} from '../../model/opportunitySchemas';
import {
  OpportunityEditorMode,
  PipelineItem,
  LeadSourceItem,
} from '../../model/opportunityTypes';
import { accountApi } from '@/services/api/accountApi';
import { contactApi } from '@/services/api/contactApi';
import { useAuth } from '@/core/session/useAuth';
import { useOwnerResolver } from '../../hooks/useOwnerResolver';
import { cn } from '@/lib/utils';
import {
  Building2,
  Calendar,
  Check,
  ChevronsUpDown,
  DollarSign,
  Globe,
  Loader2,
  Percent,
  Search,
  ShieldCheck,
  TrendingUp,
  X,
  AlertTriangle,
} from 'lucide-react';

interface OpportunityFormProps {
  mode: OpportunityEditorMode;
  initialValues: OpportunityFormSchemaValues;
  pipelines: PipelineItem[];
  leadSources: LeadSourceItem[];
  campaigns: { id: string; name: string }[];
  isSubmitting: boolean;
  onSave: (values: OpportunityFormSchemaValues) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export const OpportunityForm: React.FC<OpportunityFormProps> = ({
  mode,
  initialValues,
  pipelines,
  leadSources,
  campaigns,
  isSubmitting,
  onSave,
  onCancel,
  onDirtyChange,
}) => {
  const { session } = useAuth();
  const { resolveOwner } = useOwnerResolver();

  const currentUserId = session?.user?.id;
  const currentUserName = session?.user?.display_name || (session?.user as any)?.displayName;
  const currentTeamId = session?.assignedTeam?.id;
  const currentTeamName = session?.assignedTeam?.name || 'My Assigned Team';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<OpportunityFormSchemaValues>({
    resolver: zodResolver(opportunityFormSchema),
    defaultValues: initialValues,
  });

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const watchAccountId = watch('accountId');
  const watchPipelineId = watch('pipelineId');
  const watchStageId = watch('currentStageId');
  const watchOwner = watch('owner');
  const watchProbability = watch('probability');

  // Account Async Picker State
  const [accountPickerOpen, setAccountPickerOpen] = React.useState(false);
  const [accountSearch, setAccountSearch] = React.useState('');
  const [accountOptions, setAccountOptions] = React.useState<{ id: string; displayName: string; accountNumber: string }[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = React.useState(false);
  const [selectedAccountName, setSelectedAccountName] = React.useState<string>('');

  // Contact Async Picker State
  const [contactPickerOpen, setContactPickerOpen] = React.useState(false);
  const [contactSearch, setContactSearch] = React.useState('');
  const [contactOptions, setContactOptions] = React.useState<{ id: string; displayName: string; contactNumber?: string; jobTitle?: string }[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = React.useState(false);
  const [selectedContactName, setSelectedContactName] = React.useState<string>('');

  // Initial lookup for selected account name
  React.useEffect(() => {
    if (watchAccountId) {
      accountApi.get(watchAccountId).then((acc) => {
        if (acc) setSelectedAccountName(acc.displayName);
      }).catch(() => {});
    } else {
      setSelectedAccountName('');
    }
  }, [watchAccountId]);

  // Initial lookup for selected contact name
  const watchPrimaryContactId = watch('primaryContactId');
  React.useEffect(() => {
    if (watchPrimaryContactId) {
      contactApi.get(watchPrimaryContactId).then((c) => {
        if (c) setSelectedContactName(c.displayName);
      }).catch(() => {});
    } else {
      setSelectedContactName('');
    }
  }, [watchPrimaryContactId]);

  // Fetch accounts on picker search
  React.useEffect(() => {
    if (!accountPickerOpen) return;
    let isCurrent = true;
    setIsLoadingAccounts(true);
    accountApi
      .search({ q: accountSearch, size: 20 })
      .then((res) => {
        if (isCurrent) setAccountOptions(res.items || []);
      })
      .finally(() => {
        if (isCurrent) setIsLoadingAccounts(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [accountPickerOpen, accountSearch]);

  // Fetch contacts for selected account
  React.useEffect(() => {
    if (!contactPickerOpen || !watchAccountId) return;
    let isCurrent = true;
    setIsLoadingContacts(true);
    contactApi
      .search({ accountId: watchAccountId, q: contactSearch, size: 20 })
      .then((res) => {
        if (isCurrent) {
          setContactOptions(
            (res.items || []).map((c) => ({
              id: c.id,
              displayName: c.displayName,
              contactNumber: c.contactNumber,
              jobTitle: c.jobTitle || undefined,
            }))
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoadingContacts(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [contactPickerOpen, watchAccountId, contactSearch]);

  // Available stages for selected pipeline
  const selectedPipeline = React.useMemo(() => {
    return pipelines.find((p) => p.id === watchPipelineId);
  }, [pipelines, watchPipelineId]);

  const availableStages = React.useMemo(() => {
    if (!selectedPipeline?.stages) return [];
    return [...selectedPipeline.stages]
      .filter((st) => st.active !== false)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [selectedPipeline]);

  // When pipeline changes in create mode, auto-select first stage
  const handlePipelineChange = (newPipelineId: string) => {
    setValue('pipelineId', newPipelineId, { shouldDirty: true, shouldValidate: true });
    const p = pipelines.find((item) => item.id === newPipelineId);
    if (p?.stages && p.stages.length > 0) {
      const firstStage = p.stages[0];
      setValue('currentStageId', firstStage.id, { shouldDirty: true, shouldValidate: true });
      setValue('probability', firstStage.defaultProbability, { shouldDirty: true });
    }
  };

  // When stage changes, auto-update probability default
  const handleStageChange = (newStageId: string) => {
    setValue('currentStageId', newStageId, { shouldDirty: true, shouldValidate: true });
    const st = availableStages.find((s) => s.id === newStageId);
    if (st && st.defaultProbability !== undefined) {
      setValue('probability', st.defaultProbability, { shouldDirty: true });
    }
  };

  const isInitialOwnerExternal =
    initialValues.owner &&
    (initialValues.owner.id !== currentUserId && initialValues.owner.id !== currentTeamId);

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6 font-sans">
      {/* GLOBAL ERROR SUMMARY */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-[4px] flex items-start gap-2 text-rose-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Please resolve the following errors:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {Object.entries(errors).map(([key, err]) => (
                <li key={key}>{err?.message || `Invalid ${key}`}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 1: DEAL IDENTITY */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-xs uppercase tracking-wider">Opportunity Identity</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Name */}
          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-800">
              Deal Title / Opportunity Name <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g. Enterprise Cloud Migration - Phase 1"
              disabled={isSubmitting}
              className={cn(
                'h-8 text-xs bg-white border-slate-200 rounded-[3px] focus:bg-white',
                errors.name && 'border-rose-500 focus-visible:ring-rose-500'
              )}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Opportunity Type */}
          <div className="space-y-1">
            <Label htmlFor="opportunityType" className="text-xs font-semibold text-slate-800">
              Opportunity Type <span className="text-rose-600">*</span>
            </Label>
            <Select
              value={watch('opportunityType')}
              onValueChange={(val) =>
                setValue('opportunityType', val as any, { shouldDirty: true, shouldValidate: true })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="text-xs font-sans">
                <SelectItem value="NEW_BUSINESS">New Business</SelectItem>
                <SelectItem value="UPSELL">Upsell</SelectItem>
                <SelectItem value="CROSS_SELL">Cross Sell</SelectItem>
                <SelectItem value="RENEWAL">Renewal</SelectItem>
                <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.opportunityType && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.opportunityType.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: CUSTOMER ORGANIZATION & CONTACT */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span className="text-xs uppercase tracking-wider">Customer Organization & Contact</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Account Picker */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-800">
              Account Organization <span className="text-rose-600">*</span>
            </Label>
            <Popover open={accountPickerOpen} onOpenChange={setAccountPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  disabled={isSubmitting || mode === 'edit'}
                  className={cn(
                    'w-full justify-between h-8 text-xs font-normal bg-white border-slate-200 rounded-[3px] hover:bg-slate-50',
                    !watchAccountId && 'text-slate-400',
                    errors.accountId && 'border-rose-500'
                  )}
                >
                  <span className="truncate">
                    {selectedAccountName || 'Select account…'}
                  </span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0 shadow-lg border-slate-200 rounded-[4px]" align="start">
                <div className="p-2 border-b border-slate-100 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <Input
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    placeholder="Search accounts…"
                    className="h-8 text-xs border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 shadow-none rounded-[3px]"
                    autoFocus
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1 text-xs">
                  {isLoadingAccounts ? (
                    <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Searching accounts…</span>
                    </div>
                  ) : accountOptions.length === 0 ? (
                    <div className="py-4 text-center text-slate-400 italic">
                      No matching accounts found
                    </div>
                  ) : (
                    accountOptions.map((acc) => {
                      const isSelected = watchAccountId === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            setValue('accountId', acc.id, { shouldDirty: true, shouldValidate: true });
                            setValue('primaryContactId', null, { shouldDirty: true }); // Clear contact
                            setSelectedAccountName(acc.displayName);
                            setSelectedContactName('');
                            setAccountPickerOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-2.5 py-1.5 rounded-[3px] text-left transition-colors',
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-100'
                          )}
                        >
                          <div className="flex flex-col truncate pr-2">
                            <span className="truncate">{acc.displayName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {acc.accountNumber}
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
            {errors.accountId && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.accountId.message}</p>
            )}
          </div>

          {/* Primary Contact Picker */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-800">
              Primary Stakeholder Contact
            </Label>
            <Popover open={contactPickerOpen} onOpenChange={setContactPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  disabled={isSubmitting || !watchAccountId}
                  className={cn(
                    'w-full justify-between h-8 text-xs font-normal bg-white border-slate-200 rounded-[3px] hover:bg-slate-50',
                    !watchPrimaryContactId && 'text-slate-400'
                  )}
                >
                  <span className="truncate">
                    {selectedContactName || (watchAccountId ? 'Select contact (optional)…' : 'Select account first')}
                  </span>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {watchPrimaryContactId && !isSubmitting && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setValue('primaryContactId', null, { shouldDirty: true });
                          setSelectedContactName('');
                        }}
                        className="p-0.5 rounded-[2px] hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                        title="Clear contact"
                      >
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0 shadow-lg border-slate-200 rounded-[4px]" align="start">
                <div className="p-2 border-b border-slate-100 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <Input
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search account contacts…"
                    className="h-8 text-xs border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 shadow-none rounded-[3px]"
                    autoFocus
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1 text-xs">
                  {isLoadingContacts ? (
                    <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading contacts…</span>
                    </div>
                  ) : contactOptions.length === 0 ? (
                    <div className="py-4 text-center text-slate-400 italic">
                      No contacts found for this account
                    </div>
                  ) : (
                    contactOptions.map((c) => {
                      const isSelected = watchPrimaryContactId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setValue('primaryContactId', c.id, { shouldDirty: true });
                            setSelectedContactName(c.displayName);
                            setContactPickerOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-2.5 py-1.5 rounded-[3px] text-left transition-colors',
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-100'
                          )}
                        >
                          <div className="flex flex-col truncate pr-2">
                            <span className="truncate">{c.displayName}</span>
                            {c.jobTitle && (
                              <span className="text-[10px] text-slate-400 truncate">
                                {c.jobTitle}
                              </span>
                            )}
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* SECTION 3: PIPELINE & STAGE */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="text-xs uppercase tracking-wider">Pipeline & Stage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pipeline */}
          <div className="space-y-1">
            <Label htmlFor="pipelineId" className="text-xs font-semibold text-slate-800">
              Sales Pipeline <span className="text-rose-600">*</span>
            </Label>
            <Select
              value={watchPipelineId}
              onValueChange={handlePipelineChange}
              disabled={isSubmitting || mode === 'edit'}
            >
              <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="Select pipeline" />
              </SelectTrigger>
              <SelectContent className="text-xs font-sans">
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.defaultPipeline ? '(Default)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pipelineId && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.pipelineId.message}</p>
            )}
          </div>

          {/* Current Stage */}
          <div className="space-y-1">
            <Label htmlFor="currentStageId" className="text-xs font-semibold text-slate-800">
              Current Stage <span className="text-rose-600">*</span>
            </Label>
            <Select
              value={watchStageId}
              onValueChange={handleStageChange}
              disabled={isSubmitting || mode === 'edit'}
            >
              <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent className="text-xs font-sans">
                {availableStages.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name} ({st.defaultProbability}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currentStageId && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.currentStageId.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: COMMERCIAL VALUE & PROBABILITY */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span className="text-xs uppercase tracking-wider">Commercial Value & Probability</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Amount */}
          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="amountValue" className="text-xs font-semibold text-slate-800">
              Deal Amount <span className="text-rose-600">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="amountValue"
                type="number"
                step="any"
                {...register('amount.amount')}
                placeholder="0"
                disabled={isSubmitting}
                className={cn(
                  'h-8 text-xs bg-white border-slate-200 rounded-[3px] font-mono',
                  errors.amount?.amount && 'border-rose-500'
                )}
              />
              <Input
                type="text"
                {...register('amount.currencyCode')}
                placeholder="USD"
                maxLength={3}
                disabled={isSubmitting}
                className="w-20 h-8 text-xs bg-white border-slate-200 rounded-[3px] font-mono uppercase font-bold text-center"
              />
            </div>
            {errors.amount?.amount && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.amount.amount.message}</p>
            )}
            {errors.amount?.currencyCode && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.amount.currencyCode.message}</p>
            )}
          </div>

          {/* Probability */}
          <div className="space-y-1">
            <Label htmlFor="probability" className="text-xs font-semibold text-slate-800 flex items-center justify-between">
              <span>Probability</span>
              <span className="font-mono text-[11px] text-slate-500 font-bold">
                {watchProbability}%
              </span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="probability"
                type="number"
                min={0}
                max={100}
                {...register('probability')}
                disabled={isSubmitting}
                className="h-8 text-xs bg-white border-slate-200 rounded-[3px] font-mono"
              />
              <Percent className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {errors.probability && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.probability.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: TIMING & NEXT STEP */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <Calendar className="w-4 h-4 text-sky-600" />
          <span className="text-xs uppercase tracking-wider">Timing & Progression</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Expected Close Date */}
          <div className="space-y-1">
            <Label htmlFor="expectedCloseDate" className="text-xs font-semibold text-slate-800">
              Expected Close Date
            </Label>
            <Input
              id="expectedCloseDate"
              type="date"
              {...register('expectedCloseDate')}
              disabled={isSubmitting}
              className="h-8 text-xs bg-white border-slate-200 rounded-[3px] font-mono"
            />
          </div>

          {/* Next Step */}
          <div className="space-y-1">
            <Label htmlFor="nextStep" className="text-xs font-semibold text-slate-800">
              Next Action / Milestone
            </Label>
            <Input
              id="nextStep"
              {...register('nextStep')}
              placeholder="e.g. Schedule technical evaluation demo"
              disabled={isSubmitting}
              className="h-8 text-xs bg-white border-slate-200 rounded-[3px]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 6: OWNERSHIP */}
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
              <span>Assign to Me {currentUserName ? `(${currentUserName})` : ''}</span>
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

      {/* SECTION 7: CONTEXT & MARKETING */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <Globe className="w-4 h-4 text-purple-600" />
          <span className="text-xs uppercase tracking-wider">Context & Marketing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Source */}
          <div className="space-y-1">
            <Label htmlFor="sourceId" className="text-xs font-semibold text-slate-800">
              Lead / Deal Source
            </Label>
            <Select
              value={watch('sourceId') || 'NONE'}
              onValueChange={(val) =>
                setValue('sourceId', val === 'NONE' ? null : val, { shouldDirty: true })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="Select source (optional)" />
              </SelectTrigger>
              <SelectContent className="text-xs font-sans">
                <SelectItem value="NONE">None</SelectItem>
                {leadSources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campaign */}
          <div className="space-y-1">
            <Label htmlFor="campaignId" className="text-xs font-semibold text-slate-800">
              Marketing Campaign
            </Label>
            <Select
              value={watch('campaignId') || 'NONE'}
              onValueChange={(val) =>
                setValue('campaignId', val === 'NONE' ? null : val, { shouldDirty: true })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="Select campaign (optional)" />
              </SelectTrigger>
              <SelectContent className="text-xs font-sans">
                <SelectItem value="NONE">None</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1 pt-1">
          <Label htmlFor="description" className="text-xs font-semibold text-slate-800">
            Opportunity Description & Requirements
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            rows={3}
            placeholder="Record client pain points, technical scope, or special terms…"
            disabled={isSubmitting}
            className="text-xs bg-white border-slate-200 rounded-[3px] resize-y"
          />
        </div>
      </div>

      {/* STICKY FOOTER ACTIONS */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-6 -mb-6 flex items-center justify-end gap-2 z-10">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-8 text-xs font-semibold border-slate-200 text-slate-700 rounded-[3px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-8 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving…</span>
            </>
          ) : (
            <span>{mode === 'create' ? 'Create Opportunity' : 'Save Changes'}</span>
          )}
        </Button>
      </div>
    </form>
  );
};
