import React, { useState, useEffect, useCallback } from 'react';
import {
  mockQuotesApi,
  QuoteItem,
  QuoteStatus,
  QUOTE_STATUS_CONFIG,
} from '@/services/mock/mockQuotesData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Dialog,
  DialogContent,
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
  ChevronsLeft,
  ChevronsRight,
  X,
  RotateCcw,
  DollarSign,
  Building2,
  CheckCircle2,
  Send,
} from 'lucide-react';

export const QuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setPage(0);
    fetchQuotes();
  };

  const handleOpenCreate = () => {
    setEditingQuote(null);
    setTitle('');
    setAccountName('');
    setContactName('');
    setTotalAmount('');
    setDiscountPercent('0');
    setStatus('SENT');
    setValidUntil(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (quote: QuoteItem) => {
    setEditingQuote(quote);
    setTitle(quote.title);
    setAccountName(quote.accountName);
    setContactName(quote.contactName || '');
    setTotalAmount(quote.totalAmount.toString());
    setDiscountPercent(quote.discountPercent.toString());
    setStatus(quote.status);
    setValidUntil(quote.validUntil);
    setAssignedTo(quote.assignedTo);
    setIsModalOpen(true);
  };

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !totalAmount.trim()) {
      toast.error('Vui lòng nhập tiêu đề báo giá và tổng số tiền');
      return;
    }

    const tAmount = parseFloat(totalAmount);
    const dPercent = parseFloat(discountPercent) || 0;
    const fAmount = tAmount * (1 - dPercent / 100);

    setIsSubmitting(true);
    try {
      if (editingQuote) {
        await mockQuotesApi.update(editingQuote.id, {
          title,
          accountName,
          contactName,
          totalAmount: tAmount,
          discountPercent: dPercent,
          finalAmount: fAmount,
          status,
          validUntil,
          assignedTo,
        });
        toast.success('Đã cập nhật báo giá thành công!');
      } else {
        await mockQuotesApi.create({
          title,
          accountId: 'acc-custom',
          accountName: accountName || 'Khách hàng',
          contactName: contactName || 'Người liên hệ',
          totalAmount: tAmount,
          discountPercent: dPercent,
          finalAmount: fAmount,
          status,
          validUntil: validUntil || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          assignedTo: assignedTo || 'Phạm Tuấn Vũ',
        });
        toast.success('Đã thêm báo giá mới thành công!');
      }
      setIsModalOpen(false);
      fetchQuotes();
    } catch {
      toast.error('Không thể lưu thông tin báo giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa báo giá "${name}"?`)) return;
    try {
      await mockQuotesApi.delete(id);
      toast.success(`Đã xóa báo giá "${name}"`);
      fetchQuotes();
    } catch {
      toast.error('Không thể xóa báo giá');
    }
  };

  // KPI Metrics
  const totalQuoteValue = quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  const acceptedList = quotes.filter((q) => q.status === 'ACCEPTED');
  const acceptedValue = acceptedList.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  const sentCount = quotes.filter((q) => q.status === 'SENT').length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <FileText className="w-4.5 h-4.5 text-white" />
            </div>
            Quản lý Báo giá (Sales Quotes)
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Soạn thảo bảng chào giá, áp dụng chiết khấu &amp; theo dõi tiến độ phê duyệt hợp đồng
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQuotes}
            disabled={loading}
            className="text-xs gap-1.5 border-slate-200 h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Báo Giá Mới</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <FileText className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Báo giá</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Giá trị Chào</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">
              {(totalQuoteValue / 1_000_000).toFixed(0)} Tr ₫
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đã chấp thuận</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">
              {(acceptedValue / 1_000_000).toFixed(0)} Tr ₫
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Send className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đã gửi khách hàng</div>
            <div className="text-lg font-black text-purple-700 leading-tight">{sentCount}</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề báo giá, mã hiệu, khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 text-xs h-8.5 bg-slate-50/60 focus:bg-white border-slate-200 rounded-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-44">
              <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="DRAFT">Bản nháp (Draft)</SelectItem>
                  <SelectItem value="SENT">Đã gửi khách</SelectItem>
                  <SelectItem value="ACCEPTED">Đã chấp thuận</SelectItem>
                  <SelectItem value="REJECTED">Từ chối</SelectItem>
                  <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-slate-800 gap-1 h-8.5 px-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại ({activeFiltersCount})</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ── Quotes Table ── */}
      <Card className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4">Báo giá &amp; Mã số</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Doanh nghiệp khách hàng</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Tổng giá trị</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Chiết khấu</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Trạng thái</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Hiệu lực đến</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 text-right pr-4">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Đang tải danh sách báo giá...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={FileText}
                      title="Không tìm thấy báo giá nào"
                      description="Hãy thử thay đổi điều kiện lọc hoặc tạo mới bảng chào giá."
                      actionLabel="Tạo Báo Giá"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => {
                  const statusInfo = QUOTE_STATUS_CONFIG[quote.status] || { label: quote.status, className: 'bg-slate-100 text-slate-700' };

                  return (
                    <TableRow key={quote.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                      {/* Cột 1: Tiêu đề */}
                      <TableCell className="pl-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{quote.title}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{quote.quoteNumber}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột 2: Khách hàng */}
                      <TableCell>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{quote.accountName}</span>
                          </div>
                          {quote.contactName && (
                            <div className="text-[11px] text-slate-500 mt-0.5">{quote.contactName}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* Cột 3: Tổng tiền */}
                      <TableCell>
                        <div className="font-bold text-slate-900 font-mono text-xs">
                          {quote.totalAmount.toLocaleString('vi-VN')} ₫
                        </div>
                      </TableCell>

                      {/* Cột 4: Chiết khấu */}
                      <TableCell className="font-mono text-slate-600 text-[11px]">
                        {quote.discountPercent > 0 ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                            -{quote.discountPercent}%
                          </Badge>
                        ) : (
                          '0%'
                        )}
                      </TableCell>

                      {/* Cột 5: Trạng thái */}
                      <TableCell>
                        <Badge className={`${statusInfo.className} text-[11px]`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Cột 6: Hiệu lực */}
                      <TableCell className="font-mono text-slate-600 text-[11px]">
                        {new Date(quote.validUntil).toLocaleDateString('vi-VN')}
                      </TableCell>

                      {/* Cột 7: Thao tác */}
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(quote)}
                            className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Chỉnh sửa báo giá"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(quote.id, quote.title)}
                            className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50"
                            title="Xóa báo giá"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination Bar ── */}
        {!loading && quotes.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Hiển thị <span className="font-bold text-slate-800">{page * pageSize + 1}</span> -{' '}
              <span className="font-bold text-slate-800">{Math.min((page + 1) * pageSize, totalElements)}</span> trong tổng số{' '}
              <span className="font-bold text-slate-800">{totalElements}</span> báo giá
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                onClick={() => setPage(0)}
                disabled={page === 0}
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <div className="px-2 font-medium text-slate-700">
                Trang {page + 1} / {Math.max(totalPages, 1)}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 border-slate-200"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Create / Edit Quote Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingQuote ? 'Chỉnh sửa Báo giá' : 'Tạo Báo Giá Mới'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingQuote ? `Mã: ${editingQuote.quoteNumber}` : 'Thiết lập bảng giá, chiết khấu và điều khoản thanh toán'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveQuote} className="p-6 space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Tiêu đề bảng báo giá <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                placeholder="Ví dụ: Báo giá Gói Phần Mềm Quản Trị Khách Hàng Q3/2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-xs border-slate-200 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Doanh nghiệp khách hàng</Label>
                <Input
                  placeholder="Nhập tên doanh nghiệp..."
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Người liên hệ nhận báo giá</Label>
                <Input
                  placeholder="Nhập người đại diện..."
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Tổng giá trị (VNĐ) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="number"
                  placeholder="200,000,000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Chiết khấu (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Trạng thái</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Bản nháp (Draft)</SelectItem>
                    <SelectItem value="SENT">Đã gửi khách</SelectItem>
                    <SelectItem value="ACCEPTED">Đã chấp thuận</SelectItem>
                    <SelectItem value="REJECTED">Bị từ chối</SelectItem>
                    <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Hiệu lực đến ngày</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Chuyên viên phụ trách</Label>
                <Input
                  placeholder="Phạm Tuấn Vũ"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs border-slate-200 h-9"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-9"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{editingQuote ? 'Lưu Thay Đổi' : 'Tạo Báo Giá'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
