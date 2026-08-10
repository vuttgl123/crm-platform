import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/session/useAuth';
import { NAVIGATION_GROUPS } from '@/config/navigationConfig';
import { canAccessRoute } from '@/core/permissions/evaluator';
import { useTranslation } from 'react-i18next';
import {
  DollarSign,
  Briefcase,
  Users,
  TrendingUp,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  PhoneCall,
  Calendar,
  Shield,
  Sparkles,
  ChevronRight,
  Award,
  CheckCircle2,
  ListTodo,
  PieChart as PieIcon,
  BarChart3,
  Megaphone,
  HeartHandshake,
  CheckCircle,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  OVERVIEW_KPI_DATA,
  MONTHLY_REVENUE_DATA,
  PIPELINE_STAGE_DATA,
  LEAD_SOURCE_DATA,
  PRODUCT_REVENUE_DATA,
  TOP_DEALS_DATA,
  RECENT_ACTIVITIES,
  PENDING_TASKS_DATA,
  CAMPAIGN_PERFORMANCE_DATA,
  CUSTOMER_HEALTH_DATA,
  TOP_PERFORMERS,
  PendingTask,
} from '@/mocks/fixtures/overviewData';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { session } = useAuth();
  const { i18n, t } = useTranslation();
  const [timeframe, setTimeframe] = useState<'30D' | '90D' | 'YEAR'>('30D');
  const [tasks, setTasks] = useState<PendingTask[]>(PENDING_TASKS_DATA);
  const isVi = !i18n.language || i18n.language.startsWith('vi');

  if (!session) return null;

  const activeRoleName = session.activeRole.name;
  const scopeType = session.effectiveScopeType;

  // Format currency helper
  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    );
  };

  // Collect authorized quick links
  const authorizedItems: { path: string; title: string; groupTitle: string }[] = [];
  NAVIGATION_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      if (canAccessRoute(item, session)) {
        authorizedItems.push({
          path: item.path,
          title: isVi ? item.titleVi : item.titleEn,
          groupTitle: isVi ? group.titleVi : group.titleEn,
        });
      }
    });
  });

  return (
    <div className="space-y-6 pb-12 font-sans w-full">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t('overview.welcome', 'Xin chào')}, {session.user.display_name}! 👋
            </h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-xs py-0.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              {activeRoleName}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            {t(
              'overview.dashboardSubtitle',
              'Báo cáo hiệu suất kinh doanh & tiến độ quản trị quan hệ khách hàng VUM CRM'
            )}
          </p>
        </div>

        {/* Filter Tabs & Quick Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Tabs defaultValue="30D" onValueChange={(val) => setTimeframe(val as '30D' | '90D' | 'YEAR')}>
            <TabsList className="bg-slate-100 p-1 text-xs">
              <TabsTrigger value="30D" className="text-xs">30 ngày</TabsTrigger>
              <TabsTrigger value="90D" className="text-xs">Quý này</TabsTrigger>
              <TabsTrigger value="YEAR" className="text-xs">Năm nay</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Xuất Báo cáo PDF
          </Button>

          <Button size="sm" className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Tạo Cơ hội mới
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards Row (6 Columns on Widescreen) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {OVERVIEW_KPI_DATA.map((kpi, idx) => {
          const icons = [DollarSign, Briefcase, Users, TrendingUp, Clock, Award];
          const IconComp = icons[idx % icons.length];

          return (
            <Card key={kpi.title} className="shadow-xs hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                    {kpi.title}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="text-xl font-black text-slate-900 tracking-tight truncate">
                    {kpi.value}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px]">
                    <span
                      className={`inline-flex items-center font-bold px-1 py-0.2 rounded text-[10px] ${
                        kpi.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {kpi.isPositive ? (
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                      )}
                      {kpi.change}
                    </span>
                    <span className="text-slate-400 truncate">{kpi.subtext}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts Grid (3 Charts across Widescreen) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Chart 1: Revenue Trend Area Chart */}
        <Card className="shadow-xs border-slate-200 md:col-span-2 xl:col-span-1">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Xu hướng Doanh thu</span>
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                {timeframe}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              So sánh doanh thu thực tế và chỉ tiêu (Triệu VNĐ)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      borderColor: '#e2e8f0',
                      fontSize: '12px',
                    }}
                    formatter={(value) => `${Number(value || 0).toLocaleString()} Tr. VNĐ`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Doanh thu"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Lead Source Donut Chart */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Phân bổ Nguồn Lead</span>
              <PieIcon className="w-4 h-4 text-slate-400" />
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Tỷ lệ nguồn khách hàng tiềm năng đến hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={LEAD_SOURCE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {LEAD_SOURCE_DATA.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => `${Number(val || 0)} Leads`}
                    contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend Grid */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
              {LEAD_SOURCE_DATA.map((src) => (
                <div key={src.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: src.color }} />
                  <span className="text-slate-600 truncate">{src.name}</span>
                  <span className="font-bold text-slate-900 ml-auto">{src.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Revenue by Product Line Bar Chart */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Doanh số theo Dòng sản phẩm</span>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Cơ cấu đóng góp doanh thu theo gói dịch vụ
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PRODUCT_REVENUE_DATA} layout="vertical" margin={{ top: 5, right: 10, left: 35, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="product" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#475569' }} width={100} />
                  <Tooltip
                    formatter={(val) => `${Number(val || 0).toLocaleString()} Tr. VNĐ`}
                    contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Widescreen Grid: Left (Tables, Pipelines & Marketing/CSAT) + Right (Tasks, Activity & Leaderboard) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on XL Widescreen) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Top High Value Opportunities Table */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Cơ hội Kinh doanh Giá trị cao nhất
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Các thương vụ trọng điểm đang trong tiến trình chốt hợp đồng
                </CardDescription>
              </div>
              <Link to="/app/crm/opportunities">
                <Button size="sm" variant="ghost" className="text-xs gap-1 text-blue-600">
                  Tất cả Cơ hội
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3 pl-6">Khách hàng / Công ty</th>
                      <th className="p-3">Giá trị Hợp đồng</th>
                      <th className="p-3">Giai đoạn</th>
                      <th className="p-3">Xác suất</th>
                      <th className="p-3">Phụ trách</th>
                      <th className="p-3 pr-6 text-right">Dự kiến Chốt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {TOP_DEALS_DATA.map((deal) => (
                      <tr key={deal.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 pl-6">
                          <div className="font-bold text-slate-900">{deal.customerName}</div>
                          <div className="text-[11px] text-slate-500">{deal.company}</div>
                        </td>
                        <td className="p-3 font-bold font-mono text-slate-900">
                          {formatVND(deal.value)}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                            {deal.stage}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{deal.probability}%</span>
                            <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                              {deal.ownerAvatar}
                            </div>
                            <span className="text-slate-700 font-medium">{deal.ownerName}</span>
                          </div>
                        </td>
                        <td className="p-3 pr-6 text-right font-mono text-slate-500">
                          {deal.expectedClose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Sales Pipeline Funnel Stage Details */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Chi tiết Giai đoạn Phễu Bán hàng (Pipeline Funnel)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Phân bổ 42 thương vụ trị giá 2.150 Tr. VNĐ qua các bước quy trình
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-slate-100 text-slate-700 font-medium text-xs">
                Tổng 42 Deals
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {PIPELINE_STAGE_DATA.map((stage) => (
                  <div key={stage.stage} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 truncate">{stage.stage}</div>
                      <div className="text-lg font-black text-slate-900 mt-1">{stage.count} deals</div>
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-blue-600">{stage.value} Tr. VNĐ</div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${stage.percentage}%`, backgroundColor: stage.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* NEW MODULE: Marketing Campaign ROI & Customer Satisfaction (Fill Bottom-Left Gap) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campaign ROI Panel */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-purple-600" />
                    <span>Chiến dịch Marketing Nổi bật</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Hiệu quả ROI & số lượng Lead quy đổi
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-3">
                {CAMPAIGN_PERFORMANCE_DATA.map((camp) => (
                  <div key={camp.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{camp.name}</span>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-mono text-[10px]">
                        {camp.roi}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{camp.leads} Leads ({camp.deals} Deals chốt)</span>
                      <span className="font-semibold text-emerald-600">{camp.conversionRate}% Chuyển đổi</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Customer Health CSAT Panel */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    <span>Sức khỏe & Sự Hài lòng Khách hàng</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Chỉ số CSAT, NPS & Tỷ lệ gia hạn hợp đồng
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-3 grid grid-cols-2 gap-3">
                {CUSTOMER_HEALTH_DATA.map((item) => (
                  <div key={item.title} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-[11px] font-medium text-slate-500 truncate">{item.title}</div>
                    <div className="text-lg font-black text-slate-900 flex items-center gap-1">
                      <span>{item.value}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{item.detail}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column (1 Col on XL Widescreen) */}
        <div className="space-y-6">
          {/* Pending Tasks & Action Checklist */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-blue-600" />
                  <span>Nhiệm vụ Cần xử lý</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Nhắc nhở lịch hẹn & công việc ưu tiên
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                {tasks.filter((t) => !t.completed).length} việc tồn
              </Badge>
            </CardHeader>
            <CardContent className="pt-3 divide-y divide-slate-100">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50/60 transition-colors rounded-md px-1"
                >
                  <button className="mt-0.5 text-slate-400 hover:text-blue-600 shrink-0">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        task.completed ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'
                      }`}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-mono text-slate-500">{task.dueDate}</span>
                      <span>•</span>
                      <span className="text-slate-600">{task.relatedTo}</span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 py-0 shrink-0 ${
                      task.priority === 'HIGH'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : task.priority === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Live Activity Timeline */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Hoạt động Thời gian thực</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Nhật ký tương tác & cập nhật trạng thái hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative border-l border-slate-200 ml-3 space-y-4">
                {RECENT_ACTIVITIES.map((act) => {
                  const getIcon = () => {
                    switch (act.type) {
                      case 'DEAL':
                        return <Briefcase className="w-3.5 h-3.5 text-blue-600" />;
                      case 'CALL':
                        return <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />;
                      case 'CUSTOMER':
                        return <Users className="w-3.5 h-3.5 text-purple-600" />;
                      case 'MEETING':
                        return <Calendar className="w-3.5 h-3.5 text-amber-600" />;
                    }
                  };

                  return (
                    <div key={act.id} className="relative pl-6">
                      <div className="absolute -left-2.5 top-0.5 w-5 h-5 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center">
                        {getIcon()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-600">{act.user}</span>
                          <span>•</span>
                          <span>{act.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers Leaderboard */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Bảng Xếp hạng Bán hàng</span>
                <Award className="w-4 h-4 text-amber-500" />
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Nhân viên kinh doanh xuất sắc nhất tháng
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {TOP_PERFORMERS.map((perf, index) => (
                <div key={perf.id} className="flex items-center gap-3">
                  <div className="font-black text-sm text-slate-400 w-4">
                    #{index + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {perf.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate">{perf.name}</span>
                      <span className="font-mono font-bold text-blue-600">{perf.revenue} Tr. VNĐ</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{perf.dealsClosed} hợp đồng chốt</span>
                      <span className="font-medium text-emerald-600">{perf.quotaPercentage}% Chỉ tiêu</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security & Multi-tenant Context Specs */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Ngữ cảnh Bảo mật & Scope</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="text-xs">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Tổ chức (Tenant)</div>
                  <div className="font-bold text-slate-900 mt-0.5">{session.tenant.display_name}</div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {session.tenant.tenant_code}
                </Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="text-xs">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Phạm vi Dữ liệu (Scope)</div>
                  <div className="font-bold text-slate-900 mt-0.5">{scopeType}</div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                  {session.grantedPermissions.length} Quyền
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
