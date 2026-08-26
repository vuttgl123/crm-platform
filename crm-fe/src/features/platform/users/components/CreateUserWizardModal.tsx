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
} from 'lucide-react';
import { DynamicForm } from '@/components/common/DynamicForm';
import { EmptyState } from '@/components/common/EmptyState';
import { RoleSummaryResponse } from '@/services/api/roleApi';
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
  onUserCreated: (newUser: {
    displayName: string;
    email: string;
    roleName: string;
    department: string;
    employeeCode: string;
  }) => void;
}

export const CreateUserWizardModal: React.FC<CreateUserWizardModalProps> = ({
  open,
  onOpenChange,
  roles = [],
  onUserCreated,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const deptMap: Record<string, string> = {
      'team-mb-001': 'Northern Regional Enterprise Sales',
      'team-hn-001': 'Commercial Account Executive Team',
      'team-cs-001': 'Customer Success & Support',
      'team-bod-001': 'Executive Board & Management',
    };

    const chosenRole = roles.find((r) => r.id === selectedRole || r.roleCode === selectedRole);

    onUserCreated({
      displayName: step1Values.displayName.trim(),
      email: step1Values.email.trim(),
      roleName: chosenRole ? chosenRole.name : selectedRole || 'Tenant Member',
      department: deptMap[step2Values.department] || 'Enterprise Sales',
      employeeCode: step2Values.employeeCode.trim() || `EMP-${Date.now().toString().slice(-4)}`,
    });

    toast.success(`Successfully registered new team member "${step1Values.displayName}"!`);
    resetForm();
    onOpenChange(false);
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-[4px]">
        {/* Header Bar */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Register New System Member
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Provision workforce profile, department mapping and RBAC security role assignments
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step Indicator Header Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3.5 shrink-0">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

            {/* Step 1 */}
            <div className="flex items-center gap-2 relative z-10 bg-white pr-2">
              <div
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                  currentStep === 1
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 1 ? 'text-blue-600 font-bold' : 'text-slate-600'
                }`}
              >
                1. Personal Details
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-2 relative z-10 bg-white px-2">
              <div
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                  currentStep === 2
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 2 ? 'text-blue-600 font-bold' : 'text-slate-600'
                }`}
              >
                2. Department &amp; Role
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-2 relative z-10 bg-white pl-2">
              <div
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                  currentStep === 3
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 3 ? 'text-blue-600 font-bold' : 'text-slate-600'
                }`}
              >
                3. Security Role &amp; Access
              </span>
            </div>
          </div>
        </div>

        {/* Wizard Form Content Area */}
        <form onSubmit={handleSubmit} className="flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {/* STEP 1: Personal Information via DynamicForm */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-[4px] bg-blue-50/70 border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Step 1: Enter corporate work email and legal display name to provision profile.</span>
                </div>

                <DynamicForm
                  schema={userStep1Schema}
                  values={step1Values}
                  onChange={handleStep1Change}
                />
              </div>
            )}

            {/* STEP 2: Department & Job Information via DynamicForm */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-[4px] bg-purple-50/70 border border-purple-100 flex items-center gap-2 text-xs text-purple-800">
                  <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Step 2: Assign member to department, title and internal employee identifier code.</span>
                </div>

                <DynamicForm
                  schema={userStep2Schema}
                  values={step2Values}
                  onChange={handleStep2Change}
                />
              </div>
            )}

            {/* STEP 3: Role & Permissions Selection */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-[4px] bg-emerald-50/70 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Step 3: Assign security role &amp; permission level for CRM platform access.</span>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-semibold flex items-center gap-1 text-slate-900">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Select Security Role (RBAC) *</span>
                  </Label>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {roles.length > 0 ? (
                      roles.map((r) => {
                        const isSelected = selectedRole === r.id || selectedRole === r.roleCode;
                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedRole(r.id)}
                            className={`p-3.5 rounded-[4px] border cursor-pointer transition-all flex items-start gap-3 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="mt-0.5">
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-300" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                                <span>{r.name}</span>
                                <Badge variant="outline" className="font-mono text-[10px] text-slate-600 border-slate-200 rounded-[2px]">
                                  {r.roleCode}
                                </Badge>
                                {r.isSystem || r.system ? (
                                  <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] rounded-[2px]">
                                    SYSTEM
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] rounded-[2px]">
                                    CUSTOM
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {r.description || `Security role ${r.name} with ${r.permissionCount || 0} permissions.`}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <EmptyState
                        icon={Shield}
                        title="No roles configured in tenant"
                        description="Please create roles in Role Management before provisioning team access."
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Footer Action Bar */}
          <DialogFooter className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="h-8 px-3 text-xs font-semibold gap-1 rounded-[3px] border-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 px-3 text-xs rounded-[3px]"
              >
                Cancel
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1 rounded-[3px]"
                >
                  <span>Continue (Step {currentStep + 1})</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 min-w-32 rounded-[3px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete &amp; Register</span>
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
