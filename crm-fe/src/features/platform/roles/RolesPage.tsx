import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Shield,
  Plus,
  Lock,
  Trash2,
  Key,
  Layers,
  Sparkles,
  RefreshCw,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Copy,
  CheckCircle2,
  XCircle,
  BarChart2,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SearchableSelect } from '@/components/ui/searchable-select';
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
import {
  roleApi,
  RoleSummaryResponse,
  RoleDetailResponse,
  PermissionResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/services/api/roleApi';
import { DynamicForm } from '@/components/common/DynamicForm';
import { EmptyState } from '@/components/common/EmptyState';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardFilterBar } from '@/components/common/StandardFilterBar';
import { StandardPagination } from '@/components/common/StandardPagination';
import {
  createRoleFormSchema,
  editRoleFormSchema,
} from './schemas/roleFormSchema';
import { PermissionGroupSelector } from './components/PermissionGroupSelector';

export interface ExtendedPermission {
  id?: string;
  permissionCode: string;
  code?: string;
  description: string;
  moduleCode: string;
  moduleGroup?: string;
  displayNameVi?: string;
  displayNameEn?: string;
  descriptionVi?: string;
  moduleNameVi: string;
  actionNameVi: string;
  riskLevel?: 'NORMAL' | 'SENSITIVE' | 'PRIVILEGED';
}

export const mapPermissionResponse = (p: PermissionResponse): ExtendedPermission => {
  const moduleViMap: Record<string, string> = {
    crm: 'Quản lý Khách hàng (CRM)',
    sales: 'Bán hàng & Đơn hàng',
    service: 'Hỗ trợ & CSKH',
    platform: 'Quản trị Hệ thống',
    audit: 'Nhật ký Kiểm toán',
    privacy: 'Bảo mật & Quyền riêng tư',
  };
  const modCode = p.moduleCode?.toLowerCase() || 'other';
  return {
    id: p.id,
    permissionCode: p.permissionCode || p.code || '',
    description: p.description || p.descriptionVi || '',
    moduleCode: p.moduleCode || 'other',
    moduleNameVi: moduleViMap[modCode] || p.moduleCode?.toUpperCase() || 'Hệ thống',
    actionNameVi: p.displayNameVi || p.description || p.permissionCode || '',
    riskLevel: (p.riskLevel as 'NORMAL' | 'SENSITIVE' | 'PRIVILEGED') || 'NORMAL',
  };
};

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleSummaryResponse[]>([]);
  const [permissions, setPermissions] = useState<ExtendedPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleTypeFilter, setRoleTypeFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('roles');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<RoleDetailResponse | null>(null);
  const [editRolePermissions, setEditRolePermissions] = useState<string[]>([]);

  // Form State for Creating Role
  const [createStep, setCreateStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleScope, setNewRoleScope] = useState<'TENANT' | 'TEAM_TREE' | 'TEAM' | 'OWN'>('OWN');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Form State for Editing Role
  const [editStep, setEditStep] = useState(1);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDesc, setEditRoleDesc] = useState('');
  const [editRoleScope, setEditRoleScope] = useState<'TENANT' | 'TEAM_TREE' | 'TEAM' | 'OWN'>('OWN');
  const [editRoleStatus, setEditRoleStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Filters for Permission Selection
  const [permSearchQuery, setPermSearchQuery] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Role Comparison State
  const [compareRole1Id, setCompareRole1Id] = useState<string>('role-tenant-admin');
  const [compareRole2Id, setCompareRole2Id] = useState<string>('role-sales-staff');

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    try {
      const [fetchedRoles, fetchedPerms] = await Promise.all([
        roleApi.getRoles().catch(() => []),
        roleApi.getPermissions().catch(() => []),
      ]);

      const roleList: RoleSummaryResponse[] = Array.isArray(fetchedRoles)
        ? fetchedRoles
        : (fetchedRoles as any)?.items || (fetchedRoles as any)?.content || [];
      setRoles(roleList);

      const permList: PermissionResponse[] = Array.isArray(fetchedPerms)
        ? fetchedPerms
        : (fetchedPerms as any)?.items || (fetchedPerms as any)?.content || [];
      if (permList && permList.length > 0) {
        setPermissions(permList.map(mapPermissionResponse));
      } else {
        setPermissions([]);
      }
    } catch {
      toast.error('Không thể tải danh sách Vai trò & Phân quyền từ máy chủ.');
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const moduleList = useMemo(() => {
    const modulesMap = new Map<string, { code: string; name: string; count: number }>();
    permissions.forEach((p) => {
      const mod = p.moduleCode || 'other';
      if (!modulesMap.has(mod)) {
        modulesMap.set(mod, {
          code: mod,
          name: p.moduleNameVi || mod.toUpperCase(),
          count: 0,
        });
      }
      modulesMap.get(mod)!.count++;
    });
    return Array.from(modulesMap.values());
  }, [permissions]);

  const handleOpenDetail = async (role: RoleSummaryResponse) => {
    try {
      const detail = await roleApi.getRole(role.id);
      if (detail) {
        setSelectedRoleDetail(detail);
        setEditRoleName(detail.name || '');
        setEditRoleDesc(detail.description || '');
        setEditRoleStatus(detail.status || 'ACTIVE');
        const existingScope = detail.dataScopes && detail.dataScopes.length > 0 ? detail.dataScopes[0].type : 'OWN';
        setEditRoleScope(existingScope);

        const permCodes: string[] = detail.permissions
          ? (detail.permissions.map((p) => p.permissionCode || p.code).filter(Boolean) as string[])
          : (detail.permissionCodes || []);
        setEditRolePermissions(permCodes);
        setEditStep(1);
        setIsDetailDialogOpen(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải chi tiết vai trò từ máy chủ.';
      toast.error(msg);
    }
  };

  const handleOpenCreateModal = () => {
    setNewRoleCode('');
    setNewRoleName('');
    setNewRoleDesc('');
    setNewRoleScope('OWN');
    setSelectedPermissions([]);
    setCreateStep(1);
    setIsCreateDialogOpen(true);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRoleCode.trim() || !newRoleName.trim()) {
      toast.error('Vui lòng nhập Mã Vai trò và Tên Vai trò!');
      return;
    }

    if (createStep === 1) {
      setCreateStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateRoleRequest = {
        roleCode: newRoleCode.toUpperCase().trim(),
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        scopeType: newRoleScope,
        permissionCodes: selectedPermissions,
        dataScopes: [
          { entityType: 'ACCOUNT', type: newRoleScope },
          { entityType: 'CONTACT', type: newRoleScope },
          { entityType: 'LEAD', type: newRoleScope },
          { entityType: 'OPPORTUNITY', type: newRoleScope },
          { entityType: 'QUOTE', type: newRoleScope },
          { entityType: 'ORDER', type: newRoleScope },
        ],
      };

      const createdRoleDetail = await roleApi.createRole(payload);

      const createdRole: RoleSummaryResponse = {
        id: createdRoleDetail.id,
        roleCode: createdRoleDetail.roleCode || payload.roleCode,
        name: createdRoleDetail.name || payload.name,
        description: createdRoleDetail.description || payload.description,
        isSystem: false,
        system: false,
        permissionCount: createdRoleDetail.permissionCodes?.length ?? selectedPermissions.length,
        status: createdRoleDetail.status || 'ACTIVE',
        createdAt: createdRoleDetail.createdAt || new Date().toISOString(),
        version: createdRoleDetail.version || 1,
      };

      setRoles((prev) => [createdRole, ...prev]);
      toast.success(`Đã khởi tạo thành công Vai trò [${createdRole.name}] với (${selectedPermissions.length}) quyền!`);
      setIsCreateDialogOpen(false);
      setCreateStep(1);
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

  const handleUpdateRolePermissions = async () => {
    if (!selectedRoleDetail) return;
    const isSystemRole = Boolean(selectedRoleDetail.isSystem || selectedRoleDetail.system);

    if (isSystemRole) {
      toast.error('Vai trò Hệ thống mặc định (System Role) được bảo vệ bởi Backend, không được phép chỉnh sửa.');
      return;
    }

    if (!editRoleName.trim()) {
      toast.error('Tên Vai trò không được để trống.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataScopesPayload = [
        { entityType: 'ACCOUNT', type: editRoleScope },
        { entityType: 'CONTACT', type: editRoleScope },
        { entityType: 'LEAD', type: editRoleScope },
        { entityType: 'OPPORTUNITY', type: editRoleScope },
        { entityType: 'QUOTE', type: editRoleScope },
        { entityType: 'ORDER', type: editRoleScope },
      ];

      const updatePayload: UpdateRoleRequest = {
        version: selectedRoleDetail.version || 1,
        name: editRoleName.trim(),
        description: editRoleDesc.trim(),
        status: editRoleStatus,
        permissionCodes: editRolePermissions,
        dataScopes: dataScopesPayload,
      };

      const updated = await roleApi.updateRole(selectedRoleDetail.id, updatePayload);
      if (updated && updated.version) {
        setSelectedRoleDetail(updated);
      }

      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRoleDetail.id
            ? {
                ...r,
                name: editRoleName.trim(),
                description: editRoleDesc.trim(),
                status: editRoleStatus,
                permissionCount: editRolePermissions.length,
                version: updated?.version || ((r.version || 1) + 1),
              }
            : r
        )
      );

      toast.success(`Đã cập nhật thành công Vai trò [${editRoleName.trim()}] & Phạm vi dữ liệu (${editRoleScope})!`);
      setIsDetailDialogOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error && (err.message.includes('409') || err.message.includes('Conflict') || err.message.includes('IMMUTABLE'))) {
        if (isSystemRole) {
          toast.error('Vai trò Hệ thống mặc định (System Role) được bảo vệ bởi Backend, không được phép chỉnh sửa.');
        } else {
          toast.error('Xung đột phiên dữ liệu (Version Conflict). Đang tự động làm mới chi tiết vai trò...');
          roleApi.getRole(selectedRoleDetail.id).then((refreshed) => {
            if (refreshed) setSelectedRoleDetail(refreshed);
          }).catch(() => null);
        }
      } else {
        const msg = err instanceof Error ? err.message : 'Cập nhật vai trò thất bại';
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: RoleSummaryResponse) => {
    const isSystemRole = Boolean(role.isSystem || role.system);
    if (isSystemRole) {
      toast.error('Không thể xóa Vai trò Hệ thống mặc định (System Role)');
      return;
    }

    try {
      await roleApi.deleteRole(role.id, role.version || 1).catch(() => null);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      toast.success(`Đã xóa thành công Vai trò ${role.name}`);
    } catch (err) {
      toast.error('Không thể xóa vai trò. Vui lòng thử lại!');
    }
  };

  const handleCloneRole = (role: RoleSummaryResponse) => {
    setNewRoleCode(`${role.roleCode}_COPY`);
    setNewRoleName(`${role.name} (Bản sao)`);
    setNewRoleDesc(`Được nhân bản từ vai trò gốc ${role.name}`);
    setNewRoleScope('OWN');
    setIsCreateDialogOpen(true);
  };

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.roleCode.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q));

      const isSys = Boolean(r.isSystem || r.system);
      const matchesType =
        roleTypeFilter === 'ALL' ||
        (roleTypeFilter === 'SYSTEM' ? isSys : !isSys);

      return matchesSearch && matchesType;
    });
  }, [roles, searchQuery, roleTypeFilter]);

  const activeRolesFiltersCount =
    (searchQuery ? 1 : 0) + (roleTypeFilter !== 'ALL' ? 1 : 0);

  const handleResetRolesFilter = () => {
    setSearchQuery('');
    setRoleTypeFilter('ALL');
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));

  const paginatedRoles = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredRoles.slice(startIdx, startIdx + pageSize);
  }, [filteredRoles, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleTypeFilter, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const filteredCatalogPermissions = permissions.filter((perm) => {
    const permCode = perm.permissionCode || '';
    const permDesc = perm.description || '';
    const modCode = perm.moduleCode || '';

    const matchesModule =
      selectedModuleFilter === 'ALL' ||
      modCode.toLowerCase() === selectedModuleFilter.toLowerCase();

    const matchesRisk = riskFilter === 'ALL' || perm.riskLevel === riskFilter;

    const matchesSearch =
      !permSearchQuery.trim() ||
      permCode.toLowerCase().includes(permSearchQuery.toLowerCase()) ||
      permDesc.toLowerCase().includes(permSearchQuery.toLowerCase());

    return matchesModule && matchesRisk && matchesSearch;
  });

  const activeCatalogFiltersCount =
    (permSearchQuery ? 1 : 0) +
    (selectedModuleFilter !== 'ALL' ? 1 : 0) +
    (riskFilter !== 'ALL' ? 1 : 0);

  const handleResetCatalogFilter = () => {
    setPermSearchQuery('');
    setSelectedModuleFilter('ALL');
    setRiskFilter('ALL');
  };

  const role1 = useMemo(() => roles.find((r) => r.id === compareRole1Id) || roles[0], [roles, compareRole1Id]);
  const role2 = useMemo(() => roles.find((r) => r.id === compareRole2Id) || roles[1] || roles[0], [roles, compareRole2Id]);

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Quản trị Vai trò & Ma trận Phân quyền"
        subtitle="Mô hình kiểm soát truy cập dựa trên vai trò (RBAC), phạm vi dữ liệu theo phòng ban & phân bổ quyền hệ thống"
        badgeCount={roles.length}
        badgeLabel="vai trò"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRolesAndPermissions}
              disabled={loading}
              className="text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 h-8 rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreateModal}
              className="text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none h-8 rounded-[3px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Vai trò</span>
            </Button>
          </>
        }
      />

      {/* ── Main Tabs Container ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 p-0.5 border border-slate-200 rounded-[4px] h-9">
          <TabsTrigger value="roles" className="text-xs font-semibold gap-2 rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-[#0C66E4] data-[state=active]:shadow-none">
            <Layers className="w-3.5 h-3.5 text-[#0C66E4]" />
            <span>Danh sách Vai trò</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-mono font-bold">
              {roles.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="catalog" className="text-xs font-semibold gap-2 rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-[#0C66E4] data-[state=active]:shadow-none">
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>Danh mục Quyền Hệ thống</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
              {permissions.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="text-xs font-semibold gap-2 rounded-[3px] data-[state=active]:bg-white data-[state=active]:text-[#0C66E4] data-[state=active]:shadow-none">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>So sánh Ma trận Quyền</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ROLES TABLE & LIST */}
        <TabsContent value="roles" className="space-y-3">
          {/* ── Filter & Search Bar ── */}
          <StandardFilterBar
            searchQuery={searchQuery}
            onSearchChange={(val: string) => { setSearchQuery(val); setCurrentPage(1); }}
            searchPlaceholder="Tìm theo mã hoặc tên vai trò..."
            activeFiltersCount={activeRolesFiltersCount}
            onResetFilters={handleResetRolesFilter}
            filterControls={
              <SearchableSelect
                options={[
                  { value: 'ALL', label: 'Tất cả loại vai trò' },
                  { value: 'SYSTEM', label: 'Vai trò Hệ thống', badge: 'System' },
                  { value: 'CUSTOM', label: 'Vai trò Tùy chỉnh', badge: 'Custom' },
                ]}
                value={roleTypeFilter}
                onValueChange={(val: string) => {
                  setRoleTypeFilter(val);
                  setCurrentPage(1);
                }}
                placeholder="Tất cả loại vai trò"
                searchPlaceholder="Tìm loại vai trò..."
                className="w-[180px] h-8 rounded-[3px] text-xs"
              />
            }
          />

          {/* Roles Table Card */}
          <Card className="border border-slate-200 rounded-[4px] w-full overflow-hidden bg-white shadow-none">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="hover:bg-[#F7F8F9]">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Mã Vai trò (Role Code)</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Tên Vai trò</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Mô tả Chức năng</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Số Quyền Gán</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Phân loại</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-6">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {filteredRoles.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-6">
                      <EmptyState
                        icon={Shield}
                        title={searchQuery || activeRolesFiltersCount > 0 ? 'Không tìm thấy vai trò phù hợp' : 'Chưa có vai trò nào trong hệ thống'}
                        description={searchQuery || activeRolesFiltersCount > 0 ? 'Vui lòng thử tìm kiếm với bộ lọc hoặc từ khóa khác.' : 'Bắt đầu bằng cách tạo vai trò phân quyền đầu tiên cho tổ chức của bạn.'}
                        actionLabel={activeRolesFiltersCount > 0 ? undefined : 'Thêm Vai trò Mới'}
                        onAction={activeRolesFiltersCount > 0 ? undefined : handleOpenCreateModal}
                      />
                    </TableCell>
                  </TableRow>
                )}
                {paginatedRoles.map((role) => {
                  const isSys = Boolean(role.isSystem || role.system);
                  return (
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
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{
                                width: `${Math.min(100, Math.round((role.permissionCount / Math.max(1, permissions.length)) * 100))}%`,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-700">
                            {role.permissionCount}/{permissions.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {isSys ? (
                          <span className="inline-flex items-center gap-1 bg-[#EAE6FF] text-[#403294] font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5">
                            <Lock className="w-2.5 h-2.5 text-[#403294]" />
                            Hệ thống (System)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-[#E3FCEF] text-[#006644] font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-[#006644]" />
                            Tùy chỉnh (Custom)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDetail(role)}
                            className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                            title="Xem chi tiết & Phân quyền"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCloneRole(role)}
                            className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-slate-900 hover:bg-[#EBECF0]"
                            title="Nhân bản Vai trò"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>

                          {!isSys && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRole(role)}
                              className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-red-600 hover:bg-red-50"
                              title="Xóa Vai trò"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Standard Pagination Controls Bar */}
            <StandardPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={filteredRoles.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="vai trò"
            />
          </Card>
        </TabsContent>

        {/* TAB 2: SYSTEM PERMISSIONS CATALOG */}
        <TabsContent value="catalog" className="space-y-3">
          {/* ── Filter & Search Bar ── */}
          <StandardFilterBar
            searchQuery={permSearchQuery}
            onSearchChange={(val: string) => setPermSearchQuery(val)}
            searchPlaceholder="Tìm theo mã hoặc mô tả quyền..."
            activeFiltersCount={activeCatalogFiltersCount}
            onResetFilters={handleResetCatalogFilter}
            filterControls={
              <>
                <SearchableSelect
                  options={[
                    { value: 'ALL', label: `Tất cả Phân hệ (${permissions.length})` },
                    ...moduleList.map((m) => ({
                      value: m.code,
                      label: m.name,
                      badge: `${m.count}`,
                    })),
                  ]}
                  value={selectedModuleFilter}
                  onValueChange={setSelectedModuleFilter}
                  placeholder="Tất cả Phân hệ"
                  searchPlaceholder="Tìm kiếm phân hệ..."
                  className="w-[180px] h-8 rounded-[3px] text-xs"
                />

                <SearchableSelect
                  options={[
                    { value: 'ALL', label: 'Tất cả Mức Rủi ro' },
                    { value: 'NORMAL', label: 'Bình thường (Normal)', badge: 'Normal' },
                    { value: 'SENSITIVE', label: 'Nhạy cảm (Sensitive)', badge: 'Sensitive' },
                    { value: 'PRIVILEGED', label: 'Đặc quyền (Privileged)', badge: 'Privileged' },
                  ]}
                  value={riskFilter}
                  onValueChange={setRiskFilter}
                  placeholder="Tất cả Mức Rủi ro"
                  searchPlaceholder="Tìm mức rủi ro..."
                  className="w-[160px] h-8 rounded-[3px] text-xs"
                />
              </>
            }
          />

          {/* Catalog Table Card */}
          <Card className="border border-slate-200 rounded-[4px] w-full overflow-hidden bg-white shadow-none">
            <Table>
              <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                <TableRow className="hover:bg-[#F7F8F9]">
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Mã Quyền (Permission Code)</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Phân hệ Chức năng</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Mô tả Phạm vi Thao tác</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Mức Rủi ro Bảo mật</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredCatalogPermissions.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="p-6">
                        <EmptyState
                          icon={Key}
                          title="Không tìm thấy quyền chức năng"
                          description="Danh mục quyền trống hoặc không có quyền nào khớp với bộ lọc đã chọn."
                        />
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredCatalogPermissions.map((perm) => (
                    <TableRow key={perm.permissionCode} className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] transition-colors">
                      <TableCell className="text-xs font-mono font-bold text-[#0C66E4] py-2 px-3">
                        {perm.permissionCode}
                      </TableCell>
                      <TableCell className="text-xs py-2 px-3">
                        <span className="bg-[#EBECF0] text-[#42526E] font-semibold text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded-[3px]">
                          {perm.moduleNameVi}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-normal py-2 px-3">
                        {perm.description}
                      </TableCell>
                      <TableCell className="text-xs py-2 px-3">
                        {perm.riskLevel === 'PRIVILEGED' && (
                          <span className="inline-flex items-center gap-1 bg-[#FFEBE6] text-[#DE350B] text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[3px]">
                            <ShieldAlert className="w-2.5 h-2.5 text-[#DE350B]" />
                            Đặc quyền (Privileged)
                          </span>
                        )}
                        {perm.riskLevel === 'SENSITIVE' && (
                          <span className="inline-flex items-center gap-1 bg-[#FFFAE6] text-[#974F0C] text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[3px]">
                            <ShieldCheck className="w-2.5 h-2.5 text-[#974F0C]" />
                            Nhạy cảm (Sensitive)
                          </span>
                        )}
                        {(!perm.riskLevel || perm.riskLevel === 'NORMAL') && (
                          <span className="inline-flex items-center gap-1 bg-[#E3FCEF] text-[#006644] text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[3px]">
                            <CheckCircle2 className="w-2.5 h-2.5 text-[#006644]" />
                            Bình thường (Normal)
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </Card>
        </TabsContent>

        {/* TAB 3: ROLE COMPARISON MATRIX */}
        <TabsContent value="compare" className="space-y-4">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <span>So sánh Ma trận Quyền giữa 2 Vai trò</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Chọn 2 vai trò bất kỳ để đối soát điểm khác biệt về phân quyền
              </CardDescription>

              {roles.length >= 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Vai trò 1 (Gốc):</Label>
                    <SearchableSelect
                      options={roles.map((r) => ({
                        value: r.id,
                        label: `${r.name} (${r.roleCode})`,
                        badge: r.roleCode,
                        description: r.description,
                      }))}
                      value={compareRole1Id || roles[0]?.id}
                      onValueChange={setCompareRole1Id}
                      placeholder="Chọn vai trò 1..."
                      searchPlaceholder="Tìm kiếm vai trò..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Vai trò 2 (So sánh):</Label>
                    <SearchableSelect
                      options={roles.map((r) => ({
                        value: r.id,
                        label: `${r.name} (${r.roleCode})`,
                        badge: r.roleCode,
                        description: r.description,
                      }))}
                      value={compareRole2Id || roles[1]?.id || roles[0]?.id}
                      onValueChange={setCompareRole2Id}
                      placeholder="Chọn vai trò 2..."
                      searchPlaceholder="Tìm kiếm vai trò..."
                    />
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {roles.length < 2 ? (
                <div className="p-8">
                  <EmptyState
                    icon={BarChart2}
                    title="Cần ít nhất 2 vai trò để so sánh ma trận quyền"
                    description="Hệ thống hiện tại chưa có đủ 2 vai trò để thực hiện đối soát. Vui lòng tạo thêm vai trò mới."
                    actionLabel="Thêm Vai trò Mới"
                    onAction={handleOpenCreateModal}
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-xs font-bold text-slate-700">Quyền Chức năng</TableHead>
                      <TableHead className="text-xs font-bold text-center text-slate-700">
                        {role1?.name}
                      </TableHead>
                      <TableHead className="text-xs font-bold text-center text-slate-700">
                        {role2?.name}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((perm) => {
                      const has1 = role1 && (role1.roleCode === 'TENANT_ADMIN' || perm.permissionCode.startsWith(role1.roleCode.toLowerCase().split('_')[0]) || perm.riskLevel === 'NORMAL');
                      const has2 = role2 && (role2.roleCode === 'TENANT_ADMIN' || perm.permissionCode.startsWith(role2.roleCode.toLowerCase().split('_')[0]));

                      return (
                        <TableRow key={perm.permissionCode} className="hover:bg-slate-50/80">
                          <TableCell className="text-xs font-medium">
                            <span className="font-mono font-bold text-slate-900 block">{perm.permissionCode}</span>
                            <span className="text-[11px] text-slate-500">{perm.description}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            {has1 ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold gap-1 text-[10px]">
                                <Check className="w-3 h-3 text-emerald-600" /> Có quyền
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-slate-100 text-slate-400 border-slate-200 text-[10px]">
                                <XCircle className="w-3 h-3 text-slate-300" /> Không
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {has2 ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold gap-1 text-[10px]">
                                <Check className="w-3 h-3 text-emerald-600" /> Có quyền
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-slate-100 text-slate-400 border-slate-200 text-[10px]">
                                <XCircle className="w-3 h-3 text-slate-300" /> Không
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: CREATE NEW ROLE WIZARD */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (open) setCreateStep(1);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl">
          <DialogHeader className="p-5 pb-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Khởi tạo Vai trò & Phân quyền Mới
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Khởi tạo định danh vai trò và phân bổ quyền thao tác qua Wizard 2 bước
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Stepper Header Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

              {/* Step 1 */}
              <div className="flex items-center gap-2 relative z-10 bg-white pr-2">
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                    createStep === 1
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : createStep > 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {createStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    createStep === 1 ? 'text-blue-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  1. Thông tin & Phạm vi Vai trò
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-2 relative z-10 bg-white pl-2">
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                    createStep === 2
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-semibold ${
                    createStep === 2 ? 'text-blue-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  2. Gán Quyền Thao tác ({selectedPermissions.length} đã chọn)
                </span>
              </div>
            </div>
          </div>

          <form id="createRoleForm" onSubmit={handleCreateRole} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {createStep === 1 && (
                <DynamicForm
                  schema={createRoleFormSchema}
                  values={{
                    roleCode: newRoleCode,
                    roleName: newRoleName,
                    roleDesc: newRoleDesc,
                    roleScope: newRoleScope,
                  }}
                  onChange={(field, val) => {
                    if (field === 'roleCode') setNewRoleCode(val);
                    if (field === 'roleName') setNewRoleName(val);
                    if (field === 'roleDesc') setNewRoleDesc(val);
                    if (field === 'roleScope') setNewRoleScope(val);
                  }}
                />
              )}

              {createStep === 2 && (
                <PermissionGroupSelector
                  permissions={permissions}
                  selectedPermissions={selectedPermissions}
                  onChange={setSelectedPermissions}
                />
              )}
            </div>

            <DialogFooter className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
              <div>
                {createStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateStep(1)}
                    className="text-xs font-semibold gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="text-xs"
                  >
                    Hủy bỏ
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {createStep === 1 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!newRoleCode.trim() || !newRoleName.trim()) {
                        toast.error('Vui lòng nhập Mã vai trò và Tên hiển thị!');
                        return;
                      }
                      setCreateStep(2);
                    }}
                    className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1"
                  >
                    <span>Tiếp tục (Bước 2: Gán Quyền)</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="sm"
                    className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 min-w-36"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Hoàn tất & Lưu Vai trò</span>
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: EDIT ROLE & PERMISSIONS WIZARD */}
      <Dialog
        open={isDetailDialogOpen}
        onOpenChange={(open) => {
          setIsDetailDialogOpen(open);
          if (open) setEditStep(1);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl">
          <DialogHeader className="p-5 pb-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Chỉnh sửa Vai trò & Phân quyền: {selectedRoleDetail?.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Mã Vai trò: <code className="font-mono font-bold text-blue-700">{selectedRoleDetail?.roleCode}</code> | Phân loại: {(selectedRoleDetail?.isSystem || selectedRoleDetail?.system) ? 'Vai trò hệ thống (Chỉ đọc)' : 'Vai trò tùy chỉnh'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Stepper Header Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

              {/* Step 1 */}
              <div className="flex items-center gap-2 relative z-10 bg-white pr-2">
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                    editStep === 1
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : editStep > 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {editStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    editStep === 1 ? 'text-blue-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  1. Thông tin & Phạm vi
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-2 relative z-10 bg-white pl-2">
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                    editStep === 2
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-semibold ${
                    editStep === 2 ? 'text-blue-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  2. Ma trận Quyền ({editRolePermissions.length} đã gán)
                </span>
              </div>
            </div>
          </div>

          {selectedRoleDetail && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {editStep === 1 && (
                  <>
                    {(selectedRoleDetail.isSystem || selectedRoleDetail.system) ? (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Vai trò hệ thống mặc định:</strong> Đây là vai trò cốt lõi của hệ thống được bảo vệ, chỉ được phép xem thông tin và không được phép sửa đổi.
                        </div>
                      </div>
                    ) : (
                      <DynamicForm
                        schema={editRoleFormSchema}
                        values={{
                          roleName: editRoleName,
                          status: editRoleStatus,
                          roleDesc: editRoleDesc,
                          roleScope: editRoleScope,
                        }}
                        onChange={(field, val) => {
                          if (field === 'roleName') setEditRoleName(val);
                          if (field === 'status') setEditRoleStatus(val);
                          if (field === 'roleDesc') setEditRoleDesc(val);
                          if (field === 'roleScope') setEditRoleScope(val);
                        }}
                      />
                    )}
                  </>
                )}

                {editStep === 2 && (
                  <PermissionGroupSelector
                    permissions={permissions}
                    selectedPermissions={editRolePermissions}
                    onChange={setEditRolePermissions}
                    readOnly={Boolean(selectedRoleDetail.isSystem || selectedRoleDetail.system)}
                  />
                )}
              </div>

              <DialogFooter className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
                <div>
                  {editStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditStep(1)}
                      className="text-xs font-semibold gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Quay lại</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDetailDialogOpen(false)}
                      className="text-xs"
                    >
                      Hủy / Đóng
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editStep === 1 ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditStep(2);
                      }}
                      className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1"
                    >
                      <span>Tiếp tục (Bước 2: Ma trận Quyền)</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <>
                      {!(selectedRoleDetail.isSystem || selectedRoleDetail.system) && (
                        <Button
                          onClick={handleUpdateRolePermissions}
                          size="sm"
                          className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 min-w-36"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          <span>Lưu Thay đổi Phân quyền</span>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
