import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Loader2, Users, ArrowRight } from 'lucide-react';
import { RoleSummaryResponse, RoleMemberSummaryData, roleApi } from '@/services/api/roleApi';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface RoleDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleSummaryResponse | null;
  allRoles?: RoleSummaryResponse[];
  onConfirmDelete: (role: RoleSummaryResponse) => Promise<void> | void;
  isDeleting: boolean;
}

export const RoleDeleteDialog: React.FC<RoleDeleteDialogProps> = ({
  isOpen,
  onClose,
  role,
  allRoles = [],
  onConfirmDelete,
  isDeleting,
}) => {
  const [members, setMembers] = useState<RoleMemberSummaryData[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [targetRoleId, setTargetRoleId] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  useEffect(() => {
    if (role && isOpen) {
      setLoadingMembers(true);
      roleApi
        .getRoleMembers(role.id)
        .then((m) => {
          setMembers(m);
          setLoadingMembers(false);
        })
        .catch(() => {
          setMembers([]);
          setLoadingMembers(false);
        });
    } else {
      setMembers([]);
      setTargetRoleId('');
    }
  }, [role, isOpen]);

  if (!role) return null;

  const otherRoles = allRoles
    .filter((r) => r.id !== role.id && r.status === 'ACTIVE')
    .map((r) => ({
      value: r.id,
      label: `${r.name} (${r.roleCode})`,
      description: r.description,
    }));

  const handleDeleteWithReassignment = async () => {
    if (members.length > 0 && targetRoleId) {
      setIsReassigning(true);
      try {
        await roleApi.reassignRoleMembers(role.id, targetRoleId);
        toast.success(`Reassigned ${members.length} members to target role.`);
      } catch {
        toast.error('Failed to reassign role members.');
        setIsReassigning(false);
        return;
      }
      setIsReassigning(false);
    }
    onConfirmDelete(role);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <AlertDialogContent className="max-w-md font-sans rounded-[4px]">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-rose-600">
            <div className="p-2 rounded-[4px] bg-rose-50 border border-rose-100">
              <Trash2 className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Security Role
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-slate-600 space-y-2">
            <span>
              Are you sure you want to permanently delete custom role{' '}
              <strong className="text-slate-900 font-semibold">"{role.name}"</strong> (
              <span className="font-mono font-bold text-slate-900">{role.roleCode}</span>)?
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Members Warning & Reassignment */}
        {loadingMembers ? (
          <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#0C66E4]" />
            <span>Checking assigned members...</span>
          </div>
        ) : members.length > 0 ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-[4px] space-y-2 text-xs text-amber-900">
            <div className="flex items-center justify-between font-bold">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{members.length} Members Currently Assigned</span>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] rounded-[2px]">
                ACTION REQUIRED
              </Badge>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Select a replacement role to automatically migrate these members prior to deletion:
            </p>
            <SearchableSelect
              options={otherRoles}
              value={targetRoleId}
              onChange={setTargetRoleId}
              placeholder="Select Replacement Role..."
            />
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0" />
              <span>No Active Members Assigned</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              This role has zero active users assigned and can be safely removed without impacting workforce permissions.
            </p>
          </div>
        )}

        <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDeleting || isReassigning}
            onClick={onClose}
            className="h-8 text-xs font-semibold rounded-[3px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isDeleting || isReassigning || (members.length > 0 && !targetRoleId)}
            onClick={handleDeleteWithReassignment}
            className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[3px] gap-1.5"
          >
            {isDeleting || isReassigning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{members.length > 0 ? 'Reassign & Delete' : 'Delete Role'}</span>
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
