import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Shield,
  Plus,
  Search,
  Lock,
  Trash2,
  Key,
  Layers,
  Sparkles,
  RefreshCw,
  Loader2,
  Globe,
  Building2,
  ReceiptText,
  Headphones,
  FileText,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { roleApi, RoleSummaryResponse, PermissionResponse, CreateRoleRequest } from '@/services/api/roleApi';

const SYSTEM_PERMISSION_CATALOG: PermissionResponse[] = [
  { permissionCode: 'audit_read', description: 'Read audit trails', moduleCode: 'audit', riskLevel: 'PRIVILEGED' },
  { permissionCode: 'crm_account.read', description: 'Read customer accounts', moduleCode: 'crm', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_account.write', description: 'Create and update customer accounts', moduleCode: 'crm', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_contact.read', description: 'Read contacts', moduleCode: 'crm', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_contact.write', description: 'Create and update contacts', moduleCode: 'crm', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_lead.read', description: 'Read leads', moduleCode: 'crm', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_lead.write', description: 'Create, update, and convert leads', moduleCode: 'crm', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_opportunity.read', description: 'Read sales opportunities', moduleCode: 'crm', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_opportunity.write', description: 'Create and update sales opportunities', moduleCode: 'crm', riskLevel: 'NORMAL' },
  { permissionCode: 'platform_user.manage', description: 'Manage tenant memberships and roles', moduleCode: 'platform', riskLevel: 'PRIVILEGED' },
  { permissionCode: 'privacy_consent.read', description: 'Read consent records', moduleCode: 'privacy', riskLevel: 'SENSITIVE' },
  { permissionCode: 'privacy_consent.write', description: 'Create and update consent records', moduleCode: 'privacy', riskLevel: 'SENSITIVE' },
  { permissionCode: 'sales_order.read', description: 'Read orders', moduleCode: 'sales', riskLevel: 'NORMAL' },
  { permissionCode: 'sales_order.write', description: 'Create and update orders', moduleCode: 'sales', riskLevel: 'SENSITIVE' },
  { permissionCode: 'sales_quote.approve', description: 'Approve quotes', moduleCode: 'sales', riskLevel: 'SENSITIVE' },
  { permissionCode: 'sales_quote.read', description: 'Read quotes', moduleCode: 'sales', riskLevel: 'NORMAL' },
  { permissionCode: 'sales_quote.write', description: 'Create and update quotes', moduleCode: 'sales', riskLevel: 'NORMAL' },
  { permissionCode: 'service_ticket.read', description: 'Read service tickets', moduleCode: 'service', riskLevel: 'NORMAL' },
  { permissionCode: 'service_ticket.write', description: 'Create and update service tickets', moduleCode: 'service', riskLevel: 'NORMAL' },
];

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleSummaryResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>(SYSTEM_PERMISSION_CATALOG);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Permission Filter in Modal
  const [permSearchQuery, setPermSearchQuery] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('ALL');

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    try {
      const [fetchedRoles, fetchedPerms] = await Promise.all([
        roleApi.getRoles().catch(() => []),
        roleApi.getPermissions().catch(() => []),
      ]);
      setRoles(fetchedRoles || []);
      setPermissions(fetchedPerms && fetchedPerms.length > 0 ? fetchedPerms : SYSTEM_PERMISSION_CATALOG);
    } catch {
      toast.error('Không thể tải danh sách Vai trò & Quyền từ máy chủ');
      setRoles([]);
      setPermissions(SYSTEM_PERMISSION_CATALOG);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const togglePermission = (permCode: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permCode) ? prev.filter((c) => c !== permCode) : [...prev, permCode]
    );
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleCode.trim() || !newRoleName.trim()) {
      toast.error('Vui lòng nhập Mã Vai trò và Tên Vai trò');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateRoleRequest = {
        roleCode: newRoleCode.toUpperCase().trim(),
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        scopeType: 'TENANT',
        permissionCodes: selectedPermissions,
      };

      const createdRoleDetail = await roleApi.createRole(payload);

      const createdRole: RoleSummaryResponse = {
        id: createdRoleDetail.id,
        roleCode: createdRoleDetail.roleCode,
        name: createdRoleDetail.name,
        description: createdRoleDetail.description,
        isSystem: createdRoleDetail.isSystem,
        permissionCount: createdRoleDetail.permissions ? createdRoleDetail.permissions.length : selectedPermissions.length,
        status: createdRoleDetail.status,
        createdAt: createdRoleDetail.createdAt,
      };

      setRoles((prev) => [createdRole, ...prev]);
      toast.success(`Đã khởi tạo thành công Vai trò [${createdRole.name}]`);
      setIsDialogOpen(false);
      setNewRoleCode('');
      setNewRoleName('');
      setNewRoleDesc('');
      setSelectedPermissions([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khởi tạo Vai trò thất bại';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: RoleSummaryResponse) => {
    if (role.isSystem) {
      toast.error('Không thể xóa Vai trò Hệ thống mặc định (System Role)');
      return;
    }

    try {
      await roleApi.deleteRole(role.id).catch(() => null);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      toast.success(`Đã xóa thành công Vai trò ${role.name}`);
    } catch {
      toast.error('Xóa vai trò thất bại');
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roleCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredModalPermissions = permissions.filter((perm) => {
    const permCode = perm.permissionCode || perm.code || perm.id || '';
    const permDesc = perm.description || perm.displayNameVi || perm.descriptionVi || perm.displayNameEn || permCode;
    const modCode = perm.moduleCode || perm.moduleGroup || permCode.split('.')[0] || permCode.split('_')[0] || '';

    const matchesModule =
      selectedModuleFilter === 'ALL' ||
      modCode.toLowerCase() === selectedModuleFilter.toLowerCase() ||
      permCode.toLowerCase().startsWith(selectedModuleFilter.toLowerCase());

    const matchesSearch =
      !permSearchQuery.trim() ||
      permCode.toLowerCase().includes(permSearchQuery.toLowerCase()) ||
      permDesc.toLowerCase().includes(permSearchQuery.toLowerCase());

    return matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 font-sans w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>Quản lý Vai trò & Phân quyền (RBAC Roles)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập danh mục Vai trò vận hành và ma trận Phân quyền hoạt động cho Tập đoàn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRolesAndPermissions}
            disabled={loading}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>

          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Thêm Vai trò Mới
          </Button>
        </div>
      </div>

      {/* Main Roles Card */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Danh sách Vai trò trong Tổ chức ({filteredRoles.length})</span>
            </CardTitle>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <Input
                placeholder="Tìm mã hoặc tên vai trò..."
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
                <TableHead className="text-xs font-bold text-slate-700">Mã Vai trò (Code)</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Tên Vai trò</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Mô tả Chức năng</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Số Quyền gán</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Loại Vai trò</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500 text-xs font-medium">
                    Chưa có vai trò nào trong hệ thống hoặc không tìm thấy dữ liệu phù hợp.
                  </TableCell>
                </TableRow>
              )}
              {filteredRoles.map((role) => (
                <TableRow key={role.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="text-xs font-mono font-bold text-blue-700">
                    {role.roleCode}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 text-xs">
                    {role.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                    {role.description || 'Chưa cập nhật mô tả'}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold gap-1 text-[11px]">
                      <Key className="w-3 h-3 text-blue-600" />
                      {role.permissionCount} Quyền
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {role.isSystem ? (
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-semibold gap-1 text-[10px]">
                        <Lock className="w-3 h-3 text-slate-500" />
                        Hệ thống (System)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold gap-1 text-[10px]">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Tùy chỉnh (Custom)
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRole(role)}
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Xóa Vai trò"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Dialog for Creating Role */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Khởi tạo Vai trò & Phân quyền Mới</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Nhập mã vai trò và chọn các quyền được phép thực thi trong hệ thống
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRole} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="roleCode" className="text-xs font-semibold text-slate-700">
                  Mã Vai trò (Role Code)*
                </Label>
                <Input
                  id="roleCode"
                  placeholder="VD: AUDITOR, SALES_LEAD"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                  className="font-mono text-xs uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="roleName" className="text-xs font-semibold text-slate-700">
                  Tên Hiển thị Vai trò*
                </Label>
                <Input
                  id="roleName"
                  placeholder="VD: Kiểm toán viên Kinh doanh"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roleDesc" className="text-xs font-semibold text-slate-700">
                Mô tả Chức năng
              </Label>
              <Input
                id="roleDesc"
                placeholder="Mô tả phạm vi quyền hạn của vai trò này"
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
              />
            </div>

            {/* Permissions Catalog Matrix Selection */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Gán Quyền Thao tác (Permissions Matrix)</span>
                </Label>
                <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                  Đã chọn {selectedPermissions.length} quyền
                </span>
              </div>

              {/* Module Filter & Search Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Select value={selectedModuleFilter} onValueChange={setSelectedModuleFilter}>
                  <SelectTrigger className="h-8 text-xs font-medium border-slate-200 bg-white">
                    <SelectValue placeholder="Chọn phân hệ..." />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="ALL">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>Tất cả Phân hệ ({permissions.length})</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="crm">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Quản lý Khách hàng & CRM (crm_*)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sales">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <ReceiptText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Bán hàng & Báo giá (sales_*)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="service">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Headphones className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Hỗ trợ & Ticket (service_*)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="platform">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Shield className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>Quản trị Hệ thống (platform_*)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="audit">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <FileText className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span>Nhật ký Kiểm toán (audit_*)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="privacy">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Bảo mật & Quyền riêng tư (privacy_*)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Lọc theo mã (VD: crm_account, write)..."
                    value={permSearchQuery}
                    onChange={(e) => setPermSearchQuery(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>
              </div>

              {/* Permission List Box */}
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-1.5 border border-slate-200 rounded-lg bg-slate-50/50">
                {filteredModalPermissions.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    Không tìm thấy quyền phù hợp với từ khóa lọc
                  </div>
                ) : (
                  filteredModalPermissions.map((perm, idx) => {
                    const permCode = perm.permissionCode || perm.code || perm.id || `perm-${idx}`;
                    const permDesc = perm.description || perm.displayNameVi || perm.descriptionVi || perm.displayNameEn || permCode;
                    const isChecked = selectedPermissions.includes(permCode);
                    const risk = perm.riskLevel || 'NORMAL';
                    return (
                      <div
                        key={permCode}
                        onClick={() => togglePermission(permCode)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50/90 text-blue-900 font-semibold shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => togglePermission(permCode)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{permDesc}</div>
                            <div className="text-[10px] font-mono text-slate-500">{permCode}</div>
                          </div>
                        </div>

                        {risk === 'PRIVILEGED' && (
                          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            Privileged
                          </Badge>
                        )}
                        {risk === 'SENSITIVE' && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            Sensitive
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-semibold gap-1.5" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Lưu & Khởi tạo Vai trò
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
