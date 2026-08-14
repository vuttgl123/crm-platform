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
        toast.error('Vui lòng nhập Email công việc và Họ tên nhân viên!');
        return;
      }
    }
    if (currentStep === 2) {
      if (!step2Values.jobTitle.trim()) {
        toast.error('Vui lòng nhập Chức danh công việc!');
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
      'team-mb-001': 'Khối Kinh doanh Miền Bắc',
      'team-hn-001': 'Nhóm Kinh doanh Hà Nội 1',
      'team-cs-001': 'Phòng Chăm sóc Khách hàng',
      'team-bod-001': 'Ban Giám đốc',
    };

    const chosenRole = roles.find((r) => r.id === selectedRole || r.roleCode === selectedRole);

    onUserCreated({
      displayName: step1Values.displayName.trim(),
      email: step1Values.email.trim(),
      roleName: chosenRole ? chosenRole.name : selectedRole || 'Thành viên Tập đoàn',
      department: deptMap[step2Values.department] || 'Khối Kinh doanh',
      employeeCode: step2Values.employeeCode.trim() || `EMP-${Date.now().toString().slice(-4)}`,
    });

    toast.success(`Đã thêm thành công nhân viên mới "${step1Values.displayName}"!`);
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl">
        {/* Header Bar */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Thêm Nhân viên Mới vào Hệ thống
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Khởi tạo tài khoản nhân sự và phân bổ vai trò quyền hạn qua Form động
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
                1. Thông tin Cá nhân
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
                2. Phòng ban & Chức danh
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
                3. Vai trò & Quyền hạn
              </span>
            </div>
          </div>
        </div>

        {/* Wizard Form Content Area */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {/* STEP 1: Personal Information via DynamicForm */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Bước 1: Nhập email công việc và họ tên của nhân viên mới để khởi tạo hồ sơ.</span>
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
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center gap-2 text-xs text-purple-800">
                  <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Bước 2: Phân bổ nhân viên vào khối phòng ban và gán mã nhân sự.</span>
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
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bước 3: Gán vai trò quyền hạn truy cập hệ thống CRM cho nhân viên.</span>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-semibold flex items-center gap-1 text-slate-900">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chọn Vai trò Quyền hạn (Role) *</span>
                  </Label>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {roles.length > 0 ? (
                      roles.map((r) => {
                        const isSelected = selectedRole === r.id || selectedRole === r.roleCode;
                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedRole(r.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
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
                                <Badge variant="outline" className="font-mono text-[10px] text-slate-600 border-slate-200">
                                  {r.roleCode}
                                </Badge>
                                {r.isSystem || r.system ? (
                                  <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
                                    Hệ thống
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                    Tùy chỉnh
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {r.description || `Vai trò ${r.name} với ${r.permissionCount || 0} quyền hạn.`}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <EmptyState
                        icon={Shield}
                        title="Chưa có vai trò nào trong hệ thống"
                        description="Vui lòng tạo vai trò trong mục Quản lý Vai trò trước khi phân quyền cho nhân viên mới."
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
                  className="text-xs font-semibold gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Hủy
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1"
                >
                  <span>Tiếp tục (Bước {currentStep + 1})</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 min-w-32"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hoàn tất & Tạo nhân viên</span>
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
