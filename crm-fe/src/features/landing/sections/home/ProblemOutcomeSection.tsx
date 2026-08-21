import React from 'react';
import { useTranslation } from 'react-i18next';
import { XCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { SpotlightCard } from '../../components/SpotlightCard';

const problemPoints = [
  {
    title: 'Dữ liệu phân mảnh trên bảng tính rời rạc',
    desc: 'Thông tin khách hàng lưu trữ rải rác trên file Excel cá nhân, nguy cơ mất trắng dữ liệu khi nhân sự nghỉ việc.',
    risk: 'Thất thoát dữ liệu 40%',
  },
  {
    title: 'Không kiểm soát được tiến độ và lịch sử deal',
    desc: 'Lãnh đạo không nắm được cơ hội đang tắc ở bước nào, dự báo doanh số thiếu căn cứ thực tế.',
    risk: 'Dự báo sai lệch > 30%',
  },
  {
    title: 'Quy trình báo giá & duyệt hợp đồng thủ công chậm trễ',
    desc: 'Mất nhiều ngày để tính toán chiết khấu và phê duyệt qua lại, làm giảm tốc độ chốt đơn của kinh doanh.',
    risk: 'Thời gian trễ 5 - 7 ngày',
  },
];

const solutionPoints = [
  {
    title: 'Dữ liệu khách hàng tập trung Customer 360°',
    desc: 'Hồ sơ pháp nhân, danh bạ liên hệ, công nợ và lịch sử trao đổi được quản lý tập trung và phân quyền chặt chẽ.',
    badge: 'Tập trung 100%',
  },
  {
    title: 'Pipeline trực quan theo thời gian thực',
    desc: 'Theo dõi giá trị cơ hội, giai đoạn đàm phán và tỷ lệ chuyển đổi minh bạch theo từng chi nhánh.',
    badge: 'Kiểm soát 24/7',
  },
  {
    title: 'Tự động hóa báo giá, đơn hàng & hợp đồng',
    desc: 'Quy trình tạo báo giá thông minh, phê duyệt phân cấp nhanh chóng và đồng bộ tức thì sang kế toán.',
    badge: 'Nhanh hơn 3x',
  },
];

export const ProblemOutcomeSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="problem" className="bg-[#F8FAFD] py-20 lg:py-28">
      <SectionHeading

        title={t('landing.home.problem.title')}
        description="Đối chiếu hiệu quả vận hành trước và sau khi doanh nghiệp chuẩn hóa quy trình cùng VUM CRM"
        align="left"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-6">
        {/* Left Side: Before (Fragmented legacy spreadsheets) */}
        <div className="bg-white border border-rose-200/80 rounded-3xl p-7 sm:p-9 space-y-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex items-center justify-between pb-5 border-b border-rose-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 landing-display">
                  {t('landing.home.problem.beforeTitle')}
                </h3>
                <span className="text-xs text-rose-600 font-semibold">Quy trình thủ công rủi ro cao</span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full">
              Thách thức
            </span>
          </div>

          <div className="space-y-4">
            {problemPoints.map((point, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2 hover:bg-rose-50/70 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                    {point.title}
                  </span>
                  <span className="text-[11px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200 shrink-0">
                    {point.risk}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {point.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: After (VUM CRM Standardized Bento) */}
        <SpotlightCard
          spotlightColor="rgba(8, 90, 192, 0.18)"
          className="rounded-3xl border-blue-200/90 bg-gradient-to-b from-blue-50/40 via-white to-white p-7 sm:p-9 space-y-6 shadow-lg shadow-blue-900/5 ring-1 ring-blue-500/20"
        >
          <div className="flex items-center justify-between pb-5 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#07182B] landing-display">
                  {t('landing.home.problem.afterTitle')}
                </h3>
                <span className="text-xs text-[#085AC0] font-semibold">Tự động hóa &amp; Chuẩn quy trình</span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Chuẩn hóa
            </span>
          </div>

          <div className="space-y-4">
            {solutionPoints.map((point, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-white border border-blue-100/90 shadow-2xs space-y-2 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-sm sm:text-base text-[#07182B] group-hover:text-[#085AC0] transition-colors leading-snug">
                    {point.title}
                  </span>
                  <span className="text-[11px] font-extrabold text-[#085AC0] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 shrink-0">
                    {point.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {point.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#085AC0] hover:text-[#06499D] transition-colors"
            >
              <span>Xem chi tiết 7 giai đoạn vòng đời CRM</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </SpotlightCard>
      </div>
    </LandingSection>
  );
};

export default ProblemOutcomeSection;
