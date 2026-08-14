import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  X,
  RotateCcw,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
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
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // Pagination State for Active Users
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch Real Roles Catalog from Backend API
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

      if (pendingItems.length > 0 && activeList.length === 0) {
        setActiveTab('pending');
      }
    } catch {
      setPendingRequests([]);
      setActiveUsers([]);
    } finally {
      setLoading(false);
    }
  }, [session, roles]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    fetchMembershipRequests();
  }, [fetchMembershipRequests]);

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

    localStorage.setItem(`user_role_${userId}`, newRoleId);

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

  // Filtered & Paginated Active Users
  const filteredActiveUsers = useMemo(() => {
    return activeUsers.filter((u) => {
      const matchesSearch =
        searchQuery === '' ||
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        selectedRoleFilter === 'ALL' ||
        u.roleId === selectedRoleFilter ||
        (roles.find((r) => r.id === selectedRoleFilter)?.name === u.roleName);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ADMIN' ? u.isTenantAdmin : u.status === statusFilter);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [activeUsers, searchQuery, selectedRoleFilter, statusFilter, roles]);

  const totalPages = Math.max(1, Math.ceil(filteredActiveUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActiveUsers.slice(start, start + pageSize);
  }, [filteredActiveUsers, currentPage, pageSize]);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedRoleFilter !== 'ALL' ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRoleFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const getVisiblePageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
              <Users className="w-4.5 h-4.5 text-white" />
            </div>
            Quản lý Người dùng &amp; Thành viên
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Phê duyệt yêu cầu gia nhập và phân bổ vai trò quyền hạn thành viên tổ chức
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMembershipRequests}
            disabled={loading}
            className="text-xs gap-1.5 border-slate-200 h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
          {hasManagePermission && (
            <Button
              size="sm"
              onClick={() => setIsCreateWizardOpen(true)}
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Thành viên Mới</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Quick Stat KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Thành viên</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{activeUsers.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Chờ phê duyệt</div>
            <div className="text-lg font-black text-amber-700 leading-tight">{pendingRequests.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đang hoạt động</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">
              {activeUsers.filter((u) => u.status === 'ACTIVE').length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Shield className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Quản trị viên</div>
            <div className="text-lg font-black text-purple-700 leading-tight">
              {activeUsers.filter((u) => u.isTenantAdmin).length}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Tabs Component ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="active" className="text-xs font-semibold gap-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Thành viên Hoạt động ({activeUsers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs font-semibold gap-2 relative">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Yêu cầu Chờ Phê duyệt</span>
            {activePendingCount > 0 && (
              <Badge className="bg-amber-500 text-white font-bold text-[10px] px-1.5 h-4 rounded-full">
                {activePendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ACTIVE MEMBERS */}
        <TabsContent value="active" className="space-y-4">
          {/* ── Filter & Search Bar ── */}
          <Card className="shadow-xs border-slate-200 w-full">
            <CardContent className="py-3 px-4">
              <div className="flex flex-col md:flex-row items-center gap-2.5">
                {/* Search Input */}
                <div className="relative w-full md:w-[280px] shrink-0">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Tìm theo tên thành viên, email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 pr-8 text-xs h-9 border-slate-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                  <SearchableSelect
                    options={[
                      { value: 'ALL', label: `Tất cả vai trò (${roles.length})` },
                      ...roles.map((r) => ({
                        value: r.id,
                        label: r.name,
                        badge: r.roleCode,
                        description: r.description,
                      })),
                    ]}
                    value={selectedRoleFilter}
                    onValueChange={(val) => {
                      setSelectedRoleFilter(val);
                      setCurrentPage(1);
                    }}
                    placeholder="Tất cả vai trò"
                    searchPlaceholder="Tìm kiếm vai trò..."
                    className="w-[200px]"
                  />

                  <SearchableSelect
                    options={[
                      { value: 'ALL', label: 'Tất cả trạng thái' },
                      { value: 'ACTIVE', label: 'Đang hoạt động' },
                      { value: 'ADMIN', label: 'Quản trị viên' },
                    ]}
                    value={statusFilter}
                    onValueChange={(val) => {
                      setStatusFilter(val);
                      setCurrentPage(1);
                    }}
                    placeholder="Tất cả trạng thái"
                    searchPlaceholder="Tìm trạng thái..."
                    className="w-[170px]"
                  />

                  {/* Reset Button */}
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetFilters}
                      className="h-9 px-2 text-xs text-slate-500 hover:text-red-600 gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Đặt lại ({activeFiltersCount})</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Card */}
          <Card className="shadow-xs border-slate-200 w-full overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/90">
                <TableRow className="text-xs">
                  <TableHead className="font-bold text-slate-900">Họ và Tên</TableHead>
                  <TableHead className="font-bold text-slate-900">Email Công vụ</TableHead>
                  <TableHead className="font-bold text-slate-900">Vai trò &amp; Quyền hạn</TableHead>
                  <TableHead className="font-bold text-slate-900">Trạng thái</TableHead>
                  <TableHead className="font-bold text-slate-900">Ngày gia nhập</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                      <span>Đang tải dữ liệu thành viên từ Backend...</span>
                    </TableCell>
                  </TableRow>
                ) : filteredActiveUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-6">
                      <EmptyState
                        icon={Users}
                        title={searchQuery || activeFiltersCount > 0 ? 'Không tìm thấy thành viên phù hợp' : 'Chưa có thành viên nào'}
                        description={searchQuery || activeFiltersCount > 0 ? 'Vui lòng thử tìm kiếm với bộ lọc hoặc từ khóa khác.' : 'Bắt đầu bằng cách thêm thành viên mới hoặc duyệt yêu cầu gia nhập.'}
                        actionLabel={activeFiltersCount > 0 ? undefined : 'Thêm Thành viên Mới'}
                        onAction={activeFiltersCount > 0 ? undefined : () => setIsCreateWizardOpen(true)}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => {
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
                            <SearchableSelect
                              options={roles.map((r) => ({
                                value: r.id,
                                label: r.name,
                                badge: r.roleCode,
                              }))}
                              value={effectiveRoleId}
                              onValueChange={(val) => handleChangeMemberRole(user.id, val)}
                              placeholder="Chọn vai trò..."
                              searchPlaceholder="Tìm vai trò..."
                              triggerClassName="h-8 font-semibold"
                              className="w-56"
                            />
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
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls Bar */}
            {!loading && filteredActiveUsers.length > 0 && (
              <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-600">
                  <span>
                    Hiển thị <strong className="text-slate-900 font-bold">{Math.min((currentPage - 1) * pageSize + 1, filteredActiveUsers.length)} - {Math.min(currentPage * pageSize, filteredActiveUsers.length)}</strong> trên tổng số <strong className="text-slate-900 font-bold">{filteredActiveUsers.length}</strong> thành viên
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Số hàng:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(v) => {
                        setPageSize(Number(v));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-7 w-16 text-xs bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 px-2 text-xs border-slate-200"
                    title="Trang đầu"
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-2 text-xs border-slate-200"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>

                  {getVisiblePageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 text-xs font-semibold p-0 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2 text-xs border-slate-200"
                    title="Trang tiếp"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2 text-xs border-slate-200"
                    title="Trang cuối"
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* TAB 2: PENDING MEMBERSHIP REQUESTS */}
        <TabsContent value="pending" className="space-y-4">
          <Card className="shadow-xs border-slate-200 w-full overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/90">
                <TableRow className="text-xs">
                  <TableHead className="font-bold text-slate-900">Người đăng ký</TableHead>
                  <TableHead className="font-bold text-slate-900">Email Công vụ</TableHead>
                  <TableHead className="font-bold text-slate-900">Thời gian đăng ký</TableHead>
                  <TableHead className="font-bold text-slate-900">Chọn Vai trò Gán</TableHead>
                  <TableHead className="font-bold text-slate-900 text-right pr-6">Thao tác Phê duyệt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                      <span>Đang tải danh sách đơn đăng ký từ máy chủ...</span>
                    </TableCell>
                  </TableRow>
                ) : pendingRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-6">
                      <EmptyState
                        icon={CheckCircle2}
                        title="Không có yêu cầu gia nhập nào đang chờ duyệt"
                        description="Tất cả tài khoản đăng ký gia nhập Tập đoàn đã được xử lý hoàn tất."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
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
                        <SearchableSelect
                          options={roles.map((r) => ({
                            value: r.id,
                            label: r.name,
                            badge: r.roleCode,
                          }))}
                          value={selectedRoleIds[req.id] || (roles[0] ? roles[0].id : '')}
                          onValueChange={(val) => setSelectedRoleIds((prev) => ({ ...prev, [req.id]: val }))}
                          placeholder="Chọn vai trò gán..."
                          searchPlaceholder="Tìm vai trò gán..."
                          triggerClassName="h-8 font-medium"
                          className="w-56"
                        />
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
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Wizard Modal */}
      <CreateUserWizardModal
        open={isCreateWizardOpen}
        onOpenChange={setIsCreateWizardOpen}
        roles={roles}
        onUserCreated={() => fetchMembershipRequests()}
      />
    </div>
  );
};
