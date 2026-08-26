import React, { useState } from 'react';
import { ArrowRight, Clock, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { EditorialSection } from '../components/EditorialSection';
import { EditorialEyebrow } from '../components/EditorialEyebrow';
import { FadeIn } from '../components/FadeIn';

interface TeamTierConfig {
  reps: number;
  label: string;
  hoursSaved: string;
  approvalTime: string;
  leakageReduction: string;
  revenueProtected: string;
}

const teamTiers: TeamTierConfig[] = [
  {
    reps: 10,
    label: '10 nhân sự',
    hoursSaved: '160 giờ / tháng',
    approvalTime: '< 15 phút (giảm 85%)',
    leakageReduction: '15% thất thoát deal',
    revenueProtected: '~450 triệu ₫ / năm',
  },
  {
    reps: 25,
    label: '25 nhân sự',
    hoursSaved: '420 giờ / tháng',
    approvalTime: '< 15 phút (giảm 85%)',
    leakageReduction: '18% thất thoát deal',
    revenueProtected: '~1.2 tỷ ₫ / năm',
  },
  {
    reps: 50,
    label: '50 nhân sự',
    hoursSaved: '900 giờ / tháng',
    approvalTime: '< 12 phút (giảm 90%)',
    leakageReduction: '22% thất thoát deal',
    revenueProtected: '~2.8 tỷ ₫ / năm',
  },
  {
    reps: 100,
    label: '100+ nhân sự',
    hoursSaved: '1.900 giờ / tháng',
    approvalTime: '< 10 phút (giảm 92%)',
    leakageReduction: '25% thất thoát deal',
    revenueProtected: '~6.2 tỷ ₫ / năm',
  },
];

export const RoiCalculatorSection: React.FC = () => {
  const [selectedReps, setSelectedReps] = useState<number>(25);

  const currentTier =
    teamTiers.find((tier) => tier.reps === selectedReps) || teamTiers[1];

  return (
    <EditorialSection id="roi">
      <FadeIn>
        <div className="max-w-2xl">
          <EditorialEyebrow>Ước tính hiệu quả</EditorialEyebrow>
          <h2 className="editorial-h2">
            Đo lường thời gian và doanh thu tiết kiệm được
          </h2>
          <p className="editorial-body text-[17px] text-[#57534E] mt-3">
            Chọn quy mô đội ngũ kinh doanh hiện tại của bạn để xem mức độ cải thiện hiệu suất vận hành dự kiến.
          </p>
        </div>
      </FadeIn>

      {/* Main ROI Container */}
      <div className="mt-12 editorial-card p-8 sm:p-12 space-y-10">
        {/* Segmented Control Selector */}
        <FadeIn stagger={1}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border-b border-[#E7E5E4] pb-8">
            <div>
              <span className="text-[15px] font-semibold text-[#1C1917]">
                Quy mô đội ngũ bán hàng (Sales Reps):
              </span>
              <p className="text-[13px] text-[#78716C] mt-0.5">
                Nhân sự trực tiếp sử dụng CRM &amp; tạo báo giá hàng ngày
              </p>
            </div>

            <div className="inline-flex rounded-[8px] bg-[#F5F5F4] p-1.5 border border-[#E7E5E4] overflow-x-auto max-w-full">
              {teamTiers.map((tier) => {
                const isActive = tier.reps === selectedReps;
                return (
                  <button
                    key={tier.reps}
                    type="button"
                    onClick={() => setSelectedReps(tier.reps)}
                    className={`px-5 py-2 text-[14px] font-semibold rounded-[6px] transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-[#1C1917] shadow-[0_1px_2px_rgba(28,25,23,0.06)] border border-[#E7E5E4]'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* 4 Output Stat Pods (Nền Soft #EFF6FF, Viền #BFDBFE) */}
        <FadeIn stagger={2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric 1: Hours Saved */}
            <div className="p-6 rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE] space-y-3 shadow-[0_1px_2px_rgba(29,78,216,0.04)]">
              <div className="flex items-center justify-between text-[#1D4ED8]">
                <span className="text-[12px] font-semibold uppercase tracking-wider">Thời gian tiết kiệm</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="font-mono text-[24px] sm:text-[28px] font-semibold text-[#1C1917] tabular-nums tracking-tight">
                {currentTier.hoursSaved}
              </p>
              <p className="text-[13px] text-[#57534E] leading-snug">
                Giảm thời gian soạn báo giá thủ công và tổng hợp số liệu
              </p>
            </div>

            {/* Metric 2: Approval Time */}
            <div className="p-6 rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE] space-y-3 shadow-[0_1px_2px_rgba(29,78,216,0.04)]">
              <div className="flex items-center justify-between text-[#1D4ED8]">
                <span className="text-[12px] font-semibold uppercase tracking-wider">Tốc độ duyệt giá</span>
                <Zap className="w-4 h-4" />
              </div>
              <p className="font-mono text-[24px] sm:text-[28px] font-semibold text-[#1C1917] tabular-nums tracking-tight">
                {currentTier.approvalTime}
              </p>
              <p className="text-[13px] text-[#57534E] leading-snug">
                Duyệt chiết khấu tự động theo hạn mức phân quyền
              </p>
            </div>

            {/* Metric 3: Leakage Reduction */}
            <div className="p-6 rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE] space-y-3 shadow-[0_1px_2px_rgba(29,78,216,0.04)]">
              <div className="flex items-center justify-between text-[#1D4ED8]">
                <span className="text-[12px] font-semibold uppercase tracking-wider">Giảm mất cơ hội</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="font-mono text-[24px] sm:text-[28px] font-semibold text-[#1C1917] tabular-nums tracking-tight">
                {currentTier.leakageReduction}
              </p>
              <p className="text-[13px] text-[#57534E] leading-snug">
                Nhờ cảnh báo deal tồn đọng và tương tác kịp thời
              </p>
            </div>

            {/* Metric 4: Revenue Protected */}
            <div className="p-6 rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE] space-y-3 shadow-[0_1px_2px_rgba(29,78,216,0.04)]">
              <div className="flex items-center justify-between text-[#1D4ED8]">
                <span className="text-[12px] font-semibold uppercase tracking-wider">Giá trị bảo vệ</span>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="font-mono text-[24px] sm:text-[28px] font-semibold text-[#15803D] tabular-nums tracking-tight">
                {currentTier.revenueProtected}
              </p>
              <p className="text-[13px] text-[#57534E] leading-snug">
                Bảo vệ biên lợi nhuận và hạn chế chiết khấu vượt khung
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Real Assumptions Footnote */}
        <FadeIn stagger={3}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pt-4 border-t border-[#E7E5E4]">
            <p className="editorial-caption max-w-2xl">
              Ước tính dựa trên giả định mỗi nhân sự kinh doanh tiết kiệm 45 phút/ngày cho việc làm báo giá thủ công và tổng hợp báo cáo. Con số thực tế có thể thay đổi tùy ngành nghề.
            </p>
            <a
              href="#demo"
              className="editorial-btn-primary h-11 px-5 text-[14px] font-medium shrink-0"
            >
              <span>Nhận phân tích chi tiết cho doanh nghiệp</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>
        </FadeIn>
      </div>
    </EditorialSection>
  );
};

export default RoiCalculatorSection;
