import React, { useState, useEffect, useCallback } from 'react';
import {
  opportunityApi,
  OpportunityItem,
  OpportunityStage,
  PIPELINE_STAGES,
} from '@/services/api/opportunityApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/EmptyState';
import { renderOpportunityStageBadge } from '@/config/crmStatusConfig';
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
  ChevronsLeft,
  ChevronsRight,
  X,
  RotateCcw,
  DollarSign,
  Building2,
  Trophy,
  Target,
  ArrowRight,
} from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'TABLE' | 'KANBAN'>('TABLE');
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
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
        const data = await opportunityApi.getAllForKanban();
        setOpportunities(data);
        setTotalElements(data.length);
      } else {
        const res = await opportunityApi.list({
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
      toast.error('Không thể tải danh sách cơ hội bán hàng');
    } finally {
      setLoading(false);
    }
  }, [viewMode, searchQuery, selectedStage, page, pageSize]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStage('ALL');
    setPage(0);
    fetchOpportunities();
  };

  const handleOpenCreate = () => {
    setEditingOpp(null);
    setDealName('');
    setAccountName('');
    setContactName('');
    setAmount('');
    setStage('PROSPECTING');
    setProbability('15');
    setExpectedCloseDate('');
    setDescription('');
    setNextStep('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (opp: OpportunityItem) => {
    setEditingOpp(opp);
    setDealName(opp.dealName);
    setAccountName(opp.accountName || '');
    setContactName(opp.contactName || '');
    setAmount(opp.amount.toString());
    setStage(opp.stage);
    setProbability(opp.probability.toString());
    setExpectedCloseDate(opp.expectedCloseDate);
    setAssignedTo(opp.assignedTo);
    setDescription(opp.description || '');
    setNextStep(opp.nextStep || '');
    setIsModalOpen(true);
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
        await opportunityApi.update(editingOpp.id, {
          version: editingOpp.version || 1,
          dealName,
          accountName,
          contactName,
          amount: parseFloat(amount),
          stage,
          probability: parseInt(probability, 10),
          expectedCloseDate,
          assignedTo,
          description,
          nextStep,
        });
        toast.success('Đã cập nhật cơ hội bán hàng thành công!');
      } else {
        await opportunityApi.create({
          dealName,
          accountId: 'acc-custom',
          accountName: accountName || 'Khách hàng chưa gán',
          contactName: contactName || 'Chưa chọn',
          amount: parseFloat(amount),
          stage,
          probability: parseInt(probability, 10),
          expectedCloseDate: expectedCloseDate || new Date().toISOString().split('T')[0],
          assignedTo: assignedTo || 'Phạm Tuấn Vũ',
          description,
          nextStep,
        });
        toast.success('Đã thêm cơ hội bán hàng mới thành công!');
      }
      setIsModalOpen(false);
      fetchOpportunities();
    } catch {
      toast.error('Không thể lưu thông tin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa cơ hội "${name}"?`)) return;
    try {
      await opportunityApi.delete(id);
      toast.success(`Đã xóa cơ hội "${name}"`);
      fetchOpportunities();
    } catch {
      toast.error('Không thể xóa cơ hội');
    }
  };

  const handleAdvanceStage = async (deal: OpportunityItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const stageIndex = PIPELINE_STAGES.findIndex((s) => s.id === deal.stage);
    if (stageIndex >= PIPELINE_STAGES.length - 1) return;
    const nextStage = PIPELINE_STAGES[stageIndex + 1];

    try {
      await opportunityApi.update(deal.id, {
        ...deal,
        stage: nextStage.id,
        probability: nextStage.defaultProb,
      });

      if (nextStage.id === 'PROPOSAL') {
        toast.success(`⚡ Workflow Automation: Đã chuyển sang "${nextStage.title}" và tự động kích hoạt tạo nhiệm vụ 'Soạn báo giá'`);
      } else if (nextStage.id === 'CLOSED_WON') {
        toast.success(`🎉 Chúc mừng! Đã chuyển sang "Ký kết Thành công" và tự động kích hoạt Workflow khởi tạo Đơn hàng / Hợp đồng mới`);
      } else {
        toast.success(`Đã chuyển cơ hội sang "${nextStage.title}"`);
      }
      fetchOpportunities();
    } catch {
      toast.error('Không thể cập nhật giai đoạn cơ hội');
    }
  };

  // KPI Metrics
  const totalPipelineAmount = opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
  const closedWonList = opportunities.filter((o) => o.stage === 'CLOSED_WON');
  const closedWonAmount = closedWonList.reduce((sum, opp) => sum + (opp.amount || 0), 0);
  const inProgressCount = opportunities.filter((o) => o.stage !== 'CLOSED_WON' && o.stage !== 'CLOSED_LOST').length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedStage !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-5 pb-12 font-sans w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <TrendingUp className="w-4.5 h-4.5 text-white" />
            </div>
            Quản lý Cơ hội Bán hàng (Opportunities)
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Theo dõi đường ống phễu bán hàng (Pipeline), xác suất chốt hợp đồng và dự báo doanh số
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Bảng</span>
            </button>
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'KANBAN'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchOpportunities}
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
            <span>Thêm Cơ hội Mới</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Tổng Cơ hội</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{totalElements}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Giá trị Pipeline</div>
            <div className="text-lg font-black text-indigo-700 leading-tight">
              {(totalPipelineAmount / 1_000_000).toFixed(0)} Tr ₫
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <Trophy className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Doanh số Đã chốt</div>
            <div className="text-lg font-black text-emerald-700 leading-tight">
              {(closedWonAmount / 1_000_000).toFixed(0)} Tr ₫
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-purple-100 px-4 py-3 flex items-center gap-3 shadow-xs hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Target className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Đang triển khai</div>
            <div className="text-lg font-black text-purple-700 leading-tight">{inProgressCount}</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      {viewMode === 'TABLE' && (
        <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Tìm kiếm theo tên cơ hội, doanh nghiệp, người phụ trách..."
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
              <div className="w-48">
                <Select value={selectedStage} onValueChange={(val) => { setSelectedStage(val); setPage(0); }}>
                  <SelectTrigger className="h-8.5 text-xs bg-slate-50/60 border-slate-200 rounded-lg">
                    <SelectValue placeholder="Giai đoạn phễu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả giai đoạn</SelectItem>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title} ({s.defaultProb}%)
                      </SelectItem>
                    ))}
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
      )}

      {/* ── Main View: Table vs Kanban ── */}
      {viewMode === 'TABLE' ? (
        <Card className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                  <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4">Tên Cơ hội &amp; Mã số</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Doanh nghiệp</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Giai đoạn Phễu</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Giá trị Hợp đồng</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Xác suất</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">Dự kiến chốt</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 text-right pr-4">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="text-xs">Đang tải danh sách cơ hội...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : opportunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0">
                      <EmptyState
                        icon={TrendingUp}
                        title="Không tìm thấy cơ hội bán hàng nào"
                        description="Hãy thử thay đổi bộ lọc hoặc tạo thêm cơ hội kinh doanh mới."
                        actionLabel="Thêm Cơ Hội"
                        onAction={handleOpenCreate}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  opportunities.map((opp) => (
                    <TableRow key={opp.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                      {/* Cột 1: Tên cơ hội */}
                      <TableCell className="pl-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{opp.dealName}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{opp.id.toUpperCase()}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột 2: Khách hàng */}
                      <TableCell>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{opp.accountName}</span>
                          </div>
                          {opp.contactName && (
                            <div className="text-[11px] text-slate-500 mt-0.5">{opp.contactName}</div>
                          )}
                        </div>
                      </TableCell>

                      {/* Cột 3: Giai đoạn */}
                      <TableCell>
                        {renderOpportunityStageBadge(opp.stage)}
                      </TableCell>

                      {/* Cột 4: Giá trị */}
                      <TableCell>
                        <div className="font-bold text-slate-900 font-mono text-xs">
                          {opp.amount.toLocaleString('vi-VN')} ₫
                        </div>
                      </TableCell>

                      {/* Cột 5: Xác suất */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all"
                              style={{ width: `${opp.probability}%` }}
                            />
                          </div>
                          <span className="font-mono font-semibold text-[11px] text-slate-700">{opp.probability}%</span>
                        </div>
                      </TableCell>

                      {/* Cột 6: Dự kiến chốt */}
                      <TableCell className="text-slate-600 font-mono text-[11px]">
                        {new Date(opp.expectedCloseDate).toLocaleDateString('vi-VN')}
                      </TableCell>

                      {/* Cột 7: Thao tác */}
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(opp)}
                            className="h-7 w-7 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Chỉnh sửa cơ hội"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(opp.id, opp.dealName)}
                            className="h-7 w-7 text-slate-600 hover:text-red-600 hover:bg-red-50"
                            title="Xóa cơ hội"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination Bar ── */}
          {!loading && opportunities.length > 0 && (
            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Hiển thị <span className="font-bold text-slate-800">{page * pageSize + 1}</span> -{' '}
                <span className="font-bold text-slate-800">{Math.min((page + 1) * pageSize, totalElements)}</span> trong tổng số{' '}
                <span className="font-bold text-slate-800">{totalElements}</span> cơ hội
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
      ) : (
        /* ── Kanban View ── */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((s) => {
            const stageDeals = opportunities.filter((o) => o.stage === s.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0);

            return (
              <div key={s.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-2.5 flex flex-col min-w-[220px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 mb-2.5">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{s.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(stageTotal / 1_000_000).toFixed(0)} Tr ₫
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-white text-slate-700 border-slate-200 text-[10px] px-1.5 py-0 font-bold">
                    {stageDeals.length}
                  </Badge>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-[600px] pr-0.5">
                  {stageDeals.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-[11px] italic">
                      Không có deal
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => handleOpenEdit(deal)}
                        className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all cursor-pointer space-y-1.5"
                      >
                        <div className="font-bold text-xs text-slate-900 hover:text-blue-600 line-clamp-1">
                          {deal.dealName}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{deal.accountName}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[11px]">
                          <span className="font-bold text-slate-900 font-mono">
                            {(deal.amount / 1_000_000).toFixed(0)} Tr
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-[10px]">{deal.expectedCloseDate}</span>
                            {deal.stage !== 'CLOSED_WON' && deal.stage !== 'CLOSED_LOST' && (
                              <button
                                onClick={(e) => handleAdvanceStage(deal, e)}
                                className="p-0.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors ml-1"
                                title="Chuyển sang giai đoạn tiếp theo (Workflow Trigger)"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Opportunity Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-slate-200 shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingOpp ? 'Chỉnh sửa Cơ hội Bán hàng' : 'Thêm Cơ Hội Bán Hàng Mới'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingOpp ? `Mã: ${editingOpp.id.toUpperCase()}` : 'Thiết lập phễu cơ hội và dự báo doanh thu tiềm năng'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveOpportunity} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Tên thương vụ / Cơ hội <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="Ví dụ: Triển khai Hệ thống CRM Enterprise 2026"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>

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
                <Label className="text-xs font-semibold text-slate-700">Người liên hệ chính</Label>
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
                  Giá trị Hợp đồng (VNĐ) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="number"
                  placeholder="150,000,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Giai đoạn Phễu</Label>
                <Select
                  value={stage}
                  onValueChange={(val: any) => {
                    setStage(val);
                    const s = PIPELINE_STAGES.find((st) => st.id === val);
                    if (s) setProbability(s.defaultProb.toString());
                  }}
                >
                  <SelectTrigger className="h-9 text-xs border-slate-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title} ({s.defaultProb}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Xác suất thành công (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Ngày dự kiến chốt</Label>
                <Input
                  type="date"
                  value={expectedCloseDate}
                  onChange={(e) => setExpectedCloseDate(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Người phụ trách thương vụ</Label>
                <Input
                  placeholder="Phạm Tuấn Vũ"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Bước tiếp theo cần thực hiện</Label>
              <Input
                placeholder="Ví dụ: Gửi bảng chào giá và Demo trực tiếp vào thứ 5..."
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                className="h-9 text-xs border-slate-200 mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Mô tả &amp; Chi tiết thương vụ</Label>
              <textarea
                rows={3}
                placeholder="Yêu cầu tích hợp API với ERP SAP và hỗ trợ đào tạo 50 nhân sự..."
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
                <span>{editingOpp ? 'Lưu Thay Đổi' : 'Thêm Cơ Hội'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
