import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Mail,
  Phone,
  Briefcase,
  IdCard,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface CreateUserWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  onUserCreated,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Personal & Account
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [givenName, setGivenName] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Department & Employee Info
  const [department, setDepartment] = useState('team-hn-001');
  const [jobTitle, setJobTitle] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');

  // Step 3: Role & Permissions
  const [selectedRole, setSelectedRole] = useState('SALES_STAFF');

  const handleNext = () => {
    if (currentStep === 1) {
      if (!email.trim() || !displayName.trim()) {
        toast.error('Vui lòng nhập Email công việc và Họ tên nhân viên!');
        return;
      }
    }
    if (currentStep === 2) {
      if (!jobTitle.trim()) {
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

    const roleNameMap: Record<string, string> = {
      ADMIN: 'Quản trị viên Hệ thống (ADMIN)',
      REGIONAL_MANAGER: 'Quản lý Vùng (REGIONAL_MANAGER)',
      TEAM_LEADER: 'Trưởng nhóm Kinh doanh (TEAM_LEADER)',
      SALES_STAFF: 'Nhân viên Kinh doanh (SALES_STAFF)',
      VIEWER: 'Người xem Read-only (VIEWER)',
    };

    const deptMap: Record<string, string> = {
      'team-mb-001': 'Khối Kinh doanh Miền Bắc',
      'team-hn-001': 'Nhóm Kinh doanh Hà Nội 1',
      'team-cs-001': 'Phòng Chăm sóc Khách hàng',
      'team-bod-001': 'Ban Giám đốc',
    };

    onUserCreated({
      displayName: displayName.trim(),
      email: email.trim(),
      roleName: roleNameMap[selectedRole] || selectedRole,
      department: deptMap[department] || 'Khối Kinh doanh',
      employeeCode: employeeCode.trim() || `EMP-${Date.now().toString().slice(-4)}`,
    });

    toast.success(`Đã thêm thành công nhân viên mới "${displayName}"!`);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setEmail('');
    setDisplayName('');
    setFamilyName('');
    setGivenName('');
    setPhone('');
    setDepartment('team-hn-001');
    setJobTitle('');
    setEmployeeCode('');
    setSelectedRole('SALES_STAFF');
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
                Khởi tạo tài khoản nhân sự và phân bổ vai trò quyền hạn theo từng bước
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step Indicator Header Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3.5 shrink-0">
          <div className="flex items-center justify-between relative">
            {/* Background line */}
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
            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Bước 1: Nhập email công việc và họ tên của nhân viên mới để khởi tạo hồ sơ.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="userEmail" className="text-xs font-semibold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Email Công việc *
                    </Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nguyen.van.a@company.com"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="userDisplayName" className="text-xs font-semibold flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Họ và Tên Hiển thị (Đầy đủ) *
                    </Label>
                    <Input
                      id="userDisplayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn Anh"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="familyName" className="text-xs font-semibold">Họ & Tên lót</Label>
                    <Input
                      id="familyName"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder="Nguyễn Văn"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="givenName" className="text-xs font-semibold">Tên chính</Label>
                    <Input
                      id="givenName"
                      value={givenName}
                      onChange={(e) => setGivenName(e.target.value)}
                      placeholder="Anh"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="userPhone" className="text-xs font-semibold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Số điện thoại Di động
                    </Label>
                    <Input
                      id="userPhone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912 345 678"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Department & Job Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center gap-2 text-xs text-purple-800">
                  <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Bước 2: Phân bổ nhân viên vào khối phòng ban và gán mã nhân sự.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      Phòng ban / Nhóm Làm việc *
                    </Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="team-mb-001">Khối Kinh doanh Miền Bắc</SelectItem>
                        <SelectItem value="team-hn-001">Nhóm Kinh doanh Hà Nội 1</SelectItem>
                        <SelectItem value="team-cs-001">Phòng Chăm sóc Khách hàng</SelectItem>
                        <SelectItem value="team-bod-001">Ban Giám đốc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="jobTitle" className="text-xs font-semibold flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      Chức danh Chuyên môn *
                    </Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Ví dụ: Chuyên viên Tư vấn Khách hàng"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="empCode" className="text-xs font-semibold flex items-center gap-1">
                      <IdCard className="w-3.5 h-3.5 text-slate-400" />
                      Mã Số Nhân viên (Mã định danh)
                    </Label>
                    <Input
                      id="empCode"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder="Ví dụ: EMP-2026-09"
                    />
                  </div>
                </div>
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
                    Chọn Vai trò Quyền hạn (Role) *
                  </Label>

                  <div className="space-y-2">
                    {/* Role Option 1: SALES_STAFF */}
                    <div
                      onClick={() => setSelectedRole('SALES_STAFF')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        selectedRole === 'SALES_STAFF'
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5">
                        {selectedRole === 'SALES_STAFF' ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>Nhân viên Kinh doanh (SALES_STAFF)</span>
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Phổ biến</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tạo và quản lý các hồ sơ khách hàng, người liên hệ, cơ hội kinh doanh do bản thân sở hữu.
                        </p>
                      </div>
                    </div>

                    {/* Role Option 2: TEAM_LEADER */}
                    <div
                      onClick={() => setSelectedRole('TEAM_LEADER')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        selectedRole === 'TEAM_LEADER'
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5">
                        {selectedRole === 'TEAM_LEADER' ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Trưởng nhóm Kinh doanh (TEAM_LEADER)</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Quản lý toàn bộ dữ liệu khách hàng và hợp đồng thuộc phạm vi nhóm làm việc phụ trách.
                        </p>
                      </div>
                    </div>

                    {/* Role Option 3: REGIONAL_MANAGER */}
                    <div
                      onClick={() => setSelectedRole('REGIONAL_MANAGER')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        selectedRole === 'REGIONAL_MANAGER'
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5">
                        {selectedRole === 'REGIONAL_MANAGER' ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Quản lý Vùng (REGIONAL_MANAGER)</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Quản lý khối phòng ban và các nhóm nhánh trực thuộc (Cấp Quản lý vùng / Miền).
                        </p>
                      </div>
                    </div>

                    {/* Role Option 4: VIEWER */}
                    <div
                      onClick={() => setSelectedRole('VIEWER')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        selectedRole === 'VIEWER'
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5">
                        {selectedRole === 'VIEWER' ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Người xem Read-only (VIEWER)</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Chỉ có quyền xem báo cáo và thông tin trong tổ chức, không có quyền thêm mới hoặc sửa đổi.
                        </p>
                      </div>
                    </div>
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
