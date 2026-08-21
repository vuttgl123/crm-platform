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
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardPagination } from '@/components/common/StandardPagination';
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
  DollarSign,
  Loader2,
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
  Sliders,
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
  const [pageSize, setPageSize] = useState(10);
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
  const [campAssignedTo, setCampAssignedTo] = useState('Sarah Jenkins');
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
    { stepOrder: 1, stepType: 'EMAIL', name: 'Welcome & Enterprise Capabilities Overview', delayDays: 0, templateSubject: 'Welcome to our enterprise CRM platform' },
    { stepOrder: 2, stepType: 'SMS', name: 'SMS Live Architecture Demo Reminder', delayDays: 2 },
    { stepOrder: 3, stepType: 'EMAIL', name: 'Industry Case Study: 35% Cost Optimization', delayDays: 4, templateSubject: 'Case study: How tech enterprises scale revenue' },
    { stepOrder: 4, stepType: 'CREATE_TASK', name: 'Sales AE Discovery Consultation Call', delayDays: 6, actionTarget: 'SALES_REP' },
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
  const [previewRendered, setPreviewRendered] = useState<{ renderedSubject?: string; renderedContent?: string; subject?: string; content?: string } | null>(null);
  const [previewSampleName, setPreviewSampleName] = useState('Alex Morgan');
  const [previewSampleCompany, setPreviewSampleCompany] = useState('Apex Technologies Inc');

  // ==================== 4. ANALYTICS & ROI STATE ====================
  const [analyticsData, setAnalyticsData] = useState<MarketingAnalyticsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const formatVND = (num?: number) => {
    if (!num) return '0 ₫';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(num);
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
      toast.error('Unable to load campaigns list');
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
      toast.error('Unable to load drip nurturing workflows');
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
      toast.error('Unable to load marketing template catalog');
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
      toast.error('Unable to load analytics report');
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
    setCampAssignedTo('Sarah Jenkins');
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
    setCampAssignedTo(c.assignedTo || 'Sarah Jenkins');
    setCampDescription(c.description || '');
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim()) {
      toast.error('Please enter campaign title');
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
        toast.success('Campaign updated successfully!');
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
        toast.success('New marketing campaign created successfully!');
      }
      setIsCampaignModalOpen(false);
      fetchCampaigns();
      fetchAnalytics();
    } catch {
      toast.error('Unable to save campaign');
    } finally {
      setIsCampaignSubmitting(false);
    }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${name}"?`)) return;
    try {
      await campaignApi.delete(id);
      toast.success(`Campaign "${name}" deleted`);
      fetchCampaigns();
      fetchAnalytics();
    } catch {
      toast.error('Unable to delete campaign');
    }
  };

  // ==================== DRIP AUTOMATION HANDLERS ====================
  const handleToggleDripStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await dripApi.updateStatus(id, nextStatus);
      toast.success(`Workflow status updated to ${nextStatus}`);
      fetchDripCampaigns();
    } catch {
      toast.error('Unable to update workflow status');
    }
  };

  const handleOpenStepAnalytics = async (drip: DripCampaignSummary) => {
    setLoadingStepAnalytics(true);
    setIsAnalyticsModalOpen(true);
    try {
      const analytics = await dripApi.getAnalytics(drip.id);
      setSelectedDripAnalytics(analytics);
    } catch {
      toast.error('Unable to load sequence step analytics');
    } finally {
      setLoadingStepAnalytics(false);
    }
  };

  const handleOpenEnrollModal = (dripId: string) => {
    setEnrollingDripId(dripId);
    setEnrollName('Alex Morgan');
    setEnrollEmail('alex.morgan@apextechnologies.com');
    setEnrollPhone('+1 555 0192');
    setIsEnrollModalOpen(true);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollingDripId || !enrollName.trim()) {
      toast.error('Please specify lead contact name');
      return;
    }
    try {
      await dripApi.enroll(enrollingDripId, {
        subscriberType: 'LEAD',
        subscriberName: enrollName,
        email: enrollEmail,
        phone: enrollPhone,
      });
      toast.success(`Enrolled ${enrollName} into nurturing workflow!`);
      setIsEnrollModalOpen(false);
      fetchDripCampaigns();
    } catch {
      toast.error('Unable to enroll contact');
    }
  };

  const handleSaveDripCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dripName.trim()) {
      toast.error('Please enter workflow name');
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
      toast.success('Drip automation workflow created successfully!');
      setIsDripModalOpen(false);
      fetchDripCampaigns();
    } catch {
      toast.error('Unable to create workflow');
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
        name: `Step ${nextOrder}: Value Proposition Dispatch`,
        delayDays: nextOrder * 2,
        templateSubject: 'Enterprise solution update',
      },
    ]);
  };

  const handleRemoveDripStep = (index: number) => {
    if (dripSteps.length <= 1) {
      toast.error('Workflow must contain at least 1 action step');
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
    setTemplateSubject('Welcome {{lead.name}} to our enterprise suite');
    setTemplateContent('Dear {{lead.name}},\n\nThank you for exploring our enterprise software solutions at {{lead.company}}.\n\nBest regards,\n{{consultant.name}}');
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
      toast.error('Please enter template name and content');
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
        toast.success('Template updated successfully!');
      } else {
        await marketingTemplateApi.create({
          name: templateName,
          channel: templateChannel,
          category: templateCategory,
          subject: templateSubject,
          content: templateContent,
          status: 'ACTIVE',
        });
        toast.success('Marketing template created successfully!');
      }
      setIsTemplateModalOpen(false);
      fetchTemplates();
    } catch {
      toast.error('Unable to save template');
    } finally {
      setIsTemplateSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}"?`)) return;
    try {
      await marketingTemplateApi.delete(id);
      toast.success(`Template "${name}" deleted`);
      fetchTemplates();
    } catch {
      toast.error('Unable to delete template');
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
          'consultant.name': 'Sarah Jenkins',
          'consultant.phone': '+1 555 0192',
          'promo.code': 'ENTERPRISE2026',
        },
      });
      setPreviewRendered(res);
      setIsPreviewModalOpen(true);
    } catch {
      toast.error('Unable to generate preview');
    }
  };

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Marketing Hub &amp; Campaign Automation"
        subtitle="Multi-channel campaign orchestration, automated drip nurturing sequences, template asset library &amp; ROI attribution"
        icon={Megaphone}
        badgeCount={campaigns.length}
        badgeLabel="campaigns"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchCampaigns();
                fetchDripCampaigns();
                fetchTemplates();
                fetchAnalytics();
                toast.success('Marketing datasets refreshed');
              }}
              className="h-8 px-3 text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCampaigns || loadingDrip || loadingAnalytics ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            {activeTab === 'campaigns' && (
              <Button
                size="sm"
                onClick={handleOpenCreateCampaign}
                className="h-8 px-3 text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none rounded-[3px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Campaign</span>
              </Button>
            )}

            {activeTab === 'automation' && (
              <Button
                size="sm"
                onClick={() => setIsDripModalOpen(true)}
                className="h-8 px-3 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-none rounded-[3px]"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>New Drip Sequence</span>
              </Button>
            )}

            {activeTab === 'templates' && (
              <Button
                size="sm"
                onClick={handleOpenCreateTemplate}
                className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-none rounded-[3px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Content Template</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 p-0.5 rounded-[4px] border border-slate-200 flex flex-wrap h-9 gap-1">
          <TabsTrigger
            value="analytics"
            className="rounded-[3px] px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>ROI Attribution &amp; Funnel</span>
          </TabsTrigger>

          <TabsTrigger
            value="campaigns"
            className="rounded-[3px] px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Campaign Directory ({campaigns.length})</span>
          </TabsTrigger>

          <TabsTrigger
            value="automation"
            className="rounded-[3px] px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-none"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Drip Nurturing Workflows ({dripCampaigns.length})</span>
          </TabsTrigger>

          <TabsTrigger
            value="templates"
            className="rounded-[3px] px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-none"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Message Templates ({templates.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: EXECUTIVE MARKETING ROI & ATTRIBUTION FUNNEL */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <div className="border border-slate-200 bg-white rounded-[4px] shadow-none p-3.5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                <span>Allocated Budget</span>
              </p>
              <h3 className="text-lg font-black text-slate-900 font-mono">
                {formatVND(analyticsData?.summary?.totalBudget || 345000000)}
              </h3>
              <span className="text-[10px] text-slate-400 block">4 active initiatives</span>
            </div>

            <div className="border border-slate-200 bg-white rounded-[4px] shadow-none p-3.5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <span>Actual Spend</span>
              </p>
              <h3 className="text-lg font-black text-indigo-600 font-mono">
                {formatVND(analyticsData?.summary?.totalActualSpend || 75000000)}
              </h3>
              <span className="text-[10px] text-slate-400 block">21.7% of budget deployed</span>
            </div>

            <div className="border border-slate-200 bg-white rounded-[4px] shadow-none p-3.5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Attributed Revenue</span>
              </p>
              <h3 className="text-lg font-black text-emerald-600 font-mono">
                {formatVND(analyticsData?.summary?.totalWonRevenue || 1280000000)}
              </h3>
              <span className="text-[10px] text-emerald-600 font-semibold block">37 closed customers</span>
            </div>

            <div className="border border-slate-200 bg-white rounded-[4px] shadow-none p-3.5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-purple-500" />
                <span>Overall ROI Ratio</span>
              </p>
              <h3 className="text-lg font-black text-purple-600 font-mono">
                +{analyticsData?.summary?.overallRoiPercent || 1606.67}%
              </h3>
              <span className="text-[10px] text-purple-600 font-semibold block">17.0x spend efficiency</span>
            </div>

            <div className="border border-slate-200 bg-white rounded-[4px] shadow-none p-3.5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-500" />
                <span>Cost Per Lead (CPL)</span>
              </p>
              <h3 className="text-lg font-black text-sky-600 font-mono">
                {formatVND(analyticsData?.summary?.costPerLead || 263158)}
              </h3>
              <span className="text-[10px] text-slate-400 block">285 inbound leads</span>
            </div>

            <div className="border border-slate-200 bg-white rounded-[4px] shadow-none p-3.5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Customer Acquisition (CAC)</span>
              </p>
              <h3 className="text-lg font-black text-emerald-700 font-mono">
                {formatVND(analyticsData?.summary?.customerAcquisitionCost || 2027027)}
              </h3>
              <span className="text-[10px] text-slate-400 block">Per acquired customer</span>
            </div>
          </div>

          {/* Marketing Attribution Funnel */}
          <Card className="border border-slate-200 bg-white shadow-none rounded-[4px]">
            <CardHeader className="p-4 border-b border-slate-100 bg-[#F7F8F9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Full-Funnel Marketing Attribution Pipeline</span>
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500 mt-0.5">
                  Track buyer journey velocity from impression reach through deal conversion
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px] rounded-[3px]">
                Lead-to-Deal Conversion: 28.7%
              </Badge>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                {(analyticsData?.funnelStages || [
                  { stageOrder: 1, stageKey: 'IMPRESSIONS', stageNameVi: 'Brand Reach & Impressions', count: 48500, conversionRateFromPrevious: 100, dropoffRate: 0 },
                  { stageOrder: 2, stageKey: 'CLICKS', stageNameVi: 'Engaged Inbound Clicks', count: 4200, conversionRateFromPrevious: 8.66, dropoffRate: 91.34 },
                  { stageOrder: 3, stageKey: 'LEADS', stageNameVi: 'Captured Leads Generated', count: 285, conversionRateFromPrevious: 6.79, dropoffRate: 93.21 },
                  { stageOrder: 4, stageKey: 'MQL_QUALIFIED', stageNameVi: 'Marketing Qualified Leads (MQL)', count: 164, conversionRateFromPrevious: 57.54, dropoffRate: 42.46 },
                  { stageOrder: 5, stageKey: 'OPPORTUNITIES', stageNameVi: 'Commercial Sales Opportunities', count: 82, conversionRateFromPrevious: 50.0, dropoffRate: 50.0 },
                  { stageOrder: 6, stageKey: 'CLOSED_WON', stageNameVi: 'Contracted Revenue (Closed Won)', count: 37, conversionRateFromPrevious: 45.12, dropoffRate: 54.88 },
                ]).map((stage, idx) => {
                  const widthPercent = Math.max(15, 100 - idx * 16);
                  return (
                    <div key={stage.stageKey} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                            {stage.stageOrder}
                          </span>
                          <span>{stage.stageNameVi}</span>
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900 text-xs">{stage.count.toLocaleString('en-US')}</span>
                          {idx > 0 && (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Conversion: {stage.conversionRateFromPrevious}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-blue-600"
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
          <Card className="border border-slate-200 bg-white shadow-none rounded-[4px] overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 bg-[#F7F8F9]">
              <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>Channel Performance Attribution Matrix</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                  <TableRow className="hover:bg-[#F7F8F9]">
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Channel</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Spend</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Leads Volume</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Cost / Lead (CPL)</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Deals Won</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Revenue Value</TableHead>
                    <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4">ROI Yield</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(analyticsData?.channelPerformances || [
                    { channelType: 'WEBINAR', channelNameVi: 'Webinars & Virtual Roundtables', spend: 35000000, leadsCount: 142, costPerLead: 246479, conversionsCount: 18, wonRevenue: 550000000, roiPercent: 1471.43 },
                    { channelType: 'SOCIAL_ADS', channelNameVi: 'Paid Social (LinkedIn & Meta)', spend: 28000000, leadsCount: 89, costPerLead: 314607, conversionsCount: 7, wonRevenue: 420000000, roiPercent: 1400.00 },
                    { channelType: 'EMAIL', channelNameVi: 'Outbound Email & Nurturing', spend: 12000000, leadsCount: 54, costPerLead: 222222, conversionsCount: 12, wonRevenue: 310000000, roiPercent: 2483.33 },
                    { channelType: 'EVENT', channelNameVi: 'Industry Conferences & Summits', spend: 0, leadsCount: 0, costPerLead: 0, conversionsCount: 0, wonRevenue: 0, roiPercent: 0 },
                  ]).map((item) => (
                    <TableRow key={item.channelType} className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] text-xs">
                      <TableCell className="py-2 px-3 font-semibold text-slate-900">{item.channelNameVi}</TableCell>
                      <TableCell className="py-2 px-3 font-mono text-slate-700">{formatVND(item.spend)}</TableCell>
                      <TableCell className="py-2 px-3 font-bold text-blue-600 font-mono">{item.leadsCount} Leads</TableCell>
                      <TableCell className="py-2 px-3 font-mono text-slate-600">{formatVND(item.costPerLead)}</TableCell>
                      <TableCell className="py-2 px-3 font-bold text-emerald-600 font-mono">{item.conversionsCount} Deals</TableCell>
                      <TableCell className="py-2 px-3 font-mono font-bold text-slate-900">{formatVND(item.wonRevenue)}</TableCell>
                      <TableCell className="text-right pr-4 py-2 px-3">
                        <Badge className={`font-mono text-[10px] rounded-[2px] shadow-none ${item.roiPercent > 0 ? 'bg-[#E3FCEF] text-[#006644] border-emerald-300' : 'bg-slate-100 text-slate-600'}`}>
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

        {/* TAB 2: CAMPAIGNS MANAGEMENT */}
        <TabsContent value="campaigns" className="space-y-3">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-[4px] border border-slate-200 shadow-none">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search campaigns by title or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs border-slate-200 rounded-[3px]"
              />
            </div>

            <div className="w-full sm:w-44">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-8 text-xs border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-8 text-xs border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Channel Type" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Channels</SelectItem>
                  <SelectItem value="EMAIL">Email Marketing</SelectItem>
                  <SelectItem value="WEBINAR">Virtual Webinar</SelectItem>
                  <SelectItem value="EVENT">Trade Summit / Offline</SelectItem>
                  <SelectItem value="SOCIAL_ADS">Paid Social Ads</SelectItem>
                  <SelectItem value="DIRECT_MAIL">Direct Mail</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campaigns Table */}
          <Card className="border border-slate-200 bg-white shadow-none rounded-[4px] overflow-hidden">
            <CardContent className="p-0">
              {campaigns.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="No campaigns found"
                  description="Adjust filter criteria or create a new campaign to track lead generation."
                  actionLabel="Create Campaign"
                  onAction={handleOpenCreateCampaign}
                />
              ) : (
                <Table>
                  <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                    <TableRow className="hover:bg-[#F7F8F9]">
                      <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Campaign Name</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Channel</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Status</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Budget / Spend</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Leads / Won</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Timeline</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3">Owner</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-600 uppercase py-2.5 px-3 text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((c) => {
                      const statusCfg = CAMPAIGN_STATUS_CONFIG[c.status] || { label: c.status, className: 'bg-slate-100 text-slate-700' };
                      const typeCfg = CAMPAIGN_TYPE_CONFIG[c.type] || { label: c.type, className: 'bg-slate-100 text-slate-700' };
                      return (
                        <TableRow key={c.id} className="hover:bg-[#F1F2F4] border-b border-[#EBECF0] transition-colors text-xs">
                          <TableCell className="py-2 px-3">
                            <div>
                              <p className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer">{c.name}</p>
                              {c.description && <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.description}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            <Badge className={`text-[10px] font-semibold rounded-[2px] shadow-none ${typeCfg.className}`}>
                              {typeCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            <Badge className={`text-[10px] font-bold rounded-[2px] shadow-none ${statusCfg.className}`}>
                              {statusCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 px-3 font-mono">
                            <div>
                              <p className="font-bold text-slate-900">{formatVND(c.budget)}</p>
                              <p className="text-[10px] text-indigo-600 font-semibold">Spend: {formatVND(c.actualCost)}</p>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-3 font-mono">
                            <div>
                              <span className="font-bold text-blue-600">{c.leadsGenerated || 0} Leads</span>
                              <span className="text-slate-400 mx-1">/</span>
                              <span className="font-bold text-emerald-600">{c.conversionsCount || 0} Won</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-3 text-xs text-slate-600 font-mono">
                            {c.startDate ? `${c.startDate} → ${c.endDate || '...'}` : 'Not set'}
                          </TableCell>
                          <TableCell className="py-2 px-3 text-xs font-medium text-slate-700">
                            {c.assignedTo || 'Unassigned'}
                          </TableCell>
                          <TableCell className="text-right pr-4 py-2 px-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditCampaign(c)}
                                className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 rounded-[3px]"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCampaign(c.id, c.name)}
                                className="h-7 w-7 p-0 text-slate-600 hover:text-rose-600 rounded-[3px]"
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
              )}

              {/* Standard Pagination */}
              <StandardPagination
                currentPage={page + 1}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={(p) => setPage(p - 1)}
                onPageSizeChange={setPageSize}
                itemLabel="campaigns"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: DRIP AUTOMATION SEQUENCES */}
        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {dripCampaigns.map((drip) => (
              <Card key={drip.id} className="border border-slate-200 bg-white shadow-none rounded-[4px] overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-[#F7F8F9] flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{drip.name}</h3>
                      <Badge className={`text-[10px] font-bold rounded-[2px] shadow-none ${drip.status === 'ACTIVE' ? 'bg-[#E3FCEF] text-[#006644] border-emerald-300' : 'bg-[#FFFAE6] text-[#974F0C] border-amber-200'}`}>
                        {drip.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED'}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-semibold rounded-[2px]">
                        Trigger: {drip.triggerEvent}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{drip.description}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleDripStatus(drip.id, drip.status)}
                      className="h-8 text-xs font-semibold gap-1.5 rounded-[3px]"
                    >
                      {drip.status === 'ACTIVE' ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Activate</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenStepAnalytics(drip)}
                      className="h-8 text-xs font-semibold gap-1.5 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50 rounded-[3px]"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Step Funnel</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleOpenEnrollModal(drip.id)}
                      className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-none rounded-[3px]"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Enroll Lead</span>
                    </Button>
                  </div>
                </div>

                {/* Drip Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 bg-white p-3 border-b border-slate-100 text-center gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Total Enrolled</span>
                    <p className="text-sm font-black text-slate-900 mt-0.5 font-mono">{drip.totalEnrolled} Leads</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Active In Sequence</span>
                    <p className="text-sm font-black text-blue-600 mt-0.5 font-mono">{drip.activeSubscribers} Running</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Completed</span>
                    <p className="text-sm font-black text-emerald-600 mt-0.5 font-mono">{drip.completedSubscribers} Done</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Total Sequence Steps</span>
                    <p className="text-sm font-black text-purple-600 mt-0.5 font-mono">{drip.stepCount} Steps</p>
                  </div>
                </div>

                {/* Visual Step Timeline */}
                <div className="p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Visual Workflow Sequence</span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative">
                    {(drip.steps || [
                      { stepOrder: 1, stepType: 'EMAIL', name: 'Welcome & Enterprise Capabilities', delayDays: 0 },
                      { stepOrder: 2, stepType: 'SMS', name: 'SMS Architecture Demo Invite', delayDays: 2 },
                      { stepOrder: 3, stepType: 'EMAIL', name: 'Industry Case Study', delayDays: 4 },
                      { stepOrder: 4, stepType: 'CREATE_TASK', name: 'Sales Discovery Call Task', delayDays: 6 },
                    ]).map((step, idx) => (
                      <div
                        key={step.stepOrder}
                        className="p-3 rounded-[4px] border border-slate-200 bg-slate-50/50 shadow-none space-y-1.5 relative text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                            {step.stepOrder}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 bg-white rounded-[2px]">
                            <Clock className="w-3 h-3" />
                            <span>{step.delayDays === 0 ? 'Immediate' : `After ${step.delayDays}d`}</span>
                          </Badge>
                        </div>

                        <div className="pt-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700">
                            {step.stepType === 'EMAIL' && <Mail className="w-3 h-3" />}
                            {step.stepType === 'SMS' && <MessageSquare className="w-3 h-3" />}
                            {step.stepType === 'CREATE_TASK' && <CheckSquare className="w-3 h-3 text-emerald-600" />}
                            <span>{step.stepType}</span>
                          </div>
                          <p className="font-semibold text-slate-800 mt-1 line-clamp-2">{step.name}</p>
                          {step.templateSubject && (
                            <p className="text-[10px] text-slate-500 mt-0.5 italic line-clamp-1">"{step.templateSubject}"</p>
                          )}
                        </div>

                        {idx < 3 && (
                          <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                            <ArrowRight className="w-3.5 h-3.5" />
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

        {/* TAB 4: MARKETING CONTENT TEMPLATES */}
        <TabsContent value="templates" className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-[4px] border border-slate-200 shadow-none">
            <div className="w-full sm:w-52">
              <Select value={templateChannelFilter} onValueChange={setTemplateChannelFilter}>
                <SelectTrigger className="h-8 text-xs border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Channels</SelectItem>
                  <SelectItem value="EMAIL">Email Marketing</SelectItem>
                  <SelectItem value="SMS">SMS Brandname</SelectItem>
                  <SelectItem value="ZALO_ZNS">Zalo Notification (ZNS)</SelectItem>
                  <SelectItem value="IN_APP">In-App Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-52">
              <Select value={templateCategoryFilter} onValueChange={setTemplateCategoryFilter}>
                <SelectTrigger className="h-8 text-xs border-slate-200 rounded-[3px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="WELCOME">Welcome</SelectItem>
                  <SelectItem value="NURTURE">Nurture</SelectItem>
                  <SelectItem value="PROMOTION">Promotion</SelectItem>
                  <SelectItem value="RE_ENGAGEMENT">Re-engagement</SelectItem>
                  <SelectItem value="EVENT">Event Invitation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Templates Grid */}
          {loadingTemplates ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs mt-2 font-medium">Loading templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tpl) => (
                <Card key={tpl.id} className="border border-slate-200 bg-white shadow-none rounded-[4px] flex flex-col justify-between hover:border-blue-300 transition-all">
                  <CardHeader className="p-3.5 pb-2 border-b border-slate-100 bg-[#F7F8F9]">
                    <div className="flex items-center justify-between">
                      <Badge className={`text-[10px] font-bold rounded-[2px] shadow-none ${tpl.channel === 'EMAIL' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {tpl.channel === 'EMAIL' ? 'EMAIL' : 'SMS'}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] font-semibold text-slate-500 bg-white rounded-[2px]">
                        Used {tpl.usageCount} times
                      </Badge>
                    </div>
                    <CardTitle className="text-xs font-bold text-slate-900 mt-1.5">{tpl.name}</CardTitle>
                    {tpl.subject && (
                      <CardDescription className="text-[11px] text-blue-700 font-medium line-clamp-1">
                        Subject: {tpl.subject}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="p-3.5 space-y-2.5 flex-1">
                    <div className="bg-slate-50 p-2.5 rounded-[3px] border border-slate-100 text-xs text-slate-700 font-mono line-clamp-4 whitespace-pre-line">
                      {tpl.content}
                    </div>

                    {tpl.variables && tpl.variables.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Merge Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {tpl.variables.map((v) => (
                            <span key={v} className="text-[9px] font-mono bg-purple-50 text-purple-700 border border-purple-200 px-1 py-0.2 rounded-[2px]">
                              {`{{${v}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <div className="p-3 pt-0 flex items-center justify-between border-t border-slate-100 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewTemplate(tpl)}
                      className="h-7 text-xs font-medium gap-1 text-slate-700 border-slate-200 rounded-[3px]"
                    >
                      <Eye className="w-3 h-3 text-blue-600" />
                      <span>Preview</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditTemplate(tpl)}
                        className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 rounded-[3px]"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                        className="h-7 w-7 p-0 text-slate-600 hover:text-rose-600 rounded-[3px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 1. Create/Edit Campaign Modal */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingCampaign ? 'Edit Marketing Campaign' : 'Create New Marketing Campaign'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Define campaign targets, channel parameters, budget allocations and assigned owners
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCampaign} className="space-y-3.5 pt-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Campaign Title *</Label>
              <Input
                placeholder="e.g. Enterprise Digital Transformation Summit 2026"
                value={campName}
                onChange={(e) => setCampName(e.target.value)}
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Campaign Channel</Label>
                <Select value={campType} onValueChange={(val: CampaignType) => setCampType(val)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEBINAR">Virtual Webinar</SelectItem>
                    <SelectItem value="SOCIAL_ADS">Paid Social (LinkedIn / Meta)</SelectItem>
                    <SelectItem value="EMAIL">Email Marketing</SelectItem>
                    <SelectItem value="EVENT">Trade Summit / Offline</SelectItem>
                    <SelectItem value="DIRECT_MAIL">Direct Mail Outreach</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Operational Status</Label>
                <Select value={campStatus} onValueChange={(val: CampaignStatus) => setCampStatus(val)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Budget Allocation (₫)</Label>
                <Input
                  type="number"
                  placeholder="50000000"
                  value={campBudget}
                  onChange={(e) => setCampBudget(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Target Revenue Expected (₫)</Label>
                <Input
                  type="number"
                  placeholder="500000000"
                  value={campExpectedRevenue}
                  onChange={(e) => setCampExpectedRevenue(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Start Date</Label>
                <DatePicker
                  value={campStartDate}
                  onChange={(val) => setCampStartDate(val || '')}
                  className="w-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">End Date</Label>
                <DatePicker
                  value={campEndDate}
                  onChange={(val) => setCampEndDate(val || '')}
                  className="w-full text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Campaign Lead Owner</Label>
              <Input
                placeholder="Sarah Jenkins"
                value={campAssignedTo}
                onChange={(e) => setCampAssignedTo(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Strategic Objectives &amp; Description</Label>
              <Input
                placeholder="Strategic target audience notes, buyer persona and success metrics..."
                value={campDescription}
                onChange={(e) => setCampDescription(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCampaignModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isCampaignSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs">
                {isCampaignSubmitting ? 'Saving...' : 'Save Campaign'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Create Drip Workflow Modal */}
      <Dialog open={isDripModalOpen} onOpenChange={setIsDripModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              <span>Configure Drip Nurturing Automation Workflow</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure event triggers and automated multi-step touchpoint sequences
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDripCampaign} className="space-y-3.5 pt-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Sequence Name *</Label>
              <Input
                placeholder="e.g. Inbound Demo Lead Nurturing & Activation"
                value={dripName}
                onChange={(e) => setDripName(e.target.value)}
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Trigger Event</Label>
                <Select value={dripTrigger} onValueChange={setDripTrigger}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEAD_CREATED">New Lead Created</SelectItem>
                    <SelectItem value="FORM_SUBMITTED">Website Form Submitted</SelectItem>
                    <SelectItem value="CONTRACT_SIGNED">Contract Signed</SelectItem>
                    <SelectItem value="DEAL_LOST">Opportunity Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Target Audience Scope</Label>
                <Select value={dripAudience} onValueChange={setDripAudience}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_LEADS">All New Inbound Leads</SelectItem>
                    <SelectItem value="EXISTING_CUSTOMERS">Existing Customer Accounts</SelectItem>
                    <SelectItem value="LOST_LEADS">Dormant Leads (&gt;30 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Workflow Description</Label>
              <Input
                placeholder="Operational purpose of this nurturing flow..."
                value={dripDescription}
                onChange={(e) => setDripDescription(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            {/* Dynamic Steps */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Action Steps ({dripSteps.length} steps)</span>
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddDripStep} className="h-7 text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Action Step</span>
                </Button>
              </div>

              <div className="space-y-2">
                {dripSteps.map((step, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700">Step {idx + 1}</span>
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
                        <Label className="text-[11px] font-semibold text-slate-600">Action Type</Label>
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
                            <SelectItem value="EMAIL">Send Email</SelectItem>
                            <SelectItem value="SMS">Send SMS</SelectItem>
                            <SelectItem value="CREATE_TASK">Create Phone Call Task</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-600">Delay (Days After)</Label>
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
                        <Label className="text-[11px] font-semibold text-slate-600">Step Description</Label>
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

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDripModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isDripSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs">
                {isDripSubmitting ? 'Saving...' : 'Save Sequence'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Drip Funnel Step Analytics Modal */}
      <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <span>Step Conversion &amp; Open Rate Analytics</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {selectedDripAnalytics?.campaignName || 'Touchpoint performance breakdown'}
            </DialogDescription>
          </DialogHeader>

          {loadingStepAnalytics ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading step metrics...</div>
          ) : (
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-[4px] border border-indigo-100">
                <div>
                  <span className="font-semibold text-indigo-900">Total Enrolled Leads:</span>
                  <span className="ml-2 font-black text-indigo-700 font-mono text-sm">{selectedDripAnalytics?.totalEnrolled}</span>
                </div>
                <div>
                  <span className="font-semibold text-indigo-900">Target Conversion Rate:</span>
                  <span className="ml-2 font-black text-emerald-600 font-mono text-sm">+{selectedDripAnalytics?.overallConversionRate}%</span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedDripAnalytics?.stepAnalytics.map((step) => (
                  <div key={step.stepOrder} className="p-3 bg-white rounded-[4px] border border-slate-200 shadow-none space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {step.stepOrder}
                        </span>
                        <span>{step.stepName}</span>
                      </span>
                      <Badge className="bg-blue-50 text-blue-700 text-[10px] font-bold rounded-[2px] shadow-none">
                        Open Rate: {step.openRatePercent}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 text-center text-[11px] bg-slate-50 p-2 rounded-[3px] gap-2 font-mono">
                      <div>
                        <span className="text-slate-400">Dispatched</span>
                        <p className="font-bold text-slate-700 mt-0.5">{step.sentCount}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Opened</span>
                        <p className="font-bold text-blue-600 mt-0.5">{step.openCount}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Clicked / Converted</span>
                        <p className="font-bold text-emerald-600 mt-0.5">{step.clickCount} ({step.conversionRatePercent}%)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button size="sm" onClick={() => setIsAnalyticsModalOpen(false)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Enroll Lead Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <span>Enroll Lead into Sequence</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Initiate automated messaging triggers for target prospective contact
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEnrollSubmit} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Contact Full Name *</Label>
              <Input
                placeholder="Alex Morgan"
                value={enrollName}
                onChange={(e) => setEnrollName(e.target.value)}
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Email Address</Label>
              <Input
                type="email"
                placeholder="alex.morgan@apextechnologies.com"
                value={enrollEmail}
                onChange={(e) => setEnrollEmail(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">SMS Phone Number</Label>
              <Input
                placeholder="+1 555 0192"
                value={enrollPhone}
                onChange={(e) => setEnrollPhone(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEnrollModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs">
                Enroll Now
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Create/Edit Template Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingTemplate ? 'Edit Marketing Template' : 'Create New Marketing Template'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Compose Email or SMS message templates with dynamic merge tags
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTemplate} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Template Title *</Label>
              <Input
                placeholder="e.g. Welcome Email After Product Demo"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Channel</Label>
                <Select value={templateChannel} onValueChange={(val: any) => setTemplateChannel(val)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">Email Marketing</SelectItem>
                    <SelectItem value="SMS">SMS Brandname</SelectItem>
                    <SelectItem value="ZALO_ZNS">Zalo Notification (ZNS)</SelectItem>
                    <SelectItem value="IN_APP">In-App Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Category</Label>
                <Select value={templateCategory} onValueChange={(val: any) => setTemplateCategory(val)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WELCOME">Welcome</SelectItem>
                    <SelectItem value="NURTURE">Nurture</SelectItem>
                    <SelectItem value="PROMOTION">Promotion</SelectItem>
                    <SelectItem value="RE_ENGAGEMENT">Re-engagement</SelectItem>
                    <SelectItem value="EVENT">Event Invitation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {templateChannel === 'EMAIL' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Email Subject</Label>
                <Input
                  placeholder="e.g. Welcome {{lead.name}} to our platform"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">Template Body *</Label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Insert tag:</span>
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
                placeholder="Enter template body text..."
                required
                className="w-full rounded-[3px] border border-slate-200 bg-white p-2.5 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTemplateModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isTemplateSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
                {isTemplateSubmitting ? 'Saving...' : 'Save Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Preview Template Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Live Template Preview</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Verify merge tag variable resolution with sample customer records
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-[3px] border border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Sample Contact:</span>
                <Input
                  value={previewSampleName}
                  onChange={(e) => setPreviewSampleName(e.target.value)}
                  className="h-7 text-xs bg-white mt-1 border-slate-200"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Sample Company:</span>
                <Input
                  value={previewSampleCompany}
                  onChange={(e) => setPreviewSampleCompany(e.target.value)}
                  className="h-7 text-xs bg-white mt-1 border-slate-200"
                />
              </div>
            </div>

            {(previewRendered?.renderedSubject || previewRendered?.subject) && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-600">Dispatched Subject:</span>
                <div className="p-2.5 bg-blue-50 rounded-[3px] border border-blue-200 text-xs font-bold text-blue-900">
                  {previewRendered?.renderedSubject || previewRendered?.subject}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-600">Rendered Content Body:</span>
              <div className="p-3 bg-white rounded-[3px] border border-slate-200 shadow-none text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                {previewRendered?.renderedContent || previewRendered?.content}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button size="sm" onClick={() => setIsPreviewModalOpen(false)} className="text-xs">
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignsPage;
