import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Search, Filter, LayoutGrid, Users, Briefcase, FileText, Settings, ShieldCheck, ChevronRight, Zap } from 'lucide-react';
import { EditorialContainer } from '../components/EditorialContainer';
import { FadeIn } from '../components/FadeIn';

interface DealItem {
  id: string;
  avatar: string;
  avatarBg: string;
  company: string;
  rep: string;
  stage: string;
  amount: string;
  statusBadge: string;
  statusBg: string;
  statusText: string;
  type: 'pending' | 'signed' | 'other';
}

const mockDeals: DealItem[] = [
  {
    id: '1',
    avatar: 'V',
    avatarBg: 'bg-[#1E40AF]',
    company: 'Công nghệ Dược phẩm Vimed',
    rep: 'Nguyễn Minh Tuấn',
    stage: 'Đề xuất giá · GĐ duyệt',
    amount: '1.250.000.000 ₫',
    statusBadge: 'Chờ duyệt (CK 15%)',
    statusBg: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    statusText: 'Chờ duyệt',
    type: 'pending',
  },
  {
    id: '2',
    avatar: 'T',
    avatarBg: 'bg-[#047857]',
    company: 'Tập đoàn Logistics Tân Cảng',
    rep: 'Trần Hoàng Lan',
    stage: 'Đàm phán thương mại',
    amount: '850.000.000 ₫',
    statusBadge: 'Đã duyệt giá',
    statusBg: 'bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]',
    statusText: 'Đã duyệt',
    type: 'signed',
  },
  {
    id: '3',
    avatar: 'A',
    avatarBg: 'bg-[#4338CA]',
    company: 'Bất động sản An Gia',
    rep: 'Lê Quốc Bảo',
    stage: 'Trình ký hợp đồng số',
    amount: '2.400.000.000 ₫',
    statusBadge: 'Đang ký số',
    statusBg: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
    statusText: 'Đang ký',
    type: 'signed',
  },
  {
    id: '4',
    avatar: 'N',
    avatarBg: 'bg-[#44403C]',
    company: 'Nhựa Công nghiệp Việt Nhật',
    rep: 'Phạm Thu Hà',
    stage: 'Đánh giá nhu cầu kỹ thuật',
    amount: '620.000.000 ₫',
    statusBadge: 'Đánh giá nhu cầu',
    statusBg: 'bg-[#F5F5F4] text-[#57534E] border border-[#E7E5E4]',
    statusText: 'Đánh giá',
    type: 'other',
  },
  {
    id: '5',
    avatar: 'G',
    avatarBg: 'bg-[#B45309]',
    company: 'Chuỗi Bán lẻ Golden Sun',
    rep: 'Vũ Mai Anh',
    stage: 'Chốt thành công Q3',
    amount: '1.800.000.000 ₫',
    statusBadge: 'Chốt thành công',
    statusBg: 'bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]',
    statusText: 'Hoàn tất',
    type: 'signed',
  },
];

const tabFilters = [
  { id: 'all', label: 'Tất cả deal', count: '5' },
  { id: 'pending', label: 'Chờ sếp duyệt', count: '1', highlight: true },
  { id: 'signed', label: 'Đã ký / Đã duyệt', count: '3', positive: true },
];

export const HeroSection: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'signed'>('all');
  const [selectedDealId, setSelectedDealId] = useState<string>('1');

  // Pill sliding position calculation
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 4,
    width: 100,
  });

  useEffect(() => {
    const activeIndex = tabFilters.findIndex((t) => t.id === filter);
    const activeTabEl = tabRefs.current[activeIndex];
    if (activeTabEl) {
      setIndicatorStyle({
        left: activeTabEl.offsetLeft,
        width: activeTabEl.offsetWidth,
      });
    }
  }, [filter]);

  return (
    <section className="pt-12 sm:pt-20 lg:pt-24 pb-16 sm:pb-24 lg:pb-28 overflow-hidden bg-[#FFFFFF] w-full">
      <EditorialContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center w-full">
          {/* Left Column (5/12 on large screens) */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-7">
            <FadeIn stagger={1}>
              {/* H1 tiếng Việt chuẩn 9 từ — Full-Width Display Scale */}
              <h1 className="editorial-h1">
                Quản trị bán hàng B2B và phê duyệt báo giá
              </h1>
            </FadeIn>

            <FadeIn stagger={2}>
              {/* Subtitle 2 dòng nêu lợi ích đo được */}
              <p className="editorial-body text-[#57534E]">
                Rút ngắn chu kỳ chốt hợp đồng từ vài ngày xuống dưới 15 phút.
                Kiểm soát 100% chiết khấu và tập trung toàn bộ dữ liệu khách hàng.
              </p>
            </FadeIn>

            <FadeIn stagger={3}>
              {/* 2 CTA Buttons Kích Thước Lớn 46px với hiệu ứng ấn xúc giác */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  to="/login"
                  className="editorial-btn-primary gap-2.5 shadow-[0_1px_2px_rgba(29,78,216,0.2)] active:scale-[0.98]"
                >
                  <span className="font-medium">Bắt đầu trải nghiệm</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#solutions"
                  className="editorial-btn-secondary gap-2 text-center active:scale-[0.98]"
                >
                  <span>Xem cách hoạt động</span>
                  <ChevronRight className="w-4 h-4 text-[#57534E]" />
                </a>
              </div>
            </FadeIn>

            <FadeIn stagger={4}>
              {/* Caption cam kết rõ ràng */}
              <p className="editorial-caption pt-1">
                Dùng thử 14 ngày · Không cần thẻ tín dụng · Hỗ trợ chuyển dữ liệu từ Excel
              </p>
            </FadeIn>
          </div>

          {/* Right Column (7/12 on large screens) — Fixed-Height Rock-Solid Dashboard Mockup */}
          <div className="lg:col-span-7 xl:col-span-7 w-full">
            <FadeIn stagger={2}>
              <div className="editorial-mockup bg-white w-full h-[470px] flex flex-col">
                {/* Mockup Top Window Bar */}
                <div className="h-11 px-4 sm:px-6 border-b border-[#E7E5E4] bg-[#FAFAF9] flex items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#E7E5E4]" />
                    <span className="w-3 h-3 rounded-full bg-[#E7E5E4]" />
                    <span className="w-3 h-3 rounded-full bg-[#E7E5E4]" />
                    <span className="ml-3 text-[12px] font-mono text-[#78716C]">vum-crm.internal/deals/pipeline</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-mono text-[#57534E]">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                    <span className="font-medium text-[#1C1917]">Đồng bộ 0.4s</span>
                  </div>
                </div>

                {/* Mockup Main Layout (Fixed Height, No Layout Shift) */}
                <div className="flex flex-1 min-h-0 w-full">
                  {/* Mockup Sidebar (190px) */}
                  <div className="hidden sm:flex w-[190px] shrink-0 border-r border-[#E7E5E4] bg-[#FAFAF9] p-4 flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="px-2.5 py-1.5 text-[12px] font-semibold text-[#1C1917] flex items-center gap-2 border-b border-[#E7E5E4] pb-2.5">
                        <div className="w-5 h-5 rounded-[4px] bg-[#1C1917] text-white flex items-center justify-center text-[10px] font-mono">V</div>
                        <span>VUM Enterprise</span>
                      </div>

                      <div className="pt-1 space-y-1">
                        <div className="px-2.5 py-2 rounded-[6px] text-[12px] font-medium text-[#57534E] hover:bg-[#F5F5F4] flex items-center gap-2.5 cursor-pointer">
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span>Tổng quan</span>
                        </div>
                        <div className="px-2.5 py-2 rounded-[6px] text-[12px] font-medium text-[#57534E] hover:bg-[#F5F5F4] flex items-center gap-2.5 cursor-pointer">
                          <Users className="w-3.5 h-3.5" />
                          <span>Khách hàng 360°</span>
                        </div>
                        <div className="px-2.5 py-2 rounded-[6px] text-[12px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] flex items-center gap-2.5 cursor-pointer shadow-[0_1px_2px_rgba(29,78,216,0.08)]">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>Cơ hội bán (24)</span>
                        </div>
                        <div className="px-2.5 py-2 rounded-[6px] text-[12px] font-medium text-[#57534E] hover:bg-[#F5F5F4] flex items-center gap-2.5 cursor-pointer">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Báo giá &amp; CPQ</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E7E5E4] px-2 text-[11px] text-[#A8A29E] flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5" />
                      <span>Cài đặt ma trận</span>
                    </div>
                  </div>

                  {/* Mockup Table Content (Fixed Height with Silky-Smooth Sliding Tab Indicator) */}
                  <div className="flex-1 min-w-0 p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                      {/* Sliding Tab Switcher */}
                      <div className="flex items-center justify-between gap-2 border-b border-[#E7E5E4] pb-3.5 mb-3.5">
                        <div className="relative inline-flex items-center rounded-[8px] bg-[#F5F5F4] p-1 border border-[#E7E5E4]">
                          {/* Animated Sliding Pill Indicator */}
                          <div
                            className="absolute top-1 bottom-1 rounded-[6px] bg-[#1C1917] shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-200 ease-out"
                            style={{
                              left: `${indicatorStyle.left}px`,
                              width: `${indicatorStyle.width}px`,
                            }}
                          />

                          {tabFilters.map((tab, idx) => {
                            const isActive = filter === tab.id;
                            return (
                              <button
                                key={tab.id}
                                ref={(el) => (tabRefs.current[idx] = el)}
                                type="button"
                                onClick={() => setFilter(tab.id as 'all' | 'pending' | 'signed')}
                                className={`relative z-10 px-3 py-1 text-[12px] font-medium transition-colors duration-150 whitespace-nowrap ${
                                  isActive
                                    ? 'text-white font-semibold'
                                    : 'text-[#57534E] hover:text-[#1C1917]'
                                }`}
                              >
                                <span>{tab.label}</span>{' '}
                                <span
                                  className={`tabular-nums font-mono text-[11px] ${
                                    isActive
                                      ? 'text-white opacity-90'
                                      : tab.highlight
                                      ? 'text-[#B91C1C] font-semibold'
                                      : tab.positive
                                      ? 'text-[#15803D] font-semibold'
                                      : 'opacity-70'
                                  }`}
                                >
                                  ({tab.count})
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <span className="text-[12px] font-mono text-[#78716C] hidden md:inline">
                          Tổng: <strong className="text-[#1C1917] font-semibold tabular-nums">6.87B ₫</strong>
                        </span>
                      </div>

                      {/* Fixed 5-Slot Deal List — Keeps Exact Frame Dimensions */}
                      <div className="space-y-2 text-[13px]">
                        {mockDeals.map((deal) => {
                          const isMatch =
                            filter === 'all' ||
                            (filter === 'pending' && deal.type === 'pending') ||
                            (filter === 'signed' && deal.type === 'signed');

                          const isSelected = selectedDealId === deal.id;

                          return (
                            <div
                              key={deal.id}
                              onClick={() => setSelectedDealId(deal.id)}
                              className={`p-3 rounded-[8px] border flex items-center justify-between gap-4 cursor-pointer transition-all duration-150 ${
                                isMatch
                                  ? isSelected
                                    ? 'border-[#BFDBFE] bg-[#EFF6FF]/60 shadow-[0_1px_4px_rgba(29,78,216,0.06)] opacity-100'
                                    : 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1] hover:bg-[#FAFAF9] opacity-100'
                                  : 'border-dashed border-[#E7E5E4] bg-[#FAFAF9]/60 opacity-30 hover:opacity-75'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2.5">
                                  <span className={`w-5 h-5 rounded-full ${deal.avatarBg} text-white flex items-center justify-center text-[10px] font-mono font-semibold`}>
                                    {deal.avatar}
                                  </span>
                                  <p className="font-semibold text-[#1C1917] truncate">
                                    {deal.company}
                                  </p>
                                </div>
                                <p className="text-[12px] text-[#57534E] mt-0.5 ml-7.5">
                                  Phụ trách: {deal.rep} · {deal.stage}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-mono font-semibold text-[#1C1917] tabular-nums text-[14px]">
                                  {deal.amount}
                                </p>
                                <span className={`inline-block px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold mt-0.5 ${deal.statusBg}`}>
                                  {deal.statusBadge}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </EditorialContainer>
    </section>
  );
};

export default HeroSection;
