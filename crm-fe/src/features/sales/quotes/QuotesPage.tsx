import React, { useState, useEffect, useCallback } from 'react';
import {
  mockQuotesApi,
  QuoteItem,
  QuoteStatus,
  QUOTE_STATUS_CONFIG,
} from '@/services/mock/mockQuotesData';
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
import {
  FileText,
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
  CheckCircle2,
} from 'lucide-react';

export const QuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<QuoteItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [accountName, setAccountName] = useState('');
  const [contactName, setContactName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [status, setStatus] = useState<QuoteStatus>('SENT');
  const [validUntil, setValidUntil] = useState('');
  const [assignedTo, setAssignedTo] = useState('Phạm Tuấn Vũ');

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mockQuotesApi.list({
        search: searchQuery,
        status: selectedStatus,
        page,
        size: pageSize,
      });
      setQuotes(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Không thể tải danh sách báo giá');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, page, pageSize]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleOpenCreate = () => {
    setEditingQuote(null);
    setTitle('');
    setAccountName('');
    setContactName('');
    setTotalAmount('');
    setDiscountPercent('0');
    setStatus('SENT');
    setValidUntil(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setAssignedTo('Phạm Tuấn Vũ');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: QuoteItem) => {
    setEditingQuote(q);
    setTitle(q.title);
    setAccountName(q.accountName);
    setContactName(q.contactName);
    setTotalAmount(q.totalAmount.toString());
    setDiscountPercent(q.discountPercent.toString());
    setStatus(q.status);
    setValidUntil(q.validUntil);
    setAssignedTo(q.assignedTo);
    setIsModalOpen(true);
  };

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !totalAmount.trim()) {
      toast.error('Vui lòng nhập tiêu đề và tổng giá trị');
      return;
    }

    const subTotal = Number(totalAmount) || 0;
    const disc = Number(discountPercent) || 0;
    const finalVal = subTotal * (1 - disc / 100);

    setIsSubmitting(true);
    try {
      if (editingQuote) {
        await mockQuotesApi.update(editingQuote.id, {
          title,
          accountName: accountName || 'Khách hàng chưa gán',
          contactName: contactName || 'Chưa gán',
          totalAmount: subTotal,
          discountPercent: disc,
          finalAmount: finalVal,
          status,
          validUntil,
          assignedTo,
        });
        toast.success('Đã cập nhật báo giá thành công!');
      } else {
        await mockQuotesApi.create({
          title,
          accountId: 'acc-custom',
          accountName: accountName || 'Khách hàng mới',
          contactName: contactName || 'Chưa gán',
          totalAmount: subTotal,
          discountPercent: disc,
          finalAmount: finalVal,
          status,
          validUntil,
          assignedTo,
        });
        toast.success('Đã tạo báo giá mới thành công!');
      }
      setIsModalOpen(false);
      fetchQuotes();
    } catch {
      toast.error('Không thể lưu báo giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa báo giá "${code}"?`)) return;
    try {
      await mockQuotesApi.delete(id);
      toast.success(`Đã xóa báo giá "${code}"`);
      fetchQuotes();
    } catch {
      toast.error('Không thể xóa báo giá');
    }
  };

  // Metrics
  const acceptedCount = quotes.filter((q) => q.status === 'ACCEPTED').length;
  const totalQuoteValue = quotes.reduce((sum, q) => sum + (q.finalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            <span>Báo giá (Quotes)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Soạn thảo, quản lý chiết khấu và theo dõi phê duyệt báo giá gửi khách hàng
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQuotes}
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
            <span>Tạo Báo giá Mới</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số báo giá</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalElements}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đã chấp thuận</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{acceptedCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng giá trị báo giá</p>
              <h3 className="text-xl font-black text-blue-700 mt-1">
                {(totalQuoteValue / 1000000000).toFixed(2)} tỷ ₫
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tỷ lệ chốt</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">
                {totalElements > 0 ? ((acceptedCount / totalElements) * 100).toFixed(0) : 0}%
              </h3>
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
                placeholder="Tìm theo số báo giá, tiêu đề, khách hàng..."
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
                    { label: 'Bản nháp', value: 'DRAFT' },
                    { label: 'Đã gửi khách', value: 'SENT' },
                    { label: 'Đã chấp thuận', value: 'ACCEPTED' },
                    { label: 'Bị từ chối', value: 'REJECTED' },
                    { label: 'Đã hết hạn', value: 'EXPIRED' },
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
            <span className="text-xs font-semibold">Đang tải danh sách báo giá...</span>
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FileText}
              title="Không tìm thấy báo giá nào"
              description="Thử thay đổi bộ lọc tìm kiếm hoặc tạo báo giá đầu tiên cho khách hàng."
              actionLabel="Tạo Báo giá Mới"
              onAction={handleOpenCreate}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Số BG & Tiêu đề</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Khách hàng / Doanh nghiệp</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Giá trị sau chiết khấu</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Hạn hiệu lực</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Trạng thái</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {quotes.map((q) => {
                  const statusObj = QUOTE_STATUS_CONFIG[q.status];

                  return (
                    <TableRow key={q.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="pl-5 py-3.5">
                        <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mb-1">
                          {q.quoteNumber}
                        </span>
                        <span className="font-bold text-slate-900 text-xs block">{q.title}</span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{q.accountName}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 pl-4">{q.contactName}</p>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <span className="text-xs font-bold text-blue-700 block">
                          {q.finalAmount.toLocaleString('vi-VN')} ₫
                        </span>
                        {q.discountPercent > 0 && (
                          <span className="text-[11px] text-emerald-600 font-semibold">
                            Giảm {q.discountPercent}% (Gốc: {(q.totalAmount / 1000000).toFixed(0)}M)
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{q.validUntil}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Tạo: {q.createdAt}</span>
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
                            onClick={() => handleOpenEdit(q)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(q.id, q.quoteNumber)}
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
        {!loading && quotes.length > 0 && (
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

      {/* Add / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-white p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-2xl">
          <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {editingQuote ? 'Chỉnh sửa Báo giá' : 'Tạo Báo giá Mới'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Thiết lập giá trị hợp đồng và thời hạn hiệu lực của bản chào giá
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveQuote} className="p-5 space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Tiêu đề Báo giá *</Label>
              <Input
                placeholder="VD: Báo giá triển khai phần mềm CRM 2026"
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
                <Label className="font-bold text-slate-700 text-xs">Người liên hệ nhận báo giá</Label>
                <Input
                  placeholder="VD: Trần Minh Đức"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Tổng giá niêm yết (VNĐ) *</Label>
                <Input
                  type="number"
                  placeholder="VD: 1800000000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Chiết khấu (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Trạng thái</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as QuoteStatus)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Bản nháp</SelectItem>
                    <SelectItem value="SENT">Đã gửi khách</SelectItem>
                    <SelectItem value="ACCEPTED">Đã chấp thuận</SelectItem>
                    <SelectItem value="REJECTED">Bị từ chối</SelectItem>
                    <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Hiệu lực đến ngày</Label>
                <DatePicker
                  value={validUntil}
                  onChange={setValidUntil}
                  placeholder="Chọn ngày hết hạn..."
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
                <span>{editingQuote ? 'Lưu Thay đổi' : 'Tạo Báo giá'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
