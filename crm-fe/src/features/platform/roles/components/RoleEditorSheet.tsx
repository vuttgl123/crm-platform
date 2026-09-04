import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Shield,
  Key,
  Database,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  RoleEditorMode,
  RoleEditorStep,
  RoleDraft,
  ExtendedPermission,
} from '../model/roleTypes';
import { TeamItem } from '@/services/api/teamApi';
import { useRoleDetail, useRoleMutations } from '../hooks/roleQueries';
import {
  createInitialRoleDraft,
  roleDetailToDraft,
  draftToCreateRequest,
  draftToUpdateRequest,
} from '../model/roleMappers';
import { computeRoleDiff } from '../model/roleDiff';
import { parseRoleError } from '../model/roleErrors';
import { roleBasicsSchema, roleDataScopeItemSchema } from '../model/roleSchemas';

import { RoleBasicsStep } from './RoleBasicsStep';
import { PermissionMatrix } from './PermissionMatrix';
import { DataScopeEditor } from './DataScopeEditor';
import { RoleChangeReview } from './RoleChangeReview';

interface RoleEditorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  roleId?: string | null;
  mode: RoleEditorMode;
  catalog: ExtendedPermission[];
  teams: TeamItem[];
  tenantId?: string;
}

const STEPS: Array<{ id: RoleEditorStep; title: string; icon: React.ElementType }> = [
  { id: 'basics', title: '1. Role Info', icon: Shield },
  { id: 'permissions', title: '2. Permissions', icon: Key },
  { id: 'scopes', title: '3. Data Scopes', icon: Database },
  { id: 'review', title: '4. Governance Review', icon: CheckCircle },
];

export const RoleEditorSheet: React.FC<RoleEditorSheetProps> = ({
  isOpen,
  onClose,
  roleId,
  mode,
  catalog,
  teams,
  tenantId,
}) => {
  const [currentStep, setCurrentStep] = useState<RoleEditorStep>('basics');
  const [draft, setDraft] = useState<RoleDraft>(createInitialRoleDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Queries & Mutations
  const { data: roleDetail, isLoading: isLoadingDetail } = useRoleDetail(
    roleId,
    tenantId,
    isOpen && (mode === 'edit' || mode === 'view' || mode === 'clone')
  );

  const { createMutation, updateMutation } = useRoleMutations(tenantId);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Hydrate draft when roleDetail loads
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setDraft(createInitialRoleDraft());
      } else if (roleDetail) {
        setDraft(roleDetailToDraft(roleDetail, mode));
      }
      setCurrentStep('basics');
      setErrors({});
      setShowUnsavedWarning(false);
    }
  }, [isOpen, mode, roleDetail]);

  const isReadOnly = mode === 'view' || draft.system;

  // Handle draft updates
  const handleDraftChange = useCallback((updates: Partial<RoleDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
    setErrors({});
  }, []);

  // Handle individual permission toggle
  const handleTogglePermission = useCallback((code: string) => {
    if (isReadOnly) return;
    setDraft((prev) => {
      const exists = prev.permissionCodes.includes(code);
      return {
        ...prev,
        permissionCodes: exists
          ? prev.permissionCodes.filter((c) => c !== code)
          : [...prev.permissionCodes, code],
      };
    });
  }, [isReadOnly]);

  // Handle bulk permission selection
  const handleSelectMultiplePermissions = useCallback(
    (codesToAdd: string[], codesToRemove: string[]) => {
      if (isReadOnly) return;
      setDraft((prev) => {
        const toAddSet = new Set(codesToAdd);
        const toRemoveSet = new Set(codesToRemove);
        const filtered = prev.permissionCodes.filter((c) => !toRemoveSet.has(c));
        const merged = Array.from(new Set([...filtered, ...Array.from(toAddSet)]));
        return {
          ...prev,
          permissionCodes: merged,
        };
      });
    },
    [isReadOnly]
  );

  // Validate step transitions
  const validateCurrentStep = (): boolean => {
    if (currentStep === 'basics') {
      const result = roleBasicsSchema.safeParse({
        roleCode: draft.roleCode,
        name: draft.name,
        description: draft.description,
        status: draft.status,
      });

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        return false;
      }
    }

    if (currentStep === 'scopes') {
      // Validate all scope items have required teamId if TEAM/TEAM_TREE
      for (let i = 0; i < draft.dataScopes.length; i++) {
        const res = roleDataScopeItemSchema.safeParse(draft.dataScopes[i]);
        if (!res.success) {
          toast.error(`Invalid scope for ${draft.dataScopes[i].entityType}: A team must be assigned.`);
          return false;
        }
      }
    }

    setErrors({});
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;

    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const handlePrevStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  // Compute live diff
  const diffResult = useMemo(() => {
    return computeRoleDiff(mode === 'create' || mode === 'clone' ? null : roleDetail || null, draft, catalog);
  }, [roleDetail, draft, catalog, mode]);

  // Submit save
  const handleSave = async () => {
    if (!validateCurrentStep()) return;

    try {
      if (mode === 'create' || mode === 'clone') {
        const payload = draftToCreateRequest(draft);
        await createMutation.mutateAsync(payload);
        toast.success(`Role "${draft.name}" created successfully`);
        onClose();
      } else if (mode === 'edit') {
        if (!roleDetail?.id || !roleDetail.version) {
          throw new Error('Role ID or version missing for update');
        }
        const payload = draftToUpdateRequest(draft, roleDetail.version);
        await updateMutation.mutateAsync({ id: roleDetail.id, data: payload });
        toast.success(`Role "${draft.name}" updated successfully`);
        onClose();
      }
    } catch (err) {
      const parsed = parseRoleError(err);
      toast.error(parsed.title, {
        description: parsed.description,
      });
    }
  };

  // Determine if draft is actually dirty to avoid false warnings on empty new roles
  const isDirty = useMemo(() => {
    if (mode === 'view') return false;
    if (mode === 'create') {
      return Boolean(
        draft.roleCode.trim() ||
        draft.name.trim() ||
        draft.description.trim() ||
        draft.permissionCodes.length > 0 ||
        draft.dataScopes.length > 0
      );
    }
    return diffResult.hasChanges;
  }, [mode, draft, diffResult.hasChanges]);

  const handleAttemptClose = () => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (!open ? handleAttemptClose() : null)}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl p-0 flex flex-col bg-[#F7F8F9] z-50 border-l border-slate-200"
      >
        {/* Header */}
        <SheetHeader className="p-4 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <SheetTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>
                  {mode === 'create'
                    ? 'Create Security Role'
                    : mode === 'clone'
                    ? `Clone Role: ${draft.cloneSourceName || draft.name}`
                    : mode === 'edit'
                    ? `Edit Role: ${draft.name}`
                    : `Role Details: ${draft.name}`}
                </span>
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500">
                Configure RBAC capabilities, record-level scoping, and administrative governance policies.
              </SheetDescription>
            </div>
          </div>

          {/* Step Indicator Navigation */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 mt-2">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = STEPS.findIndex((s) => s.id === currentStep) > idx;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (isPast || validateCurrentStep()) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[3px] text-xs font-semibold border transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                      : isPast
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      : 'bg-slate-50 text-slate-400 border-slate-200/60'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? 'text-blue-600'
                        : isPast
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              );
            })}
          </div>
        </SheetHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoadingDetail ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs font-semibold">Loading role specifications…</span>
            </div>
          ) : (
            <>
              {currentStep === 'basics' && (
                <RoleBasicsStep
                  draft={draft}
                  mode={mode}
                  onChange={handleDraftChange}
                  errors={errors}
                />
              )}

              {currentStep === 'permissions' && (
                <PermissionMatrix
                  selectedCodes={draft.permissionCodes}
                  catalog={catalog}
                  isReadOnly={isReadOnly}
                  onToggleCode={handleTogglePermission}
                  onSelectMultiple={handleSelectMultiplePermissions}
                />
              )}

              {currentStep === 'scopes' && (
                <DataScopeEditor
                  dataScopes={draft.dataScopes || []}
                  scopes={draft.dataScopes || []}
                  teams={teams || []}
                  isReadOnly={isReadOnly}
                  onChange={(scopes) => handleDraftChange({ dataScopes: scopes })}
                />
              )}

              {currentStep === 'review' && (
                <RoleChangeReview
                  draft={draft}
                  diff={diffResult}
                  catalog={catalog}
                  teams={teams}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="p-4 bg-white border-t border-slate-200 flex items-center justify-between flex-row">
          <div>
            {currentStep !== 'basics' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrevStep}
                className="h-8 text-xs font-semibold rounded-[3px] border-slate-200 gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAttemptClose}
              className="h-8 text-xs font-semibold rounded-[3px] border-slate-200"
            >
              Cancel
            </Button>

            {currentStep !== 'review' ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNextStep}
                className="h-8 px-4 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1 shadow-none"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : !isReadOnly ? (
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 px-4 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white rounded-[3px] gap-1.5 shadow-none"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Role…</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>
                      {mode === 'create' || mode === 'clone'
                        ? 'Confirm & Create Role'
                        : 'Save Role Changes'}
                    </span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={onClose}
                className="h-8 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-[3px]"
              >
                Close
              </Button>
            )}
          </div>
        </SheetFooter>

        {/* Unsaved Changes Confirmation Modal */}
        <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
          <AlertDialogContent className="max-w-md font-sans rounded-[4px]">
            <AlertDialogHeader>
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <AlertTriangle className="w-5 h-5" />
                <AlertDialogTitle className="text-base font-bold text-slate-900">
                  Discard Unsaved Changes?
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs text-slate-600">
                You have unsaved changes in this role draft. Closing now will discard all edits.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 pt-2">
              <AlertDialogCancel
                onClick={() => setShowUnsavedWarning(false)}
                className="h-8 text-xs font-semibold rounded-[3px] border-slate-200"
              >
                Keep Editing
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowUnsavedWarning(false);
                  onClose();
                }}
                className="h-8 text-xs font-semibold rounded-[3px] bg-rose-600 hover:bg-rose-700 text-white"
              >
                Discard Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
};
