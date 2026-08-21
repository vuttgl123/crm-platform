import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  UserPlus, 
  Users, 
  Kanban, 
  FileCheck, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Layers,
  Activity,
  Lock,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { LandingSection } from '../components/LandingSection';
import { SectionHeading } from '../components/SectionHeading';
import { AnimatedCounter } from '../components/AnimatedCounter';

const featurePillars = [
  {
    number: '01',
    key: 'lead',
    icon: UserPlus,
    title: 'Quản trị Khách hàng Tiềm năng (Lead Engine)',
    badge: 'Đầu phễu bán hàng',
    highlights: [
      'Thu thập và phân loại lead từ đa nguồn (Web, Sự kiện, Đối tác)',
      'Tự động phân bổ lead theo khu vực địa lý và kỹ năng sales',
      'Đánh giá chất lượng (Qualify) và chuyển đổi 1-click thành Cơ hội',
    ],
  },
  {
    number: '02',
    key: 'account',
    icon: Users,
    title: 'Hồ sơ Pháp nhân Customer 360°',
    badge: 'Trung tâm dữ liệu',
    highlights: [
      'Liên kết nhiều người liên hệ (Contacts) thuộc cùng một pháp nhân (Account)',
      'Dòng thời gian tương tác toàn diện: Cuộc gọi, Email, Ghi chú, Tài liệu',
      'Hệ thống Tag phân khúc và quản lý công nợ, lịch sử mua hàng tập trung',
    ],
  },
  {
    number: '03',
    key: 'opportunity',
    icon: Kanban,
    title: 'Kiểm soát Cơ hội & Pipeline B2B',
    badge: 'Tối ưu tỷ lệ chuyển đổi',
    highlights: [
      'Quản lý phễu bán hàng đa giai đoạn với xác suất chốt deal thực tế',
      'Cảnh báo cơ hội trễ hạn và đề xuất hành động tiếp theo',
      'Phân quyền xem cơ hội theo cấp bậc (Cá nhân, Nhóm, Toàn công ty)',
    ],
  },
  {
    number: '04',
    key: 'commerce',
    icon: FileCheck,
    title: 'Báo giá, Đơn hàng & Hợp đồng Liền mạch',
    badge: 'Tự động hóa giao dịch',
    highlights: [
      'Tạo báo giá chuyên nghiệp đa sản phẩm với bảng giá và chiết khấu linh hoạt',
      'Quy trình phê duyệt báo giá nhiều cấp nhanh chóng trên hệ thống',
      'Chuyển đổi tức thì từ Báo giá được duyệt sang Hợp đồng và Đơn hàng',
    ],
  },
  {
    number: '05',
    key: 'automation',
    icon: Zap,
    title: 'Tự động hóa Quy trình (Workflows)',
    badge: 'Tăng 40% năng suất',
    highlights: [
      'Tự động gửi thông báo nhắc việc và giao việc khi trạng thái deal thay đổi',
      'Thiết lập luật phân quyền và chuyển giao tài khoản khi có thay đổi nhân sự',
      'Giảm thiểu hoàn toàn các tác vụ nhập liệu lặp lại thủ công',
    ],
  },
  {
    number: '06',
    key: 'forecast',
    icon: TrendingUp,
    title: 'Dự báo Doanh số & Giám sát KPI',
    badge: 'Dữ liệu thời gian thực',
    highlights: [
      'Dự báo doanh thu theo chu kỳ tháng/quý dựa trên trọng số xác suất deal',
      'Theo dõi tiến độ đạt chỉ tiêu KPI của từng đội nhóm và chuyên viên sales',
      'Báo cáo trực quan tức thì, không cần chờ tổng hợp số liệu cuối tuần',
    ],
  },
  {
    number: '07',
    key: 'governance',
    icon: ShieldCheck,
    title: 'Quản trị Bảo mật & Kiểm toán Dữ liệu (RBAC)',
    badge: 'Chuẩn Enterprise',
    highlights: [
      'Phân quyền 4 cấp phạm vi: TENANT, TEAM_TREE, TEAM và OWN',
      'Ghi nhận 100% nhật ký thay đổi và truy vết truy cập (Audit Logs)',
      'Tuân thủ chính sách quyền riêng tư DSR và quy định lưu giữ dữ liệu',
    ],
  },
];

export const FeaturesPage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.featuresTitle'),
    description: t('landing.metadata.featuresDescription'),
    path: '/features',
  });

  return (
    <div className="py-6 sm:py-10 lg:py-14 bg-radial-hero">
      <LandingSection contained className="pt-0">
        {/* Header */}
        <SectionHeading
          as="h1"

          title="7 Phân Hệ Khép Kín Vòng Đời Khách Hàng B2B"
          description="Chuẩn hóa toàn diện từ thu thập Lead, quản lý cơ hội, báo giá đến bảo mật và kiểm toán dữ liệu."
          align="left"
        />

        {/* Top Feature Stats Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2 pb-10">
          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#085AC0] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-[#07182B] landing-display">
                <AnimatedCounter end={7} suffix=" Phân hệ" duration={1200} />
              </div>
              <div className="text-xs text-slate-500 font-medium">Khép kín quy trình</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-[#07182B] landing-display">
                <AnimatedCounter end={99.9} decimals={1} suffix="%" duration={1400} />
              </div>
              <div className="text-xs text-slate-500 font-medium">Hạ tầng sẵn sàng</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#085AC0] flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-[#07182B] landing-display">
                <AnimatedCounter end={150} prefix="< " suffix="ms" duration={1300} />
              </div>
              <div className="text-xs text-slate-500 font-medium">Truy vấn siêu tốc</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-[#07182B] landing-display">
                <AnimatedCounter end={100} suffix="%" duration={1500} />
              </div>
              <div className="text-xs text-slate-500 font-medium">Truy vết kiểm toán</div>
            </div>
          </div>
        </div>

        {/* 7 Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featurePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.key}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E2E8F0] hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#085AC0] flex items-center justify-center border border-blue-100/80 shadow-2xs group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        {pillar.number}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#085AC0] bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase">
                      {pillar.badge}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-[#07182B] landing-display leading-snug">
                    {pillar.title}
                  </h2>

                  <ul className="space-y-2.5 pt-1">
                    {pillar.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">VUM Module #{pillar.number}</span>
                  <Link
                    to="/demo"
                    className="text-xs font-bold text-[#085AC0] hover:underline flex items-center gap-1 group/btn"
                  >
                    <span>Trải nghiệm</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Conversion Banner */}
        <div className="mt-16 bg-[#07182B] rounded-2xl p-8 sm:p-12 text-white text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-blue-600/20 blur-[100px] pointer-events-none rounded-full" />
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold landing-display">
              {t('landing.features.ctaTitle')}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Đặt lịch trao đổi 30 phút cùng chuyên gia VUM để trải nghiệm trực tiếp hệ thống trên dữ liệu mô phỏng doanh nghiệp.
            </p>
            <div className="pt-2">
              <Button
                asChild
                className="h-12 px-8 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-base shadow-md transition-colors"
              >
                <Link to="/demo">
                  <span>Đặt lịch demo ngay</span>
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

export default FeaturesPage;
