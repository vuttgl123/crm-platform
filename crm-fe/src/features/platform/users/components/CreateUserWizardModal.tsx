import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  UserPlus,
  User,
  Building2,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronLeft,
  Shield,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { DynamicForm } from '@/components/common/DynamicForm';
import { EmptyState } from '@/components/common/EmptyState';
import { RoleSummaryResponse } from '@/services/api/roleApi';
import { userApi, PlatformUserDetails } from '@/services/api/userApi';
import {
  userStep1Schema,
  userStep2Schema,
  UserStep1Values,
  UserStep2Values,
} from '../schemas/userFormSchema';

interface CreateUserWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles?: RoleSummaryResponse[];
  onUserCreated: (newUser: PlatformUserDetails) => void;
}

export const CreateUserWizardModal: React.FC<CreateUserWizardModalProps> = ({
  open,
  onOpenChange,
  roles = [],
  onUserCreated,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 Values
  const [step1Values, setStep1Values] = useState<UserStep1Values>({
    email: '',
    displayName: '',
    familyName: '',
    givenName: '',
    phone: '',
  });

  // Step 2 Values
  const [step2Values, setStep2Values] = useState<UserStep2Values>({
    department: 'team-hn-001',
    jobTitle: '',
    employeeCode: '',
  });

  // Step 3 Values
  const [selectedRole, setSelectedRole] = useState('');
  const [isTenantAdmin, setIsTenantAdmin] = useState(false);

  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0].id);
    }
  }, [roles, selectedRole]);

  const handleStep1Change = (field: keyof UserStep1Values, value: any) => {
    setStep1Values((prev) => ({ ...prev, [field]: value }));
  };

  const handleStep2Change = (field: keyof UserStep2Values, value: any) => {
    setStep2Values((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!step1Values.email.trim() || !step1Values.displayName.trim()) {
        toast.error('Please enter work email and full display name');
        return;
      }
    }
    if (currentStep === 2) {
      if (!step2Values.jobTitle.trim()) {
        toast.error('Please enter professional job title');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const created = await userApi.createUser({
        email: step1Values.email.trim(),
        displayName: step1Values.displayName.trim(),
        phone: step1Values.phone.trim() || undefined,
        jobTitle: step2Values.jobTitle.trim(),
        employeeReference: step2Values.employeeCode.trim() || undefined,
        roleIds: selectedRole ? [selectedRole] : [],
        isTenantAdmin,
        sendInviteEmail: true,
      });

      toast.success(`Successfully registered new team member "${step1Values.displayName}"!`);
      onUserCreated(created);
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error('Failed to create team member. Please verify email and role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setStep1Values({
      email: '',
      displayName: '',
      familyName: '',
      givenName: '',
      phone: '',
    });
    setStep2Values({
      department: 'team-hn-001',
      jobTitle: '',
      employeeCode: '',
    });
    setSelectedRole(roles.length > 0 ? roles[0].id : '');
    setIsTenantAdmin(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-[4px]">
        {/* Header Bar */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#0C66E4] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Provision New Team Member
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Onboard a new employee to the corporate tenant with role security governance.
              </DialogDescription>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/80">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold transition-colors ${
                  currentStep >= 1
                    ? 'bg-[#0C66E4] text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep >= 1 ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                Identity & Contact
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold transition-colors ${
                  currentStep >= 2
                    ? 'bg-[#0C66E4] text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                Job Title & Team
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold transition-colors ${
                  currentStep >= 3
                    ? 'bg-[#0C66E4] text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep >= 3 ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                Security & Role
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body Container */}
        <div className="p-6 overflow-y-auto max-h-[60vh] bg-white text-xs">
          {/* STEP 1: Personal & Contact */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-[4px] flex items-center gap-2.5 text-blue-900 text-xs">
                <User className="w-4 h-4 text-[#0C66E4] shrink-0" />
                <span>
                  Enter employee email address. An automated welcome email with activation instructions will be dispatched.
                </span>
              </div>

              <DynamicForm
                schema={userStep1Schema}
                values={step1Values}
                onChange={handleStep1Change}
              />
            </div>
          )}

          {/* STEP 2: Affiliation & Employment */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center gap-2.5 text-slate-700 text-xs">
                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  Configure corporate organizational placement, job title, and internal employee reference code.
                </span>
              </div>

              <DynamicForm
                schema={userStep2Schema}
                values={step2Values}
                onChange={handleStep2Change}
              />
            </div>
          )}

          {/* STEP 3: Security & Role Assignment */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-[4px] flex items-center gap-2.5 text-purple-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  Assign a security role from the system catalog to determine this user's platform access rights.
                </span>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold text-slate-700">
                  Select RBAC Security Role <span className="text-rose-500">*</span>
                </Label>

                {roles.length === 0 ? (
                  <EmptyState
                    title="No Security Roles Configured"
                    description="Please configure security roles in the platform roles module first."
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {roles.map((r) => {
                      const isSelected = selectedRole === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => setSelectedRole(r.id)}
                          className={`p-3 rounded-[4px] border cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'border-[#0C66E4] bg-blue-50/40 ring-1 ring-[#0C66E4]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                              <Shield className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0C66E4]' : 'text-slate-400'}`} />
                              <span>{r.name}</span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#0C66E4]" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-2">
                            {r.description || 'Standard permissions assigned for this operational role.'}
                          </div>
                          <div className="mt-1">
                            <Badge variant="outline" className="text-[10px] font-mono rounded-[2px]">
                              {r.roleCode}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tenant Admin Toggle */}
                <div className="p-3.5 rounded-[4px] border border-amber-200 bg-amber-50/40 flex items-center justify-between gap-4 mt-3">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Grant Tenant Super Admin Privileges</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Allows full administrative access across all tenant configurations and security policies.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTenantAdmin(!isTenantAdmin)}
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
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="text-xs h-8 rounded-[3px] border-slate-200 gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs h-8 rounded-[3px] text-slate-500 hover:text-slate-700"
            >
              Cancel
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="text-xs h-8 rounded-[3px] bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1"
              >
                Next Step
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="text-xs h-8 rounded-[3px] bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-2xs font-semibold"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Confirm & Provision Member
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
