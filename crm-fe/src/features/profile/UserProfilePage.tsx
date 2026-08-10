import React, { useState } from 'react';
import { useAuth } from '@/core/session/useAuth';
import { toast } from 'sonner';
import {
  User,
  Shield,
  Key,
  Clock,
  Building,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Camera,
  CheckCircle2,
  Lock,
  Smartphone,
  Save,
  Sparkles,
  Users,
  FileText,
  LifeBuoy,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

// Friendly operations permission metadata mapping
interface PermissionMeta {
  id: string;
  nameVi: string;
  descVi: string;
}

const PERMISSION_GROUPS: { module: string; titleVi: string; icon: React.ElementType; items: PermissionMeta[] }[] = [
  {
    module: 'crm_customer',
    titleVi: 'Quản lý Khách hàng & Đối tác',
    icon: Users,
    items: [
      { id: 'acc_read', nameVi: 'Xem danh sách & Chi tiết Khách hàng', descVi: 'Truy cập hồ sơ thông tin khách hàng doanh nghiệp và cá nhân' },
      { id: 'acc_write', nameVi: 'Thêm mới & Cập nhật Khách hàng', descVi: 'Tạo mới, sửa đổi thông tin doanh nghiệp, mã định danh và địa chỉ' },
      { id: 'contact_read', nameVi: 'Xem thông tin Người liên hệ', descVi: 'Tra cứu danh sách đại diện kinh doanh và đầu mối liên hệ của đối tác' },
      { id: 'contact_write', nameVi: 'Tạo mới & Chỉnh sửa Người liên hệ', descVi: 'Cập nhật số điện thoại, email và chức danh người liên hệ' },
    ],
  },
  {
    module: 'crm_opportunity',
    titleVi: 'Cơ hội Kinh doanh & Lead tiềm năng',
    icon: Briefcase,
    items: [
      { id: 'lead_read', nameVi: 'Xem dữ liệu Lead tiềm năng', descVi: 'Theo dõi nguồn lead thu thập từ website và các chiến dịch Marketing' },
      { id: 'lead_write', nameVi: 'Phân bổ & Xử lý Lead', descVi: 'Gán lead cho nhân viên tư vấn và cập nhật trạng thái liên hệ' },
      { id: 'opp_read', nameVi: 'Xem Pipeline Cơ hội bán hàng', descVi: 'Theo dõi các đợt đàm phán, quy mô hợp đồng và xác suất thành công' },
      { id: 'opp_write', nameVi: 'Cập nhật Giai đoạn Deal & Giá trị', descVi: 'Chuyển đổi giai đoạn đàm phán và giá trị doanh thu dự kiến' },
    ],
  },
  {
    module: 'sales_quote',
    titleVi: 'Bán hàng, Báo giá & Đơn hàng',
    icon: FileText,
    items: [
      { id: 'quote_read', nameVi: 'Xem Báo giá & Điều khoản', descVi: 'Tra cứu chi tiết báo giá, chiết khấu và danh mục hàng hóa cung cấp' },
      { id: 'quote_write', nameVi: 'Lập & Soạn thảo Báo giá mới', descVi: 'Tạo mới bản thảo báo giá và gửi yêu cầu phê duyệt cho cấp quản lý' },
      { id: 'quote_approve', nameVi: 'Phê duyệt Báo giá & Chiết khấu', descVi: 'Quyền duyệt chính sách giá đặc biệt và tỷ lệ chiết khấu cho khách hàng' },
      { id: 'order_read', nameVi: 'Xem Đơn hàng & Hợp đồng', descVi: 'Tra cứu hợp đồng thương mại và tiến độ giao hàng' },
      { id: 'order_write', nameVi: 'Tạo Đơn hàng & Xác nhận', descVi: 'Lập đơn đặt hàng chính thức và gửi thông báo kinh doanh' },
    ],
  },
  {
    module: 'service_ticket',
    titleVi: 'Hỗ trợ & Chăm sóc Khách hàng',
    icon: LifeBuoy,
    items: [
      { id: 'ticket_read', nameVi: 'Xem Yêu cầu Hỗ trợ (Tickets)', descVi: 'Theo dõi sự cố, phàn nàn và thắc mắc kỹ thuật từ phía khách hàng' },
      { id: 'ticket_write', nameVi: 'Tiếp nhận & Xử lý Yêu cầu', descVi: 'Cập nhật trạng thái xử lý ticket và gửi câu trả lời phản hồi' },
    ],
  },
  {
    module: 'system_admin',
    titleVi: 'Bảo mật & Quản trị Hệ thống',
    icon: ShieldCheck,
    items: [
      { id: 'consent_read', nameVi: 'Xem Điều khoản Quyền riêng tư', descVi: 'Kiểm tra trạng thái đồng ý thu thập dữ liệu cá nhân (GDPR/NĐ13)' },
      { id: 'consent_write', nameVi: 'Cập nhật Chính sách Bảo mật', descVi: 'Cập nhật các biểu mẫu cam kết bảo mật và quyền riêng tư' },
      { id: 'audit_read', nameVi: 'Xem Nhật ký Kiểm toán (Audit Logs)', descVi: 'Truy xuất lịch sử thao tác dữ liệu của toàn bộ nhân sự trong tổ chức' },
      { id: 'user_manage', nameVi: 'Quản trị Tài khoản & Phân quyền', descVi: 'Thêm bớt người dùng, cấp vai trò và quản lý quyền hạn chi tiết' },
    ],
  },
];

export const UserProfilePage: React.FC = () => {
  const { session } = useAuth();

  // Personal Info Form State
  const [displayName, setDisplayName] = useState(session?.user.display_name || '');
  const [email] = useState(session?.user.email || '');
  const [phone, setPhone] = useState('0988 123 456');
  const [jobTitle, setJobTitle] = useState('Senior Account Executive / Quản trị viên');
  const [department, setDepartment] = useState('Khối Kinh doanh Enterprise');
  const [employeeCode] = useState('EMP-8802');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh (GMT+07:00)');
  const [isSaving, setIsSaving] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Collapsible Open/Closed State for Permission Groups (DEFAULT: ALL CLOSED `{}`)
  const [openGroupMap, setOpenGroupMap] = useState<Record<string, boolean>>({});

  if (!session) return null;

  const toggleGroup = (moduleKey: string) => {
    setOpenGroupMap((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    PERMISSION_GROUPS.forEach((g) => {
      allOpen[g.module] = true;
    });
    setOpenGroupMap(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenGroupMap({});
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Cập nhật hồ sơ cá nhân thành công!');
    }, 600);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (newPassword.length < 12) {
      toast.error('Mật khẩu mới phải có ít nhất 12 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    setIsChangingPass(true);
    setTimeout(() => {
      setIsChangingPass(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Đổi mật khẩu tài khoản thành công!');
    }, 600);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const areAllOpen = PERMISSION_GROUPS.every((g) => openGroupMap[g.module]);

  return (
    <div className="space-y-6 pb-12 font-sans w-full">
      {/* Top Banner Cover Card - Full Width */}
      <Card className="shadow-xs border-slate-200 overflow-hidden w-full">
        <div className="h-36 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative">
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-xs gap-1.5 px-3 py-1 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              Tài khoản Xác thực Hệ thống
            </Badge>
          </div>
        </div>

        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 mb-2">
            <div className="flex items-end gap-5">
              <div className="relative">
                <Avatar className="w-28 h-28 border-4 border-white shadow-md">
                  <AvatarFallback className="bg-blue-600 text-white font-black text-3xl">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                  title="Thay đổi ảnh đại diện"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>{displayName}</span>
                  <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50" />
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{jobTitle} • {department}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold gap-1.5 text-xs py-1 px-3">
                <Shield className="w-3.5 h-3.5" />
                {session.activeRole.name}
              </Badge>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 font-mono text-xs py-1 px-3">
                Scope: {session.effectiveScopeType}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 shadow-2xs w-full justify-start flex-wrap sm:flex-nowrap h-auto overflow-hidden">
          <TabsTrigger value="info" className="gap-2 text-xs font-semibold py-2 px-4">
            <User className="w-4 h-4" />
            <span>Thông tin Cá nhân</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs font-semibold py-2 px-4">
            <Key className="w-4 h-4" />
            <span>Bảo mật & Mật khẩu</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2 text-xs font-semibold py-2 px-4">
            <Shield className="w-4 h-4" />
            <span>Vai trò & Phân quyền Vận hành</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2 text-xs font-semibold py-2 px-4">
            <Clock className="w-4 h-4" />
            <span>Nhật ký Hoạt động</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Personal Information */}
        <TabsContent value="info" className="mt-6">
          <form onSubmit={handleSaveProfile}>
            <Card className="shadow-xs border-slate-200 w-full">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Chi tiết Hồ sơ Người dùng</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Cập nhật họ tên, thông tin liên hệ và cài đặt tài khoản cá nhân của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName" className="text-xs font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Họ và tên
                    </Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Địa chỉ Email (Đăng nhập)
                    </Label>
                    <Input id="email" value={email} disabled className="bg-slate-50 font-mono text-slate-600" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Số điện thoại di động
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0988 xxx xxx"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="employeeCode" className="text-xs font-semibold flex items-center gap-1.5">
                      <Badge variant="outline" className="p-0 border-none text-slate-400">#</Badge>
                      Mã Nhân viên
                    </Label>
                    <Input id="employeeCode" value={employeeCode} disabled className="bg-slate-50 font-mono text-slate-600" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="jobTitle" className="text-xs font-semibold flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      Chức danh công việc
                    </Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Chức danh"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-xs font-semibold flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      Phòng ban / Bộ phận
                    </Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Phòng ban"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="timezone" className="text-xs font-semibold flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      Múi giờ hệ thống
                    </Label>
                    <Input
                      id="timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
                <Button type="submit" className="gap-2 font-semibold bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Đang lưu...' : 'Lưu Thay đổi'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Tab 2: Security & Password */}
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* Password Change Form */}
          <form onSubmit={handleChangePassword}>
            <Card className="shadow-xs border-slate-200 w-full">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Đổi Mật khẩu Tài khoản</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Mật khẩu mới phải bao gồm tối thiểu 12 ký tự theo chính sách bảo mật
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">Mật khẩu mới (Tối thiểu 12 ký tự)</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
                <Button type="submit" className="gap-2 font-semibold bg-blue-600 hover:bg-blue-700" disabled={isChangingPass}>
                  <Key className="w-4 h-4" />
                  {isChangingPass ? 'Đang cập nhật...' : 'Cập nhật Mật khẩu'}
                </Button>
              </CardFooter>
            </Card>
          </form>

          {/* 2FA & Active Sessions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    Xác thực 2 Yếu tố (2FA)
                  </span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    Đã bật (Authenticator)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs text-slate-600 space-y-2">
                <p>
                  Tài khoản của bạn đã được bảo vệ bởi ứng dụng Google Authenticator. Mỗi lần đăng nhập thiết bị mới sẽ yêu cầu mã OTP 6 chữ số.
                </p>
                <Button variant="outline" size="sm" className="text-xs mt-2">
                  Cấu hình lại 2FA
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Phiên Đăng nhập Hiện tại
                  </span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                    1 Thiết bị
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Chrome on Windows 11</div>
                    <div className="text-[11px] text-slate-500">IP: 14.225.21.18 • Hà Nội, Việt Nam</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Đang hoạt động
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Pure Operations RBAC Permissions Matrix */}
        <TabsContent value="permissions" className="mt-6 space-y-6">
          <Card className="shadow-xs border-slate-200 w-full">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Ma trận Phân quyền & Chức năng Vận hành</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Nhấp vào từng nhóm chức năng bên dưới để xem chi tiết danh sách quyền thao tác
                </CardDescription>
              </div>

              {/* Action Controls: Expand/Collapse All */}
              <Button
                variant="outline"
                size="sm"
                onClick={areAllOpen ? handleCollapseAll : handleExpandAll}
                className="h-7 text-xs px-3 font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200 shrink-0"
              >
                {areAllOpen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Đóng tất cả
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Mở tất cả
                  </>
                )}
              </Button>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-600 text-white">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-blue-900/60 uppercase">Tổ chức Doanh nghiệp</div>
                    <div className="text-sm font-bold text-blue-950 mt-0.5">{session.tenant.display_name}</div>
                    <div className="text-[11px] text-blue-700 font-mono">Code: {session.tenant.tenant_code}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-600 text-white">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-purple-900/60 uppercase">Vai trò Đảm nhiệm</div>
                    <div className="text-sm font-bold text-purple-950 mt-0.5">{session.activeRole.name}</div>
                    <div className="text-[11px] text-purple-700 font-mono">RoleCode: {session.activeRole.role_code}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-600 text-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-emerald-900/60 uppercase">Phạm vi Dữ liệu (Scope)</div>
                    <div className="text-sm font-bold text-emerald-950 mt-0.5">{session.effectiveScopeType}</div>
                    <div className="text-[11px] text-emerald-700">Truy cập toàn bộ dữ liệu tổ chức</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Collapsible Pure Operations Permission Matrix (DEFAULT: CLOSED) */}
              <div className="space-y-3">
                {PERMISSION_GROUPS.map((group) => {
                  const GroupIcon = group.icon;
                  const isOpen = Boolean(openGroupMap[group.module]);

                  return (
                    <Collapsible
                      key={group.module}
                      open={isOpen}
                      onOpenChange={() => toggleGroup(group.module)}
                      className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-all bg-white"
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="w-full bg-slate-50/90 hover:bg-slate-100/90 px-4 py-3 border-b border-transparent data-[state=open]:border-slate-200 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-white border border-slate-200 text-blue-600 shadow-2xs">
                              <GroupIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-slate-900">{group.titleVi}</h3>
                              <p className="text-[11px] text-slate-500">Bao gồm {group.items.length} quyền thao tác chi tiết</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold">
                              {group.items.length} quyền được cấp
                            </Badge>
                            <div className="p-1 text-slate-400 hover:text-slate-600 transition-transform">
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4 text-blue-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="divide-y divide-slate-100 bg-white">
                        {group.items.map((item) => (
                          <div key={item.id} className="p-3.5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <h4 className="font-semibold text-xs text-slate-900">
                                {item.nameVi}
                              </h4>
                              <p className="text-[11px] text-slate-500">{item.descVi}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Được phép thao tác
                              </span>
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Activity Log */}
        <TabsContent value="activity" className="mt-6">
          <Card className="shadow-xs border-slate-200 w-full">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Nhật ký Thao tác Tài khoản</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Lịch sử đăng nhập và thay đổi thiết lập hệ thống cá nhân
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative border-l border-slate-200 ml-3 space-y-6">
                <div className="relative pl-6">
                  <div className="absolute -left-2.5 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Đăng nhập hệ thống thành công</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Trình duyệt Chrome on Windows 11 • IP: 14.225.21.18</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">Hôm nay, 13:30</span>
                  </div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-2.5 top-0.5 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    ⚙
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Chuyển đổi Demo Role sang SYSTEM_ADMIN</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Kích hoạt phạm vi dữ liệu TENANT scope</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">Hôm nay, 11:15</span>
                  </div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-2.5 top-0.5 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                    🔑
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Đăng ký tài khoản người dùng thành công</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Tài khoản ptv14012003@gmail.com được tạo mới</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">10/08/2026, 10:45</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
