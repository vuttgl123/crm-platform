import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  accountChannelSchema,
  AccountChannelSchemaValues,
} from '../../../model/accountSchemas';
import {
  AccountCommunicationChannelResponse,
  ChannelType,
} from '@/services/api/accountChannelApi';
import {
  useAccountChannelsQuery,
  useCreateAccountChannelMutation,
  useUpdateAccountChannelMutation,
  useDeleteAccountChannelMutation,
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
  Mail,
  Phone,
  Smartphone,
  MessageSquare,
  Globe,
  Share2,
  Plus,
  Edit,
  Trash2,
  Star,
  CheckCircle2,
  Ban,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface AccountChannelsTabProps {
  accountId: string;
  canWrite: boolean;
}

export const AccountChannelsTab: React.FC<AccountChannelsTabProps> = ({
  accountId,
  canWrite,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] =
    useState<AccountCommunicationChannelResponse | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<AccountCommunicationChannelResponse | null>(null);

  const {
    data: channels = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAccountChannelsQuery(accountId);

  const createMutation = useCreateAccountChannelMutation(accountId);
  const updateMutation = useUpdateAccountChannelMutation(accountId);
  const deleteMutation = useDeleteAccountChannelMutation(accountId);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<AccountChannelSchemaValues>({
    resolver: zodResolver(accountChannelSchema),
    defaultValues: {
      channelType: 'EMAIL',
      rawValue: '',
      label: '',
      isPrimary: false,
      doNotUse: false,
    },
  });

  const handleOpenCreate = () => {
    setEditingChannel(null);
    reset({
      channelType: 'EMAIL',
      rawValue: '',
      label: '',
      isPrimary: false,
      doNotUse: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (ch: AccountCommunicationChannelResponse) => {
    setEditingChannel(ch);
    reset({
      channelType: ch.channelType,
      rawValue: ch.rawValue,
      label: ch.label || '',
      isPrimary: Boolean(ch.isPrimary),
      doNotUse: Boolean(ch.doNotUse),
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (data: AccountChannelSchemaValues) => {
    try {
      if (editingChannel) {
        await updateMutation.mutateAsync({
          channelId: editingChannel.id,
          version: editingChannel.version,
          data: {
            channelType: data.channelType,
            rawValue: data.rawValue,
            label: data.label?.trim() || null,
            isPrimary: data.isPrimary,
            doNotUse: data.doNotUse,
          },
        });
        toast.success('Communication channel updated');
      } else {
        await createMutation.mutateAsync({
          channelType: data.channelType,
          rawValue: data.rawValue,
          label: data.label?.trim() || null,
          isPrimary: data.isPrimary,
          doNotUse: data.doNotUse,
        });
        toast.success('Communication channel added');
      }
      setModalOpen(false);
    } catch (err: any) {
      const errorMapping = mapAccountError(err);
      toast.error(errorMapping.title, { description: errorMapping.description });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        channelId: deleteTarget.id,
        version: deleteTarget.version,
      });
      toast.success('Channel deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      const errorMapping = mapAccountError(err);
      toast.error(errorMapping.title, { description: errorMapping.description });
    }
  };

  const getChannelIcon = (type: ChannelType) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'PHONE':
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'MOBILE':
        return <Smartphone className="w-4 h-4 text-indigo-600" />;
      case 'SMS':
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'LINKEDIN':
        return <Globe className="w-4 h-4 text-blue-700" />;
      default:
        return <Share2 className="w-4 h-4 text-slate-500" />;
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Tab Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-[4px]">
        <span className="text-xs text-slate-500 font-medium">
          Verified communication channels for direct organizational outreach.
        </span>

        {canWrite && (
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Channel</span>
          </Button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-12 bg-white rounded-[4px] border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Loading communication channels…</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="py-8 bg-white border border-slate-200 rounded-[4px] p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Failed to load channels</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || 'An unexpected error occurred while communicating with the server.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-[3px]">
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && channels.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-[4px] p-10 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Mail className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">
              No Communication Channels
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Add email addresses, phone numbers, or social channels for this account.
            </p>
          </div>
          {canWrite && (
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Channel</span>
            </Button>
          )}
        </div>
      )}

      {/* Channels Table */}
      {!isLoading && !isError && channels.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden shadow-2xs">
          <Table>
            <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
              <TableRow className="hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Channel Type
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Contact Value / Address
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Label / Purpose
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Verification
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">
                  Outreach Status
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.map((ch) => {
                const isEmail = ch.channelType === 'EMAIL';
                const isPhone = ['PHONE', 'MOBILE', 'SMS', 'WHATSAPP'].includes(ch.channelType);

                return (
                  <TableRow
                    key={ch.id}
                    className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs transition-colors"
                  >
                    <TableCell className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-[3px] bg-slate-50 border border-slate-200 text-slate-600">
                          {getChannelIcon(ch.channelType)}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-slate-900">
                            {ch.channelType}
                          </span>
                          {ch.isPrimary && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-[2px]">
                              <Star className="w-2.5 h-2.5 fill-blue-600 text-blue-600" />
                              PRIMARY
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 px-3 font-mono text-xs font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{ch.rawValue}</span>
                        {isEmail && !ch.doNotUse && (
                          <ActionTooltip label={`Send email to ${ch.rawValue}`}>
                            <a
                              href={`mailto:${ch.rawValue}`}
                              className="text-blue-600 hover:text-blue-700 inline-flex items-center"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </ActionTooltip>
                        )}
                        {isPhone && !ch.doNotUse && (
                          <ActionTooltip label={`Call ${ch.rawValue}`}>
                            <a
                              href={`tel:${ch.rawValue}`}
                              className="text-emerald-600 hover:text-emerald-700 inline-flex items-center"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </ActionTooltip>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 px-3 text-slate-600">
                      {ch.label ? (
                        <span className="text-xs font-medium text-slate-800">{ch.label}</span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">General</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5 px-3">
                      {ch.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-[2px]">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          VERIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Unverified</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5 px-3">
                      {ch.doNotUse ? (
                        <Badge
                          variant="destructive"
                          className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] px-1.5 py-0 font-bold gap-1 rounded-[2px]"
                        >
                          <Ban className="w-2.5 h-2.5" />
                          DO NOT USE
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">Allowed</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5 px-3 text-right pr-4">
                      {canWrite && (
                        <div className="flex items-center justify-end gap-1">
                          <ActionTooltip label="Edit channel">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(ch)}
                              className="h-7 w-7 rounded-[3px] text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              aria-label="Edit channel"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </ActionTooltip>
                          <ActionTooltip label="Delete channel">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(ch)}
                              className="h-7 w-7 rounded-[3px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              aria-label="Delete channel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Create / Edit Channel Modal */}
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent className="max-w-md font-sans">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-slate-900">
                {editingChannel ? 'Edit Channel' : 'Add Communication Channel'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-600">
                Specify direct contact channel details for outreach and engagement.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">Channel Type *</Label>
                  <Select
                    value={watch('channelType')}
                    onValueChange={(val) => setValue('channelType', val as any)}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="h-8 text-xs rounded-[3px] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs rounded-[3px]">
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="PHONE">Phone Number</SelectItem>
                      <SelectItem value="MOBILE">Mobile</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="label" className="text-xs font-semibold text-slate-800">
                    Label (Optional)
                  </Label>
                  <Input
                    id="label"
                    {...register('label')}
                    disabled={isSaving}
                    placeholder="Support, Sales, HQ"
                    className="h-8 text-xs rounded-[3px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="rawValue" className="text-xs font-semibold text-slate-800">
                  Channel Value *
                </Label>
                <Input
                  id="rawValue"
                  {...register('rawValue')}
                  disabled={isSaving}
                  placeholder="e.g. contact@acme.com or +12025550123"
                  className="h-8 text-xs rounded-[3px]"
                />
                {errors.rawValue && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.rawValue.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 select-none">
                  <Checkbox
                    checked={watch('isPrimary')}
                    onCheckedChange={(checked) => setValue('isPrimary', Boolean(checked))}
                    disabled={isSaving}
                  />
                  <span>Mark as Primary</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-rose-700 select-none">
                  <Checkbox
                    checked={watch('doNotUse')}
                    onCheckedChange={(checked) => setValue('doNotUse', Boolean(checked))}
                    disabled={isSaving}
                  />
                  <span>Do Not Use</span>
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
                <span>{editingChannel ? 'Save Changes' : 'Add Channel'}</span>
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Channel Confirmation Dialog */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-md font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Channel?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              Are you sure you want to permanently delete this communication channel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteTarget(null)}
              className="h-8 text-xs rounded-[3px]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
              className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[3px]"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Channel'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
