import React, { useState, useEffect, useCallback } from 'react';
import {
  activityApi,
  ActivityItem,
  ActivityType,
  ActivityPriority,
  ActivityStatus,
  ACTIVITY_TYPE_CONFIG,
} from '@/services/api/activityApi';
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
  Calendar,
  CheckCircle2,
  Clock,
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
  Phone,
  Mail,
  Users,
  CheckSquare,
  CalendarCheck,
} from 'lucide-react';

const TYPE_ICON_MAP: Record<ActivityType, any> = {
  CALL: Phone,
  MEETING: Users,
  TASK: CheckSquare,
  EMAIL: Mail,
};

const STATUS_CONFIG: Record<ActivityStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold' },
  COMPLETED: { label: 'Hoàn thành', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
};

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAct, setEditingAct] = useState<ActivityItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [subject, setSubject] = useState('');
  const [type, setType] = useState<ActivityType>('CALL');
  const [priority, setPriority] = useState<ActivityPriority>('MEDIUM');
  const [status, setStatus] = useState<ActivityStatus>('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('09:00');
  const [accountName, setAccountName] = useState('');
  const [contactName, setContactName] = useState('');
  const [assignedTo, setAssignedTo] = useState('Phạm Tuấn Vũ');
  const [description, setDescription] = useState('');

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityApi.list({
        search: searchQuery,
        type: selectedType,
        priority: selectedPriority,
        status: selectedStatus,
        page,
        size: pageSize,
      });
      setActivities(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Không thể tải danh sách hoạt động');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, selectedPriority, selectedStatus, page, pageSize]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedPriority('ALL');
    setSelectedStatus('ALL');
    setPage(0);
    fetchActivities();
  };

  const handleOpenCreate = () => {
    setEditingAct(null);
    setSubject('');
    setType('CALL');
    setPriority('MEDIUM');
    setStatus('PENDING');
    setDueDate(new Date().toISOString().split('T')[0]);
    setDueTime('09:00');
    setAccountName('');
    setContactName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (act: ActivityItem) => {
    setEditingAct(act);
    setSubject(act.subject);
    setType(act.type);
    setPriority(act.priority);
    setStatus(act.status);
    setDueDate(act.dueDate);
    setDueTime(act.dueTime || '09:00');
    setAccountName(act.accountName || '');
    setContactName(act.contactName || '');
    setAssignedTo(act.assignedTo);
    setDescription(act.description || '');
    setIsModalOpen(true);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error('Vui lòng nhập tiêu đề hoạt động');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAct) {
        await activityApi.update(editingAct.id, {
          version: editingAct.version || 1,
          subject,
          type,
          priority,
          status,
          dueDate,
          dueTime,
          accountName,
          contactName,
          assignedTo,
          description,
        });
        toast.success('Đã cập nhật hoạt động thành công!');
      } else {
        await activityApi.create({
          subject,
          type,
          priority,
          status,
          dueDate: dueDate || new Date().toISOString().split('T')[0],
          dueTime: dueTime || '09:00',
          accountName: accountName || 'Khách hàng',
          contactName: contactName || 'Người liên hệ',
          assignedTo: assignedTo || 'Phạm Tuấn Vũ',
          description,
        });
        toast.success('Đã thêm hoạt động mới thành công!');
      }
      setIsModalOpen(false);
      fetchActivities();
    } catch {
      toast.error('Không thể lưu thông tin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (act: ActivityItem) => {
    try {
      await activityApi.complete(act.id, act.version || 1);
      toast.success(`Đã cập nhật trạng thái: "${act.subject}"`);
      fetchActivities();
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string, sub: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hoạt động "${sub}"?`)) return;
    try {
      await activityApi.delete(id);
      toast.success(`Đã xóa hoạt động "${sub}"`);
      fetchActivities();
    } catch {
      toast.error('Không thể xóa hoạt động');
    }
  };

  // KPI Metrics
  const callsCount = activities.filter((a) => a.type === 'CALL').length;
  const meetingsCount = activities.filter((a) => a.type === 'MEETING').length;
  const pendingCount = activities.filter((a) => a.status === 'PENDING').length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedType !== 'ALL' ? 1 : 0) +
    (selectedPriority !== 'ALL' ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <Calendar className="w-4.5 h-4.5 text-white" />
            </div>
            Quản lý Hoạt động &amp; Công việc (Activities)
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Lên lịch cuộc gọi, sự kiện hội họp, gửi email và nhiệm vụ chăm sóc khách hàng
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActivities}
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
            <span>Thêm Hoạt Động Mới</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Hoạt động</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <Phone className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Cuộc gọi Telesales</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">{callsCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Lịch họp &amp; Demo</div>
            <div className="text-lg font-black text-purple-700 leading-tight">{meetingsCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đang chờ xử lý</div>
            <div className="text-lg font-black text-amber-700 leading-tight">{pendingCount}</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề hoạt động, khách hàng, nội dung..."
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
            <div className="w-36">
              <Select value={selectedType} onValueChange={(val) => { setSelectedType(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Loại hình" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả loại</SelectItem>
                  <SelectItem value="CALL">Cuộc gọi</SelectItem>
                  <SelectItem value="MEETING">Lịch họp</SelectItem>
                  <SelectItem value="TASK">Nhiệm vụ</SelectItem>
                  <SelectItem value="EMAIL">Gửi Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-36">
              <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                  <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
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

      {/* ── Activities Table ── */}
      <Card className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4">Tiêu đề Hoạt động</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Loại hình</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Doanh nghiệp / Khách hàng</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Thời hạn (Due Date)</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Ưu tiên</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Trạng thái</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 text-right pr-4">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Đang tải danh sách hoạt động...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={Calendar}
                      title="Không tìm thấy hoạt động nào"
                      description="Hãy thử thay đổi điều kiện lọc hoặc tạo thêm hoạt động chăm sóc mới."
                      actionLabel="Thêm Hoạt Động"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((act) => {
                  const TypeIcon = TYPE_ICON_MAP[act.type] || Calendar;
                  const typeInfo = ACTIVITY_TYPE_CONFIG[act.type] || { label: act.type, className: 'bg-slate-100 text-slate-700' };
                  const statusInfo = STATUS_CONFIG[act.status] || STATUS_CONFIG.PENDING;

                  return (
                    <TableRow key={act.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                      {/* Cột 1: Tiêu đề */}
                      <TableCell className="pl-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{act.subject}</div>
                            {act.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{act.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột 2: Loại hình */}
                      <TableCell>
                        <Badge className={`${typeInfo.className} text-[10px] px-2 py-0.5 font-bold`}>
                          {typeInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Cột 3: Khách hàng */}
                      <TableCell>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{act.accountName || 'Khách hàng'}</span>
                          </div>
                          {act.contactName && (
                            <div className="text-[11px] text-slate-500 mt-0.5">{act.contactName}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* Cột 4: Hạn chót */}
                      <TableCell className="font-mono text-slate-600 text-[11px]">
                        <div>{act.dueDate}</div>
                        {act.dueTime && <div className="text-slate-400 text-[10px]">{act.dueTime}</div>}
                      </TableCell>

                      {/* Cột 5: Ưu tiên */}
                      <TableCell>
                        {renderPriorityBadge(act.priority)}
                      </TableCell>

                      {/* Cột 6: Trạng thái */}
                      <TableCell>
                        <Badge className={`${statusInfo.className} text-[11px]`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      {/* Cột 7: Thao tác */}
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          {act.status !== 'COMPLETED' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleComplete(act)}
                              className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Đánh dấu hoàn thành"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(act)}
                            className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(act.id, act.subject)}
                            className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50"
                            title="Xóa hoạt động"
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
        {!loading && activities.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Hiển thị <span className="font-bold text-slate-800">{page * pageSize + 1}</span> -{' '}
              <span className="font-bold text-slate-800">{Math.min((page + 1) * pageSize, totalElements)}</span> trong tổng số{' '}
              <span className="font-bold text-slate-800">{totalElements}</span> hoạt động
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

      {/* ── Create / Edit Activity Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingAct ? 'Chỉnh sửa Hoạt động' : 'Thêm Hoạt Động Mới'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Lên lịch cuộc gọi, sự kiện hội họp hoặc nhiệm vụ chăm sóc
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveActivity} className="p-6 space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Tiêu đề hoạt động <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                placeholder="Ví dụ: Gọi điện thảo luận hợp đồng bản quyền phần mềm"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-9 text-xs border-slate-200 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Loại hình</Label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALL">Cuộc gọi (Call)</SelectItem>
                    <SelectItem value="MEETING">Lịch họp (Meeting)</SelectItem>
                    <SelectItem value="TASK">Nhiệm vụ (Task)</SelectItem>
                    <SelectItem value="EMAIL">Gửi Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Mức độ ưu tiên</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">Cao (High)</SelectItem>
                    <SelectItem value="MEDIUM">Trung bình</SelectItem>
                    <SelectItem value="LOW">Thấp (Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Trạng thái</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                    <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Ngày đến hạn</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Thời gian</Label>
                <Input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Doanh nghiệp liên quan</Label>
                <Input
                  placeholder="Nhập tên doanh nghiệp..."
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Người liên hệ</Label>
                <Input
                  placeholder="Nhập người đại diện..."
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Mô tả &amp; Chi tiết nội dung</Label>
              <textarea
                rows={3}
                placeholder="Chuẩn bị tài liệu slide giới thiệu và demo tính năng quản trị bảo mật..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 mt-1 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
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
                <span>{editingAct ? 'Lưu Thay Đổi' : 'Tạo Hoạt Động'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
