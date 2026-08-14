import React, { useState, useEffect, useCallback } from 'react';
import {
  mockOpportunitiesApi,
  OpportunityItem,
  OpportunityStage,
  PIPELINE_STAGES,
} from '@/services/mock/mockOpportunitiesData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DatePicker } from '@/components/ui/date-picker';
import { EmptyState } from '@/components/common/EmptyState';
import { renderOpportunityStageBadge } from '@/config/crmStatusConfig';
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
  TrendingUp,
  Kanban,
  List,
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
  ArrowRight,
  User,
} from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'TABLE' | 'KANBAN'>('KANBAN');
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<OpportunityItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [dealName, setDealName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [contactName, setContactName] = useState('');
  const [amount, setAmount] = useState('');
  const [stage, setStage] = useState<OpportunityStage>('PROSPECTING');
  const [probability, setProbability] = useState('15');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Phạm Tuấn Vũ');
  const [description, setDescription] = useState('');
  const [nextStep, setNextStep] = useState('');

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      if (viewMode === 'KANBAN') {
        const data = await mockOpportunitiesApi.getAllForKanban();
        setOpportunities(data);
        setTotalElements(data.length);
      } else {
        const res = await mockOpportunitiesApi.list({
          search: searchQuery,
          stage: selectedStage,
          page,
          size: pageSize,
        });
        setOpportunities(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      }
    } catch {
      toast.error('Không thể tải danh sách cơ hội kinh doanh');
    } finally {
      setLoading(false);
    }
  }, [viewMode, searchQuery, selectedStage, page, pageSize]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleOpenCreate = () => {
    setEditingOpp(null);
    setDealName('');
    setAccountName('');
    setContactName('');
    setAmount('');
    setStage('PROSPECTING');
    setProbability('15');
    setExpectedCloseDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setAssignedTo('Phạm Tuấn Vũ');
    setDescription('');
    setNextStep('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (opp: OpportunityItem) => {
    setEditingOpp(opp);
    setDealName(opp.dealName);
    setAccountName(opp.accountName);
    setContactName(opp.contactName);
    setAmount(opp.amount ? opp.amount.toString() : '');
    setStage(opp.stage);
    setProbability(opp.probability.toString());
    setExpectedCloseDate(opp.expectedCloseDate);
    setAssignedTo(opp.assignedTo);
    setDescription(opp.description || '');
    setNextStep(opp.nextStep || '');
    setIsModalOpen(true);
  };

  const handleStageChange = (newStage: OpportunityStage) => {
    setStage(newStage);
    const stageObj = PIPELINE_STAGES.find((s) => s.id === newStage);
    if (stageObj) {
      setProbability(stageObj.defaultProb.toString());
    }
  };

  const handleSaveOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealName.trim() || !amount.trim()) {
      toast.error('Vui lòng nhập tên cơ hội và giá trị hợp đồng');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingOpp) {
        await mockOpportunitiesApi.update(editingOpp.id, {
          dealName,
          accountName: accountName || 'Khách hàng chưa gán',
          contactName: contactName || 'Chưa gán',
          amount: Number(amount) || 0,
          stage,
          probability: Number(probability) || 0,
          expectedCloseDate,
          assignedTo,
          description,
          nextStep,
        });
        toast.success('Đã cập nhật cơ hội kinh doanh thành công!');
      } else {
        await mockOpportunitiesApi.create({
          dealName,
          accountId: 'acc-custom',
          accountName: accountName || 'Khách hàng mới',
          contactName: contactName || 'Chưa gán',
          amount: Number(amount) || 0,
          stage,
          probability: Number(probability) || 0,
          expectedCloseDate,
          assignedTo,
          description,
          nextStep,
        });
        toast.success('Đã tạo cơ hội kinh doanh mới thành công!');
      }
      setIsModalOpen(false);
      fetchOpportunities();
    } catch {
      toast.error('Không thể lưu cơ hội');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceStage = async (oppId: string, currentStage: OpportunityStage) => {
    const currentIndex = PIPELINE_STAGES.findIndex((s) => s.id === currentStage);
    if (currentIndex < PIPELINE_STAGES.length - 2) {
      const nextStage = PIPELINE_STAGES[currentIndex + 1].id;
      try {
        await mockOpportunitiesApi.updateStage(oppId, nextStage);
        toast.success(`Đã chuyển giai đoạn sang "${PIPELINE_STAGES[currentIndex + 1].title}"`);
        fetchOpportunities();
      } catch {
        toast.error('Không thể cập nhật giai đoạn');
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa cơ hội "${name}"?`)) return;
    try {
      await mockOpportunitiesApi.delete(id);
      toast.success(`Đã xóa cơ hội "${name}"`);
      fetchOpportunities();
    } catch {
      toast.error('Không thể xóa cơ hội');
    }
  };

  // Metrics
  const totalPipeline = opportunities.reduce((sum, o) => sum + (o.amount || 0), 0);
  const weightedPipeline = opportunities.reduce((sum, o) => sum + (o.amount * o.probability) / 100, 0);
  const wonCount = opportunities.filter((o) => o.stage === 'CLOSED_WON').length;
  const wonValue = opportunities
    .filter((o) => o.stage === 'CLOSED_WON')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <span>Cơ hội kinh doanh (Pipeline)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi phễu doanh thu, tiến độ thương thảo và quản trị dự báo bán hàng theo từng giai đoạn Deal
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Button
              variant={viewMode === 'KANBAN' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('KANBAN')}
              className={`h-7 px-2.5 text-xs font-semibold gap-1 rounded-lg ${
                viewMode === 'KANBAN' ? 'bg-white text-slate-900 shadow-2xs hover:bg-white' : 'text-slate-600'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </Button>
            <Button
              variant={viewMode === 'TABLE' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('TABLE')}
              className={`h-7 px-2.5 text-xs font-semibold gap-1 rounded-lg ${
                viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-2xs hover:bg-white' : 'text-slate-600'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Bảng</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchOpportunities}
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
            <span>Thêm Cơ hội Mới</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng giá trị Pipeline</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {(totalPipeline / 1000000000).toFixed(2)} tỷ ₫
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
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dự báo theo xác suất</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">
                {(weightedPipeline / 1000000000).toFixed(2)} tỷ ₫
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chốt thành công (Won)</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {(wonValue / 1000000000).toFixed(2)} tỷ ₫
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số lượng Deals</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{totalElements} ({wonCount} Won)</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Kanban className="w-5 h-5" />
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
                placeholder="Tìm kiếm theo tên cơ hội, doanh nghiệp, người phụ trách..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-52">
                <SearchableSelect
                  placeholder="Lọc giai đoạn..."
                  searchPlaceholder="Tìm giai đoạn..."
                  value={selectedStage}
                  onValueChange={(val) => {
                    setSelectedStage(val);
                    setPage(0);
                  }}
                  options={[
                    { label: 'Tất cả giai đoạn', value: 'ALL' },
                    ...PIPELINE_STAGES.map((s) => ({ label: s.title, value: s.id })),
                  ]}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Rendering: KANBAN vs TABLE */}
      {viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
          {PIPELINE_STAGES.map((stageObj) => {
            const stageOpps = opportunities.filter((o) => o.stage === stageObj.id);
            const stageTotal = stageOpps.reduce((sum, o) => sum + (o.amount || 0), 0);

            return (
              <div
                key={stageObj.id}
                className={`rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 space-y-3 border-t-4 ${stageObj.colorClass}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{stageObj.title}</h4>
                    <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                      {(stageTotal / 1000000).toFixed(0)}M ₫ ({stageOpps.length})
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold bg-white text-slate-700">
                    {stageObj.defaultProb}%
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 min-h-[300px]">
                  {stageOpps.map((opp) => (
                    <Card
                      key={opp.id}
                      className="border-slate-200/80 shadow-2xs bg-white hover:shadow-md hover:border-blue-200 transition-all rounded-xl cursor-pointer group"
                      onClick={() => handleOpenEdit(opp)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {opp.dealName}
                          </h5>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium truncate">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{opp.accountName}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-xs font-black text-blue-700">
                            {(opp.amount / 1000000).toFixed(0)} Triệu ₫
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {opp.expectedCloseDate.slice(5)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${opp.probability}%` }}
                          />
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                          <span className="truncate max-w-[90px]">{opp.assignedTo}</span>
                          {opp.stage !== 'CLOSED_WON' && opp.stage !== 'CLOSED_LOST' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Chuyển sang giai đoạn tiếp theo"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdvanceStage(opp.id, opp.stage);
                              }}
                              className="h-5 px-1.5 text-[10px] text-blue-600 hover:bg-blue-50 gap-0.5"
                            >
                              <span>Tiếp theo</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {stageOpps.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-[11px]">
                      Chưa có cơ hội
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="border-slate-200 shadow-2xs bg-white overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
              <span className="text-xs font-semibold">Đang tải danh sách cơ hội...</span>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={TrendingUp}
                title="Không có cơ hội kinh doanh nào"
                description="Thử thay đổi bộ lọc tìm kiếm hoặc tạo mới cơ hội bán hàng đầu tiên."
                actionLabel="Thêm Cơ hội Mới"
                onAction={handleOpenCreate}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-slate-700 py-3.5 pl-5">Tên Cơ hội</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 py-3.5">Khách hàng & Liên hệ</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 py-3.5">Giá trị hợp đồng</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 py-3.5">Giai đoạn & Xác suất</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 py-3.5">Ngày kỳ vọng</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 py-3.5 text-right pr-5">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {opportunities.map((opp) => (
                    <TableRow key={opp.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="pl-5 py-3.5">
                        <span className="font-bold text-slate-900 text-xs block">{opp.dealName}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">{opp.description || 'Không có mô tả'}</span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{opp.accountName}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 pl-5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{opp.contactName}</span>
                        </p>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <p className="text-xs font-bold text-blue-700">
                          {opp.amount.toLocaleString('vi-VN')} ₫
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Phụ trách: {opp.assignedTo}</p>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="space-y-1">
                          {renderOpportunityStageBadge(opp.stage)}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                            <span>{opp.probability}%</span>
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${opp.probability}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{opp.expectedCloseDate}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right pr-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(opp)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(opp.id, opp.dealName)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && opportunities.length > 0 && (
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
      )}

      {/* Add / Edit Opportunity Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-white p-0 gap-0 overflow-hidden font-sans border-slate-200 shadow-xl rounded-2xl">
          <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  {editingOpp ? 'Chỉnh sửa Cơ hội Kinh doanh' : 'Thêm Cơ hội Kinh doanh Mới'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Thiết lập giá trị hợp đồng, xác suất chốt và tiến trình bán hàng
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveOpportunity} className="p-5 space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Tên Cơ hội Kinh doanh *</Label>
              <Input
                placeholder="VD: Gói triển khai CRM Enterprise 2026"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
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
                <Label className="font-bold text-slate-700 text-xs">Người liên hệ chính</Label>
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
                <Label className="font-bold text-slate-700 text-xs">Giá trị Deal (VNĐ) *</Label>
                <Input
                  type="number"
                  placeholder="VD: 1500000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Giai đoạn Phễu</Label>
                <Select value={stage} onValueChange={(v) => handleStageChange(v as OpportunityStage)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Xác suất (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700 text-xs">Ngày kỳ vọng chốt Deal</Label>
                <DatePicker
                  value={expectedCloseDate}
                  onChange={setExpectedCloseDate}
                  placeholder="Chọn ngày dự kiến..."
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

            <div className="space-y-1.5">
              <Label className="font-bold text-slate-700 text-xs">Bước hành động tiếp theo</Label>
              <Input
                placeholder="VD: Họp rà soát hợp đồng pháp lý vào Thứ Hai tuần tới..."
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
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
                <span>{editingOpp ? 'Lưu Thay đổi' : 'Tạo Cơ hội'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
