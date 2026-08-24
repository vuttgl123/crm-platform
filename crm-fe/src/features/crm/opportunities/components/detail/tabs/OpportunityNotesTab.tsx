import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  OpportunityNoteResponse,
  NoteVisibility,
  CreateOpportunityNoteRequest,
  UpdateOpportunityNoteRequest,
} from '../../../model/opportunityTypes';
import {
  OpportunityNoteSchemaValues,
  opportunityNoteSchema,
} from '../../../model/opportunitySchemas';
import { formatDateTime } from '@/lib/formatters';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Lock,
  Users,
  Building,
  Loader2,
  Clock,
} from 'lucide-react';

interface OpportunityNotesTabProps {
  notes: OpportunityNoteResponse[];
  canWrite: boolean;
  onAddNote: (payload: CreateOpportunityNoteRequest) => Promise<void>;
  onUpdateNote: (noteId: string, payload: UpdateOpportunityNoteRequest) => Promise<void>;
  onDeleteNote: (noteId: string, version: number) => Promise<void>;
  isLoading: boolean;
}

export const OpportunityNotesTab: React.FC<OpportunityNotesTabProps> = ({
  notes,
  canWrite,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  isLoading,
}) => {
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<OpportunityNoteResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OpportunityNoteSchemaValues>({
    resolver: zodResolver(opportunityNoteSchema),
    defaultValues: {
      title: '',
      body: '',
      visibility: 'TEAM',
    },
  });

  const handleOpenAdd = () => {
    setEditingNote(null);
    reset({
      title: '',
      body: '',
      visibility: 'TEAM',
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (note: OpportunityNoteResponse) => {
    setEditingNote(note);
    reset({
      title: note.title || '',
      body: note.body,
      visibility: note.visibility,
    });
    setIsEditorOpen(true);
  };

  const handleFormSubmit = async (data: OpportunityNoteSchemaValues) => {
    setIsSubmitting(true);
    try {
      if (editingNote) {
        await onUpdateNote(editingNote.id, {
          version: editingNote.version,
          title: data.title || null,
          body: data.body,
          visibility: data.visibility as NoteVisibility,
        });
      } else {
        await onAddNote({
          title: data.title || null,
          body: data.body,
          visibility: data.visibility as NoteVisibility,
        });
      }
      setIsEditorOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderVisibilityBadge = (visibility: NoteVisibility) => {
    switch (visibility) {
      case 'PRIVATE':
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold rounded-[2px] text-[10px] gap-1">
            <Lock className="w-2.5 h-2.5" />
            <span>Private</span>
          </Badge>
        );
      case 'TEAM':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold rounded-[2px] text-[10px] gap-1">
            <Users className="w-2.5 h-2.5" />
            <span>Team Only</span>
          </Badge>
        );
      case 'TENANT':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold rounded-[2px] text-[10px] gap-1">
            <Building className="w-2.5 h-2.5" />
            <span>Organization</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="text-xs uppercase tracking-wider">Opportunity Notes & Meeting Minutes</span>
          </div>

          {canWrite && !isEditorOpen && (
            <Button
              size="sm"
              onClick={handleOpenAdd}
              className="h-7 px-2.5 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1 shadow-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </Button>
          )}
        </div>

        {/* Note Editor Box */}
        {isEditorOpen && (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] space-y-3">
            <h4 className="font-bold text-slate-900 text-xs">
              {editingNote ? 'Edit Note' : 'New Note'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Note Title (Optional)</Label>
                <Input
                  {...register('title')}
                  placeholder="e.g. Key Takeaways from Architecture Review"
                  className="h-8 text-xs bg-white border-slate-200 rounded-[3px]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Visibility</Label>
                <Select
                  value={watch('visibility')}
                  onValueChange={(val) => setValue('visibility', val as any)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent className="text-xs font-sans">
                    <SelectItem value="TEAM">Team Only</SelectItem>
                    <SelectItem value="TENANT">All Organization</SelectItem>
                    <SelectItem value="PRIVATE">Private (Only Me)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                Note Content <span className="text-rose-600">*</span>
              </Label>
              <Textarea
                {...register('body')}
                rows={3}
                placeholder="Write detailed notes, client objections, action items…"
                className="text-xs bg-white border-slate-200 rounded-[3px]"
              />
              {errors.body && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.body.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditorOpen(false)}
                disabled={isSubmitting}
                className="h-7 text-xs font-semibold rounded-[3px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-7 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px]"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                  </span>
                ) : (
                  <span>{editingNote ? 'Save Changes' : 'Post Note'}</span>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Notes List */}
        {isLoading ? (
          <div className="py-8 text-center text-slate-400">Loading notes…</div>
        ) : notes.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="font-semibold text-slate-700">No notes yet</p>
            <p className="text-[11px] text-slate-400">
              Capture meeting notes, commercial terms, and deal progression context here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-slate-50/50 border border-slate-200 rounded-[4px] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {note.title && (
                      <h5 className="font-bold text-xs text-slate-900">{note.title}</h5>
                    )}
                    {renderVisibilityBadge(note.visibility)}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(note.createdAt)}
                    </span>

                    {canWrite && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(note)}
                          className="h-6 w-6 text-slate-500 hover:text-blue-600 rounded-[2px]"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteNote(note.id, note.version)}
                          className="h-6 w-6 text-slate-500 hover:text-rose-600 rounded-[2px]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {note.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
