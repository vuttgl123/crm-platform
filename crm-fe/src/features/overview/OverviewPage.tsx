import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/session/useAuth';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  BarChart3,
  DollarSign,
  Flame,
  ArrowRight,
  CheckCircle2,
  Clock,
  Award,
  Download,
  Briefcase,
  Zap,
  Building2,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

// Multi-month Performance Data
const MONTHLY_PERFORMANCE_DATA = [
  { month: 'T1', revenue: 1450, target: 1200, lastYear: 980, deals: 4 },
  { month: 'T2', revenue: 1980, target: 1600, lastYear: 1250, deals: 6 },
  { month: 'T3', revenue: 2650, target: 2200, lastYear: 1800, deals: 8 },
  { month: 'T4', revenue: 2300, target: 2400, lastYear: 1900, deals: 7 },
  { month: 'T5', revenue: 3450, target: 3000, lastYear: 2400, deals: 11 },
  { month: 'T6', revenue: 4100, target: 3600, lastYear: 2900, deals: 14 },
  { month: 'T7', revenue: 4850, target: 4200, lastYear: 3400, deals: 16 },
  { month: 'T8', revenue: 5400, target: 4800, lastYear: 3800, deals: 18 },
];

// Sales Funnel Conversion Waterfall Data
const FUNNEL_DATA = [
  { stage: '1. Tiếp cận (Leads)', count: 142, value: '100%', drop: '0%', color: '#6366f1' },
  { stage: '2. Đạt chuẩn (SQL)', count: 86, value: '60.5%', drop: '-39.5%', color: '#3b82f6' },
  { stage: '3. Báo giá & Demo', count: 48, value: '33.8%', drop: '-26.7%', color: '#0ea5e9' },
  { stage: '4. Đàm phán Hợp đồng', count: 24, value: '16.9%', drop: '-16.9%', color: '#f59e0b' },
  { stage: '5. Ký kết Won', count: 15, value: '10.5%', drop: '-6.4%', color: '#10b981' },
];

// Sales Rep Leaderboard Data
const SALES_LEADERBOARD = [
  {
    id: 'rep-1',
    name: 'Phạm Tuấn Vũ',
    role: 'Trưởng nhóm Kinh doanh',
    avatar: 'PV',
    dealsCount: 8,
    revenue: 2850000000,
    target: 3000000000,
    progress: 95,
    rank: 1,
  },
  {
    id: 'rep-2',
    name: 'Trần Thị Mai',
    role: 'Chuyên viên QHKH Cao cấp',
    avatar: 'TM',
    dealsCount: 5,
    revenue: 1650000000,
    target: 1800000000,
    progress: 91.6,
    rank: 2,
  },
  {
    id: 'rep-3',
    name: 'Lê Hoàng Nam',
    role: 'Chuyên viên Tư vấn Doanh nghiệp',
    avatar: 'HN',
    dealsCount: 4,
    revenue: 1200000000,
    target: 1500000000,
    progress: 80.0,
    rank: 3,
  },
  {
    id: 'rep-4',
    name: 'Đặng Thu Thảo',
    role: 'Kinh doanh Giải pháp Phần mềm',
    avatar: 'TT',
    dealsCount: 3,
    revenue: 900000000,
    target: 1200000000,
    progress: 75.0,
    rank: 4,
  },
];

// Top High-Value Deals in Pipeline
const TOP_PIPELINE_DEALS = [
  {
    id: 'deal-1',
    name: 'Hợp đồng Nâng cấp Hạ tầng & Tích hợp ERP Oracle',
    client: 'Tập đoàn Vingroup JSC',
    amount: 3200000000,
    stage: 'Đề xuất Báo giá',
    stageClass: 'bg-blue-50 text-blue-700 border-blue-200',
    probability: 60,
    owner: 'Phạm Tuấn Vũ',
    dueDate: '15/09/2026',
    health: 'POSITIVE',
  },
  {
    id: 'deal-2',
    name: 'Dự án Số hóa Kênh Bán hàng B2B Toàn quốc',
    client: 'Tổng Công ty Viễn thông Viettel',
    amount: 2100000000,
    stage: 'Chốt thành công',
    stageClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    probability: 100,
    owner: 'Trần Thị Mai',
    dueDate: '10/08/2026',
    health: 'POSITIVE',
  },
  {
    id: 'deal-3',
    name: 'Gói Triển khai Phần mềm SmartCRM Enterprise 2026',
    client: 'Tập đoàn Công nghệ FPT Software',
    amount: 1500000000,
    stage: 'Đàm phán Điều khoản',
    stageClass: 'bg-amber-50 text-amber-700 border-amber-200',
    probability: 80,
    owner: 'Phạm Tuấn Vũ',
    dueDate: '30/08/2026',
    health: 'POSITIVE',
  },
  {
    id: 'deal-4',
    name: 'Bản quyền License Cloud CRM & Bảo trì 24/7',
    client: 'Công ty Cổ phần Sữa Việt Nam (Vinamilk)',
    amount: 1800000000,
    stage: 'Khám phá Nhu cầu',
    stageClass: 'bg-purple-50 text-purple-700 border-purple-200',
    probability: 25,
    owner: 'Lê Hoàng Nam',
    dueDate: '20/10/2026',
    health: 'WARNING',
  },
];

// Interactive Activity Schedule
const INITIAL_SCHEDULE = [
  {
    id: 'act-1',
    time: '09:00 - 10:30 Hôm nay',
    title: 'Họp rà soát điều khoản SLA & Hợp đồng bảo mật với FPT',
    client: 'Tập đoàn Công nghệ FPT Software',
    type: 'MEETING',
    typeLabel: 'Cuộc họp',
    priority: 'HIGH',
    completed: false,
  },
  {
    id: 'act-2',
    time: '14:00 - 15:00 Hôm nay',
    title: 'Demo tính năng Báo cáo Kinh doanh cho Giám đốc Bán hàng',
    client: 'Công ty CP Tập đoàn Masan',
    type: 'CALL',
    typeLabel: 'Cuộc gọi',
    priority: 'HIGH',
    completed: false,
  },
  {
    id: 'act-3',
    time: '08:30 Ngày mai',
    title: 'Gửi bản báo giá tùy biến gói mở rộng 50 User CRM',
    client: 'Tổng Công ty Viễn thông Viettel',
    type: 'EMAIL',
    typeLabel: 'Gửi Email',
    priority: 'MEDIUM',
    completed: true,
  },
  {
    id: 'act-4',
    time: '16:00 Ngày mai',
    title: 'Kiểm tra tiến độ import dữ liệu 10,000 khách hàng cũ',
    client: 'Nội bộ phòng IT & Vận hành',
    type: 'TASK',
    typeLabel: 'Công việc',
    priority: 'LOW',
    completed: false,
  },
];

export const OverviewPage: React.FC = () => {
  const { session } = useAuth();
  const [timeRange, setTimeRange] = useState('Q3');
  const [chartMetric, setChartMetric] = useState<'REVENUE' | 'DEALS'>('REVENUE');
  const [activities, setActivities] = useState(INITIAL_SCHEDULE);

  if (!session) return null;

  const activeRoleName = session.activeRole.name;
  const tenantName = session.tenant.display_name;

  const handleToggleTask = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
    toast.success('Đã cập nhật trạng thái nhiệm vụ!');
  };

  return (
    <div className="space-y-6 pb-12 font-sans w-full max-w-[1600px] mx-auto">
      {/* Top Header & Executive Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              {tenantName}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">
              Vai trò: <strong className="text-slate-900">{activeRoleName}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            Bảng Quản trị Điều hành Kinh doanh
          </h1>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange('30D')}
              className={`h-7 px-2.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === '30D' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              30 ngày qua
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange('Q3')}
              className={`h-7 px-2.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'Q3' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Quý này (Q3)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange('Y2026')}
              className={`h-7 px-2.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'Y2026' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Năm 2026
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Đang kết xuất báo cáo tổng quan PDF...')}
            className="h-9 px-3 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất Báo cáo</span>
          </Button>

          <Link to="/app/crm/opportunities">
            <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold gap-1.5 shadow-xs">
              <Plus className="w-4 h-4" />
              <span>Thêm Cơ hội Mới</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Multi-Metric KPI Performance Cards with Progress Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Doanh số Thực thu & Target */}
        <Card className="shadow-2xs border-slate-200 bg-white hover:border-blue-300 transition-all group">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh số Đã ký kết</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <DollarSign className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">5.40 tỷ ₫</span>
                <span className="text-xs text-slate-400 block mt-0.5">Chỉ tiêu: 6.00 tỷ ₫</span>
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3 h-3" /> +14.2%
              </span>
            </div>

            {/* Target Progress Bar */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>Tiến độ hoàn thành KPI</span>
                <span className="font-bold text-blue-600">90.0%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: '90%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Pipeline Value & Deals */}
        <Card className="shadow-2xs border-slate-200 bg-white hover:border-purple-300 transition-all group">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá trị Phễu Pipeline</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-purple-700 tracking-tight">10.10 tỷ ₫</span>
                <span className="text-xs text-slate-400 block mt-0.5">6 Cơ hội trọng điểm</span>
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <Zap className="w-3 h-3" /> 62% Dự kiến
              </span>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>Dự báo giá trị chốt (Weighted)</span>
                <span className="font-bold text-purple-600">6.26 tỷ ₫</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Lead Conversion Rate */}
        <Card className="shadow-2xs border-slate-200 bg-white hover:border-emerald-300 transition-all group">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ Chuyển đổi Deal</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-emerald-700 tracking-tight">35.8%</span>
                <span className="text-xs text-slate-400 block mt-0.5">15 Deals Won / 42 Deals</span>
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3 h-3" /> +4.2%
              </span>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>Chuẩn Benchmark ngành</span>
                <span className="font-bold text-emerald-600">Vượt 28.0%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Sales Velocity & Cycle Time */}
        <Card className="shadow-2xs border-slate-200 bg-white hover:border-amber-300 transition-all group">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chu kỳ Bán hàng TB</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">18.5 Ngày</span>
                <span className="text-xs text-slate-400 block mt-0.5">Từ Lead đến Hợp đồng</span>
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingDown className="w-3 h-3" /> -3.2 Ngày
              </span>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>Tốc độ chốt Deal (Velocity)</span>
                <span className="font-bold text-amber-600">Nhanh hơn 14%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Executive Analytics Charts (Monthly Performance & Funnel Waterfall) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): Comprehensive Multi-Series Performance Area Chart */}
        <Card className="shadow-2xs border-slate-200 bg-white lg:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Tăng trưởng Doanh số Thực tế & So sánh Cùng kỳ</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Đơn vị: Triệu VNĐ • Số liệu theo dõi liên tục 8 tháng đầu năm 2026
              </CardDescription>
            </div>

            {/* Toggle Metric View */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setChartMetric('REVENUE')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  chartMetric === 'REVENUE' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Doanh thu (₫)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('DEALS')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  chartMetric === 'DEALS' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Số lượng Deals
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="primaryRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="lastYearGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', padding: '10px 14px' }}
                    formatter={(value: any, name: any) => {
                      if (name === 'revenue') return [`${Number(value).toLocaleString('vi-VN')} Triệu ₫`, 'Doanh thu Thực tế 2026'];
                      if (name === 'target') return [`${Number(value).toLocaleString('vi-VN')} Triệu ₫`, 'Chỉ tiêu Kế hoạch'];
                      if (name === 'lastYear') return [`${Number(value).toLocaleString('vi-VN')} Triệu ₫`, 'Cùng kỳ Năm 2025'];
                      if (name === 'deals') return [`${value} Hợp đồng`, 'Số Deals Chốt'];
                      return [value, name];
                    }}
                  />
                  {chartMetric === 'REVENUE' ? (
                    <>
                      <Area type="monotone" dataKey="lastYear" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#lastYearGradient)" />
                      <Area type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                      <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#primaryRevenueGradient)" />
                    </>
                  ) : (
                    <Area type="monotone" dataKey="deals" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#primaryRevenueGradient)" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend & Summary Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="font-semibold text-slate-700">Thực thu 2026</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="font-semibold text-slate-700">Chỉ tiêu Target</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                  <span className="font-semibold text-slate-500">Cùng kỳ 2025</span>
                </div>
              </div>

              <span className="text-slate-400 text-[11px]">
                Tổng luỹ kế 8 tháng: <strong className="text-slate-900 font-bold">26.18 tỷ ₫</strong> (Đạt 112% kế hoạch)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Right (1 Col): Sales Funnel Waterfall (Tỷ lệ rớt phễu qua từng bước) */}
        <Card className="shadow-2xs border-slate-200 bg-white flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>Phễu Chuyển đổi Bán hàng (Sales Funnel)</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Tỷ lệ duy trì & chuyển đổi qua 5 bước quy trình
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-around">
            {FUNNEL_DATA.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.stage}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{item.count}</span>
                    <span className="font-semibold text-blue-600 text-[11px]">({item.value})</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-lg overflow-hidden flex items-center p-0.5">
                  <div
                    className="h-full rounded-md transition-all duration-500"
                    style={{
                      width: item.value,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Hiệu suất Phễu tổng thể:</span>
            <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              10.5% Tỷ lệ Chốt cuối
            </span>
          </div>
        </Card>
      </div>

      {/* Row 2: Top Deals Table + Sales Leaderboard + Action Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): High Value Deals in Negotiation */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-2xs border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>Top Cơ hội Kinh doanh Trọng điểm Đang Đàm phán</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Các dự án có giá trị trên 1 tỷ VNĐ cần theo dõi sát sao tiến độ
                </CardDescription>
              </div>
              <Link to="/app/crm/opportunities">
                <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-blue-600 hover:bg-blue-50 gap-1">
                  <span>Xem Toàn bộ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Tên Cơ hội & Khách hàng</th>
                      <th className="py-3 px-3">Giai đoạn</th>
                      <th className="py-3 px-3 text-right">Giá trị Deal</th>
                      <th className="py-3 px-3 text-center">Xác suất</th>
                      <th className="py-3 px-4 text-right">Phụ trách</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {TOP_PIPELINE_DEALS.map((deal) => (
                      <tr key={deal.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 space-y-0.5">
                          <span className="font-bold text-slate-900 block truncate max-w-[280px]">
                            {deal.name}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {deal.client}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <Badge variant="outline" className={`text-[10px] font-bold ${deal.stageClass}`}>
                            {deal.stage}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 text-right font-black text-slate-900">
                          {(deal.amount / 1000000).toLocaleString('vi-VN')} Tr ₫
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1.5 font-bold text-[11px]">
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden inline-block">
                              <div
                                className={`h-full rounded-full ${
                                  deal.probability >= 80 ? 'bg-emerald-500' : deal.probability >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                            <span>{deal.probability}%</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-slate-700 block">{deal.owner}</span>
                          <span className="text-[10px] text-slate-400">Hạn: {deal.dueDate}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Sales Representative Leaderboard */}
          <Card className="shadow-2xs border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Bảng Vinh danh Doanh số Nhân viên (Sales Leaderboard)</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Xếp hạng hiệu suất theo doanh thu đóng góp trong Quý 3/2026
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-xs">
                Top 4 Xuất sắc
              </Badge>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SALES_LEADERBOARD.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                            {rep.avatar}
                          </div>
                          <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white border-2 border-white shadow-xs ${
                            rep.rank === 1 ? 'bg-amber-500' : rep.rank === 2 ? 'bg-slate-400' : 'bg-amber-700'
                          }`}>
                            #{rep.rank}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{rep.name}</h4>
                          <span className="text-[10px] text-slate-500">{rep.role}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-blue-700 block">
                          {(rep.revenue / 1000000000).toFixed(2)} tỷ ₫
                        </span>
                        <span className="text-[10px] text-slate-400">{rep.dealsCount} Hợp đồng</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-200/60">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                        <span>Chỉ tiêu đạt được</span>
                        <span className="font-bold text-emerald-600">{rep.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, rep.progress)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right (1 Col): Interactive Action Schedule & Reminders */}
        <div className="space-y-6">
          <Card className="shadow-2xs border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-blue-600" />
                  <span>Lịch trình & Hành động Cần làm</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Lịch họp và tương tác với khách hàng
                </CardDescription>
              </div>
              <Link to="/app/crm/activities">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                  Xem hết
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className={`p-3 rounded-xl border transition-all space-y-2 ${
                    act.completed
                      ? 'bg-slate-50/50 border-slate-200/50 opacity-75'
                      : 'bg-white border-slate-200 hover:border-blue-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(act.id)}
                      className={`w-4.5 h-4.5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                        act.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-blue-500 bg-white text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                    </button>
                    <div className="space-y-0.5 flex-1">
                      <span
                        className={`font-bold text-xs block leading-snug ${
                          act.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {act.title}
                      </span>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{act.client}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {act.time}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                      {act.typeLabel}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
