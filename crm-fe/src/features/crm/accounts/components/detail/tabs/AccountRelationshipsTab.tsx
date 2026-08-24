import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  accountRelationshipSchema,
  endRelationshipSchema,
  AccountRelationshipSchemaValues,
  EndRelationshipSchemaValues,
} from '../../../model/accountSchemas';
import {
  AccountRelationshipResponse,
  RelationshipType,
} from '@/services/api/accountRelationshipApi';
import {
  useAccountRelationshipsQuery,
  useCreateAccountRelationshipMutation,
  useEndAccountRelationshipMutation,
  useParentAccountOptionsQuery,
} from '../../../hooks/accountQueries';
import { mapAccountError } from '../../../model/accountErrors';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Network,
  Plus,
  PowerOff,
  Search,
  Check,
  ChevronsUpDown,
  Loader2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountRelationshipsTabProps {
  accountId: string;
  canWrite: boolean;
}

export const AccountRelationshipsTab: React.FC<AccountRelationshipsTabProps> = ({
  accountId,
  canWrite,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [endTarget, setEndTarget] = useState<AccountRelationshipResponse | null>(null);

  const {
    data: pageResult,
    isLoading,
    isError,
    error,
    refetch,
  } = useAccountRelationshipsQuery(accountId);

  const relationships = pageResult?.items || [];

  const createMutation = useCreateAccountRelationshipMutation(accountId);
  const endMutation = useEndAccountRelationshipMutation(accountId);

  // Parent Account Picker State for relationship linking
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const { data: accountOptions = [], isLoading: isLoadingAccounts } =
    useParentAccountOptionsQuery(accountSearch, accountId);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<AccountRelationshipSchemaValues>({
    resolver: zodResolver(accountRelationshipSchema),
    defaultValues: {
      relatedAccountId: '',
      relationshipType: 'PARTNER',
      validFrom: '',
      validTo: '',
      description: '',
    },
  });

  const watchRelatedId = watch('relatedAccountId');
  const selectedAccountName =
    accountOptions.find((a) => a.id === watchRelatedId)?.displayName ||
    (watchRelatedId ? `Account (${watchRelatedId.slice(0, 8)}…)` : null);

  const {
    register: registerEnd,
    handleSubmit: handleSubmitEnd,
    reset: resetEnd,
    formState: { errors: endErrors },
  } = useForm<EndRelationshipSchemaValues>({
    resolver: zodResolver(endRelationshipSchema),
    defaultValues: {
      validTo: new Date().toISOString().split('T')[0],
    },
  });

  const handleOpenCreate = () => {
    reset({
      relatedAccountId: '',
      relationshipType: 'PARTNER',
      validFrom: '',
      validTo: '',
      description: '',
    });
    setModalOpen(true);
  };

  const handleOpenEnd = (rel: AccountRelationshipResponse) => {
    setEndTarget(rel);
    resetEnd({
      validTo: new Date().toISOString().split('T')[0],
    });
  };

  const handleFormSubmit = async (data: AccountRelationshipSchemaValues) => {
    try {
      await createMutation.mutateAsync({
        relatedAccountId: data.relatedAccountId,
        relationshipType: data.relationshipType,
        validFrom: data.validFrom || null,
        validTo: data.validTo || null,
        description: data.description?.trim() || null,
      });
      toast.success('Commercial relationship registered');
      setModalOpen(false);
    } catch (err: any) {
      const errorMapping = mapAccountError(err);
      toast.error(errorMapping.title, { description: errorMapping.description });
    }
  };

  const handleEndSubmit = async (data: EndRelationshipSchemaValues) => {
    if (!endTarget) return;
    try {
      await endMutation.mutateAsync({
        relationshipId: endTarget.id,
        data: {
          validTo: data.validTo,
        },
      });
      toast.success('Relationship ended');
      setEndTarget(null);
    } catch (err: any) {
      const errorMapping = mapAccountError(err);
      toast.error(errorMapping.title, { description: errorMapping.description });
    }
  };

  const getRelationshipBadge = (type: RelationshipType) => {
    switch (type) {
      case 'PARTNER':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] rounded-[2px]">PARTNER</Badge>;
      case 'SUPPLIER':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] rounded-[2px]">SUPPLIER</Badge>;
      case 'CUSTOMER':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] rounded-[2px]">CUSTOMER</Badge>;
      case 'AFFILIATE':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] rounded-[2px]">AFFILIATE</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] rounded-[2px]">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Tab Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-[4px]">
        <span className="text-xs text-slate-500 font-medium">
          Commercial B2B affiliations, partnerships, and supply chain links.
        </span>

        {canWrite && (
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Relationship</span>
          </Button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-12 bg-white rounded-[4px] border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Loading relationships…</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="py-8 bg-white border border-slate-200 rounded-[4px] p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Failed to load relationships</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || 'An error occurred while communicating with the server.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-[3px]">
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && relationships.length === 0 && (
        <div className="py-12 bg-white rounded-[4px] border border-slate-200 text-center space-y-2 shadow-2xs">
          <Network className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No commercial relationships</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Link partners, suppliers, distributors, or affiliates to this account.
          </p>
          {canWrite && (
            <div className="pt-2">
              <Button size="sm" onClick={handleOpenCreate} className="rounded-[3px]">
                Add Relationship
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Relationships Grid */}
      {!isLoading && !isError && relationships.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relationships.map((rel) => {
            const isEnded = Boolean(rel.validTo);
            const otherAccount =
              rel.direction === 'OUTBOUND' ? rel.relatedAccount : rel.account;

            return (
              <div
                key={rel.id}
                className={`p-4 rounded-[4px] border ${
                  isEnded ? 'bg-slate-50/70 border-slate-200 opacity-80' : 'bg-white border-slate-200 shadow-2xs'
                } space-y-3`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getRelationshipBadge(rel.relationshipType)}
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[2px]">
                      {rel.direction === 'OUTBOUND' ? (
                        <>
                          <ArrowRight className="w-3 h-3 text-blue-600" /> Outbound
                        </>
                      ) : (
                        <>
                          <ArrowLeft className="w-3 h-3 text-indigo-600" /> Inbound
                        </>
                      )}
                    </span>
                    {isEnded && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-[2px]">
                        ENDED ({rel.validTo})
                      </span>
                    )}
                  </div>

                  {canWrite && !isEnded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEnd(rel)}
                      className="h-7 w-7 p-0 text-slate-600 hover:text-rose-600 rounded-[3px]"
                      aria-label="End relationship"
                    >
                      <PowerOff className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Affiliated Organization
                  </span>
                  <p className="font-bold text-xs text-slate-900">{otherAccount.displayName}</p>
                  <p className="font-mono text-[11px] text-slate-500">{otherAccount.accountNumber}</p>
                </div>

                {rel.description && (
                  <p className="text-slate-600 text-xs italic pt-1 border-t border-slate-100">
                    "{rel.description}"
                  </p>
                )}

                {rel.validFrom && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono pt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Effective from: {rel.validFrom}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Relationship Modal */}
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent className="max-w-md font-sans">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-slate-900">
                Register Commercial Relationship
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-600">
                Link another organization in your CRM directory as a commercial partner or supplier.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-3 text-xs">
              {/* Related Account Picker */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-800">
                  Affiliated Organization *
                </Label>
                <Popover open={accountPickerOpen} onOpenChange={setAccountPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={accountPickerOpen}
                      className={cn(
                        'w-full justify-between h-8 text-xs font-normal bg-white border-slate-200 rounded-[3px] hover:bg-slate-50',
                        !watchRelatedId && 'text-slate-400'
                      )}
                    >
                      <span className="truncate">
                        {selectedAccountName || 'Select affiliated account…'}
                      </span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[340px] p-0 shadow-lg border-slate-200 rounded-[4px]" align="start">
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
                        accountOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setValue('relatedAccountId', opt.id, { shouldValidate: true });
                              setAccountPickerOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-[3px] text-left transition-colors',
                              watchRelatedId === opt.id
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
                            {watchRelatedId === opt.id && (
                              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {errors.relatedAccountId && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    {errors.relatedAccountId.message}
                  </p>
                )}
              </div>

              {/* Relationship Type */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-800">
                  Relationship Type *
                </Label>
                <Select
                  value={watch('relationshipType')}
                  onValueChange={(val) => setValue('relationshipType', val as any)}
                >
                  <SelectTrigger className="h-8 text-xs rounded-[3px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs rounded-[3px]">
                    <SelectItem value="PARTNER">Commercial Partner</SelectItem>
                    <SelectItem value="SUPPLIER">Supplier / Vendor</SelectItem>
                    <SelectItem value="CUSTOMER">Client / Customer</SelectItem>
                    <SelectItem value="AFFILIATE">Affiliate</SelectItem>
                    <SelectItem value="OTHER">Other B2B Affiliation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="validFrom" className="text-xs font-semibold text-slate-800">
                    Effective From
                  </Label>
                  <Input
                    id="validFrom"
                    type="date"
                    {...register('validFrom')}
                    className="h-8 text-xs rounded-[3px] bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="validTo" className="text-xs font-semibold text-slate-800">
                    Valid Until (Optional)
                  </Label>
                  <Input
                    id="validTo"
                    type="date"
                    {...register('validTo')}
                    className="h-8 text-xs rounded-[3px] bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-xs font-semibold text-slate-800">
                  Description / Contract Terms
                </Label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={2}
                  placeholder="Terms, mutual agreement context, or scope of affiliation…"
                  className="w-full p-2.5 text-xs bg-white rounded-[3px] border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>
            </div>

            <AlertDialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="h-8 text-xs rounded-[3px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="h-8 px-4 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
              >
                {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Add Relationship</span>
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Relationship Dialog */}
      <AlertDialog open={Boolean(endTarget)} onOpenChange={(open) => !open && setEndTarget(null)}>
        <AlertDialogContent className="max-w-md font-sans">
          <form onSubmit={handleSubmitEnd(handleEndSubmit)} className="space-y-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-slate-900">
                End Commercial Relationship
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-600">
                Set an effective end date to transition this commercial relationship to historical status.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2 text-xs">
              <Label htmlFor="endValidTo" className="text-xs font-semibold text-slate-800">
                Effective End Date (YYYY-MM-DD) *
              </Label>
              <Input
                id="endValidTo"
                type="date"
                {...registerEnd('validTo')}
                className="h-8 text-xs rounded-[3px] bg-white"
              />
              {endErrors.validTo && (
                <p className="text-[11px] text-rose-600">{endErrors.validTo.message}</p>
              )}
            </div>

            <AlertDialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={endMutation.isPending}
                onClick={() => setEndTarget(null)}
                className="h-8 text-xs rounded-[3px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={endMutation.isPending}
                className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[3px]"
              >
                {endMutation.isPending ? 'Ending…' : 'End Relationship'}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
