import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/session/useAuth';
import { NAVIGATION_GROUPS } from '@/config/navigationConfig';
import { canAccessRoute } from '@/core/permissions/evaluator';
import { accountApi } from '@/services/api/accountApi';
import { membershipApi } from '@/services/api/membershipApi';
import { roleApi } from '@/services/api/roleApi';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Building2,
  Users,
  Shield,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Calendar,
  ListTodo,
  BarChart3,
  UserCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const OverviewPage: React.FC = () => {
  const { session } = useAuth();
  const [totalAccounts, setTotalAccounts] = useState<number>(0);
  const [orgAccounts, setOrgAccounts] = useState<number>(0);
  const [personAccounts, setPersonAccounts] = useState<number>(0);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [totalRoles, setTotalRoles] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      // Fetch Real Accounts
      const accountsRes = await accountApi.search({ size: 100 });
      if (accountsRes?.items) {
        setTotalAccounts(accountsRes.items.length);
        setOrgAccounts(accountsRes.items.filter((a) => a.accountType === 'ORGANIZATION').length);
        setPersonAccounts(accountsRes.items.filter((a) => a.accountType === 'PERSON').length);
      }

      // Fetch Real Active Members
      const membersRes = await membershipApi.searchRequests('APPROVED');
      if (membersRes?.items) {
        setTotalMembers(membersRes.items.length);
      }

      // Fetch Real Roles
      const rolesRes = await roleApi.getRoles();
      if (rolesRes) {
        setTotalRoles(rolesRes.length);
      }
    } catch {
      // Fallback silently if API returns empty
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  const activeRoleName = session.activeRole.name;
  const scopeType = session.effectiveScopeType;
  const tenantName = session.tenant.display_name;

  // Scope label map
  const scopeLabelMap: Record<string, string> = {
    TENANT: 'Toàn hệ thống (Tập đoàn)',
    TEAM_TREE: 'Khối & Đơn vị trực thuộc',
    TEAM: 'Phòng ban trực thuộc',
    OWN: 'Cá nhân phụ trách',
  };

  // Collect authorized quick links
  const authorizedItems: { path: string; title: string; groupTitle: string }[] = [];
  NAVIGATION_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      if (canAccessRoute(item, session)) {
        authorizedItems.push({
          path: item.path,
          title: item.titleVi,
          groupTitle: group.titleVi,
        });
      }
    });
  });

  return (
    <div className="space-y-6 pb-12 font-sans w-full">
      {/* Top Welcome Banner Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white font-bold text-xs px-2.5 py-0.5">
                {tenantName}
              </Badge>
              <span className="text-xs text-slate-300 font-mono">
                Vai trò: <strong className="text-white">{activeRoleName}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Xin chào, {session.user.display_name || session.user.email}! 👋
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Hệ thống Quản trị Quan hệ Khách hàng Doanh nghiệp CRM • Phạm vi truy cập:{' '}
              <strong className="text-blue-300">{scopeLabelMap[scopeType] || scopeType}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardMetrics}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </Button>
            <Link to="/app/crm/accounts">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold gap-1.5 shadow-xs">
                <Plus className="w-4 h-4" />
                <span>Thêm Khách hàng</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Real KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="shadow-xs border-slate-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tổng số Khách hàng</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{totalAccounts}</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Real API
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Dữ liệu thực tế trong hệ thống</p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="shadow-xs border-slate-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Doanh nghiệp / Tập đoàn</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{orgAccounts}</span>
              <span className="text-[11px] text-slate-500">Cá nhân: {personAccounts}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Khách hàng tổ chức pháp lý</p>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="shadow-xs border-slate-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Thành viên Hoạt động</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{totalMembers}</span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Đã phê duyệt
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Nhân sự trong Đơn vị Tenant</p>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="shadow-xs border-slate-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Vai trò & Phân quyền</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{totalRoles}</span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Cấu hình
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Vai trò phân quyền hoạt động</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Section: Authorized Quick Links & Clean Empty State Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Authorized Quick Action Cards */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-xs border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Truy cập Nhanh các Chức năng Đã Phân Quyền</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Danh sách các phân hệ làm việc được cấp quyền tương ứng với Vai trò hiện tại của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {authorizedItems.slice(0, 6).map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {item.groupTitle}
                      </span>
                      <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Analytics Container - Clean Empty State */}
          <Card className="shadow-xs border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span>Biểu đồ Báo cáo Kinh doanh</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Thống kê doanh số bán hàng & cơ hội theo thời gian
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <EmptyState
                icon={BarChart3}
                title="Chưa phát sinh dữ liệu doanh số"
                description="Biểu đồ sẽ tự động ghi nhận và phân tích khi phát sinh Hợp đồng hoặc Giao dịch kinh doanh mới trong hệ thống."
                actionLabel="Quản lý Khách hàng"
                onAction={() => window.location.href = '/app/crm/accounts'}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: System Log & Reminders */}
        <div className="space-y-6">
          {/* Active User Security Badge Card */}
          <Card className="shadow-xs border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
                <span>Thông tin Quyền hạn Đang dùng</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-500 font-medium block">Tài khoản Đăng nhập:</span>
                <span className="font-bold text-slate-900 block">{session.user.email}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-500 font-medium block">Mã Đơn vị Tenant:</span>
                <span className="font-mono font-bold text-blue-700 block">{session.tenant.tenant_code}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-500 font-medium block">Cơ chế Phân quyền:</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                  {scopeLabelMap[scopeType] || scopeType}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks & Activities - Clean Empty State */}
          <Card className="shadow-xs border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ListTodo className="w-4.5 h-4.5 text-blue-600" />
                <span>Nhắc nhở & Lịch làm việc</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <EmptyState
                icon={Calendar}
                title="Chưa có lịch hẹn hoặc công việc mới"
                description="Tất cả nhắc nhở công việc và lịch họp chăm sóc khách hàng sẽ hiển thị tại đây."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
