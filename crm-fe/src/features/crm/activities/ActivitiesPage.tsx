import React, { useState, useEffect, useCallback } from 'react';
import {
  mockActivitiesApi,
  ActivityItem,
  ActivityType,
  ActivityPriority,
  ActivityStatus,
  ACTIVITY_TYPE_CONFIG,
} from '@/services/mock/mockActivitiesData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DatePicker } from '@/components/ui/date-picker';
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
  Save,
  Building2,
  Phone,
  Mail,
  Users,
  CheckSquare,
} from 'lucide-react';

const TYPE_ICON_MAP: Record<ActivityType, any> = {
  CALL: Phone,
  MEETING: Users,
  TASK: CheckSquare,
  EMAIL: Mail,
};

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
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
      const res = await mockActivitiesApi.list({
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
    setAssignedTo('Phạm Tuấn Vũ');
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
        await mockActivitiesApi.update(editingAct.id, {
          subject,
          type,
          priority,
          status,
          dueDate: dueDate || new Date().toISOString().split('T')[0],
          dueTime,
          accountName,
          contactName,
          assignedTo,
          description,
        });
        toast.success('Đã cập nhật hoạt động thành công!');
      } else {
        await mockActivitiesApi.create({
          subject,
          type,
          priority,
          status,
          dueDate: dueDate || new Date().toISOString().split('T')[0],
          dueTime,
          accountName,
          contactName,
          assignedTo,
          description,
        });
        toast.success('Đã tạo hoạt động mới thành công!');
      }
      setIsModalOpen(false);
      fetchActivities();
    } catch {
      toast.error('Không thể lưu hoạt động');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (id: string, currentStatus: ActivityStatus) => {
    try {
      await mockActivitiesApi.toggleComplete(id);
      toast.success(
        currentStatus === 'COMPLETED'
          ? 'Đã chuyển về trạng thái Chưa hoàn thành'
          : 'Đã đánh dấu Hoàn thành hoạt động!'
      );
      fetchActivities();
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string, subjectName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hoạt động "${subjectName}"?`)) return;
    try {
      await mockActivitiesApi.delete(id);
      toast.success(`Đã xóa hoạt động "${subjectName}"`);
      fetchActivities();
    } catch {
      toast.error('Không thể xóa hoạt động');
    }
  };

  // Metrics
  const pendingCount = activities.filter((a) => a.status === 'PENDING').length;
  const completedCount = activities.filter((a) => a.status === 'COMPLETED').length;
  const callMeetingCount = activities.filter((a) => a.type === 'CALL' || a.type === 'MEETING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            <span>Hoạt động & Lịch làm việc</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lên lịch cuộc gọi, cuộc họp, gửi email và theo dõi nhiệm vụ cần hoàn thành với khách hàng
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActivities}
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
            <span>Thêm Hoạt động</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng hoạt động</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalElements}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chờ xử lý</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đã hoàn thành</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cuộc gọi & Họp</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{callMeetingCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Card */}
      <Card className="border-slate-200 shadow-2xs bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, khách hàng, nhân viên..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-44">
                <SearchableSelect
                  placeholder="Lọc loại hoạt động..."
                  searchPlaceholder="Tìm loại..."
                  value={selectedType}
                  onValueChange={(val) => {
                    setSelectedType(val);
                    setPage(0);
                  }}
                  options={[
                    { label: 'Tất cả loại hình', value: 'ALL' },
                    { label: 'Cuộc gọi điện', value: 'CALL' },
                    { label: 'Cuộc họp / Gặp gỡ', value: 'MEETING' },
                    { label: 'Nhiệm vụ cần làm', value: 'TASK' },
                    { label: 'Gửi Email', value: 'EMAIL' },
                  ]}
                  className="h-9 text-xs"
                />
              </div>

              <div className="w-36">
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
                    { label: 'Ưu tiên Cao', value: 'HIGH' },
                    { label: 'Trung bình', value: 'MEDIUM' },
                    { label: 'Thấp', value: 'LOW' },
                  ]}
                  className="h-9 text-xs"
                />
              </div>

              <div className="w-40">
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
                    { label: 'Chờ xử lý', value: 'PENDING' },
                    { label: 'Đã hoàn thành', value: 'COMPLETED' },
                    { label: 'Đã hủy bỏ', value: 'CANCELLED' },
                  ]}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Đang tải danh sách hoạt động...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Calendar}
              title="Không có hoạt động nào"
              description="Thử thay đổi bộ lọc tìm kiếm hoặc thêm mới hoạt động/lịch hẹn đầu tiên."
              actionLabel="Thêm Hoạt động"
              onAction={handleOpenCreate}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="w-12 pl-5 py-3.5"></TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Tiêu đề Hoạt động</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Loại hình</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Khách hàng liên quan</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Hạn hoàn thành</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Mức độ ưu tiên</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {activities.map((act) => {
                  const typeObj = ACTIVITY_TYPE_CONFIG[act.type];
                  const Icon = TYPE_ICON_MAP[act.type] || CheckSquare;

                  return (
                    <TableRow key={act.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="pl-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(act.id, act.status)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            act.status === 'COMPLETED'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-blue-500 bg-white text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <span
                          className={`font-bold text-xs block ${
                            act.status === 'COMPLETED'
                              ? 'line-through text-slate-400'
                              : 'text-slate-900'
                          }`}
                        >
                          {act.subject}
                        </span>
                        {act.description && (
                          <span className="text-[11px] text-slate-400 mt-0.5 block truncate max-w-[300px]">
                            {act.description}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <Badge variant="outline" className={`text-[10px] gap-1 font-semibold ${typeObj.className}`}>
                          <Icon className="w-3 h-3" />
                          <span>{typeObj.label}</span>
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5">
                        {act.accountName ? (
                          <div>
                            <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{act.accountName}</span>
                            </p>
                            {act.contactName && (
                              <p className="text-[11px] text-slate-400 pl-4">{act.contactName}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Không gán</span>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{act.dueDate} {act.dueTime ? `(${act.dueTime})` : ''}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Phụ trách: {act.assignedTo}</span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        {renderPriorityBadge(act.priority)}
                      </TableCell>

                      <TableCell className="text-right pr-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(act)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(act.id, act.subject)}
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
        {!loading && activities.length > 0 && (
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

      {/* Add / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-white p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-2xl">
          <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {editingAct ? 'Chỉnh sửa Hoạt động' : 'Thêm Hoạt động Mới'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Lên lịch công việc, cuộc gọi hoặc cuộc hẹn gặp gỡ khách hàng
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveActivity} className="p-5 space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Tiêu đề Hoạt động *</Label>
              <Input
                placeholder="VD: Gọi điện xác nhận lịch demo với khách hàng"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Loại hình</Label>
                <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALL">Cuộc gọi điện</SelectItem>
                    <SelectItem value="MEETING">Cuộc họp / Gặp gỡ</SelectItem>
                    <SelectItem value="TASK">Nhiệm vụ cần làm</SelectItem>
                    <SelectItem value="EMAIL">Gửi Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Mức ưu tiên</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as ActivityPriority)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">Ưu tiên Cao</SelectItem>
                    <SelectItem value="MEDIUM">Trung bình</SelectItem>
                    <SelectItem value="LOW">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Trạng thái</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ActivityStatus)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                    <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Hạn ngày hoàn thành</Label>
                <DatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  placeholder="Chọn ngày hạn..."
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Giờ hẹn (Time)</Label>
                <Input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Khách hàng liên quan</Label>
                <Input
                  placeholder="VD: Tập đoàn Công nghệ FPT"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Người phụ trách</Label>
                <Input
                  placeholder="VD: Phạm Tuấn Vũ"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Ghi chú chi tiết</Label>
              <Input
                placeholder="Nội dung trao đổi hoặc địa điểm họp..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-9 text-xs"
              />
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
                <span>{editingAct ? 'Lưu Thay đổi' : 'Tạo Hoạt động'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
