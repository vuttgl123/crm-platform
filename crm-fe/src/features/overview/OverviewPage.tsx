import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Briefcase,
  Building2,
  Zap,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
  PhoneCall,
  Mail,
  FileText,
  Trophy,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import {
  overviewApi,
  OverviewResponse,
  ForecastPeriodPreset,
} from '@/services/api/overviewApi';
import { toast } from 'sonner';

// Helper to format currency values
const formatMoney = (amountStr: string | undefined | null, currency: string = 'VND') => {
  if (!amountStr) return '0 ' + currency;
  const num = parseFloat(amountStr);
  if (isNaN(num)) return amountStr + ' ' + currency;

  if (currency === 'VND' || currency === '₫') {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + 'B ₫';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + 'M ₫';
    }
    return num.toLocaleString('vi-VN') + ' ₫';
  }

  return num.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' ' + currency;
};

// Activity type icons
const getActivityIcon = (type: string) => {
  const t = (type || '').toUpperCase();
  if (t.includes('CALL') || t.includes('PHONE')) return <PhoneCall className="w-3.5 h-3.5 text-blue-600" />;
  if (t.includes('MEET') || t.includes('VISIT')) return <Calendar className="w-3.5 h-3.5 text-purple-600" />;
  if (t.includes('EMAIL') || t.includes('MAIL')) return <Mail className="w-3.5 h-3.5 text-amber-600" />;
  return <FileText className="w-3.5 h-3.5 text-slate-600" />;
};

// Standard CRM Lifecycle colors
const LIFECYCLE_COLOR_MAP: Record<string, { label: string; bg: string; text: string; border: string; bar: string }> = {
  PROSPECT: { label: 'Prospect (Tiềm năng)', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', bar: 'bg-purple-500' },
  QUALIFIED: { label: 'Qualified (Đạt chuẩn)', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-500' },
  CUSTOMER: { label: 'Customer (Khách hàng)', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' },
  INACTIVE: { label: 'Inactive (Ngừng hoạt động)', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' },
  CHURNED: { label: 'Churned (Rời bỏ)', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: 'bg-rose-500' },
};

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<ForecastPeriodPreset>('THIS_QUARTER');
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async (preset: ForecastPeriodPreset) => {
    setLoading(true);
    try {
      const res = await overviewApi.getOverview(preset);
      setData(res);
    } catch {
      toast.error('Unable to load overview intelligence data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview(period);
  }, [fetchOverview, period]);

  const currency = data?.revenue?.currencyCode || 'VND';

  // Calculate max pipeline amount for Funnel relative bar width
  const maxFunnelAmount = Math.max(
    ...(data?.funnel?.stages.map((s) => parseFloat(s.openPipelineAmount) || 0) || [1]),
    1
  );

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Executive Revenue & Operations Cockpit"
        subtitle="Real-time commercial intelligence, revenue forecast, customer base progression, and daily executive action items."
        actions={
          <div className="flex items-center gap-2.5">
            {/* Period Filter Preset */}
            <div className="flex bg-slate-100 p-0.5 rounded-[3px] border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPeriod('THIS_MONTH')}
                className={`px-3 py-1 rounded-[2px] transition-all ${
                  period === 'THIS_MONTH'
                    ? 'bg-white text-[#0C66E4] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => setPeriod('THIS_QUARTER')}
                className={`px-3 py-1 rounded-[2px] transition-all ${
                  period === 'THIS_QUARTER'
                    ? 'bg-white text-[#0C66E4] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                This Quarter
              </button>
              <button
                type="button"
                onClick={() => setPeriod('THIS_YEAR')}
                className={`px-3 py-1 rounded-[2px] transition-all ${
                  period === 'THIS_YEAR'
                    ? 'bg-white text-[#0C66E4] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                This Year
              </button>
            </div>

            {/* Refresh Button */}
            <ActionTooltip label="Refresh overview metrics">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOverview(period)}
                disabled={loading}
                className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 rounded-[3px]"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </ActionTooltip>
          </div>
        }
      />

      {loading && !data ? (
        <div className="h-96 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-[4px] shadow-2xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#0C66E4] mb-3" />
          <p className="text-xs font-semibold text-slate-600">Aggregating enterprise telemetry &amp; sales data...</p>
        </div>
      ) : (
        <>
          {/* 4 Main KPI Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* KPI 1: Closed Won Revenue */}
            <div className="bg-white rounded-[4px] border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-[3px] bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                {data?.revenue?.closedWonChangePercent !== undefined && data.revenue.closedWonChangePercent !== null ? (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-[2px] border flex items-center gap-0.5 ${
                      data.revenue.closedWonChangePercent >= 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {data.revenue.closedWonChangePercent >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Math.abs(data.revenue.closedWonChangePercent).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400">Current Window</span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Closed Won Revenue
                </span>
                <div className="text-xl font-black text-slate-900 leading-tight mt-0.5">
                  {formatMoney(data?.revenue?.closedWonAmount, currency)}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{data?.revenue?.closedWonCount || 0} Deals Won</span>
                <span className="text-emerald-700 font-semibold">
                  Prev: {formatMoney(data?.revenue?.previousClosedWonAmount, currency)}
                </span>
              </div>
            </div>

            {/* KPI 2: Open Pipeline */}
            <div className="bg-white rounded-[4px] border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-[3px] bg-blue-50 text-[#0C66E4] border border-blue-200 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-[2px] border border-blue-200">
                  {data?.revenue?.openOpportunityCount || 0} Active Deals
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Open Pipeline Volume
                </span>
                <div className="text-xl font-black text-blue-700 leading-tight mt-0.5">
                  {formatMoney(data?.revenue?.openPipelineAmount, currency)}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Active Funnel</span>
                <span className="text-[#0C66E4] font-semibold">High Engagement</span>
              </div>
            </div>

            {/* KPI 3: Weighted Forecast */}
            <div className="bg-white rounded-[4px] border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-[3px] bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-[2px] border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Probability Weighted
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Weighted Expected Forecast
                </span>
                <div className="text-xl font-black text-purple-700 leading-tight mt-0.5">
                  {formatMoney(data?.revenue?.weightedForecastAmount, currency)}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Forecast Confidence</span>
                <span className="text-purple-700 font-semibold">AI Calibrated</span>
              </div>
            </div>

            {/* KPI 4: Customer Base Total */}
            <div className="bg-white rounded-[4px] border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-[3px] bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                {data?.customerBase?.churnedSharePercent !== undefined && data.customerBase.churnedSharePercent !== null ? (
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-[2px]">
                    Churn: {data.customerBase.churnedSharePercent.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400">Total CRM</span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Managed Accounts
                </span>
                <div className="text-xl font-black text-slate-900 leading-tight mt-0.5">
                  {(data?.customerBase?.totalCount || 0).toLocaleString()} Accounts
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Enterprise Portfolio</span>
                <span className="text-indigo-700 font-semibold">5 Stages</span>
              </div>
            </div>
          </div>

          {/* Main Grid: Pipeline Funnel & Tables vs Tasks & Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Funnel Stage Conversion Bar */}
              {data?.funnel ? (
                <div className="bg-white rounded-[4px] p-4 border border-slate-200 shadow-2xs">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Pipeline Funnel Distribution
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Live breakdown of open opportunities across progressive pipeline stages
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-[2px]">
                      {data.funnel.stages.length} Stages
                    </span>
                  </div>

                  {data.funnel.stages.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No active pipeline stages configured for this reporting period.
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs">
                      {data.funnel.stages.map((stage) => {
                        const amount = parseFloat(stage.openPipelineAmount) || 0;
                        const percentage = Math.min(100, Math.max(8, (amount / maxFunnelAmount) * 100));

                        return (
                          <div key={stage.stageId || stage.stageName} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-slate-900">{stage.stageName}</span>
                                {stage.pipelineName && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({stage.pipelineName})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-slate-500 font-normal text-[11px]">
                                  {stage.opportunityCount} deals
                                </span>
                                <span className="font-bold text-[#0C66E4]">
                                  {formatMoney(stage.openPipelineAmount, currency)}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-[2px] h-2 overflow-hidden">
                              <div
                                className="bg-[#0C66E4] h-2 rounded-[2px] transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}

              {/* High-Value Opportunities Table */}
              {data?.topOpportunities ? (
                <div className="bg-white rounded-[4px] border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        High-Value Commercial Opportunities
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Top open deals ranked by deal volume in {currency}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/app/crm/opportunities')}
                      className="text-xs font-semibold text-[#0C66E4] hover:text-[#0052CC] h-7 px-2 gap-1 rounded-[3px]"
                    >
                      <span>View All Opportunities</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-[#F7F8F9] border-b border-slate-200">
                        <TableRow className="text-xs">
                          <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                            Deal &amp; Account
                          </TableHead>
                          <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                            Value ({currency})
                          </TableHead>
                          <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                            Current Stage
                          </TableHead>
                          <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">
                            Owner
                          </TableHead>
                          <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-3">
                            Expected Close
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-xs font-sans">
                        {data.topOpportunities.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="py-8 text-center text-slate-500">
                              No open high-value opportunities found for this period.
                            </TableCell>
                          </TableRow>
                        ) : (
                          data.topOpportunities.items.map((opp) => (
                            <TableRow
                              key={opp.id}
                              className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs"
                            >
                              <TableCell className="py-2.5 px-3">
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/app/crm/opportunities?search=${encodeURIComponent(opp.name)}`)}
                                    className="font-semibold text-slate-900 hover:text-[#0C66E4] text-left transition-colors block truncate max-w-xs"
                                  >
                                    {opp.name}
                                  </button>
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    {opp.accountName || 'Unassigned Account'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5 px-3 font-bold text-[#0C66E4]">
                                {formatMoney(opp.amount, opp.currencyCode)}
                                {opp.probability !== null && opp.probability !== undefined && (
                                  <span className="block text-[10px] font-normal text-slate-500">
                                    Prob: {(opp.probability * 100).toFixed(0)}%
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="py-2.5 px-3">
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold rounded-[2px]"
                                >
                                  {opp.stageName}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-2.5 px-3 text-slate-700 font-medium">
                                {opp.ownerName || 'Unassigned'}
                              </TableCell>
                              <TableCell className="py-2.5 px-3 text-right pr-3 text-slate-600 font-mono text-[11px]">
                                {opp.expectedCloseDate || '—'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right Column (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* My Day & Due Activities */}
              {data?.myDay ? (
                <div className="bg-white rounded-[4px] p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        My Day &amp; Due Action Items
                      </h3>
                      <p className="text-[11px] text-slate-500">Urgent customer touchpoints</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {data.myDay.overdueCount > 0 && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-[2px]">
                          {data.myDay.overdueCount} Overdue
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-[2px]">
                        {data.myDay.dueTodayCount} Due Today
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {data.myDay.items.length === 0 ? (
                      <div className="py-6 text-center text-slate-500 text-xs">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                        <span>All clear! No overdue or pending tasks for today.</span>
                      </div>
                    ) : (
                      data.myDay.items.map((act) => (
                        <div
                          key={act.id}
                          className={`p-2.5 rounded-[3px] border flex items-start gap-2.5 transition-colors ${
                            act.overdue
                              ? 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-50/70'
                              : 'bg-[#F7F8F9] border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">{getActivityIcon(act.activityType)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-xs truncate">
                              {act.subject}
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                              <span className="truncate">{act.accountName || 'Customer Touchpoint'}</span>
                              {act.overdue ? (
                                <span className="font-bold text-rose-600 text-[10px]">Overdue</span>
                              ) : (
                                <span className="text-[10px] text-slate-600 font-mono">
                                  {act.scheduledStartAt ? new Date(act.scheduledStartAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}

              {/* Customer Base Lifecycle Stage Distribution */}
              {data?.customerBase ? (
                <div className="bg-white rounded-[4px] p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Customer Base Lifecycle
                      </h3>
                      <p className="text-[11px] text-slate-500">Account status progression</p>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      {data.customerBase.totalCount.toLocaleString()} Total
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {data.customerBase.stages.map((st) => {
                      const cfg = LIFECYCLE_COLOR_MAP[st.lifecycleStage] || {
                        label: st.lifecycleStage,
                        bg: 'bg-slate-50',
                        text: 'text-slate-700',
                        border: 'border-slate-200',
                        bar: 'bg-slate-500',
                      };
                      const pct = data.customerBase!.totalCount > 0
                        ? ((st.accountCount / data.customerBase!.totalCount) * 100).toFixed(1)
                        : '0.0';

                      return (
                        <div key={st.lifecycleStage} className="space-y-1">
                          <div className="flex justify-between items-center text-[11px] font-semibold">
                            <span className={cfg.text}>{cfg.label}</span>
                            <span className="text-slate-700 font-bold">
                              {st.accountCount.toLocaleString()} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-[2px] h-1.5 overflow-hidden">
                            <div
                              className={`${cfg.bar} h-1.5 rounded-[2px] transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Performance Leaderboard */}
              {data?.leaderboard ? (
                <div className="bg-white rounded-[4px] p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Sales Performance Leaderboard
                      </h3>
                      <p className="text-[11px] text-slate-500">Ranked by weighted deal value</p>
                    </div>
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {data.leaderboard.entries.length === 0 ? (
                      <div className="py-6 text-center text-slate-500 text-xs">
                        No team member performance records for this period.
                      </div>
                    ) : (
                      data.leaderboard.entries.map((entry, idx) => (
                        <div
                          key={entry.ownerId || entry.ownerLabel || idx}
                          className="flex items-center gap-2.5 p-2 rounded-[3px] bg-[#F7F8F9] border border-slate-200"
                        >
                          <div
                            className={`w-6 h-6 rounded-[2px] flex items-center justify-center font-black text-xs shrink-0 ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                : idx === 2
                                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                          >
                            #{idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-xs truncate">
                              {entry.ownerLabel}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Won: {formatMoney(entry.closedWonAmount, currency)} • {entry.opportunityCount} deals
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-[#0C66E4] text-xs">
                              {formatMoney(entry.weightedForecastAmount, currency)}
                            </span>
                            <span className="block text-[9px] text-slate-400 uppercase font-semibold">Weighted</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OverviewPage;
