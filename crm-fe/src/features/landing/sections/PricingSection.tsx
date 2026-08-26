import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { EditorialSection } from '../components/EditorialSection';
import { EditorialEyebrow } from '../components/EditorialEyebrow';
import { FadeIn } from '../components/FadeIn';

interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  description: string;
  monthlyPriceVND: number;
  annualPriceVND: number;
  targetScale: string;
  features: string[];
  ctaLabel: string;
  isPopular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Dành cho đội ngũ kinh doanh nhỏ bắt đầu chuẩn hóa quy trình bán hàng.',
    monthlyPriceVND: 225000,
    annualPriceVND: 180000,
    targetScale: 'Đội từ 5 – 15 nhân sự',
    features: [
      'Quản lý dữ liệu khách hàng 360°',
      'Theo dõi tiến độ Pipeline chuẩn hóa',
      'Tạo báo giá và xuất PDF tiêu chuẩn',
      'Ứng dụng di động iOS & Android',
      'Hỗ trợ kỹ thuật qua email & chat',
    ],
    ctaLabel: 'Bắt đầu dùng thử',
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: 'Phù hợp nhất',
    isPopular: true,
    description: 'Đầy đủ công cụ CPQ và phê duyệt chiết khấu tự động cho đội ngũ đang tăng trưởng.',
    monthlyPriceVND: 400000,
    annualPriceVND: 320000,
    targetScale: 'Đội từ 15 – 50 nhân sự',
    features: [
      'Tất cả tính năng của gói Standard',
      'Hệ thống CPQ tính giá & chiết khấu đa cấp',
      'Ma trận phê duyệt tự động theo hạn mức',
      'Phân vùng dữ liệu đa chi nhánh (tối đa 5)',
      'Tự động phân bổ Lead (Round-robin)',
      'Tích hợp phần mềm kế toán MISA / FAST qua API',
    ],
    ctaLabel: 'Đăng ký gói Professional',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Giải pháp toàn diện với khả năng tùy biến sâu và cam kết vận hành cho tập đoàn.',
    monthlyPriceVND: 600000,
    annualPriceVND: 480000,
    targetScale: 'Đội trên 50 nhân sự',
    features: [
      'Tất cả tính năng của gói Professional',
      'Không giới hạn số lượng chi nhánh & công ty con',
      'Ma trận phê duyệt đa cấp không giới hạn',
      'Cam kết thời gian sẵn sàng hệ thống SLA 99.9%',
      'Chuyên gia đồng hành đào tạo và triển khai riêng',
      'Hỗ trợ kỹ thuật ưu tiên 24/7 qua Hotline VIP',
    ],
    ctaLabel: 'Liên hệ tư vấn Enterprise',
  },
];

export const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState<boolean>(true);

  return (
    <EditorialSection id="pricing">
      <FadeIn>
        <div className="max-w-2xl">
          <EditorialEyebrow>Bảng giá minh bạch</EditorialEyebrow>
          <h2 className="editorial-h2">
            Đầu tư hợp lý theo quy mô đội ngũ kinh doanh
          </h2>
          <p className="editorial-body text-[17px] text-[#57534E] mt-3">
            Chi phí tính theo người dùng thực tế. Không phát sinh phí ẩn, chuyển đổi linh hoạt khi mở rộng quy mô.
          </p>
        </div>
      </FadeIn>

      {/* Billing Cycle Toggle */}
      <FadeIn stagger={1}>
        <div className="mt-8 flex items-center gap-3">
          <div className="inline-flex rounded-[8px] bg-[#F5F5F4] p-1.5 border border-[#E7E5E4]">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 text-[14px] font-semibold rounded-[6px] transition-all ${
                !isAnnual
                  ? 'bg-white text-[#1C1917] shadow-[0_1px_2px_rgba(28,25,23,0.06)] border border-[#E7E5E4]'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Thanh toán theo tháng
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 text-[14px] font-semibold rounded-[6px] transition-all flex items-center gap-2 ${
                isAnnual
                  ? 'bg-white text-[#1C1917] shadow-[0_1px_2px_rgba(28,25,23,0.06)] border border-[#E7E5E4]'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <span>Thanh toán theo năm</span>
              <span className="px-2 py-0.5 rounded-[4px] bg-[#EFF6FF] text-[#1D4ED8] text-[12px] font-semibold">
                -20%
              </span>
            </button>
          </div>
        </div>
      </FadeIn>

      {/* 3 Pricing Cards */}
      <div className="mt-12 sm:mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {pricingPlans.map((plan, index) => {
          const price = isAnnual ? plan.annualPriceVND : plan.monthlyPriceVND;
          return (
            <FadeIn key={plan.id} stagger={((index + 1) as 1 | 2 | 3)}>
              <div
                className={`editorial-card p-8 sm:p-10 h-full flex flex-col justify-between space-y-8 ${
                  plan.isPopular ? 'border-[#1D4ED8] ring-1 ring-[#1D4ED8] shadow-[0_1px_2px_rgba(28,25,23,0.04),0_20px_48px_rgba(28,25,23,0.08)] relative' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-8 px-3 py-1 rounded-[4px] bg-[#1D4ED8] text-white text-[12px] font-semibold shadow-[0_1px_2px_rgba(29,78,216,0.3)]">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="editorial-h3 text-[22px]">{plan.name}</h3>
                    <p className="text-[14px] text-[#78716C] mt-1 font-medium">{plan.targetScale}</p>
                  </div>

                  <div className="pt-2 border-t border-[#E7E5E4]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-[34px] sm:text-[38px] font-semibold text-[#1C1917] tabular-nums tracking-tight">
                        {price.toLocaleString('vi-VN')} ₫
                      </span>
                      <span className="text-[13px] text-[#78716C]">/ user / tháng</span>
                    </div>
                    <p className="text-[13px] text-[#57534E] mt-1">
                      {isAnnual ? 'Thu phí theo chu kỳ năm' : 'Thu phí theo chu kỳ tháng'}
                    </p>
                  </div>

                  <p className="text-[15px] text-[#57534E] leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="pt-6 border-t border-[#E7E5E4] space-y-3">
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-[#A8A29E]">Tính năng bao gồm:</p>
                    <ul className="space-y-3 text-[14px] text-[#57534E]">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <a
                    href="#demo"
                    className={`w-full text-center h-12 text-[15px] font-medium ${
                      plan.isPopular ? 'editorial-btn-primary' : 'editorial-btn-secondary'
                    }`}
                  >
                    {plan.ctaLabel}
                  </a>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>

      {/* Link to Full Comparison Page */}
      <FadeIn stagger={3}>
        <div className="mt-12 pt-8 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-[15px] text-[#57534E]">
            Cần bảng so sánh chi tiết từng quyền hạn và tính năng kỹ thuật?
          </span>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1D4ED8] hover:text-[#1E40AF]"
          >
            <span>So sánh đầy đủ chi tiết các tính năng</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </FadeIn>
    </EditorialSection>
  );
};

export default PricingSection;
