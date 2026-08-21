import React from 'react';
import { Users, Workflow, Database, ShieldCheck, Check } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';

const scopingFactors = [
  {
    icon: Users,
    title: 'Quy mô người dùng & chi nhánh',
    desc: 'Linh hoạt theo số lượng tài khoản kinh doanh và cơ cấu chi nhánh thực tế.',
  },
  {
    icon: Workflow,
    title: 'Độ phức tạp quy trình B2B',
    desc: 'Tùy biến số lượng phễu Pipeline, luồng phê duyệt báo giá và chiết khấu.',
  },
  {
    icon: Database,
    title: 'Tích hợp dữ liệu & hệ sinh thái',
    desc: 'Kết nối đồng bộ 2 chiều với Kế toán, ERP nội bộ và Webhooks quảng cáo.',
  },
  {
    icon: ShieldCheck,
    title: 'Bảo mật RBAC & hỗ trợ SLA',
    desc: 'Bảo mật phân quyền 4 cấp, ghi nhật ký kiểm toán 100% và hỗ trợ 24/7.',
  },
];

const foundationalFeatures = [
  'Hồ sơ khách hàng Customer 360° không giới hạn',
  'Quản lý Lead & chuyển đổi cơ hội tức thì',
  'Quản lý phễu Pipeline & báo giá đa sản phẩm',
  'Phân quyền bảo mật RBAC 4 cấp phạm vi dữ liệu',
  'Ghi nhận 100% nhật ký kiểm toán DSR',
  'Sao lưu định kỳ tự động và bảo mật đám mây',
];

export const PricingSection: React.FC = () => {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 section-py bg-[--color-canvas] border-b border-[--color-border]"
    >
      <LandingSection contained className="pt-0">
        <SectionHeading
          title="Định giá minh bạch, khảo sát trước khi báo giá"
          description="Doanh nghiệp chỉ chi trả cho phạm vi tính năng và số lượng người dùng thực sự cần thiết."
          align="left"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left: 4 scoping factors */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <h3 className="text-[17px] font-bold text-[--color-ink]">
              Các tiêu chí xác định quy mô
            </h3>
            <div className="grid gap-6">
              {scopingFactors.map((factor) => {
                const Icon = factor.icon;
                return (
                  <div key={factor.title} className="flex items-start gap-4">
                    <div className="icon-badge">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[--color-ink] leading-tight">{factor.title}</h4>
                      <p className="text-[14px] text-[--color-ink-muted] leading-relaxed mt-1">{factor.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Clean spec card */}
          <div className="lg:col-span-7 bg-white border border-[--color-border] rounded-xl p-8 sm:p-10 flex flex-col h-full">
            <div className="mb-8">
              <h4 className="text-xl font-bold text-[--color-ink] mb-2">
                Nền tảng tiêu chuẩn
              </h4>
              <p className="text-[15px] text-[--color-ink-muted]">
                Luôn bao gồm đầy đủ trong mọi gói. Không phụ phí ẩn.
              </p>
            </div>

            {/* Spec list */}
            <ul className="grid gap-4 mb-10 flex-1">
              {foundationalFeatures.map((feat) => (
                <li key={feat} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[--color-ink] mt-1 shrink-0" strokeWidth={3} />
                  <span className="text-[15px] text-[--color-ink-muted] leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="pt-8 border-t border-[--color-border]">
              <a href="#demo" className="btn-primary w-full h-12 text-base">
                Nhận tư vấn báo giá chi tiết
              </a>
            </div>
          </div>
        </div>
      </LandingSection>
    </section>
  );
};

export default PricingSection;
