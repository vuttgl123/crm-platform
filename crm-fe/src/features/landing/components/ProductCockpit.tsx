import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Search, 
  Plus, 
  Clock, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Kanban,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { renderLifecycleStageBadge } from '@/config/crmStatusConfig';

type CockpitTab = 'dashboard' | 'pipeline' | 'customer360' | 'rbac';

interface KanbanDeal {
  id: string;
  title: string;
  company: string;
  amount: string;
  industry: string;
  contact: string;
  stage: 'PROSPECT' | 'QUALIFIED' | 'CUSTOMER';
  probability: number;
  dueIn: string;
  avatarColor: string;
}

const kanbanColumns: { id: string; title: string; totalAmount: string; count: number; deals: KanbanDeal[] }[] = [
  {
    id: 'discovery',
    title: '01. Khám Phá & Thẩm Định',
    totalAmount: '2.45 Tỷ ₫',
    count: 2,
    deals: [
      {
        id: 'deal-1',
        title: 'Triển khai CRM Enterprise 150 User',
        company: 'Tập đoàn Bất động sản Phú Mỹ',
        amount: '1.250.000.000 ₫',
        industry: 'Bất động sản',
        contact: 'Trần Minh Đức (GĐ Dự án)',
        stage: 'PROSPECT',
        probability: 60,
        dueIn: 'Còn 3 ngày',
        avatarColor: 'bg-purple-600',
      },
      {
        id: 'deal-2',
        title: 'Số hóa quản lý Lead Đa kênh B2B',
        company: 'Masan Consumer Distribution',
        amount: '1.200.000.000 ₫',
        industry: 'Bán lẻ & Tiêu dùng',
        contact: 'Lê Văn Nam (Trưởng phòng Thu mua)',
        stage: 'PROSPECT',
        probability: 65,
        dueIn: 'Còn 5 ngày',
        avatarColor: 'bg-indigo-600',
      },
    ],
  },
  {
    id: 'negotiation',
    title: '02. Báo Giá & Đàm Phán',
    totalAmount: '5.75 Tỷ ₫',
    count: 2,
    deals: [
      {
        id: 'deal-3',
        title: 'Tích hợp ERP & Phân quyền Chi nhánh',
        company: 'Công ty CP Công nghệ Sao Việt',
        amount: '780.000.000 ₫',
        industry: 'CNTT & Viễn thông',
        contact: 'Nguyễn Thị Hương (Trưởng phòng Mua)',
        stage: 'QUALIFIED',
        probability: 85,
        dueIn: 'Hôm nay',
        avatarColor: 'bg-blue-600',
      },
      {
        id: 'deal-4',
        title: 'Gói VUM Cloud Enterprise Multi-Region',
        company: 'VinFast Global Supply Chain',
        amount: '4.970.000.000 ₫',
        industry: 'Sản xuất & Chuỗi cung ứng',
        contact: 'Phạm Quốc Hùng (Phó TGĐ Vận hành)',
        stage: 'QUALIFIED',
        probability: 90,
        dueIn: 'Còn 2 ngày',
        avatarColor: 'bg-cyan-600',
      },
    ],
  },
  {
    id: 'closing',
    title: '03. Ký Hợp Đồng & Chốt',
    totalAmount: '4.60 Tỷ ₫',
    count: 2,
    deals: [
      {
        id: 'deal-5',
        title: 'Hợp đồng 3 năm & Gói SLA 24/7 VIP',
        company: 'Tổng công ty Dược Phẩm Á Châu',
        amount: '3.400.000.000 ₫',
        industry: 'Y tế & Dược phẩm',
        contact: 'Lê Hoàng Nam (Phó TGĐ)',
        stage: 'CUSTOMER',
        probability: 95,
        dueIn: 'Đã duyệt',
        avatarColor: 'bg-emerald-600',
      },
      {
        id: 'deal-6',
        title: 'Mở rộng 300 Seats Chi nhánh Miền Nam',
        company: 'VNG Digital Entertainment',
        amount: '1.200.000.000 ₫',
        industry: 'Công nghệ & Game',
        contact: 'Vũ Tuấn Anh (Giám đốc CNTT)',
        stage: 'CUSTOMER',
        probability: 98,
        dueIn: 'Chờ ký số',
        avatarColor: 'bg-teal-600',
      },
    ],
  },
];

export const ProductCockpit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CockpitTab>('dashboard');
  const [selectedDealId, setSelectedDealId] = useState<string>('deal-4');

  return (
    <div className="w-full rounded-3xl bg-[#090F1A] border border-slate-700/80 shadow-2xl shadow-blue-950/40 text-slate-100 overflow-hidden font-sans text-left">
      {/* 1. Top OS Chrome Header */}
      <div className="bg-[#0D1527] px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Window Controls + Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block shadow-xs" />
          </div>
          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="text-blue-400 font-bold">VUM CRM</span>
            <span className="text-slate-600">/</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-medium border border-slate-700">
              Workspace Hà Nội (HQ)
            </span>
          </div>
        </div>

        {/* Center: Search Box Mock */}
        <div className="hidden md:flex items-center gap-2 bg-[#090F1A] border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs text-slate-400 w-64 shadow-inner">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">Tìm deal, pháp nhân...</span>
          <kbd className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Right: Live Sync Badge + Quick Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-emerald-950/90 border border-emerald-800/80 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Sync 99.98%</span>
          </div>
          <button className="hidden sm:flex items-center gap-1 bg-[#085AC0] hover:bg-[#06499D] text-white px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Deal</span>
          </button>
        </div>
      </div>

      {/* 2. Cockpit Navigation Tabs */}
      <div className="bg-[#0B1322] px-4 sm:px-6 pt-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-t-2 ${
              activeTab === 'dashboard'
                ? 'bg-[#090F1A] text-blue-400 border-blue-500 shadow-xs'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Tổng Quan (Live Cockpit)</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-t-2 ${
              activeTab === 'pipeline'
                ? 'bg-[#090F1A] text-blue-400 border-blue-500 shadow-xs'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Pipeline B2B (Kanban)</span>
          </button>

          <button
            onClick={() => setActiveTab('customer360')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-t-2 ${
              activeTab === 'customer360'
                ? 'bg-[#090F1A] text-blue-400 border-blue-500 shadow-xs'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hồ Sơ Customer 360°</span>
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-t-2 ${
              activeTab === 'rbac'
                ? 'bg-[#090F1A] text-blue-400 border-blue-500 shadow-xs'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Phân Quyền RBAC</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-400 pb-2">
          <span>Q4 / 2026</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% MoM
          </span>
        </div>
      </div>

      {/* 3. Main Cockpit Body */}
      <div className="p-4 sm:p-6 bg-[#090F1A]">
        {/* Tab 1: Live HD Product Dashboard Screenshot */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/90 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=85"
                alt="VUM CRM Enterprise Dashboard Cockpit"
                className="w-full h-auto object-cover max-h-[520px] filter brightness-95 group-hover:brightness-100 transition-all duration-500"
                loading="eager"
              />
              {/* Subtle Dark Vignette & Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090F1A] via-transparent to-transparent opacity-80 pointer-events-none" />
              
              {/* Floating Real-time Stats Overlay at Bottom */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/90 text-white flex items-center justify-center font-bold shadow-xs">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-300 font-bold block">Tổng Doanh Số Pipeline Q4</span>
                    <span className="text-lg font-black text-white font-mono">12.850.000.000 ₫ (+18.4%)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    38 Deals Đang Mở
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 font-bold">
                    Tỷ Lệ Win 84.2%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pipeline Kanban View */}
        {activeTab === 'pipeline' && (
          <div className="space-y-5">
            {/* Top KPI Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng Pipeline</span>
                <span className="text-base sm:text-lg font-black text-blue-400 block mt-0.5">12.8 Tỷ ₫</span>
                <span className="text-[10px] text-emerald-400 font-semibold">38 Cơ hội đang mở</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tỷ lệ Thắng (Win)</span>
                <span className="text-base sm:text-lg font-black text-emerald-400 block mt-0.5">84.2%</span>
                <span className="text-[10px] text-slate-400 font-normal">Cao hơn 12% ngành</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tốc độ Chốt Deal</span>
                <span className="text-base sm:text-lg font-black text-purple-400 block mt-0.5">3.2x</span>
                <span className="text-[10px] text-slate-400 font-normal">TB 32 ngày / Deal</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Độ Trễ Hệ Thống</span>
                <span className="text-base sm:text-lg font-black text-cyan-400 block mt-0.5">&lt; 150ms</span>
                <span className="text-[10px] text-slate-400 font-normal">100% Caching Redis</span>
              </div>
            </div>

            {/* 3-Column Visual Kanban Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {kanbanColumns.map((col) => (
                <div key={col.id} className="rounded-2xl bg-[#0D1527] border border-slate-800 p-3 space-y-3">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-200">{col.title}</span>
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                        {col.count}
                      </span>
                    </div>
                    <span className="text-xs font-black text-blue-400">{col.totalAmount}</span>
                  </div>

                  {/* Deal Cards */}
                  <div className="space-y-2.5">
                    {col.deals.map((deal) => {
                      const isSelected = selectedDealId === deal.id;
                      return (
                        <div
                          key={deal.id}
                          onClick={() => setSelectedDealId(deal.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-2.5 ${
                            isSelected
                              ? 'bg-slate-800/90 border-blue-500 shadow-lg shadow-blue-900/20 ring-1 ring-blue-500'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-7 h-7 rounded-lg ${deal.avatarColor} text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-xs`}>
                                {deal.company.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-xs text-white truncate">{deal.company}</h4>
                                <span className="text-[10px] text-slate-400 block truncate">{deal.industry}</span>
                              </div>
                            </div>
                            {renderLifecycleStageBadge(deal.stage)}
                          </div>

                          <p className="text-[11px] text-slate-300 font-medium line-clamp-1">
                            {deal.title}
                          </p>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                            <span className="font-black text-blue-400 text-[13px]">{deal.amount}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{deal.dueIn}</span>
                            </div>
                          </div>

                          {/* Probability Mini Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>Xác suất chốt</span>
                              <span className="font-bold text-emerald-400">{deal.probability}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Customer 360 View */}
        {activeTab === 'customer360' && (
          <div className="rounded-2xl bg-[#0D1527] border border-slate-800 p-5 space-y-6">
            {/* Customer Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg shadow-md">
                  VF
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">VinFast Global Supply Chain</h3>
                    <Badge variant="outline" className="bg-emerald-950 text-emerald-400 border-emerald-800 text-[10px]">
                      Enterprise Account
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">Mã: ACC-2026-VF88 • Ngành: Sản xuất Ô tô &amp; Pin xe điện</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Chỉ số Sức khỏe</span>
                  <span className="text-base font-black text-emerald-400">98 / 100 (Tuyệt vời)</span>
                </div>
              </div>
            </div>

            {/* 2-Col Grid: Contacts & Interaction Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contacts */}
              <div className="space-y-3 text-left">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Đầu Mối Liên Hệ Trọng Yếu (3 Contacts)
                </span>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-white block">Phạm Quốc Hùng</span>
                      <span className="text-[11px] text-slate-400">Phó Tổng Giám Đốc Vận Hành</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-white block">Trần Bích Ngọc</span>
                      <span className="text-[11px] text-slate-400">Trưởng phòng Mua hàng Toàn cầu</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Interaction Timeline */}
              <div className="space-y-3 text-left">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Dòng Thời Gian Tương Tác 360°
                </span>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-emerald-400 font-bold">HỌP NGHIỆM THU</span>
                      <span>Hôm nay 10:30</span>
                    </div>
                    <p className="text-slate-200 text-[11px] font-sans">
                      Thống nhất nghiệm thu Phase 1 phân hệ Báo giá tự động cho 120 nhân sự.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-blue-400 font-bold">GỬI BÁO GIÁ V2.4</span>
                      <span>Hôm qua 15:45</span>
                    </div>
                    <p className="text-slate-200 text-[11px] font-sans">
                      Phát hành bảng báo giá mở rộng 300 seats chi nhánh Hải Phòng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: RBAC Governance View */}
        {activeTab === 'rbac' && (
          <div className="rounded-2xl bg-[#0D1527] border border-slate-800 p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-extrabold text-white">Ma Trận Phân Quyền Dữ Liệu 4 Cấp (RBAC)</h4>
                <p className="text-xs text-slate-400">Tuân thủ nghiêm ngặt ranh giới xem và thao tác dữ liệu giữa các bộ phận.</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                100% Audit Enforcement
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Vai Trò (Role)</th>
                    <th className="py-2.5 px-3">Phạm Vi (Scope)</th>
                    <th className="py-2.5 px-3">Khách Hàng 360°</th>
                    <th className="py-2.5 px-3">Phễu Pipeline</th>
                    <th className="py-2.5 px-3">Duyệt Báo Giá</th>
                    <th className="py-2.5 px-3">Xuất Excel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  <tr className="bg-slate-900/60">
                    <td className="py-2.5 px-3 font-bold text-white">Ban Giám Đốc (CEO/Admin)</td>
                    <td className="py-2.5 px-3"><span className="text-blue-400 font-mono">TENANT (Toàn cty)</span></td>
                    <td className="py-2.5 px-3 text-emerald-400">Toàn quyền</td>
                    <td className="py-2.5 px-3 text-emerald-400">Toàn quyền</td>
                    <td className="py-2.5 px-3 text-emerald-400">Không giới hạn</td>
                    <td className="py-2.5 px-3 text-emerald-400">Được phép</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-white">Giám Đốc Vùng (Regional)</td>
                    <td className="py-2.5 px-3"><span className="text-purple-400 font-mono">TEAM_TREE (Cây vùng)</span></td>
                    <td className="py-2.5 px-3 text-emerald-400">Theo vùng miền</td>
                    <td className="py-2.5 px-3 text-emerald-400">Toàn bộ deal vùng</td>
                    <td className="py-2.5 px-3 text-emerald-400">Chiết khấu &lt; 20%</td>
                    <td className="py-2.5 px-3 text-rose-400">Cần phê duyệt</td>
                  </tr>
                  <tr className="bg-slate-900/60">
                    <td className="py-2.5 px-3 font-bold text-white">Trưởng Nhóm (Team Lead)</td>
                    <td className="py-2.5 px-3"><span className="text-amber-400 font-mono">TEAM (Đội nhóm)</span></td>
                    <td className="py-2.5 px-3 text-slate-300">Khách trong nhóm</td>
                    <td className="py-2.5 px-3 text-slate-300">Deal trong nhóm</td>
                    <td className="py-2.5 px-3 text-emerald-400">Chiết khấu &lt; 10%</td>
                    <td className="py-2.5 px-3 text-rose-400">Bị khóa</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-white">Chuyên Viên Bán Hàng (Sales)</td>
                    <td className="py-2.5 px-3"><span className="text-emerald-400 font-mono">OWN (Phụ trách)</span></td>
                    <td className="py-2.5 px-3 text-slate-400">Chỉ khách tự quản</td>
                    <td className="py-2.5 px-3 text-slate-400">Chỉ deal tự quản</td>
                    <td className="py-2.5 px-3 text-slate-400">Tạo bản nháp</td>
                    <td className="py-2.5 px-3 text-rose-400">Bị khóa</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCockpit;
