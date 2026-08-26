import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  accountNoteSchema,
  AccountNoteSchemaValues,
} from '../../../model/accountSchemas';
import { NoteItem, NoteVisibility } from '@/services/api/noteApi';
import {
  useAccountNotesQuery,
  useCreateAccountNoteMutation,
  useDeleteAccountNoteMutation,
} from '../../../hooks/accountQueries';
import { mapAccountError } from '../../../model/accountErrors';
import { formatDateTime } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
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
import { ActionTooltip } from '@/components/ui/action-tooltip';
import { toast } from 'sonner';
import {
  StickyNote,
  Plus,
  Trash2,
  Lock,
  Users,
  Building,
  Loader2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface AccountNotesTabProps {
  accountId: string;
  canWrite: boolean;
}

export const AccountNotesTab: React.FC<AccountNotesTabProps> = ({
  accountId,
  canWrite,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<NoteItem | null>(null);

  const {
    data: notesResult,
    isLoading,
    isError,
    error,
    refetch,
  } = useAccountNotesQuery(accountId);

  const notes = notesResult?.items || [];

  const createMutation = useCreateAccountNoteMutation(accountId);
  const deleteMutation = useDeleteAccountNoteMutation(accountId);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<AccountNoteSchemaValues>({
    resolver: zodResolver(accountNoteSchema),
    defaultValues: {
      content: '',
      visibility: 'TEAM',
    },
  });

  const handleCreateNote = async (data: AccountNoteSchemaValues) => {
    try {
      await createMutation.mutateAsync({
        content: data.content,
        visibility: data.visibility,
      });
      toast.success('Note added');
      reset({
        content: '',
        visibility: 'TEAM',
      });
    } catch (err: any) {
      const errorMapping = mapAccountError(err);
      toast.error(errorMapping.title, { description: errorMapping.description });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        id: deleteTarget.id,
        version: deleteTarget.version,
      });
      toast.success('Note deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      const errorMapping = mapAccountError(err);
      toast.error(errorMapping.title, { description: errorMapping.description });
    }
  };

  const getVisibilityBadge = (visibility: NoteVisibility) => {
    switch (visibility) {
      case 'PRIVATE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-[2px]">
            <Lock className="w-2.5 h-2.5" />
            PRIVATE
          </span>
        );
      case 'TEAM':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-[2px]">
            <Users className="w-2.5 h-2.5" />
            TEAM
          </span>
        );
      case 'TENANT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-[2px]">
            <Building className="w-2.5 h-2.5" />
            ORGANIZATION
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Create Note Box (Gated by canWrite) */}
      {canWrite && (
        <div className="p-4 bg-white border border-slate-200 rounded-[4px] shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-xs text-slate-900">Add Account Note</span>
            <div className="w-36">
              <Select
                value={watch('visibility')}
                onValueChange={(val) => setValue('visibility', val as any)}
                disabled={createMutation.isPending}
              >
                <SelectTrigger className="h-7 text-xs rounded-[3px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs rounded-[3px]">
                  <SelectItem value="TEAM">Team Visible</SelectItem>
                  <SelectItem value="PRIVATE">Private to Me</SelectItem>
                  <SelectItem value="TENANT">Organization Wide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleCreateNote)} className="space-y-2">
            <textarea
              {...register('content')}
              disabled={createMutation.isPending}
              rows={3}
              placeholder="Record an operational update, customer meeting summary, or account context…"
              className="w-full p-2.5 text-xs bg-white rounded-[3px] border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
            />
            {errors.content && (
              <p className="text-[11px] text-rose-600 font-medium">{errors.content.message}</p>
            )}

            <div className="flex items-center justify-end pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="h-8 px-4 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
              >
                {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <Plus className="w-3.5 h-3.5" />
                <span>Post Note</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-12 bg-white rounded-[4px] border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Loading notes…</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="py-8 bg-white border border-slate-200 rounded-[4px] p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Failed to load notes</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {(error as any)?.message || 'An unexpected error occurred while communicating with the server.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-[3px]">
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && notes.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-[4px] p-10 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <StickyNote className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">
              No Account Notes
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Post background notes and collaboration updates for this account using the editor above.
            </p>
          </div>
        </div>
      )}

      {/* Notes Timeline List */}
      {!isLoading && !isError && notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-white border border-slate-200 rounded-[4px] shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {getVisibilityBadge(note.visibility)}
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDateTime(note.createdAt)}
                  </span>
                  {note.createdBy && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      by {note.createdBy}
                    </span>
                  )}
                </div>

                {canWrite && (
                  <ActionTooltip label="Delete note">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(note)}
                      className="h-7 w-7 rounded-[3px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </ActionTooltip>
                )}
              </div>

              <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Delete Note Confirmation Dialog */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-md font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Account Note?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              Are you sure you want to permanently delete this note record?
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
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Note'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
