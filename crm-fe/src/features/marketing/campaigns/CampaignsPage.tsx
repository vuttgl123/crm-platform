import React, { useState, useEffect, useCallback } from 'react';
import {
  campaignApi,
  dripApi,
  marketingTemplateApi,
  marketingAnalyticsApi,
  CampaignItem,
  CampaignStatus,
  CampaignType,
  CAMPAIGN_STATUS_CONFIG,
  CAMPAIGN_TYPE_CONFIG,
  DripCampaignSummary,
  DripStepDto,
  DripCampaignAnalyticsResponse,
  MarketingTemplateSummary,
  MarketingAnalyticsResponse,
} from '@/services/api/campaignApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Megaphone,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  BarChart2,
  TrendingUp,
  Zap,
  Mail,
  MessageSquare,
  CheckSquare,
  Clock,
  ArrowRight,
  Eye,
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  Layers,
  Send,
  Sliders,
  FileText,
  UserPlus,
  Share2,
  Percent,
} from 'lucide-react';

export const CampaignsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  // ==================== 1. CAMPAIGNS STATE ====================
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Campaign Modal
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null);
  const [isCampaignSubmitting, setIsCampaignSubmitting] = useState(false);
  const [campName, setCampName] = useState('');
  const [campType, setCampType] = useState<CampaignType>('WEBINAR');
  const [campStatus, setCampStatus] = useState<CampaignStatus>('ACTIVE');
  const [campStartDate, setCampStartDate] = useState('');
  const [campEndDate, setCampEndDate] = useState('');
  const [campBudget, setCampBudget] = useState('');
  const [campExpectedRevenue, setCampExpectedRevenue] = useState('');
  const [campAssignedTo, setCampAssignedTo] = useState('Trần Thị Mai');
  const [campDescription, setCampDescription] = useState('');

  // ==================== 2. DRIP AUTOMATION STATE ====================
  const [dripCampaigns, setDripCampaigns] = useState<DripCampaignSummary[]>([]);
  const [loadingDrip, setLoadingDrip] = useState(false);
  const [isDripModalOpen, setIsDripModalOpen] = useState(false);
  const [isDripSubmitting, setIsDripSubmitting] = useState(false);
  const [dripName, setDripName] = useState('');
  const [dripDescription, setDripDescription] = useState('');
  const [dripTrigger, setDripTrigger] = useState('LEAD_CREATED');
  const [dripAudience, setDripAudience] = useState('ALL_LEADS');
  const [dripSteps, setDripSteps] = useState<DripStepDto[]>([
    { stepOrder: 1, stepType: 'EMAIL', name: 'Email Chào mừng & Giới thiệu Năng lực', delayDays: 0, templateSubject: 'Chào mừng quý khách đến với CRM' },
    { stepOrder: 2, stepType: 'SMS', name: 'SMS Nhắc nhở Đăng ký Trải nghiệm Demo Trực tuyến', delayDays: 2 },
    { stepOrder: 3, stepType: 'EMAIL', name: 'Email Chia sẻ Case Study Doanh nghiệp Cùng Ngành', delayDays: 4, templateSubject: 'Case study doanh nghiệp tối ưu 35% chi phí' },
    { stepOrder: 4, stepType: 'CREATE_TASK', name: 'Tự động Phân công Sales Gọi Tư vấn Báo giá', delayDays: 6, actionTarget: 'SALES_REP' },
  ]);

  // Drip Analytics Modal
  const [selectedDripAnalytics, setSelectedDripAnalytics] = useState<DripCampaignAnalyticsResponse | null>(null);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [loadingStepAnalytics, setLoadingStepAnalytics] = useState(false);

  // Enroll Modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollingDripId, setEnrollingDripId] = useState<string | null>(null);
  const [enrollName, setEnrollName] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollPhone, setEnrollPhone] = useState('');

  // ==================== 3. TEMPLATES STATE ====================
  const [templates, setTemplates] = useState<MarketingTemplateSummary[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateChannelFilter, setTemplateChannelFilter] = useState('ALL');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('ALL');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MarketingTemplateSummary | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateChannel, setTemplateChannel] = useState<'EMAIL' | 'SMS' | 'ZALO_ZNS' | 'IN_APP'>('EMAIL');
  const [templateCategory, setTemplateCategory] = useState<'WELCOME' | 'NURTURE' | 'PROMOTION' | 'RE_ENGAGEMENT' | 'EVENT'>('WELCOME');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [isTemplateSubmitting, setIsTemplateSubmitting] = useState(false);

  // Preview Template Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewRendered, setPreviewRendered] = useState<{ subject?: string; content: string } | null>(null);
  const [previewSampleName, setPreviewSampleName] = useState('Nguyễn Văn Tuấn');
  const [previewSampleCompany, setPreviewSampleCompany] = useState('Tập đoàn Công nghệ FPT');

  // ==================== 4. ANALYTICS & ROI STATE ====================
  const [analyticsData, setAnalyticsData] = useState<MarketingAnalyticsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Format Currency VND
  const formatVND = (num?: number) => {
    if (!num) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // ==================== DATA FETCHING ====================
  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const res = await campaignApi.list({
        search: searchQuery,
        status: selectedStatus,
        type: selectedType,
        page,
        size: pageSize,
      });
      setCampaigns(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Không thể tải danh sách chiến dịch tiếp thị');
    } finally {
      setLoadingCampaigns(false);
    }
  }, [searchQuery, selectedStatus, selectedType, page, pageSize]);

  const fetchDripCampaigns = useCallback(async () => {
    setLoadingDrip(true);
    try {
      const list = await dripApi.list();
      setDripCampaigns(list);
    } catch {
      toast.error('Không thể tải danh sách kịch bản nuôi dưỡng');
    } finally {
      setLoadingDrip(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const list = await marketingTemplateApi.list({
        channel: templateChannelFilter,
        category: templateCategoryFilter,
      });
      setTemplates(list);
    } catch {
      toast.error('Không thể tải danh sách mẫu nội dung');
    } finally {
      setLoadingTemplates(false);
    }
  }, [templateChannelFilter, templateCategoryFilter]);

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const data = await marketingAnalyticsApi.getFull();
      setAnalyticsData(data);
    } catch {
      toast.error('Không thể tải dữ liệu báo cáo phân tích');
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchDripCampaigns();
    fetchTemplates();
    fetchAnalytics();
  }, [fetchCampaigns, fetchDripCampaigns, fetchTemplates, fetchAnalytics]);

  // ==================== CAMPAIGN HANDLERS ====================
  const handleOpenCreateCampaign = () => {
    setEditingCampaign(null);
    setCampName('');
    setCampType('WEBINAR');
    setCampStatus('ACTIVE');
    setCampStartDate(new Date().toISOString().split('T')[0]);
    setCampEndDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setCampBudget('50000000');
    setCampExpectedRevenue('500000000');
    setCampAssignedTo('Trần Thị Mai');
    setCampDescription('');
    setIsCampaignModalOpen(true);
  };

  const handleOpenEditCampaign = (c: CampaignItem) => {
    setEditingCampaign(c);
    setCampName(c.name);
    setCampType(c.type);
    setCampStatus(c.status);
    setCampStartDate(c.startDate || '');
    setCampEndDate(c.endDate || '');
    setCampBudget((c.budget || c.budgetAmount || 0).toString());
    setCampExpectedRevenue((c.expectedRevenue || 0).toString());
    setCampAssignedTo(c.assignedTo || 'Trần Thị Mai');
    setCampDescription(c.description || '');
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim()) {
      toast.error('Vui lòng nhập tên chiến dịch');
      return;
    }

    setIsCampaignSubmitting(true);
    try {
      if (editingCampaign) {
        await campaignApi.update(editingCampaign.id, {
          version: editingCampaign.version || 1,
          name: campName,
          type: campType,
          status: campStatus,
          startDate: campStartDate,
          endDate: campEndDate,
          budget: Number(campBudget) || 0,
          budgetAmount: Number(campBudget) || 0,
          expectedRevenue: Number(campExpectedRevenue) || 0,
          assignedTo: campAssignedTo,
          description: campDescription,
        });
        toast.success('Đã cập nhật chiến dịch thành công!');
      } else {
        await campaignApi.create({
          name: campName,
          type: campType,
          startDate: campStartDate,
          endDate: campEndDate,
          budget: Number(campBudget) || 0,
          budgetAmount: Number(campBudget) || 0,
          expectedRevenue: Number(campExpectedRevenue) || 0,
          description: campDescription,
        });
        toast.success('Đã tạo chiến dịch tiếp thị mới thành công!');
      }
      setIsCampaignModalOpen(false);
      fetchCampaigns();
      fetchAnalytics();
    } catch {
      toast.error('Không thể lưu chiến dịch');
    } finally {
      setIsCampaignSubmitting(false);
    }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chiến dịch "${name}"?`)) return;
    try {
      await campaignApi.delete(id);
      toast.success(`Đã xóa chiến dịch "${name}"`);
      fetchCampaigns();
      fetchAnalytics();
    } catch {
      toast.error('Không thể xóa chiến dịch');
    }
  };

  // ==================== DRIP AUTOMATION HANDLERS ====================
  const handleToggleDripStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await dripApi.updateStatus(id, nextStatus);
      toast.success(`Đã chuyển trạng thái kịch bản sang ${nextStatus === 'ACTIVE' ? 'Đang chạy (ACTIVE)' : 'Tạm dừng (PAUSED)'}`);
      fetchDripCampaigns();
    } catch {
      toast.error('Không thể đổi trạng thái kịch bản');
    }
  };

  const handleOpenStepAnalytics = async (drip: DripCampaignSummary) => {
    setLoadingStepAnalytics(true);
    setIsAnalyticsModalOpen(true);
    try {
      const analytics = await dripApi.getAnalytics(drip.id);
      setSelectedDripAnalytics(analytics);
    } catch {
      toast.error('Không thể tải báo cáo bước kịch bản');
    } finally {
      setLoadingStepAnalytics(false);
    }
  };

  const handleOpenEnrollModal = (dripId: string) => {
    setEnrollingDripId(dripId);
    setEnrollName('Vũ Văn Minh');
    setEnrollEmail('minh.vu@techcorp.vn');
    setEnrollPhone('0912 345 678');
    setIsEnrollModalOpen(true);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollingDripId || !enrollName.trim()) {
      toast.error('Vui lòng nhập tên khách hàng');
      return;
    }
    try {
      await dripApi.enroll(enrollingDripId, {
        subscriberType: 'LEAD',
        subscriberName: enrollName,
        email: enrollEmail,
        phone: enrollPhone,
      });
      toast.success(`Đã ghi danh ${enrollName} vào kịch bản nuôi dưỡng thành công!`);
      setIsEnrollModalOpen(false);
      fetchDripCampaigns();
    } catch {
      toast.error('Không thể ghi danh khách hàng');
    }
  };

  const handleSaveDripCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dripName.trim()) {
      toast.error('Vui lòng nhập tên kịch bản nuôi dưỡng');
      return;
    }
    setIsDripSubmitting(true);
    try {
      await dripApi.create({
        name: dripName,
        description: dripDescription,
        triggerEvent: dripTrigger,
        targetAudience: dripAudience,
        steps: dripSteps,
      });
      toast.success('Đã tạo kịch bản nuôi dưỡng tự động thành công!');
      setIsDripModalOpen(false);
      fetchDripCampaigns();
    } catch {
      toast.error('Không thể tạo kịch bản nuôi dưỡng');
    } finally {
      setIsDripSubmitting(false);
    }
  };

  const handleAddDripStep = () => {
    const nextOrder = dripSteps.length + 1;
    setDripSteps([
      ...dripSteps,
      {
        stepOrder: nextOrder,
        stepType: 'EMAIL',
        name: `Bước ${nextOrder}: Gửi Email cung cấp giá trị`,
        delayDays: nextOrder * 2,
        templateSubject: 'Cập nhật giải pháp công nghệ',
      },
    ]);
  };

  const handleRemoveDripStep = (index: number) => {
    if (dripSteps.length <= 1) {
      toast.error('Kịch bản phải có ít nhất 1 bước thực thi');
      return;
    }
    const updated = dripSteps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepOrder: i + 1 }));
    setDripSteps(updated);
  };

  // ==================== TEMPLATES HANDLERS ====================
  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateChannel('EMAIL');
    setTemplateCategory('WELCOME');
    setTemplateSubject('Chào mừng {{lead.name}} đến với hệ thống');
    setTemplateContent('Kính gửi {{lead.name}},\n\nCảm ơn công ty {{lead.company}} đã quan tâm đến giải pháp.\n\nTrân trọng,\n{{consultant.name}}');
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (t: MarketingTemplateSummary) => {
    setEditingTemplate(t);
    setTemplateName(t.name);
    setTemplateChannel(t.channel);
    setTemplateCategory(t.category);
    setTemplateSubject(t.subject || '');
    setTemplateContent(t.content);
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !templateContent.trim()) {
      toast.error('Vui lòng nhập đầy đủ tên và nội dung mẫu');
      return;
    }
    setIsTemplateSubmitting(true);
    try {
      if (editingTemplate) {
        await marketingTemplateApi.update(editingTemplate.id, {
          name: templateName,
          channel: templateChannel,
          category: templateCategory,
          subject: templateSubject,
          content: templateContent,
          status: 'ACTIVE',
        });
        toast.success('Đã cập nhật mẫu tiếp thị thành công!');
      } else {
        await marketingTemplateApi.create({
          name: templateName,
          channel: templateChannel,
          category: templateCategory,
          subject: templateSubject,
          content: templateContent,
          status: 'ACTIVE',
        });
        toast.success('Đã tạo mẫu tiếp thị mới thành công!');
      }
      setIsTemplateModalOpen(false);
      fetchTemplates();
    } catch {
      toast.error('Không thể lưu mẫu tiếp thị');
    } finally {
      setIsTemplateSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mẫu "${name}"?`)) return;
    try {
      await marketingTemplateApi.delete(id);
      toast.success(`Đã xóa mẫu tiếp thị "${name}"`);
      fetchTemplates();
    } catch {
      toast.error('Không thể xóa mẫu');
    }
  };

  const handlePreviewTemplate = async (t: MarketingTemplateSummary) => {
    try {
      const res = await marketingTemplateApi.preview({
        subject: t.subject,
        content: t.content,
        sampleData: {
          'lead.name': previewSampleName,
          'lead.company': previewSampleCompany,
          'consultant.name': 'Trần Thị Mai',
          'consultant.phone': '0988 123 456',
          'promo.code': 'VIPCRM2026',
        },
      });
      setPreviewRendered(res);
      setIsPreviewModalOpen(true);
    } catch {
      toast.error('Không thể hiển thị xem trước');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>Trung tâm Tiếp thị & Chiến dịch</span>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold px-2 py-0.5">
                  Marketing Automation Suite
                </Badge>
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Quản lý chiến dịch đa kênh, kịch bản tự động hóa Drip Nurturing, mẫu nội dung và tối ưu hiệu suất ROI
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchCampaigns();
              fetchDripCampaigns();
              fetchTemplates();
              fetchAnalytics();
              toast.success('Đã làm mới toàn bộ dữ liệu tiếp thị');
            }}
            className="h-9 px-3 text-xs font-semibold gap-1.5 border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCampaigns || loadingDrip || loadingAnalytics ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          {activeTab === 'campaigns' && (
            <Button
              size="sm"
              onClick={handleOpenCreateCampaign}
              className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Chiến dịch Mới</span>
            </Button>
          )}

          {activeTab === 'automation' && (
            <Button
              size="sm"
              onClick={() => setIsDripModalOpen(true)}
              className="h-9 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-2xs"
            >
              <Zap className="w-4 h-4" />
              <span>Tạo Kịch bản Tự động (Drip)</span>
            </Button>
          )}

          {activeTab === 'templates' && (
            <Button
              size="sm"
              onClick={handleOpenCreateTemplate}
              className="h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Mẫu Nội dung Mới</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100/90 p-1 rounded-xl border border-slate-200 flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="analytics"
            className="rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs"
          >
            <BarChart2 className="w-4 h-4" />
            <span>📊 Báo cáo ROI & Phễu Chuyển đổi</span>
          </TabsTrigger>

          <TabsTrigger
            value="campaigns"
            className="rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs"
          >
            <Megaphone className="w-4 h-4" />
            <span>📢 Chiến dịch Đa kênh ({campaigns.length})</span>
          </TabsTrigger>

          <TabsTrigger
            value="automation"
            className="rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-xs"
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Tự động hóa Nuôi dưỡng Drip ({dripCampaigns.length})</span>
          </TabsTrigger>

          <TabsTrigger
            value="templates"
            className="rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs"
          >
            <Mail className="w-4 h-4" />
            <span>✉️ Thư viện Mẫu Email/SMS ({templates.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: EXECUTIVE MARKETING ROI & ATTRIBUTION FUNNEL                       */}
        {/* ========================================================================= */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tổng Ngân Sách</span>
                </p>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  {formatVND(analyticsData?.summary?.totalBudget || 345000000)}
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 block">4 chiến dịch chiến lược</span>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Chi phí Thực chi</span>
                </p>
                <h3 className="text-xl font-black text-indigo-600 mt-2">
                  {formatVND(analyticsData?.summary?.totalActualSpend || 75000000)}
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 block">21.7% ngân sách kế hoạch</span>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Doanh thu Đã chốt (Won)</span>
                </p>
                <h3 className="text-xl font-black text-emerald-600 mt-2">
                  {formatVND(analyticsData?.summary?.totalWonRevenue || 1280000000)}
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">37 khách hàng chuyển đổi</span>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-purple-500" />
                  <span>Tỷ suất ROI Tổng thể</span>
                </p>
                <h3 className="text-xl font-black text-purple-600 mt-2">
                  +{analyticsData?.summary?.overallRoiPercent || 1606.67}%
                </h3>
                <span className="text-[11px] text-purple-600 font-semibold mt-1 block">Hoàn vốn x17.0 lần</span>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-sky-500" />
                  <span>Chi phí / Lead (CPL)</span>
                </p>
                <h3 className="text-xl font-black text-sky-600 mt-2">
                  {formatVND(analyticsData?.summary?.costPerLead || 263158)}
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 block">Thu hút 285 Leads</span>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Chi phí Thu nạp (CAC)</span>
                </p>
                <h3 className="text-xl font-black text-emerald-700 mt-2">
                  {formatVND(analyticsData?.summary?.customerAcquisitionCost || 2027027)}
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 block">Trên mỗi khách hàng chốt</span>
              </CardContent>
            </Card>
          </div>

          {/* Marketing Attribution Funnel */}
          <Card className="border-slate-200 bg-white shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Phễu Chuyển đổi Khách hàng Tiếp thị (Full-Funnel Marketing Attribution)</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Theo dõi hành trình từ tiếp cận thương hiệu đến chốt hợp đồng và ghi nhận doanh thu
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs">
                  Tỷ lệ chuyển đổi Lead - Deal: 28.7%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {(analyticsData?.funnelStages || [
                  { stageOrder: 1, stageKey: 'IMPRESSIONS', stageNameVi: 'Lượt tiếp cận / Impression', count: 48500, conversionRateFromPrevious: 100, dropoffRate: 0 },
                  { stageOrder: 2, stageKey: 'CLICKS', stageNameVi: 'Lượt quan tâm & Nhấp / Clicks', count: 4200, conversionRateFromPrevious: 8.66, dropoffRate: 91.34 },
                  { stageOrder: 3, stageKey: 'LEADS', stageNameVi: 'Khách hàng Tiềm năng (Leads Generated)', count: 285, conversionRateFromPrevious: 6.79, dropoffRate: 93.21 },
                  { stageOrder: 4, stageKey: 'MQL_QUALIFIED', stageNameVi: 'Lead Đạt chuẩn Tiếp thị (MQL)', count: 164, conversionRateFromPrevious: 57.54, dropoffRate: 42.46 },
                  { stageOrder: 5, stageKey: 'OPPORTUNITIES', stageNameVi: 'Cơ hội Bán hàng Khởi tạo (Sales Deals)', count: 82, conversionRateFromPrevious: 50.0, dropoffRate: 50.0 },
                  { stageOrder: 6, stageKey: 'CLOSED_WON', stageNameVi: 'Khách hàng Ký Hợp đồng (Closed Won)', count: 37, conversionRateFromPrevious: 45.12, dropoffRate: 54.88 },
                ]).map((stage, idx) => {
                  const widthPercent = Math.max(15, 100 - idx * 16);
                  return (
                    <div key={stage.stageKey} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black">
                            {stage.stageOrder}
                          </span>
                          <span>{stage.stageNameVi}</span>
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-slate-900 text-sm">{stage.count.toLocaleString('vi-VN')}</span>
                          {idx > 0 && (
                            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Chuyển đổi: {stage.conversionRateFromPrevious}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-600 to-indigo-600"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Channel Performance Breakdown Table */}
          <Card className="border-slate-200 bg-white shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>Hiệu quả Chi tiết theo Kênh Tiếp thị (Channel Attribution Matrix)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Kênh Tiếp thị</TableHead>
                    <TableHead className="font-bold text-slate-700">Chi phí Đã chi</TableHead>
                    <TableHead className="font-bold text-slate-700">Số Leads</TableHead>
                    <TableHead className="font-bold text-slate-700">Chi phí / Lead (CPL)</TableHead>
                    <TableHead className="font-bold text-slate-700">Chuyển đổi HĐ</TableHead>
                    <TableHead className="font-bold text-slate-700">Doanh thu Thu về</TableHead>
                    <TableHead className="font-bold text-slate-700 text-right">Tỷ lệ ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(analyticsData?.channelPerformances || [
                    { channelType: 'WEBINAR', channelNameVi: 'Hội thảo Trực tuyến (Webinar)', spend: 35000000, leadsCount: 142, costPerLead: 246479, conversionsCount: 18, wonRevenue: 550000000, roiPercent: 1471.43 },
                    { channelType: 'SOCIAL_ADS', channelNameVi: 'Quảng cáo MXH (Meta / LinkedIn)', spend: 28000000, leadsCount: 89, costPerLead: 314607, conversionsCount: 7, wonRevenue: 420000000, roiPercent: 1400.00 },
                    { channelType: 'EMAIL', channelNameVi: 'Email Marketing & Nuôi dưỡng', spend: 12000000, leadsCount: 54, costPerLead: 222222, conversionsCount: 12, wonRevenue: 310000000, roiPercent: 2483.33 },
                    { channelType: 'EVENT', channelNameVi: 'Triển lãm & Sự kiện Offline', spend: 0, leadsCount: 0, costPerLead: 0, conversionsCount: 0, wonRevenue: 0, roiPercent: 0 },
                  ]).map((item) => (
                    <TableRow key={item.channelType} className="hover:bg-slate-50/80">
                      <TableCell className="font-bold text-slate-900">{item.channelNameVi}</TableCell>
                      <TableCell className="font-semibold text-slate-700">{formatVND(item.spend)}</TableCell>
                      <TableCell className="font-bold text-blue-600">{item.leadsCount} Leads</TableCell>
                      <TableCell className="text-slate-600">{formatVND(item.costPerLead)}</TableCell>
                      <TableCell className="font-bold text-emerald-600">{item.conversionsCount} Hợp đồng</TableCell>
                      <TableCell className="font-bold text-slate-900">{formatVND(item.wonRevenue)}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={`font-black text-xs ${item.roiPercent > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                          {item.roiPercent > 0 ? `+${item.roiPercent.toFixed(1)}%` : '0%'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: CAMPAIGNS MANAGEMENT                                              */}
        {/* ========================================================================= */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm kiếm chiến dịch theo tên hoặc người phụ trách..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs border-slate-200"
              />
            </div>

            <div className="w-full sm:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 text-xs border-slate-200">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PLANNING">Đang lên kế hoạch</SelectItem>
                  <SelectItem value="ACTIVE">Đang chạy</SelectItem>
                  <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy bỏ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-56">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-10 text-xs border-slate-200">
                  <SelectValue placeholder="Loại chiến dịch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả hình thức</SelectItem>
                  <SelectItem value="EMAIL">Email Marketing</SelectItem>
                  <SelectItem value="WEBINAR">Hội thảo Trực tuyến (Webinar)</SelectItem>
                  <SelectItem value="EVENT">Triển lãm / Sự kiện Offline</SelectItem>
                  <SelectItem value="SOCIAL_ADS">Quảng cáo MXH</SelectItem>
                  <SelectItem value="DIRECT_MAIL">Thư ngỏ trực tiếp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campaigns Table */}
          <Card className="border-slate-200 bg-white shadow-2xs">
            <CardContent className="p-0">
              {campaigns.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="Không tìm thấy chiến dịch tiếp thị"
                  description="Thử thay đổi bộ lọc hoặc tạo chiến dịch tiếp thị mới để bắt đầu theo dõi hiệu quả."
                  actionLabel="Tạo Chiến dịch Mới"
                  onAction={handleOpenCreateCampaign}
                />
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/75">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">Tên Chiến dịch</TableHead>
                      <TableHead className="font-bold text-slate-700">Hình thức</TableHead>
                      <TableHead className="font-bold text-slate-700">Trạng thái</TableHead>
                      <TableHead className="font-bold text-slate-700">Ngân sách / Thực chi</TableHead>
                      <TableHead className="font-bold text-slate-700">Leads / Chuyển đổi</TableHead>
                      <TableHead className="font-bold text-slate-700">Thời gian</TableHead>
                      <TableHead className="font-bold text-slate-700">Phụ trách</TableHead>
                      <TableHead className="font-bold text-slate-700 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((c) => {
                      const statusCfg = CAMPAIGN_STATUS_CONFIG[c.status] || { label: c.status, className: 'bg-slate-100 text-slate-700' };
                      const typeCfg = CAMPAIGN_TYPE_CONFIG[c.type] || { label: c.type, className: 'bg-slate-100 text-slate-700' };
                      return (
                        <TableRow key={c.id} className="hover:bg-slate-50/80">
                          <TableCell>
                            <div>
                              <p className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer">{c.name}</p>
                              {c.description && <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.description}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[11px] font-semibold ${typeCfg.className}`}>
                              {typeCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[11px] ${statusCfg.className}`}>
                              {statusCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-bold text-slate-900">{formatVND(c.budget)}</p>
                              <p className="text-[11px] text-indigo-600 font-semibold">Đã chi: {formatVND(c.actualCost)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-bold text-blue-600">{c.leadsGenerated || 0} Leads</span>
                              <span className="text-slate-400 mx-1">/</span>
                              <span className="font-bold text-emerald-600">{c.conversionsCount || 0} HĐ</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {c.startDate ? `${c.startDate} → ${c.endDate || '...'}` : 'Chưa định'}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-slate-700">
                            {c.assignedTo || 'Chưa phân công'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditCampaign(c)}
                                className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCampaign(c.id, c.name)}
                                className="h-8 w-8 p-0 text-slate-600 hover:text-rose-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: DRIP AUTOMATION SEQUENCES                                         */}
        {/* ========================================================================= */}
        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {dripCampaigns.map((drip) => (
              <Card key={drip.id} className="border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-lg font-black text-slate-900">{drip.name}</h3>
                      <Badge className={`text-xs font-bold ${drip.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {drip.status === 'ACTIVE' ? 'Đang hoạt động (ACTIVE)' : 'Tạm dừng (PAUSED)'}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
                        Sự kiện kích hoạt: {drip.triggerEvent}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{drip.description}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleDripStatus(drip.id, drip.status)}
                      className="h-8 text-xs font-semibold gap-1.5"
                    >
                      {drip.status === 'ACTIVE' ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-600" />
                          <span>Tạm dừng</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Kích hoạt</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenStepAnalytics(drip)}
                      className="h-8 text-xs font-semibold gap-1.5 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Phân tích Phễu Bước</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleOpenEnrollModal(drip.id)}
                      className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-2xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Ghi danh Lead</span>
                    </Button>
                  </div>
                </div>

                {/* Drip Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50/60 p-4 border-b border-slate-100 text-center gap-2">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-500">Tổng Ghi danh</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">{drip.totalEnrolled} Leads</p>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-500">Đang Trong Chuỗi</span>
                    <p className="text-lg font-black text-blue-600 mt-0.5">{drip.activeSubscribers} Đang chạy</p>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-500">Đã Hoàn thành</span>
                    <p className="text-lg font-black text-emerald-600 mt-0.5">{drip.completedSubscribers} Đã xong</p>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-500">Tổng Số Bước</span>
                    <p className="text-lg font-black text-purple-600 mt-0.5">{drip.stepCount} Bước</p>
                  </div>
                </div>

                {/* Visual Step Timeline */}
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Sơ đồ Quy trình Nuôi dưỡng Tự động (Visual Step Workflow)</span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative">
                    {(drip.steps || [
                      { stepOrder: 1, stepType: 'EMAIL', name: 'Email Chào mừng & Hồ sơ Năng lực', delayDays: 0 },
                      { stepOrder: 2, stepType: 'SMS', name: 'SMS Mời Trải nghiệm Bản Demo', delayDays: 2 },
                      { stepOrder: 3, stepType: 'EMAIL', name: 'Email Case Study Doanh nghiệp', delayDays: 4 },
                      { stepOrder: 4, stepType: 'CREATE_TASK', name: 'Phân công Sales Gọi Tư vấn', delayDays: 6 },
                    ]).map((step, idx) => (
                      <div
                        key={step.stepOrder}
                        className="p-4 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 shadow-2xs space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {step.stepOrder}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-white">
                            <Clock className="w-3 h-3" />
                            <span>{step.delayDays === 0 ? 'Kích hoạt ngay' : `Sau ${step.delayDays} ngày`}</span>
                          </Badge>
                        </div>

                        <div className="pt-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                            {step.stepType === 'EMAIL' && <Mail className="w-3.5 h-3.5" />}
                            {step.stepType === 'SMS' && <MessageSquare className="w-3.5 h-3.5" />}
                            {step.stepType === 'CREATE_TASK' && <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />}
                            <span>{step.stepType}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">{step.name}</p>
                          {step.templateSubject && (
                            <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">"{step.templateSubject}"</p>
                          )}
                        </div>

                        {idx < 3 && (
                          <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: MARKETING CONTENT TEMPLATES                                       */}
        {/* ========================================================================= */}
        <TabsContent value="templates" className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="w-full sm:w-56">
              <Select value={templateChannelFilter} onValueChange={setTemplateChannelFilter}>
                <SelectTrigger className="h-10 text-xs border-slate-200">
                  <SelectValue placeholder="Kênh gửi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả kênh (All Channels)</SelectItem>
                  <SelectItem value="EMAIL">Email Marketing</SelectItem>
                  <SelectItem value="SMS">Tin nhắn SMS Brandname</SelectItem>
                  <SelectItem value="ZALO_ZNS">Zalo Notification (ZNS)</SelectItem>
                  <SelectItem value="IN_APP">Thông báo In-App</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-56">
              <Select value={templateCategoryFilter} onValueChange={setTemplateCategoryFilter}>
                <SelectTrigger className="h-10 text-xs border-slate-200">
                  <SelectValue placeholder="Danh mục mẫu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả danh mục</SelectItem>
                  <SelectItem value="WELCOME">Chào mừng (Welcome)</SelectItem>
                  <SelectItem value="NURTURE">Nuôi dưỡng (Nurture)</SelectItem>
                  <SelectItem value="PROMOTION">Khuyến mãi (Promotion)</SelectItem>
                  <SelectItem value="RE_ENGAGEMENT">Tái kích hoạt (Re-engage)</SelectItem>
                  <SelectItem value="EVENT">Thư mời sự kiện (Event)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="border-slate-200 bg-white shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-all">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs font-bold ${tpl.channel === 'EMAIL' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {tpl.channel === 'EMAIL' ? '✉️ EMAIL' : '📱 SMS'}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-semibold text-slate-500 bg-slate-50">
                      Dùng {tpl.usageCount} lần
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 mt-2">{tpl.name}</CardTitle>
                  {tpl.subject && (
                    <CardDescription className="text-xs text-blue-700 font-medium line-clamp-1">
                      Tiêu đề: {tpl.subject}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-4 space-y-3 flex-1">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700 font-mono line-clamp-4 whitespace-pre-line">
                    {tpl.content}
                  </div>

                  {tpl.variables && tpl.variables.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Biến cá nhân hóa (Merge Tags):</span>
                      <div className="flex flex-wrap gap-1">
                        {tpl.variables.map((v) => (
                          <span key={v} className="text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewTemplate(tpl)}
                    className="h-8 text-xs font-semibold gap-1 text-slate-700 border-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Xem trước</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditTemplate(tpl)}
                      className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                      className="h-8 w-8 p-0 text-slate-600 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* MODALS & DIALOGS                                                          */}
      {/* ========================================================================= */}

      {/* 1. Create/Edit Campaign Modal */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingCampaign ? 'Chỉnh sửa Chiến dịch Tiếp thị' : 'Tạo Chiến dịch Tiếp thị Mới'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Điền thông tin ngân sách, mục tiêu doanh thu và phân công phụ trách cho chiến dịch
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCampaign} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Tên chiến dịch *</Label>
              <Input
                placeholder="VD: Hội thảo Chuyển đổi số B2B 2026"
                value={campName}
                onChange={(e) => setCampName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Hình thức chiến dịch</Label>
                <Select value={campType} onValueChange={(val: CampaignType) => setCampType(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEBINAR">Hội thảo Trực tuyến (Webinar)</SelectItem>
                    <SelectItem value="SOCIAL_ADS">Quảng cáo MXH (Meta / LinkedIn)</SelectItem>
                    <SelectItem value="EMAIL">Email Marketing</SelectItem>
                    <SelectItem value="EVENT">Triển lãm / Sự kiện Offline</SelectItem>
                    <SelectItem value="DIRECT_MAIL">Thư ngỏ trực tiếp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Trạng thái</Label>
                <Select value={campStatus} onValueChange={(val: CampaignStatus) => setCampStatus(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Đang lên kế hoạch (Planning)</SelectItem>
                    <SelectItem value="ACTIVE">Đang chạy (Active)</SelectItem>
                    <SelectItem value="COMPLETED">Đã hoàn thành (Completed)</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy bỏ (Cancelled)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Ngân sách dự kiến (VND)</Label>
                <Input
                  type="number"
                  placeholder="50000000"
                  value={campBudget}
                  onChange={(e) => setCampBudget(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Doanh thu kỳ vọng (VND)</Label>
                <Input
                  type="number"
                  placeholder="500000000"
                  value={campExpectedRevenue}
                  onChange={(e) => setCampExpectedRevenue(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Ngày bắt đầu</Label>
                <DatePicker
                  value={campStartDate}
                  onChange={(val) => setCampStartDate(val || '')}
                  className="w-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Ngày kết thúc</Label>
                <DatePicker
                  value={campEndDate}
                  onChange={(val) => setCampEndDate(val || '')}
                  className="w-full text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Người phụ trách chính</Label>
              <Input
                placeholder="Trần Thị Mai"
                value={campAssignedTo}
                onChange={(e) => setCampAssignedTo(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Mô tả mục tiêu chiến dịch</Label>
              <Input
                placeholder="Ghi chú chi tiết về đối tượng khách hàng mục tiêu và KPI..."
                value={campDescription}
                onChange={(e) => setCampDescription(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCampaignModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" size="sm" disabled={isCampaignSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                {isCampaignSubmitting ? 'Đang lưu...' : 'Lưu Chiến dịch'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Create Drip Workflow Modal */}
      <Dialog open={isDripModalOpen} onOpenChange={setIsDripModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              <span>Thiết lập Kịch bản Nuôi dưỡng Tự động (Drip Automation Workflow)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Cấu hình sự kiện kích hoạt và các bước gửi email/sms tự động tuần tự
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDripCampaign} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Tên kịch bản nuôi dưỡng *</Label>
              <Input
                placeholder="VD: Chuỗi Chào mừng & Chăm sóc Lead Đăng ký Web"
                value={dripName}
                onChange={(e) => setDripName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Sự kiện kích hoạt (Trigger)</Label>
                <Select value={dripTrigger} onValueChange={setDripTrigger}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEAD_CREATED">Khách hàng Tiềm năng Mới tạo (Lead Created)</SelectItem>
                    <SelectItem value="FORM_SUBMITTED">Khách hàng Điền Form Đăng ký (Form Submitted)</SelectItem>
                    <SelectItem value="CONTRACT_SIGNED">Ký kết Hợp đồng Thành công (Contract Signed)</SelectItem>
                    <SelectItem value="DEAL_LOST">Cơ hội bị Thất bại / Tạm dừng (Deal Lost)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Tệp đối tượng áp dụng</Label>
                <Select value={dripAudience} onValueChange={setDripAudience}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_LEADS">Tất cả Leads mới</SelectItem>
                    <SelectItem value="EXISTING_CUSTOMERS">Khách hàng hiện hữu</SelectItem>
                    <SelectItem value="LOST_LEADS">Lead tạm dừng quá 30 ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Mô tả kịch bản</Label>
              <Input
                placeholder="Mô tả mục đích của kịch bản chăm sóc..."
                value={dripDescription}
                onChange={(e) => setDripDescription(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Dynamic Steps */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Danh sách Các bước Thực thi ({dripSteps.length} bước)</span>
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddDripStep} className="h-7 text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm bước mới</span>
                </Button>
              </div>

              <div className="space-y-3">
                {dripSteps.map((step, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700">Bước {idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDripStep(idx)}
                        className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-600">Loại hành động</Label>
                        <Select
                          value={step.stepType}
                          onValueChange={(val: any) => {
                            const updated = [...dripSteps];
                            updated[idx].stepType = val;
                            setDripSteps(updated);
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EMAIL">Gửi Email</SelectItem>
                            <SelectItem value="SMS">Gửi SMS</SelectItem>
                            <SelectItem value="CREATE_TASK">Tạo Task Gọi Điện</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-600">Thời gian trễ (Số ngày sau)</Label>
                        <Input
                          type="number"
                          value={step.delayDays}
                          onChange={(e) => {
                            const updated = [...dripSteps];
                            updated[idx].delayDays = Number(e.target.value) || 0;
                            setDripSteps(updated);
                          }}
                          className="h-8 text-xs bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-600">Tên mô tả bước</Label>
                        <Input
                          value={step.name}
                          onChange={(e) => {
                            const updated = [...dripSteps];
                            updated[idx].name = e.target.value;
                            setDripSteps(updated);
                          }}
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDripModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" size="sm" disabled={isDripSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                {isDripSubmitting ? 'Đang lưu...' : 'Tạo Kịch bản'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Drip Funnel Step Analytics Modal */}
      <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <span>Báo cáo Tỷ lệ Chuyển đổi Qua Từng Bước Kịch bản</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {selectedDripAnalytics?.campaignName || 'Chi tiết hiệu suất gửi và tương tác'}
            </DialogDescription>
          </DialogHeader>

          {loadingStepAnalytics ? (
            <div className="py-8 text-center text-xs text-slate-500">Đang tải phân tích...</div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <div>
                  <span className="text-xs font-bold text-indigo-900">Tổng số Lead đã tham gia:</span>
                  <span className="ml-2 font-black text-indigo-700 text-sm">{selectedDripAnalytics?.totalEnrolled}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-900">Tỷ lệ hoàn thành mục tiêu:</span>
                  <span className="ml-2 font-black text-emerald-600 text-sm">+{selectedDripAnalytics?.overallConversionRate}%</span>
                </div>
              </div>

              <div className="space-y-3">
                {selectedDripAnalytics?.stepAnalytics.map((step) => (
                  <div key={step.stepOrder} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {step.stepOrder}
                        </span>
                        <span>{step.stepName}</span>
                      </span>
                      <Badge className="bg-blue-50 text-blue-700 text-[10px] font-bold">
                        Tỷ lệ mở: {step.openRatePercent}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 text-center text-[11px] bg-slate-50 p-2 rounded-lg gap-2">
                      <div>
                        <span className="text-slate-400">Đã gửi</span>
                        <p className="font-black text-slate-700 mt-0.5">{step.sentCount}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Đã mở xem</span>
                        <p className="font-black text-blue-600 mt-0.5">{step.openCount}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Tương tác nhấp / Chuyển đổi</span>
                        <p className="font-black text-emerald-600 mt-0.5">{step.clickCount} ({step.conversionRatePercent}%)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button size="sm" onClick={() => setIsAnalyticsModalOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Enroll Lead Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <span>Ghi danh Lead vào Chuỗi Nuôi dưỡng</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kích hoạt quy trình gửi thông điệp tự động cho khách hàng tiềm năng
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEnrollSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Họ và tên khách hàng *</Label>
              <Input
                placeholder="Vũ Văn Minh"
                value={enrollName}
                onChange={(e) => setEnrollName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Địa chỉ Email</Label>
              <Input
                type="email"
                placeholder="minh.vu@techcorp.vn"
                value={enrollEmail}
                onChange={(e) => setEnrollEmail(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Số điện thoại nhận SMS</Label>
              <Input
                placeholder="0912 345 678"
                value={enrollPhone}
                onChange={(e) => setEnrollPhone(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEnrollModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                Kích hoạt Ngay
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Create/Edit Template Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingTemplate ? 'Chỉnh sửa Mẫu Tiếp thị' : 'Tạo Mẫu Tiếp thị Mới'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Soạn thảo nội dung Email/SMS có gắn biến cá nhân hóa (Merge Tags)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTemplate} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Tên mẫu nội dung *</Label>
              <Input
                placeholder="VD: Email Chào mừng Sau Sự kiện Demo"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Kênh gửi</Label>
                <Select value={templateChannel} onValueChange={(val: any) => setTemplateChannel(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">Email Marketing</SelectItem>
                    <SelectItem value="SMS">Tin nhắn SMS Brandname</SelectItem>
                    <SelectItem value="ZALO_ZNS">Zalo Notification (ZNS)</SelectItem>
                    <SelectItem value="IN_APP">Thông báo In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Phân loại</Label>
                <Select value={templateCategory} onValueChange={(val: any) => setTemplateCategory(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WELCOME">Chào mừng (Welcome)</SelectItem>
                    <SelectItem value="NURTURE">Nuôi dưỡng (Nurture)</SelectItem>
                    <SelectItem value="PROMOTION">Khuyến mãi (Promotion)</SelectItem>
                    <SelectItem value="RE_ENGAGEMENT">Tái kích hoạt (Re-engage)</SelectItem>
                    <SelectItem value="EVENT">Thư mời sự kiện (Event)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {templateChannel === 'EMAIL' && (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Tiêu đề Email (Subject)</Label>
                <Input
                  placeholder="VD: Chào mừng {{lead.name}} đến với CRM"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700">Nội dung mẫu *</Label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Chèn nhanh:</span>
                  {['lead.name', 'lead.company', 'consultant.name', 'promo.code'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTemplateContent((prev) => prev + ` {{${tag}}}`)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono"
                    >
                      {`+{{${tag}}}`}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={6}
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                placeholder="Nhập nội dung mẫu tiếp thị tại đây..."
                required
                className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTemplateModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" size="sm" disabled={isTemplateSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                {isTemplateSubmitting ? 'Đang lưu...' : 'Lưu Mẫu Tiếp thị'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Preview Template Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Xem Trước Mẫu Nội dung Tiếp thị (Live Preview)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kiểm tra khả năng thay thế biến merge tags với dữ liệu khách hàng thực tế
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Tên khách hàng:</span>
                <p className="font-semibold text-slate-800">{previewSampleName}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Công ty:</span>
                <p className="font-semibold text-slate-800">{previewSampleCompany}</p>
              </div>
            </div>

            {previewRendered?.renderedSubject && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-600">Tiêu đề gửi đi:</span>
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-xs font-bold text-blue-900">
                  {previewRendered.renderedSubject}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-600">Nội dung hiển thị cho người nhận:</span>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                {previewRendered?.renderedContent}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button size="sm" onClick={() => setIsPreviewModalOpen(false)}>
              Đóng xem trước
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
