import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Users2,
  Building2,
  Crown,
  Users,
  Edit,
  AlertCircle,
  Save,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { TeamItem } from '@/services/api/teamApi';

interface TeamEditorSheetProps {
  isOpen: boolean;
  mode: 'view' | 'edit' | 'create';
  team: TeamItem | null;
  onClose: () => void;
  onSwitchMode: (newMode: 'view' | 'edit') => void;
  onSaveTeam: (data: {
    id?: string;
    code: string;
    name: string;
    leaderName?: string;
    description?: string;
    version?: number;
  }) => Promise<void>;
}

export const TeamEditorSheet: React.FC<TeamEditorSheetProps> = ({
  isOpen,
  mode,
  team,
  onClose,
  onSwitchMode,
  onSaveTeam,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  useEffect(() => {
    if (mode === 'create') {
      setCode(`TM-${Math.floor(10 + Math.random() * 90)}`);
      setName('');
      setLeaderName('');
      setDescription('');
      setIsDirty(false);
    } else if (team) {
      setCode(team.code || team.teamCode || '');
      setName(team.name || '');
      setLeaderName(team.leaderName || '');
      setDescription(team.description || '');
      setIsDirty(false);
    }
  }, [team, mode, isOpen]);

  const handleAttemptClose = useCallback(() => {
    if (isDirty && (mode === 'edit' || mode === 'create')) {
      setShowDiscardDialog(true);
    } else {
      onClose();
    }
  }, [isDirty, mode, onClose]);

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    setIsDirty(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveTeam({
        id: team?.id,
        code: code.trim(),
        name: name.trim(),
        leaderName: leaderName.trim(),
        description: description.trim(),
        version: team?.version || 1,
      });
      setIsDirty(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleAttemptClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl p-0 flex flex-col bg-[#F7F8F9] z-50 border-l border-slate-200 font-sans"
        >
          {/* Header */}
          <SheetHeader className="px-6 py-4 bg-white border-b border-slate-200 shrink-0 pr-12">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-[#E9F2FF] text-[#0C66E4] flex items-center justify-center font-bold shrink-0 border border-[#C0D9FF]">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-slate-900">
                    {mode === 'create'
                      ? 'Create Department Team'
                      : mode === 'edit'
                      ? `Edit Team: ${team?.name}`
                      : `Team Profile: ${team?.name}`}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-slate-500 mt-0.5">
                    {mode === 'view'
                      ? 'Organizational unit structure, leadership, and workforce details'
                      : 'Define department code, designated team lead, and operational scope'}
                  </SheetDescription>
                </div>
              </div>

              {mode === 'view' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSwitchMode('edit')}
                  className="h-8 px-3 text-xs font-semibold rounded-[3px] border-slate-200 hover:bg-slate-50 gap-1.5 shrink-0"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit Team</span>
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {/* VIEW MODE */}
            {mode === 'view' && team && (
              <div className="space-y-4">
                {/* Hero Profile Banner */}
                <div className="p-4 rounded-[4px] bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-[4px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-base flex items-center justify-center shadow-2xs shrink-0 tracking-wider">
                      <Users2 className="w-6 h-6" />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-slate-900 leading-tight">
                          {team.name}
                        </h2>
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-[2px]">
                          {team.code || team.teamCode}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px] rounded-[2px]"
                        >
                          ACTIVE
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="font-semibold text-slate-800">{team.leaderName || 'Unassigned'}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-medium">{team.membersCount || 1} Assigned Members</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 1: Department Overview & Mission */}
                <div className="rounded-[4px] bg-white border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#F7F8F9] border-b border-slate-200 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Department Profile &amp; Governance
                    </span>
                  </div>
                  <div className="p-4 divide-y divide-slate-100">
                    <div className="py-2.5 first:pt-0 flex items-center justify-between gap-4">
                      <span className="text-slate-500 font-medium w-44 shrink-0">
                        Department Title
                      </span>
                      <span className="font-semibold text-slate-900 text-right">
                        {team.name}
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-slate-500 font-medium w-44 shrink-0">
                        Identifier Code
                      </span>
                      <span className="font-mono font-bold text-blue-700 text-right">
                        {team.code || team.teamCode}
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-slate-500 font-medium w-44 shrink-0">
                        Appointed Team Lead
                      </span>
                      <div className="flex items-center justify-end gap-1.5 font-semibold text-slate-800 text-right">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span>{team.leaderName || 'Unassigned'}</span>
                      </div>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-slate-500 font-medium w-44 shrink-0">
                        Workforce Allocation
                      </span>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-[10px] rounded-[2px]"
                        >
                          {team.membersCount || 1} Members Provisioned
                        </Badge>
                      </div>
                    </div>

                    {team.description && (
                      <div className="py-2.5 last:pb-0 flex items-start justify-between gap-4">
                        <span className="text-slate-500 font-medium w-44 shrink-0">
                          Mission Description
                        </span>
                        <span className="text-slate-700 text-right leading-relaxed max-w-sm">
                          {team.description}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Operational Health & Audit */}
                <div className="rounded-[4px] bg-white border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#F7F8F9] border-b border-slate-200 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Operational Health &amp; Scoping
                    </span>
                  </div>
                  <div className="p-4 divide-y divide-slate-100">
                    <div className="py-2.5 first:pt-0 flex items-center justify-between gap-4">
                      <span className="text-slate-500 font-medium w-44 shrink-0">
                        Operational Status
                      </span>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px] rounded-[2px]"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1 inline" />
                          <span>Active Workforce Unit</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="py-2.5 last:pb-0 flex items-center justify-between gap-4">
                      <span className="text-slate-500 font-medium w-44 shrink-0">
                        Record ID
                      </span>
                      <span className="font-mono text-slate-600 text-right">
                        {team.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EDIT / CREATE MODE */}
            {(mode === 'edit' || mode === 'create') && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 rounded-[4px] bg-white border border-slate-200 shadow-2xs space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-800">
                      Team Identifier Code *
                    </Label>
                    <Input
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setIsDirty(true);
                      }}
                      required
                      placeholder="e.g. SALES_ENT"
                      className="h-8 text-xs font-mono uppercase rounded-[3px] border-slate-200 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-800">
                      Department / Team Name *
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setIsDirty(true);
                      }}
                      required
                      placeholder="e.g. Strategic Enterprise Commercial Group"
                      className="h-8 text-xs rounded-[3px] border-slate-200 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-800">
                      Appointed Team Lead
                    </Label>
                    <Input
                      value={leaderName}
                      onChange={(e) => {
                        setLeaderName(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="e.g. Alex Nguyen"
                      className="h-8 text-xs rounded-[3px] border-slate-200 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-800">
                      Mission Scope &amp; Objectives
                    </Label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Describe team operational objectives, assigned territory, and workforce coverage..."
                      className="w-full text-xs border border-slate-200 rounded-[3px] p-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white text-slate-900 resize-y"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAttemptClose}
                    className="h-8 px-3 text-xs font-semibold rounded-[3px] border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="h-8 px-4 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{mode === 'create' ? 'Create Team' : 'Save Changes'}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Discard Confirmation Modal */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="max-w-md font-sans rounded-[4px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <AlertCircle className="w-5 h-5" />
              <AlertDialogTitle className="text-base font-bold text-slate-900">
                Discard unsaved changes?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-slate-600">
              You have unsaved edits to this department configuration. Closing now will discard all changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="h-8 text-xs font-semibold rounded-[3px] border-slate-200">
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDiscard}
              className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[3px]"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
