import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  leadConversionSchema,
  LeadConversionSchemaValues,
} from '../model/leadSchemas';
import {
  LeadSummaryResponse,
  LeadResponse,
  LeadStatusItem,
} from '../model/leadTypes';
import { useConvertLeadMutation } from '../hooks/leadQueries';
import { mapLeadError } from '../model/leadErrors';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Info } from 'lucide-react';

interface LeadConversionDialogProps {
  isOpen: boolean;
  lead: LeadSummaryResponse | LeadResponse | null;
  statuses: LeadStatusItem[];
  tenantId?: string;
  onClose: () => void;
}

export const LeadConversionDialog: React.FC<LeadConversionDialogProps> = ({
  isOpen,
  lead,
  statuses,
  tenantId = 'default',
  onClose,
}) => {
  const { mutateAsync: convertLead, isPending } = useConvertLeadMutation(tenantId);

  // Filter statuses belonging to CONVERTED category
  const convertedStatuses = React.useMemo(() => {
    return statuses.filter((s) => s.statusCategory === 'CONVERTED' && s.active);
  }, [statuses]);

  const defaultConvertedStatusId = convertedStatuses[0]?.id || '';

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LeadConversionSchemaValues>({
    resolver: zodResolver(leadConversionSchema),
    defaultValues: {
      version: lead?.version || 1,
      convertedStatusId: defaultConvertedStatusId,
      convertedAccountId: null,
      convertedContactId: null,
      convertedOpportunityId: null,
    },
  });

  React.useEffect(() => {
    if (lead) {
      reset({
        version: lead.version,
        convertedStatusId: defaultConvertedStatusId,
        convertedAccountId: null,
        convertedContactId: null,
        convertedOpportunityId: null,
      });
    }
  }, [lead, defaultConvertedStatusId, reset]);

  if (!lead) return null;

  const handleFormSubmit = async (data: LeadConversionSchemaValues) => {
    try {
      await convertLead({
        id: lead.id,
        data: {
          version: data.version,
          convertedStatusId: data.convertedStatusId,
          convertedAccountId: data.convertedAccountId || null,
          convertedContactId: data.convertedContactId || null,
          convertedOpportunityId: data.convertedOpportunityId || null,
        },
      });
      toast.success('Lead marked as converted.');
      onClose();
    } catch (err: any) {
      const errorMapping = mapLeadError(err);
      toast.error(errorMapping.title, {
        description: errorMapping.description,
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <AlertDialogContent className="max-w-md font-sans">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <AlertDialogHeader className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <div className="p-2 rounded-[4px] bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <AlertDialogTitle className="text-base font-bold text-slate-900">
                Mark Lead as Converted
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-slate-600">
              Transition{' '}
              <strong className="text-slate-900 font-semibold">{lead.displayName}</strong>{' '}
              (<span className="font-mono text-slate-700">{lead.leadNumber}</span>) to converted status.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Converted Status Select */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-800">
              Converted Status <span className="text-rose-500">*</span>
            </Label>
            <Controller
              control={control}
              name="convertedStatusId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-8 text-xs bg-white rounded-[3px]">
                    <SelectValue placeholder="Select converted status" />
                  </SelectTrigger>
                  <SelectContent className="text-xs rounded-[3px]">
                    {convertedStatuses.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.convertedStatusId && (
              <p className="text-[11px] text-rose-600 font-medium">
                {errors.convertedStatusId.message}
              </p>
            )}
          </div>

          {/* Optional Reference Links */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-3 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Link Existing CRM Records (Optional)
            </span>

            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="convertedAccountId" className="text-[11px] font-medium text-slate-700">
                  Account UUID
                </Label>
                <Input
                  id="convertedAccountId"
                  {...register('convertedAccountId')}
                  disabled={isPending}
                  placeholder="Existing Account UUID (optional)"
                  className="h-8 text-xs font-mono rounded-[3px] bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="convertedContactId" className="text-[11px] font-medium text-slate-700">
                  Contact UUID
                </Label>
                <Input
                  id="convertedContactId"
                  {...register('convertedContactId')}
                  disabled={isPending}
                  placeholder="Existing Contact UUID (optional)"
                  className="h-8 text-xs font-mono rounded-[3px] bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="convertedOpportunityId" className="text-[11px] font-medium text-slate-700">
                  Opportunity UUID
                </Label>
                <Input
                  id="convertedOpportunityId"
                  {...register('convertedOpportunityId')}
                  disabled={isPending}
                  placeholder="Existing Opportunity UUID (optional)"
                  className="h-8 text-xs font-mono rounded-[3px] bg-white"
                />
              </div>
            </div>

            <div className="flex items-start gap-1.5 pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Marking a lead as converted updates its stage and stores references. It does not automatically create new Account or Deal records.
              </span>
            </div>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={onClose}
              className="h-8 text-xs font-semibold rounded-[3px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-8 text-xs font-semibold rounded-[3px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Converting…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Conversion</span>
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
