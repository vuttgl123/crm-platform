import React, { useState, useEffect, useCallback } from 'react';
import {
  accountApi,
  AccountSummaryResponse,
  AccountResponse,
  AccountType,
  AccountLifecycleStage,
  CreateAccountRequest,
} from '@/services/api/accountApi';
import { toast } from 'sonner';
import {
  Building2,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  Building,
  Globe,
  Loader2,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form State for Creating Account
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formLegalName, setFormLegalName] = useState('');
  const [formAccountType, setFormAccountType] = useState<AccountType>('ORGANIZATION');
  const [formLifecycleStage, setFormLifecycleStage] = useState<AccountLifecycleStage>('PROSPECT');
  const [formWebsite, setFormWebsite] = useState('');
  const [formEmployeeCount, setFormEmployeeCount] = useState('');
  const [formRevenueAmount, setFormRevenueAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      accountType: formAccountType,
      lifecycleStage: formLifecycleStage,
      website: formWebsite.trim() || undefined,
      employeeCount: formEmployeeCount ? parseInt(formEmployeeCount, 10) : undefined,
      annualRevenue: formRevenueAmount
        ? { amount: parseFloat(formRevenueAmount), currencyCode: 'VND' }
        : undefined,
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

  const handleViewDetail = async (id: string) => {
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
    setFormAccountType('ORGANIZATION');
    setFormLifecycleStage('PROSPECT');
    setFormWebsite('');
    setFormEmployeeCount('');
    setFormRevenueAmount('');
  };

  const getAccountTypeBadge = (type: AccountType) => {
    switch (type) {
      case 'ORGANIZATION':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Doanh nghiệp</Badge>;
      case 'PERSON':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Cá nhân</Badge>;
      case 'PARTNER':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Đối tác</Badge>;
      case 'RESELLER':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Đại lý</Badge>;
      case 'SUPPLIER':
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Nhà cung cấp</Badge>;
    }
  };

  const getLifecycleStageBadge = (stage: AccountLifecycleStage) => {
    switch (stage) {
      case 'PROSPECT':
        return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Tiềm năng (Prospect)</Badge>;
      case 'QUALIFIED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Đạt chuẩn (Qualified)</Badge>;
      case 'CUSTOMER':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Khách hàng chính thức</Badge>;
      case 'CHURNED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rời bỏ (Churned)</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Ngừng hoạt động</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans w-full">
      {/* Top Header Card */}
      <Card className="shadow-xs border-slate-200 w-full">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <span>Quản lý Khách hàng</span>
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Quản lý thông tin tài khoản doanh nghiệp, tổ chức và đối tác kinh doanh
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAccounts}
              disabled={loading}
              className="gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>

            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Thêm Khách hàng Mới
            </Button>
          </div>
        </CardHeader>

        {/* Filter Bar */}
        <CardContent className="pt-4 pb-4 bg-slate-50/50 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Mã KH, Tên khách hàng hoặc Tên pháp lý (q=...)"
              className="pl-9 text-xs bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden md:block" />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-44 text-xs bg-white">
                <SelectValue placeholder="Loại Khách hàng" />
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

            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-48 text-xs bg-white">
                <SelectValue placeholder="Giai đoạn Vòng đời" />
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
          </div>
        </CardContent>
      </Card>

      {/* Main Accounts Table */}
      <Card className="shadow-xs border-slate-200 w-full overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="text-xs">
              <TableHead className="font-bold text-slate-900 w-32">Mã Khách hàng</TableHead>
              <TableHead className="font-bold text-slate-900">Tên Khách hàng / Tên Pháp lý</TableHead>
              <TableHead className="font-bold text-slate-900">Loại hình</TableHead>
              <TableHead className="font-bold text-slate-900">Vòng đời Kinh doanh</TableHead>
              <TableHead className="font-bold text-slate-900">Cập nhật cuối</TableHead>
              <TableHead className="font-bold text-slate-900 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-xs divide-y divide-slate-100">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                  <span>Đang tải danh sách khách hàng từ Backend...</span>
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  Không tìm thấy dữ liệu khách hàng nào phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((acc) => (
                <TableRow key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                  <TableCell className="font-mono font-bold text-blue-600">{acc.accountNumber}</TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900">{acc.displayName}</div>
                    {acc.legalName && <div className="text-[11px] text-slate-500">{acc.legalName}</div>}
                  </TableCell>
                  <TableCell>{getAccountTypeBadge(acc.accountType)}</TableCell>
                  <TableCell>{getLifecycleStageBadge(acc.lifecycleStage)}</TableCell>
                  <TableCell className="text-slate-500 font-mono text-[11px]">
                    {new Date(acc.updatedAt).toLocaleTimeString('vi-VN')} {new Date(acc.updatedAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal 1: Create Account Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>Tạo Mới Khách hàng</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Nhập thông tin chi tiết để khởi tạo hồ sơ đối tác mới trên hệ thống
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAccount} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="accNo" className="text-xs font-semibold">Mã Khách hàng *</Label>
                <Input
                  id="accNo"
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  placeholder="Ví dụ: ACC-MB-001"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-xs font-semibold">Tên Khách hàng (Hiển thị) *</Label>
                <Input
                  id="displayName"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="Tên rút gọn / Thương hiệu"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="legalName" className="text-xs font-semibold">Tên Pháp lý Đầy đủ</Label>
                <Input
                  id="legalName"
                  value={formLegalName}
                  onChange={(e) => setFormLegalName(e.target.value)}
                  placeholder="Công ty Cổ phần / TNHH..."
                />
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
                    <SelectItem value="PARTNER">Đối tác</SelectItem>
                    <SelectItem value="RESELLER">Đại lý</SelectItem>
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
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="website" className="text-xs font-semibold">Website</Label>
                <Input
                  id="website"
                  value={formWebsite}
                  onChange={(e) => setFormWebsite(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="empCount" className="text-xs font-semibold">Số lượng Nhân sự</Label>
                <Input
                  id="empCount"
                  type="number"
                  value={formEmployeeCount}
                  onChange={(e) => setFormEmployeeCount(e.target.value)}
                  placeholder="250"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="revenue" className="text-xs font-semibold">Doanh thu Hàng năm (VNĐ)</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={formRevenueAmount}
                  onChange={(e) => setFormRevenueAmount(e.target.value)}
                  placeholder="1500000000"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="text-xs">
                Hủy
              </Button>
              <Button type="submit" className="text-xs font-semibold bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo...' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Account Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Chi tiết Khách hàng</span>
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-8 text-center text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
              <span>Đang tải thông tin chi tiết...</span>
            </div>
          ) : selectedAccount ? (
            <div className="space-y-4 text-xs pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-600 text-sm">{selectedAccount.accountNumber}</span>
                  <div className="flex gap-2">
                    {getAccountTypeBadge(selectedAccount.accountType)}
                    {getLifecycleStageBadge(selectedAccount.lifecycleStage)}
                  </div>
                </div>
                <div className="text-base font-bold text-slate-900">{selectedAccount.displayName}</div>
                {selectedAccount.legalName && <div className="text-xs text-slate-500">{selectedAccount.legalName}</div>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-slate-200">
                  <div className="text-slate-400 font-semibold">ID Hệ thống (UUID)</div>
                  <div className="font-mono text-[11px] text-slate-900 mt-1 truncate">{selectedAccount.id}</div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200">
                  <div className="text-slate-400 font-semibold">Phiên bản Optimistic (Version)</div>
                  <div className="font-mono text-slate-900 mt-1 font-bold">v{selectedAccount.version}</div>
                </div>

                {selectedAccount.website && (
                  <div className="p-3 rounded-lg border border-slate-200 col-span-2">
                    <div className="text-slate-400 font-semibold flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      Website
                    </div>
                    <a
                      href={selectedAccount.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-mono mt-1 block"
                    >
                      {selectedAccount.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="text-xs">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
