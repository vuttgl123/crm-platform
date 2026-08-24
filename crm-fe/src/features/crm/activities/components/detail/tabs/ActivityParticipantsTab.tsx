import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ActivityParticipant,
  ActivityParticipantType,
  ActivityParticipantRole,
  CreateActivityParticipantRequest,
  UpdateActivityParticipantRequest,
} from '../../../model/activityTypes';
import {
  ActivityParticipantSchemaValues,
  activityParticipantSchema,
} from '../../../model/activitySchemas';
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Crown,
} from 'lucide-react';

interface ActivityParticipantsTabProps {
  activityId: string;
  participants: ActivityParticipant[];
  canWrite: boolean;
  onAddParticipant: (payload: CreateActivityParticipantRequest) => Promise<void>;
  onUpdateParticipant: (participantId: string, payload: UpdateActivityParticipantRequest) => Promise<void>;
  onRemoveParticipant: (participantId: string, version?: number) => Promise<void>;
  isLoading: boolean;
}

export const ActivityParticipantsTab: React.FC<ActivityParticipantsTabProps> = ({
  participants,
  canWrite,
  onAddParticipant,
  onUpdateParticipant,
  onRemoveParticipant,
  isLoading,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingParticipant, setEditingParticipant] = React.useState<ActivityParticipant | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ActivityParticipantSchemaValues>({
    resolver: zodResolver(activityParticipantSchema),
    defaultValues: {
      participantType: 'USER',
      displayName: '',
      email: '',
      role: 'ATTENDEE',
    },
  });

  const handleOpenAdd = () => {
    setEditingParticipant(null);
    reset({
      participantType: 'USER',
      displayName: '',
      email: '',
      role: 'ATTENDEE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (part: ActivityParticipant) => {
    setEditingParticipant(part);
    reset({
      participantType: part.participantType,
      displayName: part.displayName,
      email: part.email || '',
      role: part.role,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: ActivityParticipantSchemaValues) => {
    setIsSubmitting(true);
    try {
      if (editingParticipant) {
        await onUpdateParticipant(editingParticipant.id, {
          version: editingParticipant.version || 1,
          role: data.role as ActivityParticipantRole,
        });
      } else {
        await onAddParticipant({
          participantType: data.participantType as ActivityParticipantType,
          displayName: data.displayName.trim(),
          email: data.email?.trim() || null,
          role: data.role as ActivityParticipantRole,
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleBadge = (role: ActivityParticipantRole) => {
    const roleColors: Record<ActivityParticipantRole, string> = {
      ORGANIZER: 'bg-purple-50 text-purple-700 border-purple-200 font-bold',
      ATTENDEE: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
      REQUIRED: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      OPTIONAL: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
      CC: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
      BCC: 'bg-slate-100 text-slate-600 border-slate-200 font-medium',
    };

    return (
      <Badge
        variant="outline"
        className={`${roleColors[role] || 'bg-slate-100'} rounded-[3px] text-[10px] uppercase`}
      >
        {role === 'ORGANIZER' && <Crown className="w-2.5 h-2.5 mr-1 text-purple-600 inline" />}
        <span>{role}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-xs uppercase tracking-wider">Activity Participants & Attendees</span>
          </div>

          {canWrite && (
            <Button
              size="sm"
              onClick={handleOpenAdd}
              className="h-7 px-2.5 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1 shadow-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Participant</span>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400">Loading participants…</div>
        ) : participants.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="font-semibold text-slate-700">No participants added</p>
            <p className="text-[11px] text-slate-400">
              Add internal team members, CRM contacts, or external email stakeholders involved in this activity.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-[3px]">
            <Table>
              <TableHeader className="bg-[#F7F8F9]">
                <TableRow>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3">
                    Participant
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3">
                    Type
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3">
                    Role
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3">
                    Participation Status
                  </TableHead>
                  {canWrite && (
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3 text-right">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((part) => (
                  <TableRow key={part.id} className="hover:bg-[#F1F2F4] text-xs">
                    <TableCell className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{part.displayName}</span>
                        {part.email && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {part.email}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 px-3">
                      <span className="font-mono text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-[2px] uppercase">
                        {part.participantType.replace('_', ' ')}
                      </span>
                    </TableCell>

                    <TableCell className="py-2.5 px-3">
                      {renderRoleBadge(part.role)}
                    </TableCell>

                    <TableCell className="py-2.5 px-3">
                      <span className="font-semibold text-slate-600">
                        {part.participationStatus ? part.participationStatus.replace('_', ' ') : '—'}
                      </span>
                    </TableCell>

                    {canWrite && (
                      <TableCell className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(part)}
                            className="h-7 w-7 text-slate-600 hover:text-blue-600 rounded-[3px]"
                            title="Edit participant role"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveParticipant(part.id, part.version)}
                            className="h-7 w-7 text-slate-600 hover:text-rose-600 rounded-[3px]"
                            title="Remove participant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add / Edit Participant Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-[4px] max-w-md font-sans">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-slate-900">
                {editingParticipant ? 'Edit Participant Role' : 'Add Activity Participant'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Manage attendees, organizers, and stakeholders for this activity.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 space-y-3 text-xs">
              {!editingParticipant && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-800">
                      Participant Type <span className="text-rose-600">*</span>
                    </Label>
                    <Select
                      value={watch('participantType')}
                      onValueChange={(val) => setValue('participantType', val as any)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="text-xs font-sans">
                        <SelectItem value="USER">Tenant User</SelectItem>
                        <SelectItem value="CONTACT">CRM Contact</SelectItem>
                        <SelectItem value="EXTERNAL_EMAIL">External Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-800">
                      Display Name <span className="text-rose-600">*</span>
                    </Label>
                    <Input
                      {...register('displayName')}
                      placeholder="e.g. John Doe"
                      className="h-8 text-xs bg-white border-slate-200 rounded-[3px]"
                    />
                    {errors.displayName && (
                      <p className="text-[11px] text-rose-600">{errors.displayName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-800">
                      Email Address (Optional)
                    </Label>
                    <Input
                      {...register('email')}
                      placeholder="john.doe@example.com"
                      className="h-8 text-xs bg-white border-slate-200 rounded-[3px]"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-rose-600">{errors.email.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* Role */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-800">
                  Role <span className="text-rose-600">*</span>
                </Label>
                <Select
                  value={watch('role')}
                  onValueChange={(val) => setValue('role', val as any)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                    <SelectValue placeholder="Select role" />
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
              </div>
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-200 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="h-8 text-xs font-semibold rounded-[3px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-8 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px]"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                  </span>
                ) : (
                  <span>{editingParticipant ? 'Save Changes' : 'Add Participant'}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
