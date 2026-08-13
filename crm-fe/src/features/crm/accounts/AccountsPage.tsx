import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AccountDetailModal } from './components/AccountDetailModal';
import {
  accountApi,
  AccountSummaryResponse,
  AccountResponse,
  AccountType,
  AccountLifecycleStage,
  CreateAccountRequest,
} from '@/services/api/accountApi';
import { membershipApi } from '@/services/api/membershipApi';
import { toast } from 'sonner';
import { BusinessNumberInput } from '@/components/ui/BusinessNumberInput';
import {
  Building2,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit3,
  Trash2,
  Building,
  Loader2,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Maximize2,
  Minimize2,
  X,
  RotateCcw,
  Users,
  ShieldAlert,
  CornerDownRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { useAuth } from '@/core/session/useAuth';

export const AccountsPage: React.FC = () => {
  const { session } = useAuth();
  const [accounts, setAccounts] = useState<AccountSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Enhanced Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [hierarchyFilter, setHierarchyFilter] = useState<'ALL' | 'PARENT_ONLY' | 'CHILD_ONLY'>('ALL');
  const [dncOnly, setDncOnly] = useState(false);

  // Pagination State: Max 3 Parent Corporations per Page
  const [currentPage, setCurrentPage] = useState(1);
  const PARENT_PER_PAGE = 3;

  // Collapsed Nodes State (by default empty set = all tree nodes expanded)
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string) => {
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => setCollapsedNodeIds(new Set());

  const handleCollapseAll = () => {
    const parentIdsWithChildren = new Set(
      accounts
        .filter((a) => accounts.some((c) => c.parentAccountId === a.id))
        .map((a) => a.id)
    );
    setCollapsedNodeIds(parentIdsWithChildren);
  };

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailInitialEdit, setIsDetailInitialEdit] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Synchronized Complete Form State for Creating Account
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formLegalName, setFormLegalName] = useState('');
  const [formParentAccountId, setFormParentAccountId] = useState<string | undefined>(undefined);
  const [formAccountType, setFormAccountType] = useState<AccountType>('ORGANIZATION');
  const [formLifecycleStage, setFormLifecycleStage] = useState<AccountLifecycleStage>('PROSPECT');
  const [formTaxIdentifier, setFormTaxIdentifier] = useState('');
  const [formRegistrationNumber, setFormRegistrationNumber] = useState('');
  const [formIndustryCode, setFormIndustryCode] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formEmployeeCount, setFormEmployeeCount] = useState('');
  const [formRevenueAmount, setFormRevenueAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDoNotContact, setFormDoNotContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');

  // Fetch approved active team members for owner selection dropdown
  useEffect(() => {
    membershipApi.searchRequests('APPROVED').then((res) => {
      if (res?.items) {
        const list = res.items.map((item) => ({
          id: item.requester.id,
          name: item.requester.displayName || item.requester.email,
          email: item.requester.email,
        }));
        if (session?.user && !list.some((m) => m.id === session.user.id)) {
          list.unshift({
            id: session.user.id,
            name: session.user.email,
            email: session.user.email,
          });
        }
        setTeamMembers(list);
      }
    }).catch(() => {
      if (session?.user) {
        setTeamMembers([{ id: session.user.id, name: session.user.email, email: session.user.email }]);
      }
    });
  }, [session]);

  // Quick Action: Create Child Account under Parent Account
  const handleCreateChildAccount = (parentAccId: string) => {
    resetForm();
    setFormParentAccountId(parentAccId);
    setIsCreateOpen(true);
  };

  // Fetch Accounts from Backend API
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountApi.search({
        q: searchQuery || undefined,
        accountType: selectedType !== 'ALL' ? (selectedType as AccountType) : undefined,
        lifecycleStage: selectedStage !== 'ALL' ? (selectedStage as AccountLifecycleStage) : undefined,
      });

      setAccounts(res.items || []);
    } catch {
      setAccounts([]);
      toast.error('Không thể kết nối đến Backend hoặc chưa có dữ liệu khách hàng.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, selectedStage]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedStage('ALL');
    setHierarchyFilter('ALL');
    setDncOnly(false);
    setCurrentPage(1);
    fetchAccounts();
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAccountNumber.trim() || !formDisplayName.trim()) {
      toast.error('Vui lòng nhập đầy đủ Mã khách hàng và Tên khách hàng');
      return;
    }

    setIsSubmitting(true);
    const payload: CreateAccountRequest = {
      accountNumber: formAccountNumber.trim(),
      displayName: formDisplayName.trim(),
      legalName: formLegalName.trim() || undefined,
      parentAccountId: formParentAccountId && formParentAccountId !== 'NONE' ? formParentAccountId : undefined,
      accountType: formAccountType,
      lifecycleStage: formLifecycleStage,
      taxIdentifier: formTaxIdentifier.trim() || undefined,
      registrationNumber: formRegistrationNumber.trim() || undefined,
      industryCode: formIndustryCode.trim() || undefined,
      website: formWebsite.trim() || undefined,
      employeeCount: formEmployeeCount ? parseInt(formEmployeeCount, 10) : undefined,
      annualRevenue: formRevenueAmount
        ? { amount: parseFloat(formRevenueAmount), currencyCode: 'VND' }
        : undefined,
      description: formDescription.trim() || undefined,
      doNotContact: formDoNotContact,
      owner: selectedOwnerId
        ? { type: 'USER', id: selectedOwnerId }
        : (session?.user?.id ? { type: 'USER', id: session.user.id } : undefined),
    };

    try {
      const created = await accountApi.create(payload);
      toast.success(`Đã tạo thành công khách hàng "${created.displayName}"`);
      setIsCreateOpen(false);
      resetForm();
      fetchAccounts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo mới khách hàng';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetail = async (id: string, startInEditMode = false) => {
    setIsDetailInitialEdit(startInEditMode);
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const details = await accountApi.get(id);
      setSelectedAccount(details);
    } catch {
      toast.error('Không thể tải thông tin chi tiết khách hàng.');
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string, version: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}" không?`)) return;

    try {
      await accountApi.delete(id, version);
      toast.success(`Đã xóa khách hàng "${name}" thành công!`);
      fetchAccounts();
    } catch {
      toast.error('Xóa khách hàng thất bại. Vui lòng kiểm tra quyền hoặc kết nối.');
    }
  };

  const resetForm = () => {
    setFormAccountNumber('');
    setFormDisplayName('');
    setFormLegalName('');
    setFormParentAccountId(undefined);
    setFormAccountType('ORGANIZATION');
    setFormLifecycleStage('PROSPECT');
    setFormTaxIdentifier('');
    setFormRegistrationNumber('');
    setFormIndustryCode('');
    setFormWebsite('');
    setFormEmployeeCount('');
    setFormRevenueAmount('');
    setFormDescription('');
    setFormDoNotContact(false);
  };

  const getAccountTypeBadge = (type: AccountType) => {
    switch (type) {
      case 'ORGANIZATION':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold">Doanh nghiệp</Badge>;
      case 'PERSON':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-bold">Cá nhân</Badge>;
      case 'PARTNER':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">Đối tác</Badge>;
      case 'RESELLER':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold">Đại lý</Badge>;
      case 'SUPPLIER':
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-bold">Nhà cung cấp</Badge>;
    }
  };

  const getLifecycleStageBadge = (stage: AccountLifecycleStage) => {
    switch (stage) {
      case 'PROSPECT':
        return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 font-medium">Tiềm năng (Prospect)</Badge>;
      case 'QUALIFIED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">Đạt chuẩn (Qualified)</Badge>;
      case 'CUSTOMER':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">Khách hàng chính thức</Badge>;
      case 'CHURNED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium">Rời bỏ (Churned)</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">Ngừng hoạt động</Badge>;
    }
  };

  // Client-side Filtered Accounts for Hierarchy & DNC
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const isParent = !acc.parentAccountId || !accounts.some((p) => p.id === acc.parentAccountId);
      if (hierarchyFilter === 'PARENT_ONLY' && !isParent) return false;
      if (hierarchyFilter === 'CHILD_ONLY' && isParent) return false;
      if (dncOnly && !acc.doNotContact) return false;
      return true;
    });
  }, [accounts, hierarchyFilter, dncOnly]);

  // Statistics Summary Counters
  const totalCount = accounts.length;
  const parentCount = accounts.filter((a) => !a.parentAccountId || !accounts.some((p) => p.id === a.parentAccountId)).length;
  const childCount = totalCount - parentCount;
  const customerCount = accounts.filter((a) => a.lifecycleStage === 'CUSTOMER').length;

  // Root Parent Accounts for Pagination (Max 3 Parents per Page)
  const rootParentAccounts = useMemo(() => {
    return filteredAccounts.filter(
      (acc) => !acc.parentAccountId || !accounts.some((p) => p.id === acc.parentAccountId)
    );
  }, [filteredAccounts, accounts]);

  const totalPages = Math.max(1, Math.ceil(rootParentAccounts.length / PARENT_PER_PAGE));

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedStage, hierarchyFilter, dncOnly]);

  // Paginated Root Parents for Current Page
  const paginatedRootParents = useMemo(() => {
    const startIdx = (currentPage - 1) * PARENT_PER_PAGE;
    return rootParentAccounts.slice(startIdx, startIdx + PARENT_PER_PAGE);
  }, [rootParentAccounts, currentPage, PARENT_PER_PAGE]);

  // Render Single Account and its Children Recursively
  const renderSingleAccountAndChildren = (acc: AccountSummaryResponse, level: number = 0): React.ReactNode => {
    const childAccounts = accounts.filter((c) => c.parentAccountId === acc.id);
    const hasChildren = childAccounts.length > 0;
    const isCollapsed = collapsedNodeIds.has(acc.id);
    const isParentRoot = level === 0;

    return (
      <React.Fragment key={acc.id}>
        <TableRow
          className={`transition-colors ${
            isParentRoot
              ? 'bg-white hover:bg-slate-50/90 font-medium border-t-2 border-slate-200'
              : 'bg-blue-50/20 hover:bg-blue-50/60 border-l-4 border-l-blue-500'
          }`}
        >
          {/* Column 1: Mã Khách hàng & Nút Đóng/Mở Node đặt ngay cạnh Mã KH */}
          <TableCell className="font-mono text-xs font-bold">
            <div className="flex items-center gap-1.5 font-mono" style={{ paddingLeft: `${level * 1.5}rem` }}>
              {/* Toggle Expand/Collapse Button in Customer Code Column */}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleCollapse(acc.id)}
                  className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-700 flex items-center justify-center shrink-0"
                  title={isCollapsed ? 'Mở rộng các đơn vị trực thuộc' : 'Thu gọn các đơn vị trực thuộc'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 font-bold" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                  )}
                </button>
              ) : (
                level > 0 && <span className="w-4 inline-block" />
              )}

              <span className={isParentRoot ? 'text-blue-700 font-bold' : 'text-slate-700 font-semibold'}>
                {acc.accountNumber}
              </span>
            </div>
          </TableCell>

          {/* Column 2: Tên Khách hàng */}
          <TableCell>
            <div className="flex items-center gap-2">
              <div>
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <span>{acc.displayName}</span>
                  {isParentRoot && (
                    <Badge className="bg-blue-600 text-white font-bold text-[10px] gap-1 px-2 py-0.5 shadow-xs">
                      <Building className="w-3 h-3" />
                      <span>CẤP CAO NHẤT</span>
                    </Badge>
                  )}
                  {hasChildren && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                      {childAccounts.length} Đơn vị trực thuộc
                    </Badge>
                  )}
                </div>
                {acc.legalName && (
                  <div className="text-[11px] text-slate-500 mt-0.5">{acc.legalName}</div>
                )}
              </div>
            </div>
          </TableCell>

          {/* Column 3: Loại hình */}
          <TableCell>{getAccountTypeBadge(acc.accountType)}</TableCell>

          {/* Column 4: Vòng đời */}
          <TableCell>{getLifecycleStageBadge(acc.lifecycleStage)}</TableCell>

          {/* Column 5: Cập nhật cuối */}
          <TableCell className="text-slate-500 font-mono text-[11px]">
            {new Date(acc.updatedAt).toLocaleTimeString('vi-VN')} {new Date(acc.updatedAt).toLocaleDateString('vi-VN')}
          </TableCell>

          {/* Column 6: Thao tác */}
          <TableCell className="text-right pr-4">
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCreateChildAccount(acc.id)}
                className="h-7 px-2.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                title={`Thêm đơn vị trực thuộc ${acc.displayName}`}
              >
                <span>Thêm đơn vị trực thuộc</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewDetail(acc.id, false)}
                className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                title="Xem chi tiết"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewDetail(acc.id, true)}
                className="h-7 w-7 text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                title="Chỉnh sửa thông tin"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteAccount(acc.id, acc.version, acc.displayName)}
                className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50"
                title="Xóa khách hàng"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </TableCell>
        </TableRow>

        {/* Render nested children recursively ONLY IF node is NOT collapsed */}
        {hasChildren && !isCollapsed && childAccounts.map((child) => renderSingleAccountAndChildren(child, level + 1))}
      </React.Fragment>
    );
  };

  const selectedParentAccountObj = accounts.find((a) => a.id === formParentAccountId);
  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedType !== 'ALL' ? 1 : 0) +
    (selectedStage !== 'ALL' ? 1 : 0) +
    (hierarchyFilter !== 'ALL' ? 1 : 0) +
    (dncOnly ? 1 : 0);

  return (
    <div className="space-y-6 pb-12 font-sans w-full">
      {/* Top Header Card with Quick Stats Summary Bar */}
      <Card className="shadow-xs border-slate-200 w-full">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <span>Quản lý Khách hàng & Tổ chức</span>
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Cơ cấu quản lý liên kết theo mô hình Cây phân cấp Doanh nghiệp & Đơn vị trực thuộc
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAccounts}
              disabled={loading}
              className="text-xs gap-1.5 border-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Khách hàng Mới</span>
            </Button>
          </div>
        </CardHeader>

        {/* Quick Statistics Summary Counters Bar */}
        <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Building className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Tổng số Khách hàng: <strong className="font-bold text-slate-900">{totalCount}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Badge className="bg-blue-600 text-white font-bold text-[9px] px-1.5 py-0">MẸ</Badge>
            <span>Cấp cao nhất: <strong className="font-bold text-blue-700">{parentCount}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CornerDownRight className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Đơn vị trực thuộc: <strong className="font-bold text-emerald-700">{childCount}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Users className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Khách chính thức: <strong className="font-bold text-purple-700">{customerCount}</strong></span>
          </div>
        </div>

        {/* Enhanced Multi-Criteria Filter Bar */}
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex flex-col lg:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full lg:flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <Input
                placeholder="Tìm theo Mã KH, Tên thương hiệu hoặc Tên pháp lý..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 text-xs h-9 border-slate-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns & Utilities */}
            <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
              {/* Filter 1: Cấu trúc Cấp bậc */}
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <Select value={hierarchyFilter} onValueChange={(v) => setHierarchyFilter(v as any)}>
                  <SelectTrigger className="w-[170px] text-xs h-9 bg-white border-slate-200">
                    <SelectValue placeholder="Cấu trúc doanh nghiệp" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="ALL">Tất cả cấu trúc</SelectItem>
                    <SelectItem value="PARENT_ONLY">👑 Chỉ Cấp cao nhất</SelectItem>
                    <SelectItem value="CHILD_ONLY">🌳 Chỉ Đơn vị trực thuộc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 2: Loại hình */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[130px] text-xs h-9 bg-white border-slate-200">
                  <SelectValue placeholder="Loại hình" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="ALL">Tất cả loại hình</SelectItem>
                  <SelectItem value="ORGANIZATION">Doanh nghiệp</SelectItem>
                  <SelectItem value="PERSON">Cá nhân</SelectItem>
                  <SelectItem value="PARTNER">Đối tác</SelectItem>
                  <SelectItem value="RESELLER">Đại lý</SelectItem>
                  <SelectItem value="SUPPLIER">Nhà cung cấp</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter 3: Vòng đời */}
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-[150px] text-xs h-9 bg-white border-slate-200">
                  <SelectValue placeholder="Vòng đời kinh doanh" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="ALL">Tất cả vòng đời</SelectItem>
                  <SelectItem value="PROSPECT">Tiềm năng (Prospect)</SelectItem>
                  <SelectItem value="QUALIFIED">Đạt chuẩn (Qualified)</SelectItem>
                  <SelectItem value="CUSTOMER">Khách hàng chính thức</SelectItem>
                  <SelectItem value="CHURNED">Rời bỏ (Churned)</SelectItem>
                  <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter 4: Checkbox DNC */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-50 rounded border border-slate-200 h-9">
                <Checkbox
                  id="filterDnc"
                  checked={dncOnly}
                  onCheckedChange={(c) => setDncOnly(Boolean(c))}
                />
                <Label htmlFor="filterDnc" className="text-xs font-semibold cursor-pointer text-slate-700 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>DNC</span>
                </Label>
              </div>

              {/* Reset Filters Button */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 px-2 text-xs text-slate-600 hover:text-red-600 gap-1"
                  title="Đặt lại bộ lọc về mặc định"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại ({activeFiltersCount})</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Accounts Multi-Level Tree Hierarchy Table */}
      <Card className="shadow-xs border-slate-200 w-full overflow-hidden">
        {/* Toolbar: Expand All / Collapse All Controls */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="font-semibold text-slate-700 flex items-center gap-2">
            <span>Danh sách Cây Phân cấp Doanh nghiệp</span>
            <Badge variant="outline" className="bg-white border-slate-300 text-slate-700 text-[10px]">
              Hiển thị {paginatedRootParents.length} Khách hàng Cấp cao nhất / Trang
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExpandAll}
              className="h-7 text-[11px] gap-1 px-2.5 bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Mở rộng tất cả</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCollapseAll}
              className="h-7 text-[11px] gap-1 px-2.5 bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
            >
              <Minimize2 className="w-3 h-3" />
              <span>Thu gọn tất cả</span>
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/90">
            <TableRow className="text-xs">
              <TableHead className="font-bold text-slate-900 w-48">Mã Khách hàng</TableHead>
              <TableHead className="font-bold text-slate-900">Tên Khách hàng & Cấu trúc Phân cấp</TableHead>
              <TableHead className="font-bold text-slate-900">Loại hình</TableHead>
              <TableHead className="font-bold text-slate-900">Vòng đời Kinh doanh</TableHead>
              <TableHead className="font-bold text-slate-900">Cập nhật cuối</TableHead>
              <TableHead className="font-bold text-slate-900 text-right pr-4">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-xs">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                  <span>Đang tải danh sách khách hàng từ Backend...</span>
                </TableCell>
              </TableRow>
            ) : paginatedRootParents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center text-slate-500">
                  Không tìm thấy dữ liệu khách hàng nào phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRootParents.map((parentAcc) => renderSingleAccountAndChildren(parentAcc, 0))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls Bar */}
        {!loading && rootParentAccounts.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-600">
              Hiển thị <strong className="text-slate-900 font-bold">{paginatedRootParents.length}</strong> / <strong className="text-slate-900 font-bold">{rootParentAccounts.length}</strong> Khách hàng Cấp cao nhất (Trang <strong className="text-blue-700">{currentPage}</strong> / {totalPages})
            </div>

            <div className="flex items-center gap-1.5">
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
                className="h-8 px-2.5 text-xs border-slate-200 gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 text-xs font-bold ${
                    pageNum === currentPage
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
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
                className="h-8 px-2.5 text-xs border-slate-200 gap-1"
              >
                <span>Sau</span>
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

      {/* Modal 1: Create Account Dialog (100% Synchronized Form) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl">
          <DialogHeader className="p-5 pb-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>
                {formParentAccountId ? 'Tạo Mới Đơn Vị Trực Thuộc' : 'Tạo Mới Khách Hàng / Doanh Nghiệp'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Khởi tạo hồ sơ khách hàng doanh nghiệp hoặc đơn vị trực thuộc với đầy đủ thông tin pháp lý
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAccount} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Alert: Parent Account Preset Banner */}
              {formParentAccountId && formParentAccountId !== 'NONE' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between text-xs text-blue-800">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      Đang khởi tạo đơn vị trực thuộc cho khách hàng cha: <strong>{selectedParentAccountObj?.displayName}</strong> ({selectedParentAccountObj?.accountNumber})
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormParentAccountId(undefined)}
                    className="h-6 text-[11px] text-blue-700 hover:bg-blue-100 px-2"
                  >
                    Bỏ chọn khách hàng cha
                  </Button>
                </div>
              )}

              {/* Grid 1: Basic Identifiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="accNumber" className="text-xs font-semibold flex items-center gap-1">
                    <span>Mã Khách hàng</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="accNumber"
                    value={formAccountNumber}
                    onChange={(e) => setFormAccountNumber(e.target.value)}
                    placeholder="Mã số (VD: ACC-1002)..."
                    className="text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="displayName" className="text-xs font-semibold flex items-center gap-1">
                    <span>Tên Khách hàng / Thương hiệu</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="displayName"
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    placeholder="Tên thương hiệu (VD: MB Securities)..."
                    className="text-xs font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="legalName" className="text-xs font-semibold">Tên Pháp lý Đầy đủ (Tên ĐKKD)</Label>
                  <Input
                    id="legalName"
                    value={formLegalName}
                    onChange={(e) => setFormLegalName(e.target.value)}
                    placeholder="Công ty Cổ phần Chứng khoán MB..."
                    className="text-xs"
                  />
                </div>

                {/* Parent Account Selection */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs font-semibold flex items-center gap-1 text-slate-900">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Khách hàng Cha / Đơn vị cấp trên</span>
                  </Label>
                  <Select
                    value={formParentAccountId || 'NONE'}
                    onValueChange={(v) => setFormParentAccountId(v === 'NONE' ? undefined : v)}
                  >
                    <SelectTrigger className="text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Chọn Khách hàng Cha / Đơn vị cấp trên" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="NONE" className="font-semibold text-slate-700">
                        Không có (Khách hàng độc lập / Cấp cao nhất)
                      </SelectItem>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          🏢 {acc.accountNumber} - {acc.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role-Based Owner Info / Member Selector Component */}
                <div className="space-y-2 md:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Thành viên phụ trách</span>
                    </Label>
                    <span className="text-[11px] text-slate-500">Phân bổ theo quyền quản lý</span>
                  </div>

                  {teamMembers.length > 1 ? (
                    <div className="space-y-1">
                      <Select
                        value={selectedOwnerId || session?.user?.id || ''}
                        onValueChange={(v) => setSelectedOwnerId(v)}
                      >
                        <SelectTrigger className="text-xs bg-white border-slate-200 font-semibold h-9">
                          <SelectValue placeholder="Chọn thành viên trong team phụ trách" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              👤 {member.name} ({member.email}) {member.id === session?.user?.id ? ' - (Chính tôi)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-600">Khách hàng được tự động thuộc quyền phụ trách của bạn</span>
                      <Badge variant="outline" className="bg-white border-blue-200 text-blue-800 font-bold text-[11px] px-2.5 py-1">
                        👤 {session?.user?.email || 'Chính bạn (Tài khoản hiện tại)'}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="accType" className="text-xs font-semibold">Loại hình Khách hàng</Label>
                  <Select value={formAccountType} onValueChange={(v) => setFormAccountType(v as AccountType)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="ORGANIZATION">Doanh nghiệp</SelectItem>
                      <SelectItem value="PERSON">Cá nhân</SelectItem>
                      <SelectItem value="PARTNER">Đối tác chiến lược</SelectItem>
                      <SelectItem value="RESELLER">Đại lý ủy quyền</SelectItem>
                      <SelectItem value="SUPPLIER">Nhà cung cấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lifecycle" className="text-xs font-semibold">Giai đoạn Vòng đời</Label>
                  <Select value={formLifecycleStage} onValueChange={(v) => setFormLifecycleStage(v as AccountLifecycleStage)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="PROSPECT">Tiềm năng (Prospect)</SelectItem>
                      <SelectItem value="QUALIFIED">Đạt chuẩn (Qualified)</SelectItem>
                      <SelectItem value="CUSTOMER">Khách hàng chính thức</SelectItem>
                      <SelectItem value="CHURNED">Rời bỏ (Churned)</SelectItem>
                      <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="taxId" className="text-xs font-semibold">Mã số thuế (MST)</Label>
                  <Input
                    id="taxId"
                    value={formTaxIdentifier}
                    onChange={(e) => setFormTaxIdentifier(e.target.value)}
                    placeholder="Ví dụ: 0102065678"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="regNo" className="text-xs font-semibold">Số Giấy phép ĐKKD</Label>
                  <Input
                    id="regNo"
                    value={formRegistrationNumber}
                    onChange={(e) => setFormRegistrationNumber(e.target.value)}
                    placeholder="Ví dụ: 0102065678-GP"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="industry" className="text-xs font-semibold">Ngành nghề / Lĩnh vực</Label>
                  <Input
                    id="industry"
                    value={formIndustryCode}
                    onChange={(e) => setFormIndustryCode(e.target.value)}
                    placeholder="Ngành nghề kinh doanh"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="website" className="text-xs font-semibold">Website chính thức</Label>
                  <Input
                    id="website"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <BusinessNumberInput
                  id="empCount"
                  label="Quy mô Nhân sự (Số người)"
                  value={formEmployeeCount}
                  onChange={setFormEmployeeCount}
                  placeholder="Ví dụ: 2500"
                  unitSuffix="người"
                />

                <div className="md:col-span-2">
                  <BusinessNumberInput
                    id="revenue"
                    label="Doanh thu Hàng năm (Số tiền)"
                    value={formRevenueAmount}
                    onChange={setFormRevenueAmount}
                    placeholder="Ví dụ: 350000000000"
                    unitSuffix="VNĐ"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="desc" className="text-xs font-semibold">Mô tả / Ghi chú Chăm sóc</Label>
                  <textarea
                    id="desc"
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Nhập thông tin ghi chú chăm sóc đối tác..."
                    className="w-full rounded-md border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <Checkbox
                      id="createDnc"
                      checked={formDoNotContact}
                      onCheckedChange={(c) => setFormDoNotContact(Boolean(c))}
                    />
                    <Label htmlFor="createDnc" className="text-xs font-semibold cursor-pointer text-slate-800">
                      Từ chối nhận cuộc gọi / email tiếp thị (Do Not Contact - DNC)
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-slate-200 bg-slate-50/80 shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="text-xs">
                Hủy
              </Button>
              <Button type="submit" className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white min-w-28" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <span>Tạo mới</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Account Details & In-Place Edit Dialog */}
      <AccountDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        account={selectedAccount}
        loading={detailLoading}
        allAccounts={accounts}
        initialEditMode={isDetailInitialEdit}
        onSuccess={fetchAccounts}
      />
    </div>
  );
};
