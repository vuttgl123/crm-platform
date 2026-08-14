import React, { useState, useEffect, useCallback } from 'react';
import {
  mockTicketsApi,
  TicketItem,
  TicketPriority,
  TicketStatus,
  TicketChannel,
  TICKET_STATUS_CONFIG,
} from '@/services/mock/mockTicketsData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { EmptyState } from '@/components/common/EmptyState';
import { renderPriorityBadge } from '@/config/crmStatusConfig';
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
  LifeBuoy,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Save,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

export const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
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

  const handleOpenCreate = () => {
    setEditingTicket(null);
    setSubject('');
    setAccountName('');
    setContactName('');
    setPriority('MEDIUM');
    setStatus('NEW');
    setChannel('PORTAL');
    setCategory('Yêu cầu Dịch vụ');
    setAssignedTo('Phạm Tuấn Vũ');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TicketItem) => {
    setEditingTicket(t);
    setSubject(t.subject);
    setAccountName(t.accountName);
    setContactName(t.contactName);
    setPriority(t.priority);
    setStatus(t.status);
    setChannel(t.channel);
    setCategory(t.category);
    setAssignedTo(t.assignedTo);
    setIsModalOpen(true);
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !accountName.trim()) {
      toast.error('Vui lòng nhập tiêu đề và tên khách hàng');
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
          contactName: contactName || 'Chưa gán',
          priority,
          status,
          channel,
          category,
          assignedTo,
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

  const handleDelete = async (id: string, num: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phiếu "${num}"?`)) return;
    try {
      await mockTicketsApi.delete(id);
      toast.success(`Đã xóa phiếu "${num}"`);
      fetchTickets();
    } catch {
      toast.error('Không thể xóa phiếu');
    }
  };

  // Metrics
  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'NEW' || t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;
  const urgentCount = tickets.filter((t) => t.priority === 'URGENT').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-blue-600" />
            <span>Chăm sóc Khách hàng & Hỗ trợ (Tickets)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tiếp nhận sự cố kỹ thuật, theo dõi cam kết SLA giải quyết và phân bổ chuyên viên xử lý
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
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
            <span>Tạo Phiếu Hỗ trợ</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng phiếu tiếp nhận</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalElements}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang chờ xử lý</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{openCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đã giải quyết xong</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sự cố khẩn cấp (SLA)</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{urgentCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
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
                placeholder="Tìm theo mã ticket, tiêu đề sự cố, khách hàng..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-44">
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
                    { label: 'Mới tạo', value: 'NEW' },
                    { label: 'Đang mở', value: 'OPEN' },
                    { label: 'Đang xử lý', value: 'IN_PROGRESS' },
                    { label: 'Đã giải quyết', value: 'RESOLVED' },
                    { label: 'Đã đóng', value: 'CLOSED' },
                  ]}
                  className="h-9 text-xs"
                />
              </div>

              <div className="w-40">
                <SearchableSelect
                  placeholder="Lọc ưu tiên..."
                  searchPlaceholder="Tìm mức..."
                  value={selectedPriority}
                  onValueChange={(val) => {
                    setSelectedPriority(val);
                    setPage(0);
                  }}
                  options={[
                    { label: 'Tất cả ưu tiên', value: 'ALL' },
                    { label: 'Khẩn cấp (Urgent)', value: 'URGENT' },
                    { label: 'Cao (High)', value: 'HIGH' },
                    { label: 'Trung bình', value: 'MEDIUM' },
                    { label: 'Thấp', value: 'LOW' },
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
            <span className="text-xs font-semibold">Đang tải danh sách phiếu hỗ trợ...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={LifeBuoy}
              title="Không tìm thấy phiếu hỗ trợ nào"
              description="Thử thay đổi bộ lọc tìm kiếm hoặc tạo phiếu hỗ trợ mới."
              actionLabel="Tạo Phiếu Hỗ trợ"
              onAction={handleOpenCreate}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Mã & Tiêu đề Sự cố</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Khách hàng & Liên hệ</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Phân loại & Kênh</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Mức độ ưu tiên</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Trạng thái</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {tickets.map((t) => {
                  const statusObj = TICKET_STATUS_CONFIG[t.status];

                  return (
                    <TableRow key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="pl-5 py-3.5">
                        <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mb-1">
                          {t.ticketNumber}
                        </span>
                        <span className="font-bold text-slate-900 text-xs block">{t.subject}</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Tạo: {t.createdAt}</span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{t.accountName}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 pl-4">{t.contactName}</p>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold text-xs mb-1">
                          {t.category}
                        </Badge>
                        <span className="text-[11px] text-slate-400 block">Kênh: {t.channel}</span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        {renderPriorityBadge(t.priority as any)}
                        <span className="text-[11px] text-slate-400 block mt-1">Xử lý: {t.assignedTo}</span>
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
                            onClick={() => handleOpenEdit(t)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(t.id, t.ticketNumber)}
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
        {!loading && tickets.length > 0 && (
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
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {editingTicket ? 'Chỉnh sửa Phiếu Hỗ trợ' : 'Tạo Phiếu Hỗ trợ Mới'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Nhập thông tin sự cố, mức độ khẩn cấp và phân công chuyên viên xử lý
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveTicket} className="p-5 space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Tiêu đề Sự cố / Yêu cầu *</Label>
              <Input
                placeholder="VD: Lỗi đồng bộ dữ liệu liên hệ từ Zalo ZNS qua API"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
                <Label className="font-bold text-slate-700 text-xs">Người gửi yêu cầu</Label>
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
                <Label className="font-bold text-slate-700 text-xs">Mức độ ưu tiên</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">Khẩn cấp (Urgent)</SelectItem>
                    <SelectItem value="HIGH">Cao (High)</SelectItem>
                    <SelectItem value="MEDIUM">Trung bình</SelectItem>
                    <SelectItem value="LOW">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Trạng thái</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">Mới tạo</SelectItem>
                    <SelectItem value="OPEN">Đang mở</SelectItem>
                    <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
                    <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                    <SelectItem value="CLOSED">Đã đóng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Kênh tiếp nhận</Label>
                <Select value={channel} onValueChange={(v) => setChannel(v as TicketChannel)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PORTAL">Cổng Portal</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="PHONE">Tổng đài điện thoại</SelectItem>
                    <SelectItem value="CHAT">Live Chat / Zalo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Phân loại sự cố</Label>
                <Input
                  placeholder="VD: Lỗi Kỹ thuật & API"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Chuyên viên phụ trách</Label>
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
                <span>{editingTicket ? 'Lưu Thay đổi' : 'Tạo Phiếu'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
