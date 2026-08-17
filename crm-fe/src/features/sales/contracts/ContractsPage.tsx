import React, { useState, useEffect, useCallback } from 'react';
import {
  contractApi,
  ContractItem,
  ContractStatus,
  CONTRACT_STATUS_CONFIG,
} from '@/services/api/contractApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DatePicker } from '@/components/ui/date-picker';
import { EmptyState } from '@/components/common/EmptyState';
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { DocumentPreviewModal } from '@/features/sales/templates/DocumentPreviewModal';
import {
  FileCheck,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Save,
  DollarSign,
  Building2,
  Calendar,
  ShieldCheck,
  Printer,
} from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [previewContract, setPreviewContract] = useState<ContractItem | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [contractNumber, setContractNumber] = useState('');
  const [title, setTitle] = useState('');
  const [accountName, setAccountName] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ContractStatus>('ACTIVE');
  const [signedByCustomer, setSignedByCustomer] = useState('');
  const [assignedTo, setAssignedTo] = useState('Phạm Tuấn Vũ');

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contractApi.list({
        search: searchQuery,
        status: selectedStatus,
        page,
        size: pageSize,
      });
      setContracts(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, page, pageSize]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleOpenCreate = () => {
    setEditingContract(null);
    setContractNumber(`HD-${new Date().getFullYear()}/` + Math.floor(100 + Math.random() * 900));
    setTitle('');
    setAccountName('');
    setContractValue('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);
    setStatus('ACTIVE');
    setSignedByCustomer('');
    setAssignedTo('Phạm Tuấn Vũ');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: ContractItem) => {
    setEditingContract(c);
    setContractNumber(c.contractNumber);
    setTitle(c.title);
    setAccountName(c.accountName || '');
    setContractValue((c.contractValue || c.totalValue || 0).toString());
    setStartDate(c.startDate);
    setEndDate(c.endDate);
    setStatus(c.status);
    setSignedByCustomer(c.signedByCustomer || '');
    setAssignedTo(c.assignedTo || '');
    setIsModalOpen(true);
  };

  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contractValue.trim()) {
      toast.error('Vui lòng nhập tên hợp đồng và giá trị');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingContract) {
        await contractApi.update(editingContract.id, {
          version: editingContract.version || 1,
          contractNumber,
          title,
          contractValue: Number(contractValue) || 0,
          totalValue: Number(contractValue) || 0,
          startDate,
          endDate,
          status,
          signedByCustomer,
          assignedTo,
        });
        toast.success('Đã cập nhật hợp đồng thành công!');
      } else {
        await contractApi.create({
          contractNumber,
          title,
          accountId: 'acc-custom',
          contractValue: Number(contractValue) || 0,
          totalValue: Number(contractValue) || 0,
          startDate,
          endDate,
          status,
          signedByCustomer,
          assignedTo,
        });
        toast.success('Đã tạo hợp đồng mới thành công!');
      }
      setIsModalOpen(false);
      fetchContracts();
    } catch {
      toast.error('Không thể lưu hợp đồng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, num: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hợp đồng "${num}"?`)) return;
    try {
      await contractApi.delete(id);
      toast.success(`Đã xóa hợp đồng "${num}"`);
      fetchContracts();
    } catch {
      toast.error('Không thể xóa hợp đồng');
    }
  };

  // Metrics
  const activeCount = contracts.filter((c) => c.status === 'ACTIVE').length;
  const totalContractVal = contracts.reduce((sum, c) => sum + (c.contractValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-blue-600" />
            <span>Hợp đồng & Pháp lý</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị hợp đồng kinh tế, theo dõi thời hạn hiệu lực bản quyền và điều khoản thanh lý
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchContracts}
            disabled={loading}
            className="h-9 px-3 text-xs font-semibold gap-1.5 shadow-2xs border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Hợp đồng Mới</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số hợp đồng</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalElements}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang hiệu lực</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng giá trị hợp đồng</p>
              <h3 className="text-xl font-black text-blue-700 mt-1">
                {(totalContractVal / 1000000000).toFixed(2)} tỷ ₫
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời hạn trung bình</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">12 Tháng</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Card */}
      <Card className="border-slate-200 shadow-2xs bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm kiếm theo số hợp đồng, tên khách hàng..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-48">
                <SearchableSelect
                  placeholder="Lọc trạng thái..."
                  searchPlaceholder="Tìm trạng thái..."
                  value={selectedStatus}
                  onValueChange={(val) => {
                    setSelectedStatus(val);
                    setPage(0);
                  }}
                  options={[
                    { label: 'Tất cả trạng thái', value: 'ALL' },
                    { label: 'Đang hiệu lực', value: 'ACTIVE' },
                    { label: 'Bản thảo', value: 'DRAFT' },
                    { label: 'Đã hết hạn', value: 'EXPIRED' },
                    { label: 'Đã thanh lý', value: 'TERMINATED' },
                  ]}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải danh sách hợp đồng...</span>
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FileCheck}
              title="Không tìm thấy hợp đồng nào"
              description="Thử thay đổi bộ lọc tìm kiếm hoặc tạo mới hợp đồng đầu tiên."
              actionLabel="Tạo Hợp đồng Mới"
              onAction={handleOpenCreate}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Số HĐ & Tên Hợp đồng</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Khách hàng</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Giá trị hợp đồng</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Thời hạn hiệu lực</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Trạng thái</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {contracts.map((c) => {
                  const statusObj = CONTRACT_STATUS_CONFIG[c.status];

                  return (
                    <TableRow key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="pl-5 py-3.5">
                        <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mb-1">
                          {c.contractNumber}
                        </span>
                        <span className="font-bold text-slate-900 text-xs block">{c.title}</span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{c.accountName}</span>
                        </p>
                        {c.signedByCustomer && (
                          <p className="text-[11px] text-slate-400 pl-4">Đại diện ký: {c.signedByCustomer}</p>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <span className="text-xs font-bold text-blue-700 block">
                          {c.contractValue.toLocaleString('vi-VN')} ₫
                        </span>
                        <span className="text-[11px] text-slate-400">Phụ trách: {c.assignedTo}</span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.startDate} → {c.endDate}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <Badge variant="outline" className={`text-[10px] font-bold ${statusObj.className}`}>
                          {statusObj.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right pr-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewContract(c);
                              setShowPrintModal(true);
                            }}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Xem bản in & Xuất PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(c)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(c.id, c.contractNumber)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {!loading && contracts.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-8 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>trên tổng số <b>{totalElements}</b> bản ghi</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">
                Trang {page + 1} / {totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-white p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-2xl">
          <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {editingContract ? 'Chỉnh sửa Hợp đồng' : 'Tạo Hợp đồng Mới'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Thiết lập số hiệu, thời hạn hiệu lực và đại diện pháp lý hai bên
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveContract} className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Số hiệu Hợp đồng *</Label>
                <Input
                  placeholder="VD: HD-2026/FPT-CRM"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Trạng thái hiệu lực</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContractStatus)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Đang hiệu lực</SelectItem>
                    <SelectItem value="DRAFT">Bản thảo</SelectItem>
                    <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
                    <SelectItem value="TERMINATED">Đã thanh lý</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Tên / Trích yếu Hợp đồng *</Label>
              <Input
                placeholder="VD: Hợp đồng Cung cấp & Triển khai Hệ thống CRM..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Khách hàng / Doanh nghiệp *</Label>
                <Input
                  placeholder="VD: Tập đoàn Công nghệ FPT"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Giá trị hợp đồng (VNĐ) *</Label>
                <Input
                  type="number"
                  placeholder="VD: 1620000000"
                  value={contractValue}
                  onChange={(e) => setContractValue(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Ngày bắt đầu hiệu lực</Label>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Chọn ngày bắt đầu..."
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Ngày hết hạn hợp đồng</Label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Chọn ngày kết thúc..."
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Đại diện khách hàng ký</Label>
                <Input
                  placeholder="VD: Trần Minh Đức (CTO)"
                  value={signedByCustomer}
                  onChange={(e) => setSignedByCustomer(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Nhân viên phụ trách</Label>
                <Input
                  placeholder="VD: Phạm Tuấn Vũ"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-9 text-xs font-semibold px-4"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{editingContract ? 'Lưu Thay đổi' : 'Tạo Hợp đồng'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Printable Contract Modal */}
      {previewContract && (
        <DocumentPreviewModal
          open={showPrintModal}
          onClose={() => {
            setShowPrintModal(false);
            setPreviewContract(null);
          }}
          documentType="CONTRACT"
          documentNumber={previewContract.contractNumber}
          documentDate={previewContract.startDate}
          validUntilDate={previewContract.endDate}
          clientName={previewContract.accountName}
          clientRepresentative={previewContract.signedByCustomer}
          items={[
            {
              name: previewContract.title,
              quantity: 1,
              unit: 'Hợp đồng',
              unitPrice: previewContract.contractValue,
              totalAmount: previewContract.contractValue,
            },
          ]}
          subtotal={previewContract.contractValue}
          grandTotal={previewContract.contractValue}
        />
      )}
    </div>
  );
};
