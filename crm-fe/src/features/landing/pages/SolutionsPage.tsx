import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { LandingSection } from '../components/LandingSection';
import { SectionHeading } from '../components/SectionHeading';
import { AnimatedCounter } from '../components/AnimatedCounter';

const solutionContexts = [
  {
    key: 'regional',
    icon: Building2,
    badge: 'Mô hình đa chi nhánh',
    title: 'Doanh Nghiệp Quản Lý Theo Vùng Miền & Đội Nhóm',
    description: 'Giải quyết bài toán phân cấp dữ liệu khi doanh nghiệp có nhiều văn phòng đại diện, chi nhánh và đội ngũ kinh doanh phủ rộng toàn quốc.',
    metric: {
      counter: <AnimatedCounter end={4} suffix=" Cấp" duration={1200} />,
      label: 'Phạm vi phân quyền dữ liệu',
      detail: 'TENANT • TEAM_TREE • TEAM • OWN',
    },
    capabilities: [
      'Phân định ranh giới xem dữ liệu giữa các chi nhánh miền Bắc, Trung, Nam',
      'Cây sơ đồ đội nhóm giúp trưởng vùng quản lý toàn bộ nhân viên cấp dưới',
      'Tự động phân bổ Lead và khách hàng theo tỉnh thành và khu vực phụ trách',
    ],
  },
  {
    key: 'b2b',
    icon: Layers,
    badge: 'Giao dịch B2B phức tạp',
    title: 'Doanh Nghiệp B2B Chu Kỳ Bán Hàng Dài & Giá Trị Cao',
    description: 'Chuẩn hóa quy trình chăm sóc từ tiếp cận ban đầu, khảo sát nhu cầu, gửi báo giá nhiều phiên bản đến ký kết hợp đồng thương mại.',
    metric: {
      counter: <AnimatedCounter end={3.2} decimals={1} suffix="x" duration={1400} />,
      label: 'Tốc độ hoàn tất báo giá',
      detail: 'Tự động áp chiết khấu & phê duyệt',
    },
    capabilities: [
      'Quản lý hồ sơ pháp nhân liên kết nhiều đầu mối (Giám đốc, Kỹ thuật, Mua hàng)',
      'Phễu bán hàng đa giai đoạn giúp nhìn rõ điểm nghẽn và xác suất chốt deal',
      'Tạo báo giá chuyên nghiệp và chuyển đổi 1-click sang Hợp đồng & Đơn hàng',
    ],
  },
  {
    key: 'governed',
    icon: ShieldCheck,
    badge: 'Quản trị chuẩn hóa',
    title: 'Tổ Chức Yêu Cầu Kiểm Toán, Tuân Thủ & Bảo Mật Cao',
    description: 'Bảo vệ tài sản dữ liệu khách hàng của tổ chức với hệ thống phân quyền chặt chẽ, chống rò rỉ thông tin và lưu vết 100% hoạt động.',
    metric: {
      counter: <AnimatedCounter end={100} suffix="%" duration={1500} />,
      label: 'Lưu vết lịch sử kiểm toán',
      detail: 'Audit Trails thời gian thực',
    },
    capabilities: [
      'Ghi nhận chi tiết mọi hành vi chỉnh sửa, xem và trích xuất dữ liệu khách hàng',
      'Quản lý yêu cầu dữ liệu chủ thể (DSR) và thiết lập chính sách lưu giữ an toàn',
      'Đồng bộ dữ liệu hai chiều an toàn với phần mềm kế toán và ERP qua Webhooks',
    ],
  },
];

export const SolutionsPage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.solutionsTitle'),
    description: t('landing.metadata.solutionsDescription'),
    path: '/solutions',
  });

  return (
    <div className="py-6 sm:py-10 lg:py-14 bg-radial-hero">
      <LandingSection contained className="pt-0">
        <SectionHeading
          as="h1"

          title="Kiến Trúc Vận Hành Cho Từng Bài Toán Doanh Nghiệp"
          description="Thiết kế linh hoạt theo mô hình tổ chức, đặc thù quy trình bán hàng và chuẩn mực bảo mật doanh nghiệp."
          align="left"
        />

        {/* 3 Solution Context Cards */}
        <div className="space-y-8 pt-4">
          {solutionContexts.map((sol) => {
            const Icon = sol.icon;
            return (
              <div
                key={sol.key}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 shadow-sm hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Narrative */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#085AC0] flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-[#085AC0] bg-blue-50/90 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase">
                        {sol.badge}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#07182B] landing-display mt-1">
                        {sol.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                    {sol.description}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {sol.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3">
                    <Button asChild className="h-10 px-5 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-xs sm:text-sm shadow-xs">
                      <Link to="/demo">
                        <span>Nhận tư vấn giải pháp</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Right Metric Highlight Box */}
                <div className="lg:col-span-5 bg-[#F8FAFD] border border-blue-100 rounded-2xl p-6 sm:p-8 text-center space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {sol.metric.label}
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#085AC0] landing-display">
                    {sol.metric.counter}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 bg-white border border-slate-200/80 rounded-lg py-2 px-3 inline-block">
                    {sol.metric.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 bg-[#07182B] rounded-2xl p-8 sm:p-12 text-white text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-blue-600/20 blur-[100px] pointer-events-none rounded-full" />
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold landing-display">
              {t('landing.solutions.ctaTitle')}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Mỗi doanh nghiệp có cấu trúc vận hành riêng biệt. Hãy để chuyên gia VUM hỗ trợ bạn xây dựng luồng CRM tối ưu.
            </p>
            <div className="pt-2">
              <Button
                asChild
                className="h-12 px-8 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-base shadow-md transition-colors"
              >
                <Link to="/demo">
                  <span>{t('landing.solutions.ctaAction')}</span>
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

export default SolutionsPage;
