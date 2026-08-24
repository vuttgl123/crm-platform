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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  OpportunityStakeholderResponse,
  OpportunityStakeholderRole,
  OpportunityStakeholderInfluence,
  CreateOpportunityStakeholderRequest,
  UpdateOpportunityStakeholderRequest,
} from '../../../model/opportunityTypes';
import {
  OpportunityStakeholderSchemaValues,
  opportunityStakeholderSchema,
} from '../../../model/opportunitySchemas';
import { contactApi } from '@/services/api/contactApi';
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Star,
  Loader2,
} from 'lucide-react';

interface OpportunityStakeholdersTabProps {
  accountId: string;
  stakeholders: OpportunityStakeholderResponse[];
  canWrite: boolean;
  onAddStakeholder: (payload: CreateOpportunityStakeholderRequest) => Promise<void>;
  onUpdateStakeholder: (stakeholderId: string, payload: UpdateOpportunityStakeholderRequest) => Promise<void>;
  onDeleteStakeholder: (stakeholderId: string, version: number) => Promise<void>;
  isLoading: boolean;
}

export const OpportunityStakeholdersTab: React.FC<OpportunityStakeholdersTabProps> = ({
  accountId,
  stakeholders,
  canWrite,
  onAddStakeholder,
  onUpdateStakeholder,
  onDeleteStakeholder,
  isLoading,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingStakeholder, setEditingStakeholder] = React.useState<OpportunityStakeholderResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Available contacts for account
  const [contacts, setContacts] = React.useState<{ id: string; displayName: string; jobTitle?: string }[]>([]);
  const [contactsMap, setContactsMap] = React.useState<Map<string, { displayName: string; jobTitle?: string }>>(new Map());

  React.useEffect(() => {
    if (accountId) {
      contactApi.search({ accountId, size: 100 }).then((res) => {
        const items = res.items || [];
        const mapped = items.map((c) => ({
          id: c.id,
          displayName: c.displayName,
          jobTitle: c.jobTitle || undefined,
        }));
        setContacts(mapped);
        const map = new Map<string, { displayName: string; jobTitle?: string }>();
        mapped.forEach((c) => {
          map.set(c.id, {
            displayName: c.displayName,
            jobTitle: c.jobTitle,
          });
        });
        setContactsMap(map);
      }).catch(() => {});
    }
  }, [accountId]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OpportunityStakeholderSchemaValues>({
    resolver: zodResolver(opportunityStakeholderSchema),
    defaultValues: {
      contactId: '',
      role: 'DECISION_MAKER',
      influenceLevel: 'HIGH',
      primary: false,
    },
  });

  const handleOpenAdd = () => {
    setEditingStakeholder(null);
    reset({
      contactId: contacts[0]?.id || '',
      role: 'DECISION_MAKER',
      influenceLevel: 'HIGH',
      primary: stakeholders.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: OpportunityStakeholderResponse) => {
    setEditingStakeholder(st);
    reset({
      contactId: st.contactId,
      role: st.role,
      influenceLevel: st.influenceLevel || 'MEDIUM',
      primary: st.primary,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: OpportunityStakeholderSchemaValues) => {
    setIsSubmitting(true);
    try {
      if (editingStakeholder) {
        await onUpdateStakeholder(editingStakeholder.id, {
          version: editingStakeholder.version,
          role: data.role as OpportunityStakeholderRole,
          influenceLevel: data.influenceLevel as OpportunityStakeholderInfluence,
          primary: data.primary,
        });
      } else {
        await onAddStakeholder({
          contactId: data.contactId,
          role: data.role as OpportunityStakeholderRole,
          influenceLevel: data.influenceLevel as OpportunityStakeholderInfluence,
          primary: data.primary,
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleBadge = (role: OpportunityStakeholderRole) => {
    const roleColors: Record<OpportunityStakeholderRole, string> = {
      DECISION_MAKER: 'bg-purple-50 text-purple-700 border-purple-200',
      CHAMPION: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      INFLUENCER: 'bg-blue-50 text-blue-700 border-blue-200',
      PROCUREMENT: 'bg-amber-50 text-amber-700 border-amber-200',
      TECHNICAL_EVALUATOR: 'bg-sky-50 text-sky-700 border-sky-200',
      LEGAL: 'bg-rose-50 text-rose-700 border-rose-200',
      OTHER: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <Badge variant="outline" className={`${roleColors[role] || 'bg-slate-100'} font-bold rounded-[3px] text-[10px]`}>
        {role.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="text-xs uppercase tracking-wider">Opportunity Stakeholders & Buying Committee</span>
          </div>

          {canWrite && (
            <Button
              size="sm"
              onClick={handleOpenAdd}
              className="h-7 px-2.5 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1 shadow-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stakeholder</span>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400">Loading stakeholders…</div>
        ) : stakeholders.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="font-semibold text-slate-700">No stakeholders linked yet</p>
            <p className="text-[11px] text-slate-400">
              Add contacts from the customer organization to map the buying committee and decision makers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-[3px]">
            <Table>
              <TableHeader className="bg-[#F7F8F9]">
                <TableRow>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3">
                    Contact Stakeholder
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3">
                    Buying Committee Role
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3">
                    Influence Level
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3">
                    Primary State
                  </TableHead>
                  {canWrite && (
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2 px-3 text-right">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {stakeholders.map((st) => {
                  const contactInfo = contactsMap.get(st.contactId);
                  return (
                    <TableRow key={st.id} className="hover:bg-[#F1F2F4] text-xs">
                      <TableCell className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {contactInfo?.displayName || `Contact: ${st.contactId.slice(0, 8)}…`}
                          </span>
                          {contactInfo?.jobTitle && (
                            <span className="text-[10px] text-slate-400">
                              {contactInfo.jobTitle}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-2.5 px-3">
                        {renderRoleBadge(st.role)}
                      </TableCell>

                      <TableCell className="py-2.5 px-3">
                        <span className="font-semibold text-slate-700">
                          {st.influenceLevel || 'MEDIUM'}
                        </span>
                      </TableCell>

                      <TableCell className="py-2.5 px-3">
                        {st.primary ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-bold rounded-[2px] text-[10px] gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>Primary Contact</span>
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Secondary</span>
                        )}
                      </TableCell>

                      {canWrite && (
                        <TableCell className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(st)}
                              className="h-7 w-7 text-slate-600 hover:text-blue-600 rounded-[3px]"
                              title="Edit stakeholder"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteStakeholder(st.id, st.version)}
                              className="h-7 w-7 text-slate-600 hover:text-rose-600 rounded-[3px]"
                              title="Remove stakeholder"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Stakeholder Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-[4px] max-w-md font-sans">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-slate-900">
                {editingStakeholder ? 'Edit Stakeholder Role' : 'Add Opportunity Stakeholder'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Map organization contacts to their influence and responsibility on this deal.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 space-y-3 text-xs">
              {/* Contact Selector */}
              {!editingStakeholder && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-800">
                    Select Contact <span className="text-rose-600">*</span>
                  </Label>
                  <Select
                    value={watch('contactId')}
                    onValueChange={(val) => setValue('contactId', val, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent className="text-xs font-sans">
                      {contacts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.displayName} {c.jobTitle ? `(${c.jobTitle})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.contactId && (
                    <p className="text-[11px] text-rose-600 font-medium">{errors.contactId.message}</p>
                  )}
                </div>
              )}

              {/* Role */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-800">
                  Role in Deal <span className="text-rose-600">*</span>
                </Label>
                <Select
                  value={watch('role')}
                  onValueChange={(val) => setValue('role', val as any)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="text-xs font-sans">
                    <SelectItem value="DECISION_MAKER">Decision Maker</SelectItem>
                    <SelectItem value="CHAMPION">Champion</SelectItem>
                    <SelectItem value="TECHNICAL_EVALUATOR">Technical Evaluator</SelectItem>
                    <SelectItem value="INFLUENCER">Influencer</SelectItem>
                    <SelectItem value="PROCUREMENT">Procurement</SelectItem>
                    <SelectItem value="LEGAL">Legal</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Influence Level */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-800">
                  Influence Level
                </Label>
                <Select
                  value={watch('influenceLevel') || 'MEDIUM'}
                  onValueChange={(val) => setValue('influenceLevel', val as any)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                    <SelectValue placeholder="Select influence" />
                  </SelectTrigger>
                  <SelectContent className="text-xs font-sans">
                    <SelectItem value="HIGH">High Influence</SelectItem>
                    <SelectItem value="MEDIUM">Medium Influence</SelectItem>
                    <SelectItem value="LOW">Low Influence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Primary Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-semibold">
                  <input
                    type="checkbox"
                    {...register('primary')}
                    className="w-4 h-4 text-blue-600 rounded-[3px] border-slate-300"
                  />
                  <span>Designate as Primary Contact for this Opportunity</span>
                </label>
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
                  <span>{editingStakeholder ? 'Save Changes' : 'Add Stakeholder'}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
