import React from 'react';
import { Building2, GitBranch, ShieldCheck } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';

const solutions = [
  {
    icon: Building2,
    problem: 'Dữ liệu khách hàng bị nhầm lẫn giữa các văn phòng, Sales vùng này xem được deal của vùng kia.',
    solutionTitle: 'Cây phân cấp dữ liệu TEAM_TREE',
    solutionDesc: 'Phân định ranh giới xem và thao tác dữ liệu theo vùng miền — Bắc, Trung, Nam hoàn toàn độc lập. Báo cáo doanh thu so sánh tức thì.',
    stat: '100%',
    statLabel: 'Cô lập dữ liệu',
  },
  {
    icon: GitBranch,
    problem: 'Deal 6-12 tháng đàm phán, nhiều phiên bản báo giá, khó theo dõi trạng thái và xác suất thắng.',
    solutionTitle: 'Pipeline trọng số + CPQ tự động',
    solutionDesc: 'Chuẩn hóa toàn bộ nấc thang đàm phán từ tiếp cận, thẩm định đến ký kết. Báo giá đa phiên bản, duyệt chiết khấu tức thì.',
    stat: '3.2×',
    statLabel: 'Tốc độ chốt deal',
  },
  {
    icon: ShieldCheck,
    problem: 'Không thể truy vết ai đã truy cập, sửa hay xuất dữ liệu khách hàng — rủi ro pháp lý cao.',
    solutionTitle: 'RBAC 4 cấp & DSR Audit Trail',
    solutionDesc: 'Lưu vết 100% mọi thao tác với mã hash bất biến. Phân quyền chi tiết tới từng nút bấm — thêm, sửa, xóa, xuất Excel.',
    stat: '100%',
    statLabel: 'Audit coverage',
  },
];

export const SolutionsSection: React.FC = () => {
  return (
    <section
      id="solutions"
      className="scroll-mt-20 section-py bg-white border-b border-[--color-border]"
    >
      <LandingSection contained className="pt-0">
        <SectionHeading
          title="Thiết kế cho bài toán B2B phức tạp"
          description="Mỗi doanh nghiệp có một cấu trúc và chu kỳ bán hàng riêng. VUM CRM linh hoạt đáp ứng từng mô hình."
          align="left"
        />

        {/* 3 Solution cards - Anti-slop: pure structural typography, no borders/colors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {solutions.map((sol) => {
            const Icon = sol.icon;
            return (
              <div
                key={sol.solutionTitle}
                className="flex flex-col gap-6"
              >
                {/* Icon */}
                <div className="icon-badge">
                  <Icon className="w-5 h-5" />
                </div>

                {/* Problem quote */}
                <div className="text-[15px] text-[--color-ink-muted] leading-relaxed italic border-l-2 border-[--color-border] pl-4">
                  "{sol.problem}"
                </div>

                {/* Solution */}
                <div>
                  <h3 className="text-[17px] font-bold text-[--color-ink] mb-2">
                    {sol.solutionTitle}
                  </h3>
                  <p className="text-[15px] text-[--color-ink-muted] leading-relaxed">{sol.solutionDesc}</p>
                </div>

                {/* Stat */}
                <div className="flex flex-col pt-4 mt-auto border-t border-[--color-border]">
                  <span className="text-2xl font-black text-[--color-ink] tabular-nums leading-none mb-1">
                    {sol.stat}
                  </span>
                  <span className="text-xs text-[--color-ink-faint] font-semibold uppercase tracking-widest">{sol.statLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </LandingSection>
    </section>
  );
};

export default SolutionsSection;
