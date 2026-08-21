import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Workflow, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { LandingSection } from '../components/LandingSection';
import { SectionHeading } from '../components/SectionHeading';

const scopingFactors = [
  {
    key: 'scale',
    icon: Users,
    badge: 'Linh hoạt mở rộng',
    title: 'Quy Mô Người Dùng & Chi Nhánh',
    description: 'Chi phí được tối ưu theo số lượng nhân viên bán hàng và cơ cấu phòng ban thực tế của doanh nghiệp.',
    criteria: [
      'Số lượng tài khoản sử dụng theo từng phòng ban',
      'Cơ cấu chi nhánh và cây sơ đồ đội nhóm (TEAM_TREE)',
      'Tùy chọn mở rộng số lượng user linh hoạt theo giai đoạn',
    ],
  },
  {
    key: 'process',
    icon: Workflow,
    badge: 'Chuẩn hóa nghiệp vụ',
    title: 'Độ Phức Tạp Quy Trình B2B',
    description: 'Tùy biến số lượng phễu Pipeline, luồng phê duyệt báo giá và hệ thống chiết khấu thương mại.',
    criteria: [
      'Số lượng phễu bán hàng theo từng dòng sản phẩm',
      'Quy trình duyệt Báo giá, Đơn hàng và Hợp đồng nhiều cấp',
      'Mẫu in báo giá và tài liệu nghiệm thu theo chuẩn công ty',
    ],
  },
  {
    key: 'integration',
    icon: Database,
    badge: 'Đồng bộ hệ thống',
    title: 'Tích Hợp Dữ Liệu & Hệ Sinh Thái',
    description: 'Kết nối an toàn với phần mềm Kế toán, ERP nội bộ, cổng Webhooks và các nguồn thu thập Lead.',
    criteria: [
      'Đồng bộ 2 chiều dữ liệu khách hàng và hóa đơn',
      'Cổng Webhooks nhận lead tự động từ Website, Quảng cáo',
      'Hỗ trợ chuyển đổi và làm sạch dữ liệu cũ (Excel/CRM cũ)',
    ],
  },
  {
    key: 'governance',
    icon: ShieldCheck,
    badge: 'Tiêu chuẩn Enterprise',
    title: 'Quản Trị, Bảo Mật & Hỗ Trợ SLA',
    description: 'Bảo mật dữ liệu nhiều cấp, nhật ký kiểm toán toàn diện và cam kết hỗ trợ kỹ thuật trực tiếp 1:1.',
    criteria: [
      'Phân quyền 4 cấp phạm vi dữ liệu (RBAC) nghiêm ngặt',
      'Ghi nhận 100% nhật ký kiểm toán (Audit Trails) theo thời gian thực',
      'Cam kết sẵn sàng hạ tầng SLA 99.9% và hỗ trợ kỹ thuật tận nơi',
    ],
  },
];

const includedFeatures = [
  'Đầy đủ 7 phân hệ cốt lõi từ Lead đến Hợp đồng',
  'Hồ sơ Customer 360° không giới hạn bản ghi',
  'Phân quyền bảo mật 4 cấp dữ liệu (RBAC)',
  'Nhật ký kiểm toán (Audit Trails) chi tiết',
  'Đồng bộ Webhooks & REST API chuẩn hóa',
  'Đào tạo và bàn giao tài liệu vận hành đầy đủ',
];

const deploymentSteps = [
  {
    step: '01',
    title: 'Khảo sát nhu cầu (30 Phút)',
    desc: 'Trao đổi cùng chuyên gia VUM về mô hình kinh doanh và điểm nghẽn quy trình.',
  },
  {
    step: '02',
    title: 'Xây dựng bản Demo mẫu (1-3 Ngày)',
    desc: 'Thiết lập luồng bán hàng mẫu trên hệ thống VUM với dữ liệu mô phỏng của bạn.',
  },
  {
    step: '03',
    title: 'Bàn giao & Đào tạo thực chiến',
    desc: 'Cung cấp báo giá chính xác, hỗ trợ chuyển đổi dữ liệu và đào tạo đội ngũ sử dụng.',
  },
];

export const PricingPage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.pricingTitle'),
    description: t('landing.metadata.pricingDescription'),
    path: '/pricing',
  });

  return (
    <div className="py-6 sm:py-10 lg:py-14 bg-radial-hero">
      <LandingSection contained className="pt-0">
        {/* Header */}
        <SectionHeading
          as="h1"

          title="Định Hướng Quy Mô Triển Khai Cho Doanh Nghiệp"
          description="Không chi phí ẩn, không ép gói tính năng. Chi phí được tư vấn chính xác theo nhu cầu thực tế."
          align="left"
        />

        {/* 4 Scoping Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {scopingFactors.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.key}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#085AC0] flex items-center justify-center border border-blue-100 shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold text-[#085AC0] bg-blue-50/90 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase">
                      {f.badge}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-extrabold text-[#07182B] landing-display">
                    {f.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {f.description}
                  </p>

                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    {f.criteria.map((crit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* All Plans Include Strip */}
        <div className="mt-12 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-6 h-6 text-[#085AC0] shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#07182B] landing-display">
                Mọi Gói Triển Khai Đều Có Sẵn Nền Tảng Cốt Lõi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Đảm bảo doanh nghiệp vận hành ổn định mà không lo phát sinh phụ phí
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {includedFeatures.map((item, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-[#F8FAFD] border border-slate-200/80 flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#07182B]"
              >
                <span className="w-2 h-2 rounded-full bg-[#085AC0] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Step Deployment Flow */}
        <div className="mt-12 bg-[#F8FAFD] border border-blue-100 rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[#085AC0] uppercase tracking-wider">Quy trình làm việc rõ ràng</span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#07182B] landing-display">
              3 Bước Để Sở Hữu Giải Pháp CRM Phù Hợp Nhất
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {deploymentSteps.map((s, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200/80 space-y-2 shadow-2xs">
                <span className="text-xs font-mono font-bold text-[#085AC0] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Bước {s.step}
                </span>
                <h4 className="text-sm font-bold text-[#07182B]">{s.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation CTA Banner */}
        <div className="mt-16 bg-[#07182B] rounded-2xl p-8 sm:p-12 text-white text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-blue-600/20 blur-[100px] pointer-events-none rounded-full" />
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold landing-display">
              {t('landing.pricing.ctaTitle')}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Đội ngũ chuyên gia VUM sẽ làm việc trực tiếp cùng bạn để xác định mô hình tối ưu chi phí và hiệu quả nhất.
            </p>
            <div className="pt-2">
              <Button
                asChild
                className="h-12 px-8 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-base shadow-md transition-colors"
              >
                <Link to="/demo">
                  <span>{t('landing.pricing.ctaAction')}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </LandingSection>
    </div>
  );
};

export default PricingPage;
