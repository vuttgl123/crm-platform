import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldAlert,
  ShieldCheck,
  Edit3,
  Eye,
  Copy,
  CheckCircle2,
  XCircle,
  BarChart2,
  Check,
  Building2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import {
  roleApi,
  RoleSummaryResponse,
  RoleDetailResponse,
  PermissionResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/services/api/roleApi';

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

const SYSTEM_PERMISSION_CATALOG: ExtendedPermission[] = [
  { permissionCode: 'audit_read', description: 'Xem nhật ký truy cập và lịch sử thay đổi hệ thống', moduleCode: 'audit', moduleNameVi: 'Nhật ký Kiểm toán', actionNameVi: 'Xem Nhật ký Audit', riskLevel: 'PRIVILEGED' },
  { permissionCode: 'crm_account.read', description: 'Xem thông tin danh sách và chi tiết Doanh nghiệp / Khách hàng', moduleCode: 'crm', moduleNameVi: 'Quản lý Khách hàng (CRM)', actionNameVi: 'Xem Khách hàng', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_account.write', description: 'Tạo mới, chỉnh sửa thông tin Doanh nghiệp và Tập đoàn Mẹ-Con', moduleCode: 'crm', moduleNameVi: 'Quản lý Khách hàng (CRM)', actionNameVi: 'Tạo & Sửa Khách hàng', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_contact.read', description: 'Xem danh sách và thông tin chi tiết người liên hệ', moduleCode: 'crm', moduleNameVi: 'Quản lý Khách hàng (CRM)', actionNameVi: 'Xem Người liên hệ', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_contact.write', description: 'Tạo mới và cập nhật người liên hệ của doanh nghiệp', moduleCode: 'crm', moduleNameVi: 'Quản lý Khách hàng (CRM)', actionNameVi: 'Tạo & Sửa Người liên hệ', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_lead.read', description: 'Xem thông tin khách hàng tiềm năng (Leads)', moduleCode: 'crm', moduleNameVi: 'Quản lý Khách hàng (CRM)', actionNameVi: 'Xem Leads', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_lead.write', description: 'Tạo mới, cập nhật và chuyển đổi Lead thành Khách hàng chính thức', moduleCode: 'crm', moduleNameVi: 'Quản lý Khách hàng (CRM)', actionNameVi: 'Quản lý & Chuyển đổi Lead', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_opportunity.read', description: 'Xem các cơ hội bán hàng và đường ống kinh doanh (Pipeline)', moduleCode: 'crm', moduleNameVi: 'Quản lý Khách hàng (CRM)', actionNameVi: 'Xem Cơ hội Kinh doanh', riskLevel: 'NORMAL' },
  { permissionCode: 'crm_opportunity.write', description: 'Tạo mới, cập nhật giai đoạn và giá trị hợp đồng cơ hội', moduleCode: 'crm', moduleNameVi: 'Quản lý Khách hàng (CRM)', actionNameVi: 'Cập nhật Cơ hội Kinh doanh', riskLevel: 'NORMAL' },
  { permissionCode: 'platform_user.manage', description: 'Quản lý tài khoản thành viên, duyệt đơn gia nhập và gán Vai trò', moduleCode: 'platform', moduleNameVi: 'Quản trị Hệ thống', actionNameVi: 'Quản lý Thành viên & Phân quyền', riskLevel: 'PRIVILEGED' },
  { permissionCode: 'privacy_consent.read', description: 'Xem hồ sơ đồng ý xử lý dữ liệu cá nhân theo GDPR / Nghị định 13', moduleCode: 'privacy', moduleNameVi: 'Bảo mật & Quyền riêng tư', actionNameVi: 'Xem Hồ sơ Đồng ý Dữ liệu', riskLevel: 'SENSITIVE' },
  { permissionCode: 'privacy_consent.write', description: 'Cập nhật trạng thái đồng ý và yêu cầu rút lại quyền dữ liệu', moduleCode: 'privacy', moduleNameVi: 'Bảo mật & Quyền riêng tư', actionNameVi: 'Cập nhật Hồ sơ Đồng ý Dữ liệu', riskLevel: 'SENSITIVE' },
  { permissionCode: 'sales_order.read', description: 'Xem danh sách và trạng thái các Đơn hàng kinh doanh', moduleCode: 'sales', moduleNameVi: 'Bán hàng & Đơn hàng', actionNameVi: 'Xem Đơn hàng', riskLevel: 'NORMAL' },
  { permissionCode: 'sales_order.write', description: 'Khởi tạo, điều chỉnh và hủy đơn hàng kinh doanh', moduleCode: 'sales', moduleNameVi: 'Bán hàng & Đơn hàng', actionNameVi: 'Tạo & Xử lý Đơn hàng', riskLevel: 'SENSITIVE' },
  { permissionCode: 'sales_quote.approve', description: 'Phê duyệt báo giá kinh doanh có giá trị lớn hoặc chiết khấu đặc biệt', moduleCode: 'sales', moduleNameVi: 'Bán hàng & Đơn hàng', actionNameVi: 'Phê duyệt Báo giá', riskLevel: 'SENSITIVE' },
  { permissionCode: 'sales_quote.read', description: 'Xem danh sách và chi tiết các Báo giá gửi cho khách hàng', moduleCode: 'sales', moduleNameVi: 'Bán hàng & Đơn hàng', actionNameVi: 'Xem Báo giá', riskLevel: 'NORMAL' },
  { permissionCode: 'sales_quote.write', description: 'Soạn thảo, chỉnh sửa và gửi báo giá cho khách hàng', moduleCode: 'sales', moduleNameVi: 'Bán hàng & Đơn hàng', actionNameVi: 'Tạo & Chỉnh sửa Báo giá', riskLevel: 'NORMAL' },
  { permissionCode: 'service_ticket.read', description: 'Xem danh sách yêu cầu hỗ trợ và ticket bảo hành của khách hàng', moduleCode: 'service', moduleNameVi: 'Hỗ trợ & CSKH', actionNameVi: 'Xem Yêu cầu Hỗ trợ', riskLevel: 'NORMAL' },
  { permissionCode: 'service_ticket.write', description: 'Tiếp nhận, xử lý và cập nhật phản hồi ticket khách hàng', moduleCode: 'service', moduleNameVi: 'Hỗ trợ & CSKH', actionNameVi: 'Xử lý Ticket Hỗ trợ', riskLevel: 'NORMAL' },
];

const DEFAULT_SYSTEM_ROLES: RoleSummaryResponse[] = [
  {
    id: 'role-tenant-admin',
    roleCode: 'TENANT_ADMIN',
    name: 'Quản trị viên Tập đoàn (Tenant Admin)',
    description: 'Quyền quản trị cao nhất của Tập đoàn. Có toàn quyền quản lý thành viên, phân quyền và dữ liệu tổ chức.',
    isSystem: true,
    system: true,
    permissionCount: 19,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 'role-admin',
    roleCode: 'ADMIN',
    name: 'Quản trị viên Vận hành',
    description: 'Quản trị viên hệ thống có quyền thiết lập cấu hình và phê duyệt người dùng gia nhập.',
    isSystem: true,
    system: true,
    permissionCount: 16,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 'role-sales-director',
    roleCode: 'SALES_DIRECTOR',
    name: 'Giám đốc Kinh doanh',
    description: 'Quản lý toàn bộ đường ống bán hàng, xem báo cáo doanh thu và duyệt các Báo giá có chiết khấu cao.',
    isSystem: true,
    system: true,
    permissionCount: 12,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 'role-sales-staff',
    roleCode: 'SALES_STAFF',
    name: 'Nhân viên Kinh doanh (Sales)',
    description: 'Chăm sóc khách hàng cá nhân phụ trách, tạo báo giá, lên đơn hàng và theo dõi cơ hội kinh doanh.',
    isSystem: true,
    system: true,
    permissionCount: 8,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 'role-support-agent',
    roleCode: 'SUPPORT_AGENT',
    name: 'Chuyên viên Hỗ trợ (Support)',
    description: 'Tiếp nhận và giải quyết các Ticket hỗ trợ kỹ thuật và phản hồi của khách hàng.',
    isSystem: true,
    system: true,
    permissionCount: 5,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 'role-auditor',
    roleCode: 'AUDITOR',
    name: 'Kiểm toán viên & Tuân thủ',
    description: 'Quyền xem nhật ký audit hệ thống và tra cứu các bản ghi bảo mật riêng tư.',
    isSystem: true,
    system: true,
    permissionCount: 4,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    version: 1,
  },
];

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleSummaryResponse[]>(DEFAULT_SYSTEM_ROLES);
  const [permissions] = useState<ExtendedPermission[]>(SYSTEM_PERMISSION_CATALOG);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('roles');

  // Modals & Drawers
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<RoleDetailResponse | null>(null);
  const [editRolePermissions, setEditRolePermissions] = useState<string[]>([]);

  // Form State for Creating Role
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleScope, setNewRoleScope] = useState<'TENANT' | 'TEAM_TREE' | 'TEAM' | 'OWN'>('OWN');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Form State for Editing Role
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
      const fetchedRoles = await roleApi.getRoles().catch(() => []);
      if (fetchedRoles && fetchedRoles.length > 0) {
        setRoles(fetchedRoles);
      } else {
        setRoles(DEFAULT_SYSTEM_ROLES);
      }
    } catch {
      toast.error('Không thể tải danh sách Vai trò từ máy chủ. Đã hiển thị danh mục mặc định.');
      setRoles(DEFAULT_SYSTEM_ROLES);
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

  const togglePermission = (permCode: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(permCode)) {
      setList(list.filter((c) => c !== permCode));
    } else {
      setList([...list, permCode]);
    }
  };

  const handleOpenDetail = async (role: RoleSummaryResponse) => {
    try {
      const detail = await roleApi.getRole(role.id).catch(() => null);
      if (detail) {
        setSelectedRoleDetail(detail);
        setEditRoleName(detail.name);
        setEditRoleDesc(detail.description || '');
        setEditRoleStatus(detail.status || 'ACTIVE');
        const existingScope = detail.dataScopes && detail.dataScopes.length > 0 ? detail.dataScopes[0].type : 'OWN';
        setEditRoleScope(existingScope);

        const permCodes: string[] = detail.permissions
          ? (detail.permissions.map((p) => p.permissionCode || p.code).filter(Boolean) as string[])
          : (detail.permissionCodes || []);
        setEditRolePermissions(permCodes);
      } else {
        const mockPermCodes: string[] = (role.isSystem || role.system || role.roleCode === 'TENANT_ADMIN')
          ? permissions.map((p) => p.permissionCode)
          : permissions.filter((p) => p.permissionCode.startsWith(role.roleCode.toLowerCase().split('_')[0]) || p.riskLevel === 'NORMAL').map((p) => p.permissionCode);
        
        const fallbackDetail: RoleDetailResponse = {
          id: role.id,
          roleCode: role.roleCode,
          name: role.name,
          description: role.description,
          isSystem: Boolean(role.isSystem || role.system),
          system: Boolean(role.isSystem || role.system),
          scopeType: role.roleCode.includes('ADMIN') ? 'TENANT' : 'OWN',
          status: role.status,
          version: role.version || 1,
          permissions: permissions.filter((p) => mockPermCodes.includes(p.permissionCode)) as PermissionResponse[],
          dataScopes: [{ entityType: 'ACCOUNT', type: role.roleCode.includes('ADMIN') ? 'TENANT' : 'OWN' }],
          createdAt: role.createdAt,
          updatedAt: role.createdAt,
        };

        setSelectedRoleDetail(fallbackDetail);
        setEditRoleName(role.name);
        setEditRoleDesc(role.description || '');
        setEditRoleStatus(role.status);
        setEditRoleScope(role.roleCode.includes('ADMIN') ? 'TENANT' : 'OWN');
        setEditRolePermissions(mockPermCodes);
      }
      setIsDetailDialogOpen(true);
    } catch {
      toast.error('Không thể tải chi tiết vai trò');
    }
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
      toast.success(`Đã khởi tạo thành công Vai trò [${createdRole.name}] với Phạm vi dữ liệu (${newRoleScope})`);
      setIsCreateDialogOpen(false);
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
    } catch {
      toast.error('Xóa vai trò thất bại');
    }
  };

  const handleCloneRole = (role: RoleSummaryResponse) => {
    setNewRoleCode(`${role.roleCode}_COPY`);
    setNewRoleName(`${role.name} (Bản sao)`);
    setNewRoleDesc(`Được nhân bản từ vai trò gốc ${role.name}`);
    setNewRoleScope('OWN');
    setIsCreateDialogOpen(true);
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roleCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const role1 = useMemo(() => roles.find((r) => r.id === compareRole1Id) || roles[0], [roles, compareRole1Id]);
  const role2 = useMemo(() => roles.find((r) => r.id === compareRole2Id) || roles[1] || roles[0], [roles, compareRole2Id]);

  return (
    <div className="space-y-6 pb-12 font-sans w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600 shrink-0" />
            <span>Quản lý Vai trò & Phân quyền Hệ thống (RBAC Matrix)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập ma trận Phân quyền hoạt động, cấp quyền chi tiết theo Phân hệ và Phạm vi dữ liệu cho Tập đoàn
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
            Làm mới Dữ liệu
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Thêm Vai trò Mới
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border-slate-200 bg-linear-to-br from-white to-blue-50/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Tổng số Vai trò</p>
              <p className="text-2xl font-bold text-slate-900">{roles.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <Layers className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 bg-linear-to-br from-white to-purple-50/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Vai trò Hệ thống (Lock)</p>
              <p className="text-2xl font-bold text-purple-900">{roles.filter((r) => r.isSystem || r.system).length}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <Lock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 bg-linear-to-br from-white to-emerald-50/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Vai trò Tùy chỉnh (Custom)</p>
              <p className="text-2xl font-bold text-emerald-900">{roles.filter((r) => !r.isSystem && !r.system).length}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <Sparkles className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 bg-linear-to-br from-white to-amber-50/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Danh mục Quyền Chức năng</p>
              <p className="text-2xl font-bold text-amber-900">{permissions.length} Quyền</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
              <Key className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="roles" className="text-xs font-semibold gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Danh sách Vai trò ({roles.length})
          </TabsTrigger>
          <TabsTrigger value="catalog" className="text-xs font-semibold gap-1.5">
            <Key className="w-3.5 h-3.5" />
            Danh mục Quyền Hệ thống ({permissions.length})
          </TabsTrigger>
          <TabsTrigger value="compare" className="text-xs font-semibold gap-1.5">
            <BarChart2 className="w-3.5 h-3.5" />
            So sánh Vai trò (Role Matrix Compare)
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ROLES TABLE & LIST */}
        <TabsContent value="roles" className="space-y-4">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Danh sách Vai trò Phân quyền ({filteredRoles.length})</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Bấm vào từng vai trò để xem hoặc chỉnh sửa Ma trận phân quyền chi tiết
                  </CardDescription>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Tìm theo mã hoặc tên vai trò..."
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
                    <TableHead className="text-xs font-bold text-slate-700">Mã Vai trò (Role Code)</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Tên Vai trò</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Mô tả Chức năng</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Số Quyền Gán</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Phân loại</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 text-right pr-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500 text-xs font-medium">
                        Không tìm thấy vai trò phù hợp với từ khóa tìm kiếm.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredRoles.map((role) => {
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
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold gap-1 text-[11px]">
                            <Key className="w-3 h-3 text-blue-600" />
                            {role.permissionCount} / {permissions.length} Quyền
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {isSys ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold gap-1 text-[10px]">
                              <Lock className="w-3 h-3 text-purple-600" />
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDetail(role)}
                              className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                              title="Xem chi tiết & Phân quyền"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>

                            {!isSys && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDetail(role)}
                                className="h-7 w-7 text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                                title="Chỉnh sửa Vai trò"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCloneRole(role)}
                              className="h-7 w-7 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              title="Nhân bản Vai trò"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>

                            {!isSys && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRole(role)}
                                className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50"
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: SYSTEM PERMISSION CATALOG */}
        <TabsContent value="catalog" className="space-y-4">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>Danh mục Quyền Chức năng Hệ thống (Permissions Directory)</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Tra cứu toàn bộ 19 quyền hoạt động phân loại theo Phân hệ và Mức độ Rủi ro Bảo mật
                  </CardDescription>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={selectedModuleFilter} onValueChange={setSelectedModuleFilter}>
                    <SelectTrigger className="h-8 text-xs font-medium border-slate-200 bg-white w-44">
                      <SelectValue placeholder="Phân hệ..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả Phân hệ ({permissions.length})</SelectItem>
                      {moduleList.map((m) => (
                        <SelectItem key={m.code} value={m.code}>
                          {m.name} ({m.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="h-8 text-xs font-medium border-slate-200 bg-white w-36">
                      <SelectValue placeholder="Rủi ro..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả Rủi ro</SelectItem>
                      <SelectItem value="NORMAL">Bình thường (Normal)</SelectItem>
                      <SelectItem value="SENSITIVE">Nhạy cảm (Sensitive)</SelectItem>
                      <SelectItem value="PRIVILEGED">Đặc quyền (Privileged)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="relative w-44 sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <Input
                      placeholder="Tìm mã quyền..."
                      value={permSearchQuery}
                      onChange={(e) => setPermSearchQuery(e.target.value)}
                      className="pl-8 text-xs h-8"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-700">Mã Quyền (Permission Code)</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Phân hệ Chức năng</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Mô tả Phạm vi Thao tác</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Mức Rủi ro Bảo mật</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCatalogPermissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-500 font-medium">
                        Không tìm thấy quyền nào phù hợp với bộ lọc.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredCatalogPermissions.map((perm) => (
                    <TableRow key={perm.permissionCode} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-xs font-mono font-bold text-blue-700">
                        {perm.permissionCode}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200 font-medium">
                          {perm.moduleNameVi}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-medium">
                        {perm.description}
                      </TableCell>
                      <TableCell className="text-xs">
                        {perm.riskLevel === 'PRIVILEGED' && (
                          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            Đặc quyền (Privileged)
                          </Badge>
                        )}
                        {perm.riskLevel === 'SENSITIVE' && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            Nhạy cảm (Sensitive)
                          </Badge>
                        )}
                        {(!perm.riskLevel || perm.riskLevel === 'NORMAL') && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Bình thường (Normal)
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Vai trò 1 (Gốc):</Label>
                  <Select value={compareRole1Id} onValueChange={setCompareRole1Id}>
                    <SelectTrigger className="h-9 text-xs font-bold border-slate-200 bg-white">
                      <SelectValue placeholder="Chọn vai trò 1..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} ({r.roleCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Vai trò 2 (So sánh):</Label>
                  <Select value={compareRole2Id} onValueChange={setCompareRole2Id}>
                    <SelectTrigger className="h-9 text-xs font-bold border-slate-200 bg-white">
                      <SelectValue placeholder="Chọn vai trò 2..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} ({r.roleCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
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
                    const has1 = role1.roleCode === 'TENANT_ADMIN' || perm.permissionCode.startsWith(role1.roleCode.toLowerCase().split('_')[0]) || perm.riskLevel === 'NORMAL';
                    const has2 = role2.roleCode === 'TENANT_ADMIN' || perm.permissionCode.startsWith(role2.roleCode.toLowerCase().split('_')[0]);

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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: CREATE NEW ROLE */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Khởi tạo Vai trò & Phân quyền Mới</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Nhập mã vai trò, tên hiển thị và chọn phạm vi dữ liệu cho vai trò
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
                  placeholder="VD: SALES_STAFF, AUDITOR"
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
                  placeholder="VD: Nhân viên Kinh doanh"
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

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Phạm vi Dữ liệu Mặc định (Data Scope Type)*</span>
              </Label>
              <Select value={newRoleScope} onValueChange={(val: 'TENANT' | 'TEAM_TREE' | 'TEAM' | 'OWN') => setNewRoleScope(val)}>
                <SelectTrigger className="h-9 text-xs font-semibold border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWN">
                    <div className="font-bold text-slate-900">OWN - Chỉ Dữ liệu do Cá nhân phụ trách</div>
                    <div className="text-[10px] text-slate-500">Khuyên dùng cho Nhân viên Sales (Chỉ xem khách hàng do mình phụ trách)</div>
                  </SelectItem>
                  <SelectItem value="TEAM">
                    <div className="font-bold text-slate-900">TEAM - Chỉ Phòng ban trực thuộc</div>
                    <div className="text-[10px] text-slate-500">Dành cho Trưởng phòng / Trưởng nhóm</div>
                  </SelectItem>
                  <SelectItem value="TEAM_TREE">
                    <div className="font-bold text-slate-900">TEAM_TREE - Phòng ban & Các Đơn vị Con</div>
                    <div className="text-[10px] text-slate-500">Dành cho Giám đốc Khối / Trưởng Chi nhánh</div>
                  </SelectItem>
                  <SelectItem value="TENANT">
                    <div className="font-bold text-slate-900">TENANT - Toàn bộ Tập đoàn (Toàn quyền dữ liệu)</div>
                    <div className="text-[10px] text-slate-500">Dành cho Admin hoặc Ban Giám đốc</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permissions Selection Box */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Gán Quyền Thao tác ({selectedPermissions.length} đã chọn)</span>
                </Label>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-1.5 border border-slate-200 rounded-lg bg-slate-50/50">
                {permissions.map((perm) => {
                  const permCode = perm.permissionCode;
                  const isChecked = selectedPermissions.includes(permCode);
                  return (
                    <div
                      key={permCode}
                      onClick={() => togglePermission(permCode, selectedPermissions, setSelectedPermissions)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/90 text-blue-900 font-semibold shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => togglePermission(permCode, selectedPermissions, setSelectedPermissions)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{perm.description}</div>
                          <div className="text-[10px] font-mono text-slate-500">{permCode}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
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

      {/* MODAL 2: EDIT ROLE & PERMISSIONS */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Chỉnh sửa Vai trò & Phân quyền: {selectedRoleDetail?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Mã Vai trò: <code className="font-mono font-bold text-blue-700">{selectedRoleDetail?.roleCode}</code> |
              Phân loại: {(selectedRoleDetail?.isSystem || selectedRoleDetail?.system) ? 'Vai trò Hệ thống Mặc định (Read-only)' : 'Vai trò Tùy chỉnh'}
            </DialogDescription>
          </DialogHeader>

          {selectedRoleDetail && (
            <div className="space-y-4 py-2">
              {(selectedRoleDetail.isSystem || selectedRoleDetail.system) ? (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Vai trò Hệ thống Mặc định (System Role):</strong> Đây là vai trò cốt lõi của hệ thống được bảo vệ bởi Backend Java Spring Boot, chỉ được phép tra cứu thông tin (Read-only) và không cho phép sửa đổi.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Tên Hiển thị Vai trò*</Label>
                    <Input
                      value={editRoleName}
                      onChange={(e) => setEditRoleName(e.target.value)}
                      className="bg-white text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Trạng thái Hoạt động</Label>
                    <Select value={editRoleStatus} onValueChange={(v: 'ACTIVE' | 'INACTIVE') => setEditRoleStatus(v)}>
                      <SelectTrigger className="bg-white h-9 text-xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE - Đang hoạt động</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE - Tạm ngưng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Mô tả Chức năng</Label>
                    <Input
                      value={editRoleDesc}
                      onChange={(e) => setEditRoleDesc(e.target.value)}
                      className="bg-white text-xs"
                      placeholder="Nhập mô tả phạm vi vai trò..."
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Phạm vi Dữ liệu (Data Scope Type)*</span>
                    </Label>
                    <Select value={editRoleScope} onValueChange={(val: 'TENANT' | 'TEAM_TREE' | 'TEAM' | 'OWN') => setEditRoleScope(val)}>
                      <SelectTrigger className="h-9 text-xs font-semibold border-slate-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OWN">
                          <div className="font-bold text-slate-900">OWN - Chỉ Dữ liệu do Cá nhân phụ trách</div>
                          <div className="text-[10px] text-slate-500">Khuyên dùng cho Nhân viên Sales (Chỉ xem khách hàng do mình phụ trách)</div>
                        </SelectItem>
                        <SelectItem value="TEAM">
                          <div className="font-bold text-slate-900">TEAM - Chỉ Phòng ban trực thuộc</div>
                          <div className="text-[10px] text-slate-500">Dành cho Trưởng phòng / Trưởng nhóm</div>
                        </SelectItem>
                        <SelectItem value="TEAM_TREE">
                          <div className="font-bold text-slate-900">TEAM_TREE - Phòng ban & Các Đơn vị Con</div>
                          <div className="text-[10px] text-slate-500">Dành cho Giám đốc Khối / Trưởng Chi nhánh</div>
                        </SelectItem>
                        <SelectItem value="TENANT">
                          <div className="font-bold text-slate-900">TENANT - Toàn bộ Tập đoàn (Toàn quyền dữ liệu)</div>
                          <div className="text-[10px] text-slate-500">Dành cho Admin hoặc Ban Giám đốc</div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>Gán Quyền Thao tác ({editRolePermissions.length} / {permissions.length})</span>
                  </Label>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50/50">
                  {permissions.map((perm) => {
                    const permCode = perm.permissionCode;
                    const isGranted = editRolePermissions.includes(permCode);
                    const canEditThis = !(selectedRoleDetail.isSystem || selectedRoleDetail.system);

                    return (
                      <div
                        key={permCode}
                        onClick={() => canEditThis && togglePermission(permCode, editRolePermissions, setEditRolePermissions)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                          isGranted
                            ? 'border-blue-500 bg-blue-50/90 text-blue-900 font-semibold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-400 opacity-60'
                        } ${canEditThis ? 'cursor-pointer hover:bg-blue-100' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isGranted}
                            disabled={!canEditThis}
                            onCheckedChange={() => canEditThis && togglePermission(permCode, editRolePermissions, setEditRolePermissions)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{perm.description}</div>
                            <div className="text-[10px] font-mono text-slate-500">{permCode}</div>
                          </div>
                        </div>

                        <Badge variant="outline" className="text-[10px] bg-slate-100 font-medium">
                          {perm.moduleNameVi}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Hủy / Đóng
                </Button>
                {!(selectedRoleDetail.isSystem || selectedRoleDetail.system) && (
                  <Button
                    onClick={handleUpdateRolePermissions}
                    className="bg-blue-600 hover:bg-blue-700 font-semibold gap-1.5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Lưu Thay đổi Vai trò & Phân quyền
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
