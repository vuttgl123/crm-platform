import React, { useState, useEffect, useCallback } from 'react';
import {
  mockLeadsApi,
  LeadItem,
  LEAD_SOURCE_CONFIG,
} from '@/services/mock/mockLeadsData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/EmptyState';
import { renderLeadStatusBadge } from '@/config/crmStatusConfig';
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
  UserPlus,
  Flame,
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
  TrendingUp,
  Building2,
  ArrowRightCircle,
  Sparkles,
  Target,
} from 'lucide-react';

const RATING_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
  HOT: { label: 'NÓNG (Hot)', className: 'bg-rose-50 text-rose-700 border-rose-200 font-bold', icon: Flame },
  WARM: { label: 'ẤM (Warm)', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold', icon: TrendingUp },
  COLD: { label: 'LẠNH (Cold)', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: Target },
};

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [leadSource, setLeadSource] = useState<'WEBSITE' | 'EVENT' | 'REFERRAL' | 'COLD_CALL' | 'SOCIAL' | 'PARTNER'>('WEBSITE');
  const [status, setStatus] = useState<'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'UNQUALIFIED'>('NEW');
  const [rating, setRating] = useState<'HOT' | 'WARM' | 'COLD'>('HOT');
  const [estimatedRevenue, setEstimatedRevenue] = useState('');
  const [assignedTo, setAssignedTo] = useState('Phạm Tuấn Vũ');
  const [notes, setNotes] = useState('');
  const [city, setCity] = useState('Hà Nội');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mockLeadsApi.list({
        search: searchQuery,
        status: selectedStatus,
        leadSource: selectedSource,
        rating: selectedRating,
        page,
        size: pageSize,
      });
      setLeads(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Không thể tải danh sách khách hàng tiềm năng');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, selectedSource, selectedRating, page, pageSize]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedSource('ALL');
    setSelectedRating('ALL');
    setPage(0);
    fetchLeads();
  };

  const handleOpenCreate = () => {
    setEditingLead(null);
    setFullName('');
    setCompanyName('');
    setJobTitle('');
    setEmail('');
    setPhone('');
    setLeadSource('WEBSITE');
    setStatus('NEW');
    setRating('HOT');
    setEstimatedRevenue('');
    setNotes('');
    setCity('Hà Nội');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead: LeadItem) => {
    setEditingLead(lead);
    setFullName(lead.fullName);
    setCompanyName(lead.companyName);
    setJobTitle(lead.jobTitle);
    setEmail(lead.email);
    setPhone(lead.phone);
    setLeadSource(lead.leadSource);
    setStatus(lead.status);
    setRating(lead.rating);
    setEstimatedRevenue(lead.estimatedRevenue ? lead.estimatedRevenue.toString() : '');
    setAssignedTo(lead.assignedTo);
    setNotes(lead.notes || '');
    setCity(lead.city);
    setIsModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Vui lòng nhập họ tên và email');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingLead) {
        await mockLeadsApi.update(editingLead.id, {
          fullName,
          companyName,
          jobTitle,
          email,
          phone,
          leadSource,
          status,
          rating,
          estimatedRevenue: estimatedRevenue ? parseFloat(estimatedRevenue) : 0,
          assignedTo,
          notes,
          city,
        });
        toast.success('Đã cập nhật thông tin tiềm năng thành công!');
      } else {
        await mockLeadsApi.create({
          fullName,
          companyName: companyName || 'Khách hàng cá nhân',
          jobTitle: jobTitle || 'Đại diện',
          email,
          phone,
          leadSource,
          status,
          rating,
          estimatedRevenue: estimatedRevenue ? parseFloat(estimatedRevenue) : 0,
          assignedTo: assignedTo || 'Phạm Tuấn Vũ',
          notes,
          city: city || 'Hà Nội',
        });
        toast.success('Đã thêm khách hàng tiềm năng mới thành công!');
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch {
      toast.error('Không thể lưu thông tin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khách hàng tiềm năng "${name}"?`)) return;
    try {
      await mockLeadsApi.delete(id);
      toast.success(`Đã xóa tiềm năng "${name}"`);
      fetchLeads();
    } catch {
      toast.error('Không thể xóa tiềm năng');
    }
  };

  const handleConvert = async (lead: LeadItem) => {
    if (!window.confirm(`Chuyển đổi tiềm năng "${lead.fullName}" thành Khách hàng chính thức & Cơ hội?`)) return;
    try {
      await mockLeadsApi.convert(lead.id);
      toast.success(`Đã chuyển đổi thành công "${lead.fullName}" sang Khách hàng chính thức!`);
      fetchLeads();
    } catch {
      toast.error('Chuyển đổi thất bại');
    }
  };

  // KPI Metrics
  const hotCount = leads.filter((l) => l.rating === 'HOT').length;
  const qualifiedCount = leads.filter((l) => l.status === 'QUALIFIED').length;
  const convertedCount = leads.filter((l) => l.status === 'CONVERTED').length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0) +
    (selectedSource !== 'ALL' ? 1 : 0) +
    (selectedRating !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <UserPlus className="w-4.5 h-4.5 text-white" />
            </div>
            Quản lý Khách hàng Tiềm năng (Leads)
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Thu thập, phân loại mức độ quan tâm (Hot/Warm/Cold) và chuyển đổi thành Khách hàng
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeads}
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
            <span>Thêm Tiềm Năng Mới</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <UserPlus className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Tiềm năng</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-rose-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <Flame className="w-4.5 h-4.5 text-rose-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tiềm năng NÓNG (Hot)</div>
            <div className="text-lg font-black text-rose-700 leading-tight">{hotCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <Target className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đạt chuẩn tiềm năng</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">{qualifiedCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đã chuyển đổi</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">{convertedCount}</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo họ tên, công ty, email, số điện thoại..."
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
              <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="NEW">Mới tiếp nhận</SelectItem>
                  <SelectItem value="CONTACTED">Đã liên hệ</SelectItem>
                  <SelectItem value="QUALIFIED">Đạt chuẩn</SelectItem>
                  <SelectItem value="CONVERTED">Đã chuyển đổi</SelectItem>
                  <SelectItem value="UNQUALIFIED">Không đạt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-36">
              <Select value={selectedRating} onValueChange={(val) => { setSelectedRating(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Đánh giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả đánh giá</SelectItem>
                  <SelectItem value="HOT">NÓNG (Hot)</SelectItem>
                  <SelectItem value="WARM">ẤM (Warm)</SelectItem>
                  <SelectItem value="COLD">LẠNH (Cold)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-36">
              <Select value={selectedSource} onValueChange={(val) => { setSelectedSource(val); setPage(0); }}>
                <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Nguồn đến" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả nguồn</SelectItem>
                  <SelectItem value="WEBSITE">Website</SelectItem>
                  <SelectItem value="EVENT">Hội thảo &amp; Sự kiện</SelectItem>
                  <SelectItem value="REFERRAL">Giới thiệu</SelectItem>
                  <SelectItem value="COLD_CALL">Telesales</SelectItem>
                  <SelectItem value="SOCIAL">Mạng xã hội</SelectItem>
                  <SelectItem value="PARTNER">Đối tác</SelectItem>
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

      {/* ── Leads Table ── */}
      <Card className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4">Khách hàng Tiềm năng</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Công ty &amp; Chức danh</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Mức độ (Rating)</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Trạng thái</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Doanh thu dự kiến</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Nguồn</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 text-right pr-4">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Đang tải danh sách tiềm năng...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={UserPlus}
                      title="Không tìm thấy khách hàng tiềm năng nào"
                      description="Hãy thử thay đổi điều kiện lọc hoặc thêm tiềm năng mới."
                      actionLabel="Thêm Tiềm Năng"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => {
                  const ratingInfo = RATING_CONFIG[lead.rating] || RATING_CONFIG.HOT;
                  const RatingIcon = ratingInfo.icon;
                  return (
                    <TableRow key={lead.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                      {/* Cột 1: Họ tên */}
                      <TableCell className="pl-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {lead.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{lead.fullName}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="font-mono text-slate-400">{lead.id.toUpperCase()}</span>
                              <span>•</span>
                              <span className="font-mono">{lead.phone}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột 2: Công ty & Chức vụ */}
                      <TableCell>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{lead.companyName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{lead.jobTitle}</div>
                        </div>
                      </TableCell>

                      {/* Cột 3: Rating */}
                      <TableCell>
                        <Badge className={`${ratingInfo.className} gap-1 text-[11px] px-2 py-0.5`}>
                          <RatingIcon className="w-3 h-3" />
                          <span>{ratingInfo.label}</span>
                        </Badge>
                      </TableCell>

                      {/* Cột 4: Trạng thái */}
                      <TableCell>
                        {renderLeadStatusBadge(lead.status)}
                      </TableCell>

                      {/* Cột 5: Doanh thu dự kiến */}
                      <TableCell>
                        <div className="font-bold text-slate-900 font-mono">
                          {lead.estimatedRevenue ? `${lead.estimatedRevenue.toLocaleString('vi-VN')} ₫` : '—'}
                        </div>
                      </TableCell>

                      {/* Cột 6: Nguồn */}
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px]">
                          {LEAD_SOURCE_CONFIG[lead.leadSource]?.label || lead.leadSource}
                        </Badge>
                      </TableCell>

                      {/* Cột 7: Thao tác */}
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          {lead.status !== 'CONVERTED' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleConvert(lead)}
                              className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Chuyển đổi thành Khách hàng chính thức"
                            >
                              <ArrowRightCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(lead)}
                            className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(lead.id, lead.fullName)}
                            className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50"
                            title="Xóa tiềm năng"
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
        {!loading && leads.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Hiển thị <span className="font-bold text-slate-800">{page * pageSize + 1}</span> -{' '}
              <span className="font-bold text-slate-800">{Math.min((page + 1) * pageSize, totalElements)}</span> trong tổng số{' '}
              <span className="font-bold text-slate-800">{totalElements}</span> tiềm năng
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

      {/* ── Create / Edit Lead Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingLead ? 'Chỉnh sửa Khách hàng Tiềm năng' : 'Thêm Tiềm Năng Mới'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingLead ? `Mã: ${editingLead.id.toUpperCase()}` : 'Ghi nhận thông tin đầu mối kinh doanh và phân loại'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveLead} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Họ và tên người liên hệ <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="Ví dụ: Trần Quốc Toản"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Tên Doanh nghiệp / Tổ chức</Label>
                <Input
                  placeholder="Ví dụ: Công ty CP Công Nghệ ABC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Chức vụ</Label>
                <Input
                  placeholder="Ví dụ: Giám đốc Điều hành (CEO)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Tỉnh / Thành phố</Label>
                <Input
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Email <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="email"
                  placeholder="ceo@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Số điện thoại</Label>
                <Input
                  placeholder="0903 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Nguồn tiềm năng</Label>
                <Select value={leadSource} onValueChange={(val: any) => setLeadSource(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEBSITE">Website</SelectItem>
                    <SelectItem value="EVENT">Hội thảo / Sự kiện</SelectItem>
                    <SelectItem value="REFERRAL">Giới thiệu</SelectItem>
                    <SelectItem value="COLD_CALL">Telesales</SelectItem>
                    <SelectItem value="SOCIAL">Mạng xã hội</SelectItem>
                    <SelectItem value="PARTNER">Đối tác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Mức độ quan tâm</Label>
                <Select value={rating} onValueChange={(val: any) => setRating(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOT">NÓNG (Hot)</SelectItem>
                    <SelectItem value="WARM">ẤM (Warm)</SelectItem>
                    <SelectItem value="COLD">LẠNH (Cold)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Doanh thu dự kiến (VNĐ)</Label>
                <Input
                  type="number"
                  placeholder="50,000,000"
                  value={estimatedRevenue}
                  onChange={(e) => setEstimatedRevenue(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Trạng thái xử lý</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">Mới tiếp nhận</SelectItem>
                    <SelectItem value="CONTACTED">Đã liên hệ</SelectItem>
                    <SelectItem value="QUALIFIED">Đạt chuẩn tiềm năng</SelectItem>
                    <SelectItem value="CONVERTED">Đã chuyển đổi</SelectItem>
                    <SelectItem value="UNQUALIFIED">Không tiềm năng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Nhân viên phụ trách</Label>
                <Input
                  placeholder="Phạm Tuấn Vũ"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Ghi chú nhu cầu khách hàng</Label>
              <textarea
                rows={3}
                placeholder="Khách quan tâm gói Enterprise CRM và cần tư vấn trong tuần này..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                <span>{editingLead ? 'Lưu Thay Đổi' : 'Thêm Tiềm Năng'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
