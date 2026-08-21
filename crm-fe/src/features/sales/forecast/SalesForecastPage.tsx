import React, { useState, useEffect, useCallback } from 'react';
import {
  forecastApi,
  SalesForecastSummary,
} from '@/services/api/forecastApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import {
  TrendingUp,
  Target,
  Trophy,
  DollarSign,
  PieChart,
  RefreshCw,
  Award,
  CheckCircle2,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const SalesForecastPage: React.FC = () => {
  const [period, setPeriod] = useState<'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR'>('THIS_MONTH');
  const [summary, setSummary] = useState<SalesForecastSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    try {
      const data = await forecastApi.getForecastSummary(period);
      setSummary(data);
    } catch {
      toast.error('Unable to load revenue forecast data');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const closedWon = summary?.closedWonAmount || 0;
  const commit = summary?.commitAmount || 0;
  const bestCase = summary?.bestCaseAmount || 0;
  const pipeline = summary?.pipelineAmount || 0;
  const weightedTotal = summary?.weightedForecastAmount || (closedWon + commit * 0.85 + bestCase * 0.6 + pipeline * 0.25);
  const targetQuota = summary?.totalTargetQuota || 1_200_000_000;
  const quotaAttainment = targetQuota > 0 ? (closedWon / targetQuota) * 100 : 0;
  const projectedAttainment = targetQuota > 0 ? (weightedTotal / targetQuota) * 100 : 0;

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Revenue Forecasting &amp; Quota Attainment"
        subtitle="Predictive revenue intelligence across Commit, Best Case, Pipeline categories &amp; rep attainment metrics"
        icon={TrendingUp}
        actions={
          <div className="flex items-center gap-2.5">
            <div className="w-48">
              <Select
                value={period}
                onValueChange={(val) => setPeriod(val as any)}
              >
                <SelectTrigger className="h-8 text-xs font-semibold bg-white border-slate-200 shadow-none rounded-[3px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[3px]">
                  <SelectItem value="THIS_MONTH">This Month</SelectItem>
                  <SelectItem value="THIS_QUARTER">This Quarter (Q3)</SelectItem>
                  <SelectItem value="THIS_YEAR">Full Fiscal Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchForecast}
              disabled={loading}
              className="h-8 px-3 text-xs border-slate-200 bg-white hover:bg-slate-50 gap-1.5 shadow-none text-slate-700 font-medium rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        }
      />

      {/* Forecast Waterfall KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Closed Won */}
        <div className="border border-emerald-200 bg-white rounded-[4px] shadow-none p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Closed Won</span>
            <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-black text-emerald-950 font-mono">
            {(closedWon / 1_000_000).toLocaleString('en-US')} <span className="text-xs font-normal">M ₫</span>
          </div>
          <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Confidence: 100%
          </div>
        </div>

        {/* 2. Commit */}
        <div className="border border-blue-200 bg-white rounded-[4px] shadow-none p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Commit</span>
            <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-black text-blue-950 font-mono">
            {(commit / 1_000_000).toLocaleString('en-US')} <span className="text-xs font-normal">M ₫</span>
          </div>
          <div className="text-[10px] text-blue-700 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Probability ≥ 80%
          </div>
        </div>

        {/* 3. Best Case */}
        <div className="border border-purple-200 bg-white rounded-[4px] shadow-none p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Best Case</span>
            <div className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-black text-purple-950 font-mono">
            {(bestCase / 1_000_000).toLocaleString('en-US')} <span className="text-xs font-normal">M ₫</span>
          </div>
          <div className="text-[10px] text-purple-700 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            Probability 50% - 79%
          </div>
        </div>

        {/* 4. Pipeline */}
        <div className="border border-amber-200 bg-white rounded-[4px] shadow-none p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pipeline</span>
            <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-black text-amber-950 font-mono">
            {(pipeline / 1_000_000).toLocaleString('en-US')} <span className="text-xs font-normal">M ₫</span>
          </div>
          <div className="text-[10px] text-amber-700 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Probability &lt; 50%
          </div>
        </div>

        {/* 5. Weighted Forecast Total */}
        <div className="border border-slate-900 bg-slate-900 text-white rounded-[4px] shadow-none p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Weighted Forecast</span>
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-black text-white font-mono">
            {(weightedTotal / 1_000_000).toLocaleString('en-US')} <span className="text-xs font-normal text-slate-400">M ₫</span>
          </div>
          <div className="text-[10px] text-slate-300 flex items-center gap-1">
            <span>Projected:</span>
            <strong className="text-emerald-400 font-bold">{projectedAttainment.toFixed(1)}% Quota</strong>
          </div>
        </div>
      </div>

      {/* Quota Attainment Progress & Win Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2 border border-slate-200 bg-white shadow-none rounded-[4px] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Team Quota Progress
              </h3>
              <p className="text-[11px] text-slate-500">
                Period Quota Target: <strong className="text-slate-800 font-mono">{(targetQuota / 1_000_000).toLocaleString('en-US')} M ₫</strong>
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono font-bold text-xs rounded-[3px]">
              {quotaAttainment.toFixed(1)}% Attained
            </Badge>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.min(quotaAttainment, 100)}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Closed Won: ${(closedWon / 1_000_000).toFixed(0)} M`}
              />
              <div
                style={{ width: `${Math.min((commit / targetQuota) * 100, 100 - quotaAttainment)}%` }}
                className="bg-blue-500 transition-all duration-500"
                title={`Commit: ${(commit / 1_000_000).toFixed(0)} M`}
              />
              <div
                style={{ width: `${Math.min((bestCase / targetQuota) * 100, 100 - (quotaAttainment + (commit / targetQuota) * 100))}%` }}
                className="bg-purple-400 transition-all duration-500"
                title={`Best Case: ${(bestCase / 1_000_000).toFixed(0)} M`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Won: <strong>{(closedWon / 1_000_000).toFixed(0)} M</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Commit: <strong>{(commit / 1_000_000).toFixed(0)} M</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Best Case: <strong>{(bestCase / 1_000_000).toFixed(0)} M</strong>
                </span>
              </div>
              <span className="font-semibold text-slate-800">
                Gap to Quota: {Math.max((targetQuota - closedWon) / 1_000_000, 0).toFixed(0)} M ₫
              </span>
            </div>
          </div>
        </Card>

        {/* Win / Loss Ratio Card */}
        <Card className="border border-slate-200 bg-white shadow-none rounded-[4px] p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              Win Rate Efficiency
            </h3>
            <p className="text-[11px] text-slate-500">Based on closed opportunity deals</p>
          </div>

          <div className="my-3 text-center">
            <div className="text-3xl font-black text-slate-900 font-mono">
              {(summary?.winRatePercent || 75.0).toFixed(1)}%
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">
              High Pipeline Velocity
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-[3px] border border-slate-100 flex items-center justify-between">
            <span>Total Deals in Pipeline:</span>
            <strong className="text-slate-800 font-mono">{summary?.totalDealsCount || 18} Deals</strong>
          </div>
        </Card>
      </div>

      {/* Sales Rep Leaderboard */}
      <Card className="border border-slate-200 bg-white rounded-[4px] shadow-none overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-[#F7F8F9]">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-xs text-slate-900">Commercial Account Executive Leaderboard</h3>
          </div>
          <Badge variant="outline" className="text-[10px] bg-white text-slate-700 border-slate-200 rounded-[2px]">
            {summary?.salesRepPerformance?.length || 3} Representatives
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-[#F7F8F9] hover:bg-[#F7F8F9] text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
              <TableHead className="py-2.5 px-3">Rank &amp; Representative</TableHead>
              <TableHead className="py-2.5 px-3">Closed Won Value (₫)</TableHead>
              <TableHead className="py-2.5 px-3">Committed Pipeline (₫)</TableHead>
              <TableHead className="py-2.5 px-3">Quota Target (₫)</TableHead>
              <TableHead className="py-2.5 px-3">Quota Attainment</TableHead>
              <TableHead className="py-2.5 px-3 text-right pr-4">Won / Lost Ratio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(summary?.salesRepPerformance || []).map((rep, idx) => {
              const attainment = rep.quotaAttainmentPercent || 0;
              const isTop = idx === 0;

              return (
                <TableRow key={idx} className="hover:bg-[#F1F2F4] transition-colors text-xs border-b border-[#EBECF0]">
                  <TableCell className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                          isTop
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          {rep.repName}
                          {isTop && <Award className="w-3.5 h-3.5 text-amber-500 inline" />}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-2 px-3 font-mono font-bold text-emerald-700">
                    {rep.closedAmount.toLocaleString('en-US')} ₫
                  </TableCell>

                  <TableCell className="py-2 px-3 font-mono text-blue-700 font-semibold">
                    {rep.openAmount.toLocaleString('en-US')} ₫
                  </TableCell>

                  <TableCell className="py-2 px-3 font-mono text-slate-600">
                    {rep.targetQuota.toLocaleString('en-US')} ₫
                  </TableCell>

                  <TableCell className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold rounded-[2px] ${
                          attainment >= 100
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : attainment >= 80
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {attainment.toFixed(1)}%
                      </Badge>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(attainment, 100)}%` }}
                          className={`h-full ${attainment >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        />
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-2 px-3 text-right pr-4 font-mono font-semibold">
                    <span className="text-emerald-700">{rep.wonDealsCount} Won</span> /{' '}
                    <span className="text-slate-400">{rep.lostDealsCount} Lost</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default SalesForecastPage;
