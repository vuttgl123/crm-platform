import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
  ActivityFormSchemaValues,
  activityFormSchema,
} from '../../model/activitySchemas';
import {
  ActivityEditorMode,
  ActivityType,
  ActivityDirection,
  ActivityPriority,
  ActivityRelatedType,
  ActivityParticipantType,
  ActivityParticipantRole,
} from '../../model/activityTypes';
import { accountApi } from '@/services/api/accountApi';
import { contactApi } from '@/services/api/contactApi';
import { leadApi } from '@/services/api/leadApi';
import { opportunityApi } from '@/services/api/opportunityApi';
import { useOwnerResolver } from '../../hooks/useOwnerResolver';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Building2,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  ChevronsUpDown,
  Search,
  Loader2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface ActivityFormProps {
  mode: ActivityEditorMode;
  initialValues: ActivityFormSchemaValues;
  isSubmitting: boolean;
  onSave: (values: ActivityFormSchemaValues) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  mode,
  initialValues,
  isSubmitting,
  onSave,
  onCancel,
  onDirtyChange,
}) => {
  const { currentUserId, currentUserName, currentTeamId, currentTeamName } = useOwnerResolver();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<ActivityFormSchemaValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: initialValues,
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control,
    name: 'links',
  });

  const { fields: participantFields, append: appendParticipant, remove: removeParticipant } = useFieldArray({
    control,
    name: 'participants',
  });

  React.useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const watchActivityType = watch('activityType');
  const watchDirection = watch('direction');
  const watchOwnerKind = watch('ownerKind');
  const watchOwnerId = watch('ownerId');

  // Searchable Target Link state
  const [newLinkTargetType, setNewLinkTargetType] = React.useState<ActivityRelatedType>('ACCOUNT');
  const [targetPickerOpen, setTargetPickerOpen] = React.useState(false);
  const [targetSearch, setTargetSearch] = React.useState('');
  const [targetOptions, setTargetOptions] = React.useState<{ id: string; displayName: string; displayCode?: string }[]>([]);
  const [isLoadingTargets, setIsLoadingTargets] = React.useState(false);

  // New participant temporary state
  const [newPartType, setNewPartType] = React.useState<ActivityParticipantType>('USER');
  const [newPartName, setNewPartName] = React.useState('');
  const [newPartEmail, setNewPartEmail] = React.useState('');
  const [newPartRole, setNewPartRole] = React.useState<ActivityParticipantRole>('ATTENDEE');

  // Search records for link picker
  React.useEffect(() => {
    if (!targetPickerOpen) return;
    let isCurrent = true;
    setIsLoadingTargets(true);

    const runSearch = async () => {
      try {
        if (newLinkTargetType === 'ACCOUNT') {
          const res = await accountApi.search({ q: targetSearch, size: 20 });
          if (isCurrent) {
            setTargetOptions(
              (res.items || []).map((acc) => ({
                id: acc.id,
                displayName: acc.displayName,
                displayCode: acc.accountNumber,
              }))
            );
          }
        } else if (newLinkTargetType === 'CONTACT') {
          const res = await contactApi.search({ q: targetSearch, size: 20 });
          if (isCurrent) {
            setTargetOptions(
              (res.items || []).map((c) => ({
                id: c.id,
                displayName: c.displayName,
                displayCode: c.contactNumber,
              }))
            );
          }
        } else if (newLinkTargetType === 'LEAD') {
          const res = await leadApi.search({ q: targetSearch, size: 20 });
          if (isCurrent) {
            setTargetOptions(
              (res.items || []).map((l) => ({
                id: l.id,
                displayName: l.displayName || l.companyName || l.leadNumber,
                displayCode: l.leadNumber,
              }))
            );
          }
        } else if (newLinkTargetType === 'OPPORTUNITY') {
          const res = await opportunityApi.search({ q: targetSearch, size: 20 });
          if (isCurrent) {
            setTargetOptions(
              (res.items || []).map((opp) => ({
                id: opp.id,
                displayName: opp.name,
                displayCode: opp.opportunityNumber,
              }))
            );
          }
        }
      } catch {
        if (isCurrent) setTargetOptions([]);
      } finally {
        if (isCurrent) setIsLoadingTargets(false);
      }
    };

    runSearch();
    return () => {
      isCurrent = false;
    };
  }, [targetPickerOpen, newLinkTargetType, targetSearch]);

  const handleAddLink = (item: { id: string; displayName: string; displayCode?: string }) => {
    // Avoid duplicate links
    const exists = linkFields.some((l) => l.targetType === newLinkTargetType && l.targetId === item.id);
    if (!exists) {
      appendLink({
        targetType: newLinkTargetType,
        targetId: item.id,
        displayName: item.displayName,
        displayCode: item.displayCode,
      });
    }
    setTargetPickerOpen(false);
  };

  const handleAddParticipant = () => {
    if (!newPartName.trim()) return;
    appendParticipant({
      participantType: newPartType,
      principalId: newPartType === 'USER' && currentUserId ? currentUserId : null,
      displayName: newPartName.trim(),
      email: newPartEmail.trim() || null,
      role: newPartRole,
    });
    setNewPartName('');
    setNewPartEmail('');
  };

  const isDirectionalType = ['CALL', 'EMAIL', 'MESSAGE'].includes(watchActivityType);

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6 font-sans">
      {/* GLOBAL ERROR SUMMARY */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-[4px] flex items-start gap-2 text-rose-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Please resolve the following issues:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {Object.entries(errors).map(([key, err]) => (
                <li key={key}>{err?.message || `Invalid ${key}`}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 1: ACTIVITY DETAILS */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold border-b border-slate-100 pb-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-xs uppercase tracking-wider">Activity Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Activity Type */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-800">
              Activity Type <span className="text-rose-600">*</span>
            </Label>
            <Select
              value={watchActivityType}
              onValueChange={(val) =>
                setValue('activityType', val as ActivityType, { shouldValidate: true, shouldDirty: true })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="text-xs font-sans">
                <SelectItem value="CALL">Call</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="MEETING">Meeting</SelectItem>
                <SelectItem value="TASK">Task</SelectItem>
                <SelectItem value="MESSAGE">Message</SelectItem>
                <SelectItem value="DEMO">Demo</SelectItem>
                <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Direction (if applicable) */}
          {isDirectionalType ? (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-800">
                Direction <span className="text-rose-600">*</span>
              </Label>
              <Select
                value={watchDirection || 'OUTBOUND'}
                onValueChange={(val) =>
                  setValue('direction', val as ActivityDirection, { shouldValidate: true, shouldDirty: true })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent className="text-xs font-sans">
                  <SelectItem value="OUTBOUND">Outbound</SelectItem>
                  <SelectItem value="INBOUND">Inbound</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                </SelectContent>
              </Select>
              {errors.direction && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.direction.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-800">
                Priority <span className="text-rose-600">*</span>
              </Label>
              <Select
                value={watch('priority')}
                onValueChange={(val) =>
                  setValue('priority', val as ActivityPriority, { shouldValidate: true, shouldDirty: true })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="text-xs font-sans">
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Priority (if direction was shown) */}
          {isDirectionalType && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-800">
                Priority <span className="text-rose-600">*</span>
              </Label>
              <Select
                value={watch('priority')}
                onValueChange={(val) =>
                  setValue('priority', val as ActivityPriority, { shouldValidate: true, shouldDirty: true })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="text-xs font-sans">
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject */}
          <div className="sm:col-span-3 space-y-1">
            <Label htmlFor="subject" className="text-xs font-semibold text-slate-800">
              Subject / Title <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="e.g. Discovery call with Chief Architect"
              disabled={isSubmitting}
              className={cn(
                'h-8 text-xs bg-white border-slate-200 rounded-[3px]',
                errors.subject && 'border-rose-500'
              )}
            />
            {errors.subject && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.subject.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="sm:col-span-3 space-y-1">
            <Label htmlFor="description" className="text-xs font-semibold text-slate-800">
              Description & Objectives
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={3}
              placeholder="Record agenda items, customer pain points, or expected outcomes…"
              disabled={isSubmitting}
              className="text-xs bg-white border-slate-200 rounded-[3px] resize-y"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: SCHEDULE */}
      <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-xs uppercase tracking-wider">Schedule & Timing</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Start Date & Time */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-800">
              Start Date & Time {['CALL', 'MEETING', 'DEMO'].includes(watchActivityType) && <span className="text-rose-600">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                {...register('scheduledStartDate')}
                disabled={isSubmitting}
                className="h-8 text-xs bg-white border-slate-200 rounded-[3px] font-mono flex-1"
              />
              <Input
                type="time"
                {...register('scheduledStartTime')}
                disabled={isSubmitting}
                className="h-8 w-28 text-xs bg-white border-slate-200 rounded-[3px] font-mono"
              />
            </div>
            {errors.scheduledStartDate && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.scheduledStartDate.message}</p>
            )}
          </div>

          {/* End Date & Time */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-800">
              End Date & Time {['MEETING', 'DEMO'].includes(watchActivityType) && <span className="text-rose-600">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                {...register('scheduledEndDate')}
                disabled={isSubmitting}
                className="h-8 text-xs bg-white border-slate-200 rounded-[3px] font-mono flex-1"
              />
              <Input
                type="time"
                {...register('scheduledEndTime')}
                disabled={isSubmitting}
                className="h-8 w-28 text-xs bg-white border-slate-200 rounded-[3px] font-mono"
              />
            </div>
            {errors.scheduledEndDate && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.scheduledEndDate.message}</p>
            )}
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
          {currentUserId && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="radio"
                name="activityOwnerRadio"
                checked={watchOwnerKind === 'USER' && watchOwnerId === currentUserId}
                onChange={() => {
                  setValue('ownerKind', 'USER', { shouldDirty: true });
                  setValue('ownerId', currentUserId, { shouldDirty: true, shouldValidate: true });
                }}
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
                name="activityOwnerRadio"
                checked={watchOwnerKind === 'TEAM' && watchOwnerId === currentTeamId}
                onChange={() => {
                  setValue('ownerKind', 'TEAM', { shouldDirty: true });
                  setValue('ownerId', currentTeamId, { shouldDirty: true, shouldValidate: true });
                }}
                disabled={isSubmitting}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span>Assign to {currentTeamName}</span>
            </label>
          )}

          {mode === 'edit' && initialValues.ownerId && initialValues.ownerId !== currentUserId && initialValues.ownerId !== currentTeamId && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="radio"
                name="activityOwnerRadio"
                checked={watchOwnerKind === initialValues.ownerKind && watchOwnerId === initialValues.ownerId}
                onChange={() => {
                  setValue('ownerKind', initialValues.ownerKind, { shouldDirty: true });
                  setValue('ownerId', initialValues.ownerId, { shouldDirty: true, shouldValidate: true });
                }}
                disabled={isSubmitting}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span>Retain Current Owner</span>
            </label>
          )}
        </div>
        {errors.ownerId && (
          <p className="text-[11px] text-rose-600 font-medium">{errors.ownerId.message}</p>
        )}
      </div>

      {/* SECTION 4: RELATED RECORDS (CREATE MODE ONLY) */}
      {mode === 'create' && (
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span className="text-xs uppercase tracking-wider">Related Records</span>
            </div>
          </div>

          {/* Existing Links List */}
          {linkFields.length > 0 && (
            <div className="space-y-1.5">
              {linkFields.map((link, idx) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-[3px] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded-[2px] text-slate-700">
                      {link.targetType}
                    </span>
                    <span className="font-semibold text-slate-900">{link.displayName || link.targetId}</span>
                    {link.displayCode && (
                      <span className="font-mono text-[10px] text-slate-400">({link.displayCode})</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(idx)}
                    className="h-6 w-6 text-slate-400 hover:text-rose-600 rounded-[2px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add Link Row */}
          <div className="flex items-center gap-2 pt-1">
            <Select
              value={newLinkTargetType}
              onValueChange={(val) => setNewLinkTargetType(val as ActivityRelatedType)}
            >
              <SelectTrigger className="h-8 w-36 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="Target Type" />
              </SelectTrigger>
              <SelectContent className="text-xs font-sans">
                <SelectItem value="ACCOUNT">Account</SelectItem>
                <SelectItem value="CONTACT">Contact</SelectItem>
                <SelectItem value="LEAD">Lead</SelectItem>
                <SelectItem value="OPPORTUNITY">Opportunity</SelectItem>
              </SelectContent>
            </Select>

            {/* Target Picker Popover */}
            <Popover open={targetPickerOpen} onOpenChange={setTargetPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 text-xs font-normal border-slate-200 rounded-[3px] gap-1.5 flex-1 justify-between text-slate-600 hover:bg-slate-50"
                >
                  <span>Select {newLinkTargetType.toLowerCase()}…</span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 shadow-lg border-slate-200 rounded-[4px]" align="start">
                <div className="p-2 border-b border-slate-100 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <Input
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    placeholder={`Search ${newLinkTargetType.toLowerCase()}s…`}
                    className="h-8 text-xs border-0 focus-visible:ring-0 px-1 shadow-none rounded-[3px]"
                    autoFocus
                  />
                </div>
                <div className="max-h-[180px] overflow-y-auto p-1 text-xs">
                  {isLoadingTargets ? (
                    <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Searching…</span>
                    </div>
                  ) : targetOptions.length === 0 ? (
                    <div className="py-4 text-center text-slate-400 italic">No records found</div>
                  ) : (
                    targetOptions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAddLink(item)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[3px] text-left hover:bg-slate-100 text-slate-700 transition-colors"
                      >
                        <span className="truncate pr-2 font-medium">{item.displayName}</span>
                        {item.displayCode && (
                          <span className="font-mono text-[10px] text-slate-400">{item.displayCode}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* SECTION 5: PARTICIPANTS (CREATE MODE ONLY) */}
      {mode === 'create' && (
        <div className="p-4 rounded-[4px] border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs uppercase tracking-wider">Participants</span>
            </div>
          </div>

          {/* Existing Participants List */}
          {participantFields.length > 0 && (
            <div className="space-y-1.5">
              {participantFields.map((part, idx) => (
                <div
                  key={part.id}
                  className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-[3px] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-[2px]">
                      {part.role}
                    </span>
                    <span className="font-semibold text-slate-900">{part.displayName}</span>
                    {part.email && <span className="text-slate-400 text-[11px]">&lt;{part.email}&gt;</span>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParticipant(idx)}
                    className="h-6 w-6 text-slate-400 hover:text-rose-600 rounded-[2px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add Participant Input Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
            <Select
              value={newPartType}
              onValueChange={(val) => setNewPartType(val as ActivityParticipantType)}
            >
              <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="text-xs font-sans">
                <SelectItem value="USER">Tenant User</SelectItem>
                <SelectItem value="CONTACT">CRM Contact</SelectItem>
                <SelectItem value="EXTERNAL_EMAIL">External Email</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
              placeholder="Name"
              className="h-8 text-xs bg-white border-slate-200 rounded-[3px]"
            />

            <Input
              value={newPartEmail}
              onChange={(e) => setNewPartEmail(e.target.value)}
              placeholder="Email (optional)"
              className="h-8 text-xs bg-white border-slate-200 rounded-[3px]"
            />

            <div className="flex items-center gap-1">
              <Select
                value={newPartRole}
                onValueChange={(val) => setNewPartRole(val as ActivityParticipantRole)}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px] flex-1">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="text-xs font-sans">
                  <SelectItem value="ORGANIZER">Organizer</SelectItem>
                  <SelectItem value="ATTENDEE">Attendee</SelectItem>
                  <SelectItem value="REQUIRED">Required</SelectItem>
                  <SelectItem value="OPTIONAL">Optional</SelectItem>
                  <SelectItem value="CC">CC</SelectItem>
                  <SelectItem value="BCC">BCC</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddParticipant}
                className="h-8 px-2.5 text-xs font-semibold rounded-[3px]"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

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
            <span>{mode === 'create' ? 'Create Activity' : 'Save Changes'}</span>
          )}
        </Button>
      </div>
    </form>
  );
};
