import React, { useState, useEffect, useCallback } from 'react';
import {
  forecastApi,
  SalesForecastSummary,
} from '@/services/api/forecastApi';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  TrendingUp,
  Target,
  Trophy,
  DollarSign,
  PieChart,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Users,
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
      toast.error('Không thể tải dữ liệu dự báo doanh số');
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
    <div className="space-y-6 pb-12 font-sans w-full max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <TrendingUp className="w-4.5 h-4.5 text-white" />
            </div>
            Dự báo Doanh số & Hiệu suất Bán hàng (Revenue Forecast)
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-10.5">
            Mô hình dự báo doanh thu thông minh theo nhóm cam kết (Commit, Best Case, Pipeline) và hiệu suất KPI
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-44">
            <Select
              value={period}
              onValueChange={(val) => setPeriod(val as any)}
            >
              <SelectTrigger className="h-9 text-xs font-semibold bg-white border-slate-200 shadow-2xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="THIS_MONTH">Tháng này (08/2026)</SelectItem>
                <SelectItem value="THIS_QUARTER">Quý này (Q3/2026)</SelectItem>
                <SelectItem value="THIS_YEAR">Năm nay (2026)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchForecast}
            disabled={loading}
            className="h-9 px-3 text-xs border-slate-200 bg-white hover:bg-slate-50 gap-1.5 shadow-2xs text-slate-700 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* ── Forecast Waterfall KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Closed Won */}
        <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white shadow-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Đã Chốt (Won)</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-emerald-950 font-mono">
              {(closedWon / 1_000_000).toLocaleString('vi-VN')} <span className="text-xs font-normal">Tr ₫</span>
            </div>
            <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Độ tin cậy: 100%
            </div>
          </CardContent>
        </Card>

        {/* 2. Commit */}
        <Card className="border border-blue-200 bg-gradient-to-br from-blue-50/70 to-white shadow-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Cam Kết (Commit)</span>
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-blue-950 font-mono">
              {(commit / 1_000_000).toLocaleString('vi-VN')} <span className="text-xs font-normal">Tr ₫</span>
            </div>
            <div className="text-[11px] text-blue-700 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Xác suất ≥ 80%
            </div>
          </CardContent>
        </Card>

        {/* 3. Best Case */}
        <Card className="border border-purple-200 bg-gradient-to-br from-purple-50/70 to-white shadow-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">Khả Quan (Best Case)</span>
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-purple-950 font-mono">
              {(bestCase / 1_000_000).toLocaleString('vi-VN')} <span className="text-xs font-normal">Tr ₫</span>
            </div>
            <div className="text-[11px] text-purple-700 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              Xác suất 50% - 79%
            </div>
          </CardContent>
        </Card>

        {/* 4. Pipeline */}
        <Card className="border border-amber-200 bg-gradient-to-br from-amber-50/70 to-white shadow-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Dự Phòng (Pipeline)</span>
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-amber-950 font-mono">
              {(pipeline / 1_000_000).toLocaleString('vi-VN')} <span className="text-xs font-normal">Tr ₫</span>
            </div>
            <div className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              Xác suất &lt; 50%
            </div>
          </CardContent>
        </Card>

        {/* 5. Weighted Forecast Total */}
        <Card className="border border-slate-900 bg-slate-900 text-white shadow-md">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Dự Báo Trọng Số</span>
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {(weightedTotal / 1_000_000).toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">Tr ₫</span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-1">
              <span>Đạt dự kiến:</span>
              <strong className="text-emerald-400">{projectedAttainment.toFixed(1)}% KPI</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Quota Attainment Progress & Win Rate ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border border-slate-200 bg-white shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Tiến độ Hoàn thành Chỉ tiêu Doanh số Toàn đội (Quota Progress)
              </h3>
              <p className="text-xs text-slate-500">
                Chỉ tiêu kỳ này: <strong className="text-slate-800 font-mono">{(targetQuota / 1_000_000).toLocaleString('vi-VN')} Tr ₫</strong>
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono font-bold">
              {quotaAttainment.toFixed(1)}% Thực Đạt
            </Badge>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${Math.min(quotaAttainment, 100)}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Đã chốt: ${(closedWon / 1_000_000).toFixed(0)} Tr`}
              />
              <div
                style={{ width: `${Math.min((commit / targetQuota) * 100, 100 - quotaAttainment)}%` }}
                className="bg-blue-500 transition-all duration-500"
                title={`Cam kết: ${(commit / 1_000_000).toFixed(0)} Tr`}
              />
              <div
                style={{ width: `${Math.min((bestCase / targetQuota) * 100, 100 - (quotaAttainment + (commit / targetQuota) * 100))}%` }}
                className="bg-purple-400 transition-all duration-500"
                title={`Khả quan: ${(bestCase / 1_000_000).toFixed(0)} Tr`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Đã chốt: <strong>{(closedWon / 1_000_000).toFixed(0)} Tr</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Cam kết: <strong>{(commit / 1_000_000).toFixed(0)} Tr</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                  Khả quan: <strong>{(bestCase / 1_000_000).toFixed(0)} Tr</strong>
                </span>
              </div>
              <span className="font-semibold text-slate-800">
                Khoảng cách KPI: {Math.max((targetQuota - closedWon) / 1_000_000, 0).toFixed(0)} Tr ₫
              </span>
            </div>
          </div>
        </Card>

        {/* Win / Loss Ratio Card */}
        <Card className="border border-slate-200 bg-white shadow-xs p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              Tỷ lệ Thắng Deal (Win Rate)
            </h3>
            <p className="text-xs text-slate-500">Dựa trên các cơ hội đã đóng</p>
          </div>

          <div className="my-4 text-center">
            <div className="text-4xl font-black text-slate-900 font-mono">
              {(summary?.winRatePercent || 75.0).toFixed(1)}%
            </div>
            <div className="text-xs text-emerald-700 font-bold mt-1">
              Hiệu suất chuyển đổi rất cao
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
            <span>Tổng số Deals trong phễu:</span>
            <strong className="text-slate-800 font-mono">{summary?.totalDealsCount || 18} Deals</strong>
          </div>
        </Card>
      </div>

      {/* ── Sales Rep Leaderboard ── */}
      <Card className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900">Bảng Thành tích Nhân viên Kinh doanh (Sales Leaderboard)</h3>
          </div>
          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
            {summary?.salesRepPerformance?.length || 3} Chuyên viên
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase">
              <TableHead className="py-3 pl-4">Hạng &amp; Nhân viên</TableHead>
              <TableHead className="py-3">Doanh số Đã chốt (₫)</TableHead>
              <TableHead className="py-3">Đang cam kết (₫)</TableHead>
              <TableHead className="py-3">Chỉ tiêu KPI (₫)</TableHead>
              <TableHead className="py-3">Tiến độ KPI</TableHead>
              <TableHead className="py-3 text-right pr-4">Tỷ lệ Thắng/Thua</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(summary?.salesRepPerformance || []).map((rep, idx) => {
              const attainment = rep.quotaAttainmentPercent || 0;
              const isTop = idx === 0;

              return (
                <TableRow key={idx} className="hover:bg-slate-50/80 transition-colors text-xs">
                  <TableCell className="pl-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isTop
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {rep.repName}
                          {isTop && <Award className="w-3.5 h-3.5 text-amber-500 inline" />}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono font-bold text-emerald-700">
                    {rep.closedAmount.toLocaleString('vi-VN')} ₫
                  </TableCell>

                  <TableCell className="font-mono text-blue-700 font-semibold">
                    {rep.openAmount.toLocaleString('vi-VN')} ₫
                  </TableCell>

                  <TableCell className="font-mono text-slate-600">
                    {rep.targetQuota.toLocaleString('vi-VN')} ₫
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          attainment >= 100
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : attainment >= 80
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {attainment.toFixed(1)}%
                      </Badge>
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(attainment, 100)}%` }}
                          className={`h-full ${attainment >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        />
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right pr-4 font-mono font-semibold">
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
