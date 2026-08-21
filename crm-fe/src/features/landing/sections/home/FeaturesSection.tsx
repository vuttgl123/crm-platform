import React from 'react';
import { Users, FileCheck2, TrendingUp, ShieldCheck } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';

const features = [
  {
    icon: Users,
    title: 'Hồ Sơ Khách Hàng 360°',
    description: 'Hợp nhất pháp nhân, lịch sử cuộc gọi, báo giá và danh bạ trên một dòng thời gian duy nhất. Đồng bộ 2 chiều với hệ thống ERP.',
    stat: '360°',
    statLabel: 'Tầm nhìn toàn cảnh',
    colSpan: 'lg:col-span-7',
  },
  {
    icon: FileCheck2,
    title: 'Báo Giá & Chiết Khấu CPQ',
    description: 'Tự động hóa báo giá đa sản phẩm, kiểm soát biên lợi nhuận và luồng duyệt chiết khấu nhiều cấp.',
    stat: '3.2×',
    statLabel: 'Tốc độ chốt deal',
    colSpan: 'lg:col-span-5',
  },
  {
    icon: TrendingUp,
    title: 'Quản Lý Pipeline B2B',
    description: 'Trực quan hóa phễu bán hàng đa giai đoạn với xác suất chốt deal trọng số thực tế. Cảnh báo deal trễ hạn thông minh.',
    stat: '84%',
    statLabel: 'Tỷ lệ win',
    colSpan: 'lg:col-span-5',
  },
  {
    icon: ShieldCheck,
    title: 'Phân Quyền RBAC & Audit Trail',
    description: 'Bảo vệ tài sản dữ liệu tuyệt đối với phân quyền nghiêm ngặt và lưu vết 100% nhật ký thao tác không thể xóa sửa.',
    stat: '100%',
    statLabel: 'Audit Enforcement',
    colSpan: 'lg:col-span-7',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section
      id="features"
      className="scroll-mt-20 section-py bg-[--color-canvas] border-t border-[--color-border]"
    >
      <LandingSection contained className="pt-0">
        <SectionHeading
          title="Kiến trúc tính năng chuẩn doanh nghiệp B2B"
          description="Khép kín vòng đời khách hàng từ tiếp cận đến kiểm toán trên một nền tảng thống nhất."
          align="left"
        />

        {/* Strict Bento grid - No hover borders, no glows, flat colors */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {features.map((feat) => {
            const Icon = feat.icon;

            return (
              <div
                key={feat.title}
                className={`${feat.colSpan} card-feature flex flex-col justify-between gap-8`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="icon-badge">
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Big stat - pure sharp text */}
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-black text-[--color-ink] landing-display tabular-nums leading-none">
                      {feat.stat}
                    </div>
                    <div className="text-xs text-[--color-ink-muted] font-medium mt-1 uppercase tracking-widest">{feat.statLabel}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[--color-ink] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-[15px] text-[--color-ink-muted] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </LandingSection>
    </section>
  );
};

export default FeaturesSection;
