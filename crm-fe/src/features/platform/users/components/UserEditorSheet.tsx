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
  Clock,
  Edit,
  AlertCircle,
  Building2,
  CheckCircle2,
  Save,
  ShieldCheck,
  UserCheck,
  Mail,
  Phone,
  KeyRound,
  Send,
  LogOut,
  Loader2,
} from 'lucide-react';
import { RoleSummaryResponse } from '@/services/api/roleApi';
import { PlatformUserItem, userApi } from '@/services/api/userApi';
import { toast } from 'sonner';

interface UserEditorSheetProps {
  isOpen: boolean;
  mode: 'view' | 'edit';
  user: PlatformUserItem | null;
  roles: RoleSummaryResponse[];
  canManage: boolean;
  onClose: () => void;
  onSwitchMode: (newMode: 'view' | 'edit') => void;
  onUserSaved: (updatedUser: PlatformUserItem) => void;
}

export const UserEditorSheet: React.FC<UserEditorSheetProps> = ({
  isOpen,
  mode,
  user,
  roles,
  canManage,
  onClose,
  onSwitchMode,
  onUserSaved,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employeeReference, setEmployeeReference] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isTenantAdmin, setIsTenantAdmin] = useState(false);
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'INVITED' | 'REMOVED'>('ACTIVE');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setJobTitle(user.jobTitle || '');
      setEmployeeReference(user.employeeReference || '');
      setSelectedRoleId(user.roles?.[0]?.id || roles[0]?.id || '');
      setIsTenantAdmin(Boolean(user.isTenantAdmin));
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

    setIsSubmitting(true);
    try {
      // 1. Update basic profile
      const updatedDetails = await userApi.updateUser(user.id, {
        displayName: displayName.trim() || user.displayName,
        phone: phone.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        employeeReference: employeeReference.trim() || undefined,
        isTenantAdmin,
        version: user.version,
      });

      // 2. Update role if changed
      if (selectedRoleId && selectedRoleId !== user.roles?.[0]?.id) {
        await userApi.updateUserRoles(user.id, [selectedRoleId]);
      }

      toast.success(`Updated member "${displayName}" profile successfully!`);
      setIsDirty(false);
      onUserSaved(updatedDetails);
      onClose();
    } catch {
      toast.error('Failed to update member profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvite = async () => {
    if (!user) return;
    try {
      await userApi.resendInvite(user.id);
      toast.success(`Invitation email resent to ${user.email}`);
    } catch {
      toast.error('Failed to resend invitation email');
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    try {
      await userApi.resetPassword(user.id);
      toast.success(`Password reset link dispatched to ${user.email}`);
    } catch {
      toast.error('Failed to dispatch password reset link');
    }
  };

  const handleRevokeSessions = async () => {
    if (!user) return;
    try {
      await userApi.revokeSessions(user.id);
      toast.success(`Revoked all active sessions for ${user.displayName}`);
    } catch {
      toast.error('Failed to revoke active sessions');
    }
  };

  if (!user) return null;

  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const roleOptions = roles.map((r) => ({
    value: r.id,
    label: `${r.name} (${r.roleCode})`,
    description: r.description,
  }));

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
                <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-[#0C66E4] flex items-center justify-center font-bold shrink-0 border border-blue-200">
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
                      : 'Modify workforce attributes, assigned security role, and administrative permissions'}
                  </SheetDescription>
                </div>
              </div>

              {/* Mode Toggle Button */}
              {canManage && (
                <div>
                  {mode === 'view' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSwitchMode('edit')}
                      className="text-xs h-7.5 rounded-[3px] border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 font-medium shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Member</span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSwitchMode('view')}
                      className="text-xs h-7.5 rounded-[3px] text-slate-500 hover:text-slate-700"
                    >
                      Cancel Editing
                    </Button>
                  )}
                </div>
              )}
            </div>
          </SheetHeader>

          {/* Form / Content Area */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Member Profile Identity Card */}
              <div className="bg-white border border-slate-200 rounded-[4px] p-5 shadow-2xs">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#0C66E4] to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs border-2 border-white ring-2 ring-blue-100">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {displayName || user.displayName}
                      </h3>
                      <Badge
                        className={`text-[10px] font-bold rounded-[2px] ${
                          status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : status === 'SUSPENDED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {status}
                      </Badge>
                      {isTenantAdmin && (
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold rounded-[2px]">
                          TENANT ADMIN
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {user.email}
                      </span>
                      {phone && (
                        <span className="flex items-center gap-1 font-mono text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {phone}
                        </span>
                      )}
                      {user.employeeReference && (
                        <span className="flex items-center gap-1 font-mono text-indigo-700 font-semibold">
                          ID: {user.employeeReference}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable or Readonly Field Grid */}
              <div className="bg-white border border-slate-200 rounded-[4px] p-5 shadow-2xs space-y-4">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <Building2 className="w-4 h-4 text-[#0C66E4]" />
                  Organizational Attributes & Identity
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Display Name</Label>
                    {mode === 'edit' ? (
                      <Input
                        value={displayName}
                        onChange={(e) => {
                          setDisplayName(e.target.value);
                          setIsDirty(true);
                        }}
                        className="h-8.5 text-xs bg-slate-50/60 focus:bg-white rounded-[3px] border-slate-200"
                        required
                      />
                    ) : (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-[3px] text-xs font-medium text-slate-800">
                        {displayName || '—'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Work Email</Label>
                    <div className="p-2 bg-slate-100/70 border border-slate-200 rounded-[3px] text-xs font-mono text-slate-600 cursor-not-allowed">
                      {email}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Contact Phone</Label>
                    {mode === 'edit' ? (
                      <Input
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="+84 9xx xxx xxx"
                        className="h-8.5 text-xs font-mono bg-slate-50/60 focus:bg-white rounded-[3px] border-slate-200"
                      />
                    ) : (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-[3px] text-xs font-mono text-slate-800">
                        {phone || 'Not configured'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Professional Job Title</Label>
                    {mode === 'edit' ? (
                      <Input
                        value={jobTitle}
                        onChange={(e) => {
                          setJobTitle(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="e.g. Senior Account Executive"
                        className="h-8.5 text-xs bg-slate-50/60 focus:bg-white rounded-[3px] border-slate-200"
                      />
                    ) : (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-[3px] text-xs text-slate-800">
                        {jobTitle || 'Standard Member'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Employee Reference Code</Label>
                    {mode === 'edit' ? (
                      <Input
                        value={employeeReference}
                        onChange={(e) => {
                          setEmployeeReference(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="EMP-XXXX"
                        className="h-8.5 text-xs font-mono bg-slate-50/60 focus:bg-white rounded-[3px] border-slate-200"
                      />
                    ) : (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-[3px] text-xs font-mono text-slate-800">
                        {employeeReference || '—'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Primary Assigned Role</Label>
                    {mode === 'edit' ? (
                      <SearchableSelect
                        options={roleOptions}
                        value={selectedRoleId}
                        onChange={(val) => {
                          setSelectedRoleId(val);
                          setIsDirty(true);
                        }}
                        placeholder="Select Security Role..."
                      />
                    ) : (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-[3px] text-xs font-semibold text-slate-800 flex items-center justify-between">
                        <span>{user.roles?.[0]?.name || 'Standard Member'}</span>
                        <Badge variant="outline" className="text-[10px] font-mono rounded-[2px]">
                          {user.roles?.[0]?.roleCode || 'MEMBER'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tenant Admin Toggle (Edit mode) */}
                {mode === 'edit' && (
                  <div className="p-3.5 rounded-[4px] border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 mt-2">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Tenant Super Admin Privileges</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Grants full root administrator authority across this corporate tenant instance.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTenantAdmin(!isTenantAdmin);
                        setIsDirty(true);
                      }}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        isTenantAdmin ? 'bg-[#0C66E4]' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          isTenantAdmin ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Administrative Security Actions Box */}
              {canManage && (
                <div className="bg-white border border-slate-200 rounded-[4px] p-5 shadow-2xs space-y-3">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    Security Governance & Session Actions
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendInvite}
                      className="h-8 text-xs rounded-[3px] border-slate-200 gap-1.5 justify-start text-slate-700"
                    >
                      <Send className="w-3.5 h-3.5 text-blue-600" />
                      Resend Invite
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetPassword}
                      className="h-8 text-xs rounded-[3px] border-slate-200 gap-1.5 justify-start text-slate-700"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      Reset Password
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRevokeSessions}
                      className="h-8 text-xs rounded-[3px] border-slate-200 gap-1.5 justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Revoke Sessions
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Bar */}
            {mode === 'edit' && (
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRequestClose}
                  disabled={isSubmitting}
                  className="h-8 text-xs rounded-[3px] border-slate-200"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="h-8 text-xs bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 font-semibold shadow-2xs rounded-[3px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </SheetContent>
      </Sheet>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="rounded-[4px] font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Discard Unsaved Changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              You have unsaved edits in this member profile. If you leave now, your modifications will be discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs rounded-[3px] border-slate-200">
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDiscard}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-[3px]"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
