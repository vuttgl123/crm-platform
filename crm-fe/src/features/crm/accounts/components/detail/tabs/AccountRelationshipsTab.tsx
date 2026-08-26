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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ActionTooltip } from '@/components/ui/action-tooltip';
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
        <div className="bg-white border border-slate-200 rounded-[4px] p-10 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Network className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">
              No Commercial Relationships
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Link partners, suppliers, distributors, or affiliates to this account.
            </p>
          </div>
          {canWrite && (
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Relationship</span>
            </Button>
          )}
        </div>
      )}

      {/* Relationships Table */}
      {!isLoading && !isError && relationships.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden shadow-2xs">
          <Table>
            <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
              <TableRow className="hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Affiliated Organization
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Relationship Type
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Direction
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Context / Notes
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Validity Period
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relationships.map((rel) => {
                const isEnded = Boolean(rel.validTo);
                const otherAccount =
                  rel.direction === 'OUTBOUND' ? rel.relatedAccount : rel.account;

                return (
                  <TableRow
                    key={rel.id}
                    className={`hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs transition-colors ${
                      isEnded ? 'opacity-60 bg-slate-50/50' : ''
                    }`}
                  >
                    <TableCell className="py-2.5 px-3">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 line-clamp-1">
                          {otherAccount.displayName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 font-semibold mt-0.5">
                          {otherAccount.accountNumber}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 px-3">
                      {getRelationshipBadge(rel.relationshipType)}
                    </TableCell>

                    <TableCell className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-[2px]">
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
                    </TableCell>

                    <TableCell className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                      {rel.description || <span className="text-slate-400 italic text-[11px]">No notes</span>}
                    </TableCell>

                    <TableCell className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {rel.validFrom ? (
                        <span>
                          {rel.validFrom} → {rel.validTo || 'Present'}
                        </span>
                      ) : (
                        <span>Ongoing</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5 px-3 text-right pr-4">
                      {canWrite && !isEnded && (
                        <div className="flex items-center justify-end">
                          <ActionTooltip label="End relationship">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEnd(rel)}
                              className="h-7 w-7 rounded-[3px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              aria-label="End relationship"
                            >
                              <PowerOff className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
