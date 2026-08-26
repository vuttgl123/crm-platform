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
import { SearchableSelect } from '@/components/ui/searchable-select';
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
  User,
  Shield,
  Clock,
  Edit,
  AlertCircle,
  Building2,
  Mail,
  CheckCircle2,
  Lock,
  Save,
  X,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { RoleSummaryResponse } from '@/services/api/roleApi';
import { ActiveUser } from '../UsersPage';

interface UserEditorSheetProps {
  isOpen: boolean;
  mode: 'view' | 'edit';
  user: ActiveUser | null;
  roles: RoleSummaryResponse[];
  canManage: boolean;
  onClose: () => void;
  onSwitchMode: (newMode: 'view' | 'edit') => void;
  onSaveUser: (updatedUser: ActiveUser) => Promise<void>;
}

export const UserEditorSheet: React.FC<UserEditorSheetProps> = ({
  isOpen,
  mode,
  user,
  roles,
  canManage,
  onClose,
  onSwitchMode,
  onSaveUser,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setSelectedRoleId(user.roleId || (roles[0]?.id ?? ''));
      setStatus(user.status || 'ACTIVE');
      setIsDirty(false);
    }
  }, [user, roles, isOpen, mode]);

  const handleRequestClose = useCallback(() => {
    if (isDirty && mode === 'edit') {
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
    if (!user) return;

    const chosenRole = roles.find((r) => r.id === selectedRoleId);

    setIsSubmitting(true);
    try {
      await onSaveUser({
        ...user,
        displayName: displayName.trim() || user.displayName,
        email: email.trim() || user.email,
        roleId: selectedRoleId,
        roleName: chosenRole?.name || user.roleName,
        status,
      });
      setIsDirty(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  // Compute initials for Avatar Pod
  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const assignedRoleObj = roles.find((r) => r.id === user.roleId || r.name === user.roleName);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleRequestClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl p-0 flex flex-col bg-[#F7F8F9] z-50 border-l border-slate-200 font-sans"
        >
          {/* Header Bar */}
          <SheetHeader className="px-6 py-4 bg-white border-b border-slate-200 shrink-0 pr-12">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-slate-900">
                    {mode === 'view'
                      ? `Member Profile: ${user.displayName}`
                      : `Edit Member: ${user.displayName}`}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-slate-500 mt-0.5">
                    {mode === 'view'
                      ? 'Workforce identity, organizational affiliation, and RBAC permissions'
                      : 'Update member profile information and security role assignments'}
                  </SheetDescription>
                </div>
              </div>

              {mode === 'view' && canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSwitchMode('edit')}
                  className="h-8 px-3 text-xs font-semibold rounded-[3px] border-slate-200 hover:bg-slate-50 gap-1.5 shrink-0"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit Member</span>
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {/* Hero Profile Banner */}
            <div className="p-4 rounded-[4px] bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-start gap-4">
                {/* Avatar Pod */}
                <div className="w-12 h-12 rounded-[4px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-base flex items-center justify-center shadow-2xs shrink-0 tracking-wider">
                  {initials}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      {user.displayName}
                    </h2>
                    {user.isTenantAdmin && (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[9px] px-1.5 py-0.2 rounded-[2px]">
                        ADMIN
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-slate-600">
                      {user.email}
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px] rounded-[2px]"
                    >
                      {user.status}
                    </Badge>
                    {assignedRoleObj?.roleCode && (
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-[2px]">
                        {assignedRoleObj.roleCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* VIEW MODE */}
            {mode === 'view' && (
              <div className="space-y-4">
                {/* Card 1: Identity & Organizational Affiliation */}
                <div className="rounded-[4px] bg-white border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#F7F8F9] border-b border-slate-200 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Identity &amp; Profile Details
                    </span>
                  </div>
                  <div className="p-4 divide-y divide-slate-100">
                    <div className="py-2.5 first:pt-0 flex items-center justify-between gap-4">
                      <span className="text-slate-500 font-medium w-44 shrink-0">
                        Full Display Name
                      </span>
                      <span className="font-semibold text-slate-900 text-right">
                        {user.displayName}
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-slate-500 font-medium w-44 shrink-0">
                        Corporate Work Email
                      </span>
                      <span className="font-mono font-medium text-slate-800 text-right">
                        {user.email}
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-slate-500 font-medium w-44 shrink-0">
                        Account Status
                      </span>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px] rounded-[2px]"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1 inline" />
                          <span>Active Seat Provisioned</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Security & Permissions Assignment */}
                <div className="rounded-[4px] bg-white border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#F7F8F9] border-b border-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Security &amp; RBAC Role Assignment
                    </span>
                  </div>
                  <div className="p-4 divide-y divide-slate-100">
                    <div className="py-2.5 first:pt-0 flex items-center justify-between gap-4">
                      <span className="text-slate-500 font-medium w-44 shrink-0">
                        Assigned Role
                      </span>
                      <div className="text-right flex items-center justify-end gap-1.5">
                        <span className="font-bold text-slate-900">
                          {assignedRoleObj?.name || user.roleName}
                        </span>
                        {assignedRoleObj?.roleCode && (
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] bg-slate-100 text-slate-600 border-slate-200 rounded-[2px]"
                          >
                            {assignedRoleObj.roleCode}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-slate-500 font-medium w-44 shrink-0">
                        Tenant Administrator
                      </span>
                      <span className="font-semibold text-slate-800 text-right">
                        {user.isTenantAdmin ? (
                          <span className="text-blue-600 font-bold">Yes (Master Admin)</span>
                        ) : (
                          <span className="text-slate-600">Standard Member</span>
                        )}
                      </span>
                    </div>

                    {assignedRoleObj?.description && (
                      <div className="py-2.5 last:pb-0 flex items-start justify-between gap-4">
                        <span className="text-slate-500 font-medium w-44 shrink-0">
                          Role Scope
                        </span>
                        <span className="text-slate-600 text-right leading-relaxed max-w-sm">
                          {assignedRoleObj.description}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 3: System Audit Trail */}
                <div className="p-3 rounded-[4px] bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Member ID: <strong className="font-mono text-slate-700">{user.id.slice(0, 12)}…</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Joined: {new Date(user.joinedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* EDIT MODE */}
            {mode === 'edit' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 rounded-[4px] bg-white border border-slate-200 shadow-2xs space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-800">
                      Display Name *
                    </Label>
                    <Input
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value);
                        setIsDirty(true);
                      }}
                      required
                      placeholder="e.g. Alex Nguyen"
                      className="h-8 text-xs rounded-[3px] border-slate-200 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-800">
                      Work Email *
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setIsDirty(true);
                      }}
                      required
                      placeholder="name@enterprise.com"
                      className="h-8 text-xs rounded-[3px] border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-800">
                      Security Role Assignment *
                    </Label>
                    <SearchableSelect
                      options={roles.map((r) => ({
                        value: r.id,
                        label: r.roleCode || r.name,
                      }))}
                      value={selectedRoleId}
                      onValueChange={(val) => {
                        setSelectedRoleId(val);
                        setIsDirty(true);
                      }}
                      placeholder="Select security role..."
                      searchPlaceholder="Search roles..."
                      triggerClassName="h-8 text-xs font-medium rounded-[3px] border-slate-200 bg-white"
                      popoverClassName="w-56"
                    />
                  </div>
                </div>

                {/* Edit Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRequestClose}
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
                    <span>Save Changes</span>
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
              You have unsaved edits to this member profile. Closing now will discard all changes.
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
