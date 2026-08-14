import React, { useState, useEffect, useCallback } from 'react';
import {
  mockLeadsApi,
  LeadItem,
  LEAD_SOURCE_CONFIG,
} from '@/services/mock/mockLeadsData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { EmptyState } from '@/components/common/EmptyState';
import {
  renderLeadStatusBadge,
} from '@/config/crmStatusConfig';
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
  Save,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Building2,
  Mail,
  Phone,
  ArrowRightCircle,
} from 'lucide-react';

const RATING_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
  HOT: { label: 'NÓNG (Hot)', className: 'bg-rose-50 text-rose-700 border-rose-200 font-bold', icon: Flame },
  WARM: { label: 'ẤM (Warm)', className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold', icon: TrendingUp },
  COLD: { label: 'LẠNH (Cold)', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: CheckCircle2 },
};

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
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
      toast.error('Không thể tải danh sách Leads');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, selectedSource, selectedRating, page, pageSize]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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
    setAssignedTo('Phạm Tuấn Vũ');
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
    if (!fullName.trim() || !companyName.trim()) {
      toast.error('Vui lòng nhập họ tên và tên công ty');
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
          estimatedRevenue: Number(estimatedRevenue) || 0,
          assignedTo,
          notes,
          city,
        });
        toast.success('Đã cập nhật thông tin tiềm năng thành công!');
      } else {
        await mockLeadsApi.create({
          fullName,
          companyName,
          jobTitle,
          email,
          phone,
          leadSource,
          status,
          rating,
          estimatedRevenue: Number(estimatedRevenue) || 0,
          assignedTo,
          notes,
          city,
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

  const handleConvertLead = async (lead: LeadItem) => {
    if (!window.confirm(`Chuyển đổi tiềm năng "${lead.fullName} (${lead.companyName})" thành Khách hàng chính thức & Cơ hội kinh doanh?`)) {
      return;
    }

    try {
      await mockLeadsApi.convert(lead.id);
      toast.success(`Đã chuyển đổi thành công tiềm năng "${lead.fullName}"!`);
      fetchLeads();
    } catch {
      toast.error('Không thể chuyển đổi Lead');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tiềm năng "${name}"?`)) return;
    try {
      await mockLeadsApi.delete(id);
      toast.success(`Đã xóa tiềm năng "${name}"`);
      fetchLeads();
    } catch {
      toast.error('Không thể xóa tiềm năng');
    }
  };

  const hotCount = leads.filter((l) => l.rating === 'HOT').length;
  const newCount = leads.filter((l) => l.status === 'NEW').length;
  const totalPipeline = leads.reduce((sum, l) => sum + (l.estimatedRevenue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-blue-600" />
            <span>Khách hàng tiềm năng (Leads)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi, đánh giá và nuôi dưỡng các cơ hội tiềm năng từ nguồn tiếp thị đến chốt hợp đồng
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeads}
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
            <span>Thêm Tiềm năng Mới</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số Leads</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalElements}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiềm năng Nóng (Hot)</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{hotCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-rose-500 text-rose-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mới tiếp nhận</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{newCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng giá trị dự kiến</p>
              <h3 className="text-xl font-black text-emerald-600 mt-1">
                {(totalPipeline / 1000000000).toFixed(2)} tỷ ₫
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
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
                placeholder="Tìm kiếm theo họ tên, công ty, email, số điện thoại..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
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
                    { label: 'Mới tiếp nhận', value: 'NEW' },
                    { label: 'Đã liên hệ', value: 'CONTACTED' },
                    { label: 'Đạt chuẩn tiềm năng', value: 'QUALIFIED' },
                    { label: 'Đã chuyển đổi', value: 'CONVERTED' },
                    { label: 'Không tiềm năng', value: 'UNQUALIFIED' },
                  ]}
                  className="h-9 text-xs"
                />
              </div>

              <div className="w-44">
                <SearchableSelect
                  placeholder="Lọc nguồn lead..."
                  searchPlaceholder="Tìm nguồn..."
                  value={selectedSource}
                  onValueChange={(val) => {
                    setSelectedSource(val);
                    setPage(0);
                  }}
                  options={[
                    { label: 'Tất cả nguồn Lead', value: 'ALL' },
                    { label: 'Website / Landing Page', value: 'WEBSITE' },
                    { label: 'Sự kiện / Hội thảo', value: 'EVENT' },
                    { label: 'Khách hàng giới thiệu', value: 'REFERRAL' },
                    { label: 'Telesale / Gọi điện', value: 'COLD_CALL' },
                    { label: 'Mạng xã hội', value: 'SOCIAL' },
                    { label: 'Kênh đối tác', value: 'PARTNER' },
                  ]}
                  className="h-9 text-xs"
                />
              </div>

              <div className="w-36">
                <SearchableSelect
                  placeholder="Lọc mức độ..."
                  searchPlaceholder="Tìm mức độ..."
                  value={selectedRating}
                  onValueChange={(val) => {
                    setSelectedRating(val);
                    setPage(0);
                  }}
                  options={[
                    { label: 'Tất cả mức độ', value: 'ALL' },
                    { label: 'Nóng (Hot)', value: 'HOT' },
                    { label: 'Ấm (Warm)', value: 'WARM' },
                    { label: 'Lạnh (Cold)', value: 'COLD' },
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
            <span className="text-xs font-semibold">Đang tải danh sách khách hàng tiềm năng...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={UserPlus}
              title="Không tìm thấy tiềm năng nào"
              description="Thử thay đổi điều kiện tìm kiếm hoặc thêm mới tiềm năng đầu tiên."
              actionLabel="Thêm Tiềm năng Mới"
              onAction={handleOpenCreate}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Họ & Tên Tiềm năng</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Doanh nghiệp & Chức danh</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Nguồn & Mức độ</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Giá trị dự kiến</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5">Trạng thái</TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {leads.map((lead) => {
                  const ratingObj = RATING_CONFIG[lead.rating] || RATING_CONFIG.HOT;
                  const RatingIcon = ratingObj.icon;
                  const sourceObj = LEAD_SOURCE_CONFIG[lead.leadSource];

                  return (
                    <TableRow key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="pl-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100/80 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {lead.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{lead.fullName}</span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {lead.email}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {lead.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{lead.companyName}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 pl-5">{lead.jobTitle} • {lead.city}</p>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="space-y-1">
                          <Badge variant="outline" className={`text-[10px] font-semibold ${sourceObj?.className || ''}`}>
                            {sourceObj?.label || lead.leadSource}
                          </Badge>
                          <div>
                            <Badge variant="outline" className={`text-[10px] gap-1 px-1.5 py-0 ${ratingObj.className}`}>
                              <RatingIcon className="w-3 h-3" />
                              <span>{ratingObj.label}</span>
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <p className="text-xs font-bold text-slate-900">
                          {lead.estimatedRevenue ? `${lead.estimatedRevenue.toLocaleString('vi-VN')} ₫` : 'Chưa định giá'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Phụ trách: {lead.assignedTo}</p>
                      </TableCell>

                      <TableCell className="py-3.5">
                        {renderLeadStatusBadge(lead.status)}
                      </TableCell>

                      <TableCell className="text-right pr-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {lead.status !== 'CONVERTED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Chuyển đổi thành Khách hàng & Cơ hội"
                              onClick={() => handleConvertLead(lead)}
                              className="h-8 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 gap-1"
                            >
                              <ArrowRightCircle className="w-3.5 h-3.5" />
                              <span>Chuyển đổi</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(lead)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(lead.id, lead.fullName)}
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
        {!loading && leads.length > 0 && (
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

      {/* Add / Edit Lead Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-white p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-2xl">
          <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {editingLead ? 'Chỉnh sửa Khách hàng Tiềm năng' : 'Thêm Tiềm năng Mới'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Nhập thông tin đầu mối kinh doanh và phân loại nguồn tiếp thị
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveLead} className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Họ và tên *</Label>
                <Input
                  placeholder="VD: Nguyễn Văn Hùng"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Doanh nghiệp / Tổ chức *</Label>
                <Input
                  placeholder="VD: Công ty CP Vận tải Biển Đông"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Chức danh</Label>
                <Input
                  placeholder="VD: Giám đốc Điều hành"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Tỉnh / Thành phố</Label>
                <Input
                  placeholder="VD: Hải Phòng"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Email liên hệ</Label>
                <Input
                  type="email"
                  placeholder="VD: hung.nguyen@company.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Số điện thoại</Label>
                <Input
                  placeholder="VD: 0908 123 789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Nguồn Tiềm năng</Label>
                <Select value={leadSource} onValueChange={(v) => setLeadSource(v as any)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEBSITE">Website / Landing</SelectItem>
                    <SelectItem value="EVENT">Sự kiện / Hội thảo</SelectItem>
                    <SelectItem value="REFERRAL">Khách giới thiệu</SelectItem>
                    <SelectItem value="COLD_CALL">Telesale</SelectItem>
                    <SelectItem value="SOCIAL">Mạng xã hội</SelectItem>
                    <SelectItem value="PARTNER">Đối tác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Mức độ quan tâm</Label>
                <Select value={rating} onValueChange={(v) => setRating(v as any)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOT">NÓNG (Hot)</SelectItem>
                    <SelectItem value="WARM">ẤM (Warm)</SelectItem>
                    <SelectItem value="COLD">LẠNH (Cold)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Trạng thái</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">Mới tiếp nhận</SelectItem>
                    <SelectItem value="CONTACTED">Đã liên hệ</SelectItem>
                    <SelectItem value="QUALIFIED">Đạt chuẩn</SelectItem>
                    <SelectItem value="CONVERTED">Đã chuyển đổi</SelectItem>
                    <SelectItem value="UNQUALIFIED">Không tiềm năng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Giá trị dự kiến (VNĐ)</Label>
                <Input
                  type="number"
                  placeholder="VD: 450000000"
                  value={estimatedRevenue}
                  onChange={(e) => setEstimatedRevenue(e.target.value)}
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

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Ghi chú nhu cầu</Label>
              <Input
                placeholder="Ghi chú thêm về nhu cầu phần mềm hoặc lịch hẹn..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                <span>{editingLead ? 'Lưu Thay đổi' : 'Tạo Tiềm năng'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
