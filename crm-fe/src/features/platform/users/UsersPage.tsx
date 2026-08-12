import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  Search,
  BadgeAlert,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { useAuth } from '@/core/session/useAuth';

interface PendingUserRequest {
  id: string;
  email: string;
  displayName: string;
  requestedAt: string;
  tenantCode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface ActiveUser {
  id: string;
  email: string;
  displayName: string;
  roleName: string;
  status: 'ACTIVE' | 'SUSPENDED';
  joinedAt: string;
  isTenantAdmin: boolean;
}

const INITIAL_PENDING_REQUESTS: PendingUserRequest[] = [
  {
    id: 'req-001',
    displayName: 'Nguyễn Văn Tiến (Tư vấn viên)',
    email: 'tien.nguyen@ipa-group.vn',
    requestedAt: '2026-08-10T14:30:00Z',
    tenantCode: 'TAP-DOAN-IPA',
    status: 'PENDING',
  },
  {
    id: 'req-002',
    displayName: 'Trần Thị Mai (Chuyên viên Bán hàng)',
    email: 'mai.tran@ipa-group.vn',
    requestedAt: '2026-08-10T11:15:00Z',
    tenantCode: 'TAP-DOAN-IPA',
    status: 'PENDING',
  },
];

const INITIAL_ACTIVE_USERS: ActiveUser[] = [
  {
    id: 'usr-admin-01',
    displayName: 'Quản trị viên Hệ thống (IPA Admin)',
    email: 'admin@vum.vn',
    roleName: 'Quản trị viên Hệ thống (ADMIN)',
    status: 'ACTIVE',
    joinedAt: '2026-01-01T08:00:00Z',
    isTenantAdmin: true,
  },
  {
    id: 'usr-mgr-01',
    displayName: 'Lê Văn Hoàng (Quản lý Vùng)',
    email: 'manager@vum.vn',
    roleName: 'Quản lý Vùng (Miền Bắc)',
    status: 'ACTIVE',
    joinedAt: '2026-01-15T09:30:00Z',
    isTenantAdmin: false,
  },
];

export const UsersPage: React.FC = () => {
  const { session } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<PendingUserRequest[]>(INITIAL_PENDING_REQUESTS);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>(INITIAL_ACTIVE_USERS);
  const [searchQuery, setSearchQuery] = useState('');

  const activePendingCount = pendingRequests.filter((r) => r.status === 'PENDING').length;

  const handleApprove = (req: PendingUserRequest) => {
    setPendingRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: 'APPROVED' } : r))
    );

    const newUser: ActiveUser = {
      id: `usr-${Date.now()}`,
      displayName: req.displayName,
      email: req.email,
      roleName: 'Chuyên viên Kinh doanh (SALES_STAFF)',
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      isTenantAdmin: false,
    };

    setActiveUsers((prev) => [newUser, ...prev]);

    toast.success(`Đã phê duyệt người dùng ${req.displayName} vào Tập đoàn thành công!`);
  };

  const handleReject = (req: PendingUserRequest) => {
    setPendingRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: 'REJECTED' } : r))
    );

    toast.error(`Đã từ chối yêu cầu gia nhập của ${req.displayName}`);
  };

  const filteredActiveUsers = activeUsers.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Quản lý Người dùng & Phê duyệt Thành viên</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Duyệt yêu cầu gia nhập Tập đoàn từ nhân viên mới và phân quyền thành viên trong tổ chức
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activePendingCount > 0 && (
            <Badge className="bg-amber-500 text-white font-bold px-3 py-1 text-xs animate-bounce gap-1">
              <BadgeAlert className="w-3.5 h-3.5" />
              {activePendingCount} Yêu cầu Chờ Quản trị viên duyệt
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 shadow-2xs w-full justify-start h-auto">
          <TabsTrigger value="pending" className="gap-2 text-xs font-semibold py-2 px-4 relative">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Yêu cầu Gia nhập Chờ duyệt</span>
            {activePendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {activePendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2 text-xs font-semibold py-2 px-4">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Thành viên Đã kích hoạt ({activeUsers.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Pending Requests */}
        <TabsContent value="pending" className="mt-4 space-y-4">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Danh sách Yêu cầu Gia nhập Chờ duyệt</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Các tài khoản đã đăng ký và chọn gia nhập Tập đoàn <strong>{session?.tenant.display_name}</strong>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-700">Họ và tên Người dùng</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Email Đăng ký</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Tập đoàn Gia nhập</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Thời gian Gửi yêu cầu</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Trạng thái</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 text-right pr-6">Thao tác Quản trị</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-slate-50/80">
                      <TableCell className="font-semibold text-slate-900 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {req.displayName.charAt(0)}
                          </div>
                          <span>{req.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-slate-600">{req.email}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono text-[11px]">
                          {req.tenantCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(req.requestedAt).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-xs">
                        {req.status === 'PENDING' && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 gap-1 text-[10px]">
                            <Clock className="w-3 h-3" />
                            Chờ duyệt (INVITED)
                          </Badge>
                        )}
                        {req.status === 'APPROVED' && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đã phê duyệt
                          </Badge>
                        )}
                        {req.status === 'REJECTED' && (
                          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300 gap-1 text-[10px]">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Đã từ chối
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(req)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 h-8"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Phê duyệt (Approve)
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(req)}
                              className="text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold text-xs gap-1.5 h-8"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Từ chối
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Đã xử lý</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Active Users */}
        <TabsContent value="active" className="mt-4 space-y-4">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Danh sách Thành viên Trong Tập đoàn</span>
                </CardTitle>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-700">Họ và tên</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Email</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Vai trò Phân bổ</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Trạng thái</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Ngày tham gia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActiveUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/80">
                      <TableCell className="font-semibold text-slate-900 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {user.displayName.charAt(0)}
                          </div>
                          <span>{user.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-slate-600">{user.email}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-[11px]">
                          <Shield className="w-3 h-3 text-blue-600" />
                          {user.roleName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Hoạt động (ACTIVE)
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(user.joinedAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
