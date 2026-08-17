import React, { useState, useEffect, useCallback } from 'react';
import {
  mockTicketsApi,
  TicketItem,
  TicketPriority,
  TicketStatus,
  TicketChannel,
  TICKET_STATUS_CONFIG,
} from '@/services/mock/mockTicketsData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/EmptyState';
import { renderPriorityBadge } from '@/config/crmStatusConfig';
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
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Headphones,
  Inbox,
} from 'lucide-react';

export const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [subject, setSubject] = useState('');
  const [accountName, setAccountName] = useState('');
  const [contactName, setContactName] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [status, setStatus] = useState<TicketStatus>('NEW');
  const [channel, setChannel] = useState<TicketChannel>('PORTAL');
  const [category, setCategory] = useState('Yêu cầu Dịch vụ');
  const [assignedTo, setAssignedTo] = useState('Phạm Tuấn Vũ');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mockTicketsApi.list({
        search: searchQuery,
        status: selectedStatus,
        priority: selectedPriority,
        page,
        size: pageSize,
      });
      setTickets(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Không thể tải danh sách phiếu hỗ trợ');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, selectedPriority, page, pageSize]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
    setPage(0);
    fetchTickets();
  };

  const handleOpenCreate = () => {
    setEditingTicket(null);
    setSubject('');
    setAccountName('');
    setContactName('');
    setPriority('MEDIUM');
    setStatus('NEW');
    setChannel('PORTAL');
    setCategory('Yêu cầu Dịch vụ');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ticket: TicketItem) => {
    setEditingTicket(ticket);
    setSubject(ticket.subject);
    setAccountName(ticket.accountName);
    setContactName(ticket.contactName || '');
    setPriority(ticket.priority);
    setStatus(ticket.status);
    setChannel(ticket.channel);
    setCategory(ticket.category);
    setAssignedTo(ticket.assignedTo);
    setIsModalOpen(true);
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !accountName.trim()) {
      toast.error('Vui lòng nhập tiêu đề ticket và tên khách hàng');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTicket) {
        await mockTicketsApi.update(editingTicket.id, {
          subject,
          accountName,
          contactName,
          priority,
          status,
          channel,
          category,
          assignedTo,
        });
        toast.success('Đã cập nhật phiếu hỗ trợ thành công!');
      } else {
        await mockTicketsApi.create({
          subject,
          accountId: 'acc-custom',
          accountName,
          contactName: contactName || 'Người gửi yêu cầu',
          priority,
          status,
          channel,
          category,
          assignedTo: assignedTo || 'Phạm Tuấn Vũ',
        });
        toast.success('Đã tạo phiếu hỗ trợ mới thành công!');
      }
      setIsModalOpen(false);
      fetchTickets();
    } catch {
      toast.error('Không thể lưu phiếu hỗ trợ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phiếu "${code}"?`)) return;
    try {
      await mockTicketsApi.delete(id);
      toast.success(`Đã xóa ticket "${code}"`);
      fetchTickets();
    } catch {
      toast.error('Không thể xóa ticket');
    }
  };

  // KPI Metrics
  const newCount = tickets.filter((t) => t.status === 'NEW').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0) +
    (selectedPriority !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <Headphones className="w-4.5 h-4.5 text-white" />
            </div>
            Dịch vụ &amp; Hỗ trợ Khách hàng (Helpdesk Tickets)
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Tiếp nhận sự cố kỹ thuật, giải quyết khiếu nại và cam kết chất lượng dịch vụ (SLA)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
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
            <span>Tạo Phiếu Hỗ Trợ Mới</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Inbox className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Số Phiếu</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-rose-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Phiếu mới tiếp nhận</div>
            <div className="text-lg font-black text-rose-700 leading-tight">{newCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đang xử lý / SLA</div>
            <div className="text-lg font-black text-amber-700 leading-tight">{inProgressCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đã giải quyết</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo mã phiếu, tiêu đề, khách hàng..."
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
            <div className="w-40">
              <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="NEW">Mới tiếp nhận</SelectItem>
                  <SelectItem value="OPEN">Đang mở</SelectItem>
                  <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
                  <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                  <SelectItem value="CLOSED">Đã đóng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-36">
              <Select value={selectedPriority} onValueChange={(val) => { setSelectedPriority(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả ưu tiên</SelectItem>
                  <SelectItem value="URGENT">Khẩn cấp (Urgent)</SelectItem>
                  <SelectItem value="HIGH">Cao (High)</SelectItem>
                  <SelectItem value="MEDIUM">Trung bình</SelectItem>
                  <SelectItem value="LOW">Thấp (Low)</SelectItem>
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

      {/* ── Tickets Table ── */}
      <Card className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4">Mã Phiếu &amp; Tiêu đề</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Khách hàng yêu cầu</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Phân loại &amp; Kênh</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Ưu tiên</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Trạng thái</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Phụ trách</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 text-right pr-4">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Đang tải danh sách phiếu hỗ trợ...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={Headphones}
                      title="Không tìm thấy phiếu hỗ trợ nào"
                      description="Hãy thử thay đổi điều kiện lọc hoặc tạo mới ticket hỗ trợ khách hàng."
                      actionLabel="Tạo Phiếu Hỗ Trợ"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => {
                  const statusInfo = TICKET_STATUS_CONFIG[ticket.status] || { label: ticket.status, className: 'bg-slate-100 text-slate-700' };

                  return (
                    <TableRow key={ticket.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                      {/* Cột 1: Mã & Tiêu đề */}
                      <TableCell className="pl-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                            <Headphones className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{ticket.subject}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{ticket.ticketNumber}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột 2: Khách hàng */}
                      <TableCell>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{ticket.accountName}</span>
                          </div>
                          {ticket.contactName && (
                            <div className="text-[11px] text-slate-500 mt-0.5">{ticket.contactName}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* Cột 3: Phân loại & Kênh */}
                      <TableCell>
                        <div>
                          <div className="text-slate-800 font-medium">{ticket.category}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Kênh: {ticket.channel}</div>
                        </div>
                      </TableCell>

                      {/* Cột 4: Ưu tiên */}
                      <TableCell>
                        {renderPriorityBadge(ticket.priority)}
                      </TableCell>

                      {/* Cột 5: Trạng thái */}
                      <TableCell>
                        <Badge className={`${statusInfo.className} text-[11px]`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Cột 6: Phụ trách */}
                      <TableCell className="text-slate-700">
                        {ticket.assignedTo}
                      </TableCell>

                      {/* Cột 7: Thao tác */}
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(ticket)}
                            className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Chỉnh sửa phiếu"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(ticket.id, ticket.ticketNumber)}
                            className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50"
                            title="Xóa phiếu"
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
        {!loading && tickets.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Hiển thị <span className="font-bold text-slate-800">{page * pageSize + 1}</span> -{' '}
              <span className="font-bold text-slate-800">{Math.min((page + 1) * pageSize, totalElements)}</span> trong tổng số{' '}
              <span className="font-bold text-slate-800">{totalElements}</span> phiếu hỗ trợ
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

      {/* ── Create / Edit Ticket Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingTicket ? `Chỉnh sửa Phiếu ${editingTicket.ticketNumber}` : 'Tạo Phiếu Hỗ Trợ Mới'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Ghi nhận yêu cầu hỗ trợ và chỉ định chuyên viên xử lý
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveTicket} className="p-6 space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Tiêu đề sự cố / Yêu cầu <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                placeholder="Ví dụ: Không kết nối được cổng API tích hợp ngân hàng"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-9 text-xs border-slate-200 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Khách hàng / Doanh nghiệp <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="Ví dụ: Tập đoàn Bán Lẻ SunGroup"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Người liên hệ gửi yêu cầu</Label>
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
                <Label className="text-xs font-semibold text-slate-700">Mức độ ưu tiên</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">Khẩn cấp (Urgent)</SelectItem>
                    <SelectItem value="HIGH">Cao (High)</SelectItem>
                    <SelectItem value="MEDIUM">Trung bình</SelectItem>
                    <SelectItem value="LOW">Thấp (Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Trạng thái xử lý</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">Mới tiếp nhận</SelectItem>
                    <SelectItem value="OPEN">Đang mở</SelectItem>
                    <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
                    <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                    <SelectItem value="CLOSED">Đã đóng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Kênh tiếp nhận</Label>
                <Select value={channel} onValueChange={(val: any) => setChannel(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PORTAL">Cổng Portal KH</SelectItem>
                    <SelectItem value="EMAIL">Email hỗ trợ</SelectItem>
                    <SelectItem value="PHONE">Tổng đài Hotline</SelectItem>
                    <SelectItem value="CHAT">Trò chuyện trực tiếp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Phân loại yêu cầu</Label>
                <Input
                  placeholder="Ví dụ: Sự cố kỹ thuật (Bug / Issue)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Chuyên viên hỗ trợ phụ trách</Label>
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
                <span>{editingTicket ? 'Lưu Thay Đổi' : 'Tạo Phiếu Hỗ Trợ'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
