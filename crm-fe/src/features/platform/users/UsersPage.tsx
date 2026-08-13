import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Plus,
  RefreshCw,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { useAuth } from '@/core/session/useAuth';
import { CreateUserWizardModal } from './components/CreateUserWizardModal';
import {
  membershipApi,
  MembershipRequestItem,
} from '@/services/api/membershipApi';
import { roleApi, RoleSummaryResponse } from '@/services/api/roleApi';

export interface ActiveUser {
  id: string;
  displayName: string;
  email: string;
  roleId: string;
  roleName: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
  isTenantAdmin?: boolean;
  requestId?: string;
  requestVersion?: number;
}

export const UsersPage: React.FC = () => {
  const { session } = useAuth();
  const hasManagePermission =
    Boolean(session?.membership?.is_tenant_admin) ||
    Boolean(session?.grantedPermissions?.includes('platform_user.manage'));

  const [pendingRequests, setPendingRequests] = useState<MembershipRequestItem[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<RoleSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch Real Roles Catalog from Backend API (No Fallback Mock)
  const fetchRoles = useCallback(async () => {
    try {
      const availableRoles = await roleApi.getRoles();
      setRoles(availableRoles || []);
    } catch {
      setRoles([]);
    }
  }, []);

  // Fetch Both Pending Requests and Approved Active Members from Backend API
  const fetchMembershipRequests = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        membershipApi.searchRequests('PENDING').catch(() => ({ items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 })),
        membershipApi.searchRequests('APPROVED').catch(() => ({ items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 })),
      ]);

      const pendingItems = pendingRes.items || [];
      setPendingRequests(pendingItems);

      const approvedItems = approvedRes.items || [];
      const membersMap = new Map<string, ActiveUser>();

      // 1. Logged-in Tenant Admin / User from Auth Session
      if (session?.user) {
        membersMap.set(session.user.id, {
          id: session.user.id,
          displayName: session.user.display_name || session.user.email,
          email: session.user.email,
          roleId: session.activeRole?.id || '',
          roleName: session.membership?.is_tenant_admin
            ? 'Quản trị viên Tập đoàn (Tenant Admin)'
            : (session.activeRole?.name || 'Thành viên Tập đoàn'),
          status: 'ACTIVE',
          joinedAt: session.user.created_at || new Date().toISOString(),
          isTenantAdmin: Boolean(session.membership?.is_tenant_admin),
        });
      }

      // 2. Approved Membership Requests strictly from PostgreSQL DB
      approvedItems.forEach((req) => {
        if (!membersMap.has(req.requester.id)) {
          const savedRoleId = localStorage.getItem(`user_role_${req.requester.id}`) || '';
          const matchedRole = roles.find((r) => r.id === savedRoleId || r.roleCode === savedRoleId);

          membersMap.set(req.requester.id, {
            id: req.requester.id,
            displayName: req.requester.displayName || req.requester.email,
            email: req.requester.email,
            roleId: savedRoleId,
            roleName: matchedRole ? matchedRole.name : 'Thành viên Tập đoàn',
            status: 'ACTIVE',
            joinedAt: req.reviewedAt || req.requestedAt || new Date().toISOString(),
            isTenantAdmin: false,
            requestId: req.id,
            requestVersion: req.version,
          });
        }
      });

      const activeList = Array.from(membersMap.values());
      setActiveUsers(activeList);

      if (pendingItems.length === 0 && activeList.length > 0) {
        setActiveTab('active');
      }
    } catch {
      setPendingRequests([]);
      setActiveUsers([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchRoles();
    fetchMembershipRequests();
  }, [fetchRoles, fetchMembershipRequests]);

  const activePendingCount = pendingRequests.filter((r) => r.status === 'PENDING').length;

  const getEffectiveRoleId = (user: ActiveUser) => {
    if (!roles || roles.length === 0) return '';
    const exactMatch = roles.find((r) => r.id === user.roleId || r.roleCode === user.roleId);
    if (exactMatch) return exactMatch.id;
    return roles[0]?.id || '';
  };

  const handleApprove = async (req: MembershipRequestItem) => {
    if (!hasManagePermission) {
      toast.error('Bạn không có quyền platform_user.manage để phê duyệt tài khoản.');
      return;
    }

    const selectedRoleId = selectedRoleIds[req.id] || (roles[0] ? roles[0].id : '');
    if (!selectedRoleId) {
      toast.error('Vui lòng chọn vai trò để gán cho thành viên.');
      return;
    }

    const assignedRole = roles.find((r) => r.id === selectedRoleId);

    setActionLoadingId(req.id);
    try {
      await membershipApi.approveRequest(req.id, {
        version: req.version,
        roleIds: [selectedRoleId],
        reviewNote: `Đã phê duyệt gia nhập Tập đoàn ${session?.tenant.display_name || ''}`,
      });

      toast.success(`Đã phê duyệt tài khoản "${req.requester.displayName || req.requester.email}" gia nhập Tập đoàn thành công!`);

      const approvedUser: ActiveUser = {
        id: req.requester.id,
        displayName: req.requester.displayName || req.requester.email,
        email: req.requester.email,
        roleId: selectedRoleId,
        roleName: assignedRole?.name || 'Thành viên Tập đoàn',
        status: 'ACTIVE',
        joinedAt: new Date().toISOString(),
        isTenantAdmin: false,
        requestId: req.id,
        requestVersion: req.version + 1,
      };

      setActiveUsers((prev) => [approvedUser, ...prev.filter((u) => u.id !== approvedUser.id)]);
      fetchMembershipRequests();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể phê duyệt yêu cầu gia nhập.';
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleChangeMemberRole = async (userId: string, newRoleId: string) => {
    const selectedRole = roles.find((r) => r.id === newRoleId);
    if (!selectedRole) return;

    const user = activeUsers.find((u) => u.id === userId);
    if (!user) return;

    // Save selected role ID for persistence across reloads
    localStorage.setItem(`user_role_${userId}`, newRoleId);

    // Update UI state immediately
    setActiveUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, roleId: newRoleId, roleName: selectedRole.name } : u))
    );

    try {
      await membershipApi.updateMemberRoles(userId, [newRoleId]);
      toast.success(`Đã lưu vai trò mới [${selectedRole.name}] cho [${user.displayName}] vào CSDL PostgreSQL!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu vai trò mới vào CSDL.';
      toast.error(msg);
    }
  };

  const handleReject = async (req: MembershipRequestItem) => {
    if (!hasManagePermission) {
      toast.error('Bạn không có quyền platform_user.manage để từ chối tài khoản.');
      return;
    }

    const reason = window.prompt(`Nhập lý do từ chối yêu cầu của "${req.requester.displayName || req.requester.email}":`);
    if (reason === null) return;

    setActionLoadingId(req.id);
    try {
      await membershipApi.rejectRequest(req.id, {
        version: req.version,
        reason: reason.trim() || 'Không phù hợp với yêu cầu nhân sự Tập đoàn.',
      });

      toast.info(`Đã từ chối yêu cầu gia nhập của "${req.requester.displayName || req.requester.email}".`);
      fetchMembershipRequests();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể từ chối yêu cầu.';
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredActiveUsers = activeUsers.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans w-full">
      {/* Top Header Card */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Quản lý Người dùng & Phê duyệt Thành viên</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Duyệt yêu cầu gia nhập Tập đoàn từ nhân viên mới và phân quyền thành viên trong tổ chức
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMembershipRequests}
              disabled={loading}
              className="gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            {hasManagePermission && (
              <Button
                size="sm"
                onClick={() => setIsCreateWizardOpen(true)}
                className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Thêm Thành viên Mới
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Main Tabs Component */}
        <CardContent className="pt-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-100 p-1 border border-slate-200">
              <TabsTrigger value="pending" className="text-xs font-semibold gap-2 relative">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Yêu cầu Chờ Phê duyệt</span>
                {activePendingCount > 0 && (
                  <Badge className="bg-amber-500 text-white font-bold text-[10px] px-1.5 h-4 rounded-full">
                    {activePendingCount}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger value="active" className="text-xs font-semibold gap-2">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thành viên Đang Hoạt động ({activeUsers.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: PENDING MEMBERSHIP REQUESTS */}
            <TabsContent value="pending" className="pt-3 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Danh sách Đơn gia nhập chờ duyệt ({pendingRequests.length})</h3>
                  <p className="text-xs text-slate-500">Các tài khoản đăng ký nhập Mã Tập đoàn đang chờ Quản trị viên cấp quyền</p>
                </div>
              </div>

              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-700">Người đăng ký</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Email Công vụ</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Thời gian đăng ký</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Chọn Vai trò Gán</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 text-right pr-6">Thao tác Phê duyệt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500 text-xs font-medium">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                        Đang tải danh sách đơn đăng ký từ máy chủ...
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && pendingRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                        <p className="font-bold text-slate-700 text-sm">Không có yêu cầu gia nhập nào đang chờ duyệt</p>
                        <p className="text-slate-400 mt-0.5">Tất cả tài khoản đăng ký gia nhập Tập đoàn đã được xử lý xong.</p>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    pendingRequests.map((req) => (
                      <TableRow key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="font-bold text-slate-900 text-xs">
                          {req.requester.displayName || req.requester.email}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-mono">
                          {req.requester.email}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(req.requestedAt).toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Select
                            value={selectedRoleIds[req.id] || (roles[0] ? roles[0].id : '')}
                            onValueChange={(val) => setSelectedRoleIds((prev) => ({ ...prev, [req.id]: val }))}
                          >
                            <SelectTrigger className="w-56 h-8 text-xs font-medium border-slate-200 bg-white">
                              <SelectValue placeholder="Chọn vai trò gán..." />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((r) => (
                                <SelectItem key={r.id} value={r.id} className="text-xs font-medium">
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(req)}
                              disabled={actionLoadingId === req.id}
                              className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            >
                              {actionLoadingId === req.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              Phê duyệt
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(req)}
                              disabled={actionLoadingId === req.id}
                              className="h-8 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Từ chối
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* TAB 2: ACTIVE MEMBERS */}
            <TabsContent value="active" className="pt-3 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Danh sách Thành viên Đang Hoạt động trong Tập đoàn</h3>
                  <p className="text-xs text-slate-500">Tất cả nhân sự đã được Quản trị viên duyệt quyền truy cập dữ liệu CRM</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Tìm thành viên theo tên hoặc email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>
              </div>

              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-700">Họ và Tên</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Email Công vụ</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Vai trò & Quyền hạn</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Trạng thái</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Ngày gia nhập</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActiveUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-500 font-medium">
                        Không tìm thấy thành viên nào phù hợp với từ khóa tìm kiếm.
                      </TableCell>
                    </TableRow>
                  )}

                  {filteredActiveUsers.map((user) => {
                    const effectiveRoleId = getEffectiveRoleId(user);
                    return (
                      <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="font-bold text-slate-900 text-xs">
                          <div className="flex items-center gap-2">
                            <span>{user.displayName}</span>
                            {user.isTenantAdmin && (
                              <Badge className="bg-blue-600 text-white font-bold text-[9px] px-1.5 py-0">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-mono">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-xs">
                          {user.isTenantAdmin ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 w-fit">
                              <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{user.roleName}</span>
                            </div>
                          ) : (
                            <Select
                              value={effectiveRoleId}
                              onValueChange={(val) => handleChangeMemberRole(user.id, val)}
                            >
                              <SelectTrigger className="w-56 h-8 text-xs font-semibold border-slate-200 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((r) => (
                                  <SelectItem key={r.id} value={r.id} className="text-xs font-medium">
                                    {r.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-[10px]">
                            Đang hoạt động
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(user.joinedAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create User Wizard Modal */}
      <CreateUserWizardModal
        open={isCreateWizardOpen}
        onOpenChange={setIsCreateWizardOpen}
        onUserCreated={() => fetchMembershipRequests()}
      />
    </div>
  );
};
