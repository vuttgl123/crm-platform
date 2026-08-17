import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  accountApi,
  AccountSummaryResponse,
  AccountType,
  AccountLifecycleStage,
  CreateAccountRequest,
} from '@/services/api/accountApi';
import { membershipApi } from '@/services/api/membershipApi';
import { toast } from 'sonner';
import { BusinessNumberInput } from '@/components/ui/BusinessNumberInput';
import {
  renderLifecycleStageBadge as getLifecycleStageBadge,
  renderAccountTypeBadge as getAccountTypeBadge,
  renderRootAccountBadge,
  renderChildCountBadge,
} from '@/config/crmStatusConfig';
import {
  Building2,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  Building,
  Loader2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  X,
  RotateCcw,
  Users,
  ShieldAlert,
  CornerDownRight,
  GitMerge,
} from 'lucide-react';
import { SmartMergeModal } from '@/features/crm/deduplication/SmartMergeModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

import { useAuth } from '@/core/session/useAuth';

export const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [accounts, setAccounts] = useState<AccountSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Enhanced Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL');
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

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'general' | 'legal'>('general');

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
    setOwnerFilter('ALL');
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

  const handleViewDetail = (id: string) => {
    navigate(`/app/crm/accounts/${id}`);
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
    setActiveFormTab('general');
  };



  // Client-side Filtered Accounts for Owner & DNC
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // Filter by Owner (Admin View)
      if (ownerFilter !== 'ALL') {
        if (ownerFilter === 'MY_OWN') {
          if (!session?.user || acc.owner?.id !== session.user.id) return false;
        } else {
          if (acc.owner?.id !== ownerFilter) return false;
        }
      }

      // Filter by DNC
      if (dncOnly && !acc.doNotContact) return false;
      return true;
    });
  }, [accounts, ownerFilter, dncOnly, session]);

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
  }, [searchQuery, selectedType, selectedStage, ownerFilter, dncOnly]);

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
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2 flex-wrap">
                  <Link to={`/app/crm/accounts/${acc.id}`} className="hover:text-blue-600 hover:underline transition-colors">
                    {acc.displayName}
                  </Link>
                  {isParentRoot && renderRootAccountBadge()}
                  {hasChildren && renderChildCountBadge(childAccounts.length)}
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
                size="icon"
                onClick={() => handleCreateChildAccount(acc.id)}
                className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                title={`Thêm đơn vị trực thuộc ${acc.displayName}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewDetail(acc.id)}
                className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                title="Xem chi tiết"
              >
                <Eye className="w-3.5 h-3.5" />
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
    (ownerFilter !== 'ALL' ? 1 : 0) +
    (dncOnly ? 1 : 0);

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
              <Building2 className="w-4.5 h-4.5 text-white" />
            </div>
            Quản lý Khách hàng &amp; Tổ chức
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Cơ cấu liên kết theo mô hình Cây phân cấp Doanh nghiệp &amp; Đơn vị trực thuộc
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAccounts}
            disabled={loading}
            className="text-xs gap-1.5 border-slate-200 h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMergeModalOpen(true)}
            className="text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 gap-1.5 shadow-2xs h-8"
          >
            <GitMerge className="w-3.5 h-3.5 text-blue-600" />
            <span>Quét trùng lặp &amp; Gộp</span>
          </Button>
          <Button
            size="sm"
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Khách hàng Mới</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Building className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Khách hàng</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Building2 className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Cấp cao nhất</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">{parentCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CornerDownRight className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đơn vị trực thuộc</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">{childCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Khách hàng chính thức</div>
            <div className="text-lg font-black text-purple-700 leading-tight">{customerCount}</div>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Bar ── */}
      <Card className="shadow-xs border-slate-200 w-full">
        <CardContent className="py-3 px-4">
          <div className="flex flex-col md:flex-row items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full md:w-[280px] shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <Input
                placeholder="Tìm theo Mã KH, Tên thương hiệu, Pháp lý..."
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

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Filter 1: Người phụ trách */}
              <SearchableSelect
                options={[
                  { value: 'ALL', label: 'Tất cả người phụ trách' },
                  ...(session?.user ? [{ value: 'MY_OWN', label: 'Chỉ Khách hàng của tôi' }] : []),
                  ...teamMembers.map((m) => ({
                    value: m.id,
                    label: m.name,
                  })),
                ]}
                value={ownerFilter}
                onValueChange={setOwnerFilter}
                placeholder="Tất cả người phụ trách"
                searchPlaceholder="Tìm người phụ trách..."
                className="w-[190px]"
              />

              {/* Filter 2: Loại hình */}
              <SearchableSelect
                options={[
                  { value: 'ALL', label: 'Tất cả loại hình' },
                  { value: 'ORGANIZATION', label: 'Doanh nghiệp' },
                  { value: 'PERSON', label: 'Cá nhân' },
                  { value: 'PARTNER', label: 'Đối tác' },
                  { value: 'RESELLER', label: 'Đại lý' },
                  { value: 'SUPPLIER', label: 'Nhà cung cấp' },
                ]}
                value={selectedType}
                onValueChange={setSelectedType}
                placeholder="Loại hình"
                searchPlaceholder="Tìm loại hình..."
                className="w-[155px]"
              />

              {/* Filter 3: Vòng đời */}
              <SearchableSelect
                options={[
                  { value: 'ALL', label: 'Tất cả vòng đời' },
                  { value: 'PROSPECT', label: 'Tiềm năng', badge: 'Mới' },
                  { value: 'QUALIFIED', label: 'Đạt chuẩn', badge: 'Chuẩn' },
                  { value: 'CUSTOMER', label: 'Khách hàng chính thức', badge: 'Active' },
                  { value: 'INACTIVE', label: 'Ngừng hoạt động', badge: 'Tạm dừng' },
                  { value: 'CHURNED', label: 'Rời bỏ', badge: 'Mất' },
                ]}
                value={selectedStage}
                onValueChange={setSelectedStage}
                placeholder="Vòng đời kinh doanh"
                searchPlaceholder="Tìm vòng đời..."
                className="w-[170px]"
              />

              {/* Filter 4: DNC */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 rounded border border-slate-200 h-9">
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


      {/* Main Accounts Multi-Level Tree Hierarchy Table */}
      <Card className="shadow-xs border-slate-200 w-full overflow-hidden">
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

      {/* Modal 1: Create Account Dialog — 100% Synchronized Flat Tabbed Design */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl w-full flex flex-col p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-2xl bg-white">

          {/* ── Dialog Header ── */}
          <div className="shrink-0 px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {formParentAccountId ? 'Tạo Mới Đơn Vị Trực Thuộc' : 'Tạo Mới Khách Hàng / Doanh Nghiệp'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Khởi tạo hồ sơ thông tin khách hàng &amp; cấu trúc tổ chức
                </p>
              </div>
            </div>
          </div>

          {/* ── Synchronized Horizontal Tabs Bar ── */}
          <div className="shrink-0 flex items-center gap-1 px-6 bg-slate-50/70 border-b border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveFormTab('general')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 relative ${
                activeFormTab === 'general'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-2xs rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>1. Thông tin Chung &amp; Phân cấp</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFormTab('legal')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 relative ${
                activeFormTab === 'legal'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-2xs rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>2. Thông tin Pháp lý &amp; Bổ sung</span>
            </button>
          </div>

          <form onSubmit={handleCreateAccount} className="flex flex-col flex-1 overflow-hidden">
            {/* ── Form Body (No nested card clutter, perfect flat layout) ── */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[58vh]">

              {/* Alert: Parent Account Preset Banner */}
              {formParentAccountId && formParentAccountId !== 'NONE' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      Đang tạo đơn vị trực thuộc cho: <strong>{selectedParentAccountObj?.displayName}</strong> ({selectedParentAccountObj?.accountNumber})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormParentAccountId(undefined)}
                    className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold underline"
                  >
                    Bỏ chọn
                  </button>
                </div>
              )}

              {/* ── TAB 1: THÔNG TIN CHUNG & PHÂN CẤP ── */}
              {activeFormTab === 'general' && (
                <div className="space-y-6">
                  {/* Section A: Định danh */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Thông tin Định danh
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="accNumber" className="text-xs font-semibold text-slate-700">
                          Mã Khách hàng <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="accNumber"
                          value={formAccountNumber}
                          onChange={(e) => setFormAccountNumber(e.target.value)}
                          placeholder="VD: ACC-1002"
                          className="text-xs font-mono h-9 border-slate-200 focus-visible:ring-blue-500 bg-white"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="displayName" className="text-xs font-semibold text-slate-700">
                          Tên Thương hiệu / Viết tắt <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="displayName"
                          value={formDisplayName}
                          onChange={(e) => setFormDisplayName(e.target.value)}
                          placeholder="VD: MB Securities"
                          className="text-xs h-9 border-slate-200 focus-visible:ring-blue-500 bg-white"
                          required
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <Label htmlFor="legalName" className="text-xs font-semibold text-slate-700">
                          Tên Pháp lý Đầy đủ (Tên ĐKKD)
                        </Label>
                        <Input
                          id="legalName"
                          value={formLegalName}
                          onChange={(e) => setFormLegalName(e.target.value)}
                          placeholder="VD: Công ty Cổ phần Chứng khoán MB"
                          className="text-xs h-9 border-slate-200 focus-visible:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section B: Phân cấp & Quản lý */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                      <CornerDownRight className="w-3.5 h-3.5 text-emerald-600" />
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Phân cấp Tổ chức &amp; Phụ trách
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Khách hàng Cha / Cấp trên</Label>
                        <SearchableSelect
                          options={[
                            { value: 'NONE', label: 'Không có – Cấp cao nhất (Độc lập)' },
                            ...accounts.map((acc) => ({
                              value: acc.id,
                              label: `${acc.accountNumber} – ${acc.displayName}`,
                              badge: acc.accountType,
                              description: acc.legalName || undefined,
                            })),
                          ]}
                          value={formParentAccountId || 'NONE'}
                          onValueChange={(v) => setFormParentAccountId(v === 'NONE' ? undefined : v)}
                          placeholder="Chọn Khách hàng Cha..."
                          searchPlaceholder="Tìm mã hoặc tên khách hàng..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Thành viên phụ trách</Label>
                        {teamMembers.length > 1 ? (
                          <SearchableSelect
                            options={teamMembers.map((member) => {
                              const isSelf = member.id === session?.user?.id;
                              const label = member.name && member.name !== member.email
                                ? `${member.name} (${member.email})`
                                : member.email;
                              return {
                                value: member.id,
                                label: `${label}${isSelf ? ' – Chính tôi' : ''}`,
                              };
                            })}
                            value={selectedOwnerId || session?.user?.id || ''}
                            onValueChange={(v) => setSelectedOwnerId(v)}
                            placeholder="Chọn thành viên phụ trách..."
                            searchPlaceholder="Tìm tên hoặc email..."
                          />
                        ) : (
                          <div className="flex items-center justify-between h-9 px-3 bg-white border border-slate-200 rounded-md text-xs text-slate-700 w-full">
                            <span className="truncate">{session?.user?.email || 'Chính bạn (Tài khoản hiện tại)'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section C: Phân loại & Vòng đời */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Phân loại Kinh doanh
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="accType" className="text-xs font-semibold text-slate-700">Loại hình Khách hàng</Label>
                        <Select value={formAccountType} onValueChange={(v) => setFormAccountType(v as AccountType)}>
                          <SelectTrigger className="text-xs h-9 border-slate-200 bg-white">
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
                        <Label htmlFor="lifecycle" className="text-xs font-semibold text-slate-700">Giai đoạn Vòng đời</Label>
                        <Select value={formLifecycleStage} onValueChange={(v) => setFormLifecycleStage(v as AccountLifecycleStage)}>
                          <SelectTrigger className="text-xs h-9 border-slate-200 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="text-xs">
                            <SelectItem value="PROSPECT">Tiềm năng (Prospect)</SelectItem>
                            <SelectItem value="QUALIFIED">Đạt chuẩn (Qualified)</SelectItem>
                            <SelectItem value="CUSTOMER">Khách hàng chính thức</SelectItem>
                            <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                            <SelectItem value="CHURNED">Rời bỏ (Churned)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: THÔNG TIN PHÁP LÝ & BỔ SUNG ── */}
              {activeFormTab === 'legal' && (
                <div className="space-y-6">
                  {/* Section D: Pháp lý */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Thông tin Đăng ký &amp; Liên hệ
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="taxId" className="text-xs font-semibold text-slate-700">Mã số thuế (MST)</Label>
                        <Input id="taxId" value={formTaxIdentifier} onChange={(e) => setFormTaxIdentifier(e.target.value)} placeholder="VD: 0102065678" className="text-xs h-9 border-slate-200 bg-white" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="regNo" className="text-xs font-semibold text-slate-700">Số Giấy phép ĐKKD</Label>
                        <Input id="regNo" value={formRegistrationNumber} onChange={(e) => setFormRegistrationNumber(e.target.value)} placeholder="VD: 0102065678-GP" className="text-xs h-9 border-slate-200 bg-white" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="website" className="text-xs font-semibold text-slate-700">Website chính thức</Label>
                        <Input id="website" value={formWebsite} onChange={(e) => setFormWebsite(e.target.value)} placeholder="https://..." className="text-xs h-9 border-slate-200 bg-white" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="industry" className="text-xs font-semibold text-slate-700">Ngành nghề / Lĩnh vực</Label>
                        <Input id="industry" value={formIndustryCode} onChange={(e) => setFormIndustryCode(e.target.value)} placeholder="VD: Tài chính - Bất động sản" className="text-xs h-9 border-slate-200 bg-white" />
                      </div>

                      <div className="space-y-1.5">
                        <BusinessNumberInput
                          id="empCount"
                          label="Quy mô Nhân sự"
                          value={formEmployeeCount}
                          onChange={setFormEmployeeCount}
                          placeholder="VD: 2500"
                          unitSuffix="người"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <BusinessNumberInput
                          id="revenue"
                          label="Doanh thu Hàng năm"
                          value={formRevenueAmount}
                          onChange={setFormRevenueAmount}
                          placeholder="VD: 350,000,000,000"
                          unitSuffix="VNĐ"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section E: Ghi chú & DNC */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                      <Users className="w-3.5 h-3.5 text-slate-600" />
                      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Ghi chú &amp; Quyền riêng tư
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="desc" className="text-xs font-semibold text-slate-700">Mô tả / Ghi chú Chăm sóc</Label>
                        <textarea
                          id="desc"
                          rows={3}
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          placeholder="Nhập thông tin ghi chú, đặc điểm chăm sóc đối tác..."
                          className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                        />
                      </div>

                      <div
                        className="flex items-center gap-3 bg-rose-50/60 hover:bg-rose-50 border border-rose-200/80 rounded-xl px-4 py-3 cursor-pointer transition-colors"
                        onClick={() => setFormDoNotContact(!formDoNotContact)}
                      >
                        <Checkbox
                          id="createDnc"
                          checked={formDoNotContact}
                          onCheckedChange={(c) => setFormDoNotContact(Boolean(c))}
                        />
                        <div>
                          <Label htmlFor="createDnc" className="text-xs font-semibold cursor-pointer text-rose-800">
                            Đánh dấu Từ chối Tiếp thị (Do Not Contact - DNC)
                          </Label>
                          <p className="text-[11px] text-rose-600 mt-0.5">Từ chối cuộc gọi / email tiếp thị tự động tới khách hàng này</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Synchronized Dialog Footer ── */}
            <div className="shrink-0 px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="text-xs h-9 px-4 border-slate-200">
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white min-w-32 h-9 gap-1.5 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo mới Khách hàng</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Smart Deduplication & Merge Modal */}
      <SmartMergeModal
        open={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        onMerged={fetchAccounts}
      />
    </div>
  );
};