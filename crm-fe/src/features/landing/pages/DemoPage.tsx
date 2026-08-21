import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  CalendarCheck,
  Headphones
} from 'lucide-react';
import { env } from '@/config/env';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { DemoRequestForm } from '../components/DemoRequestForm';
import { AnimatedCounter } from '../components/AnimatedCounter';

export const DemoPage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.demoTitle'),
    description: t('landing.metadata.demoDescription'),
    path: '/demo',
  });

  const canSubmitDemoRequest = Boolean(
    env.demoRequestEndpoint && env.privacyPolicyUrl
  );
  const hasDirectContact = Boolean(env.salesEmail || env.salesPhone);

  return (
    <div className="py-6 sm:py-10 lg:py-14 bg-radial-hero">
      <div className="landing-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Context & Proof */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              {/* Kicker Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-[#085AC0] text-xs font-bold tracking-wide shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#085AC0]"></span>
                </span>
                <span className="uppercase tracking-wider font-extrabold">{t('landing.demo.heroKicker')}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-[#07182B] landing-display leading-[1.2] tracking-tight">
                {t('landing.demo.heroTitle')}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {t('landing.demo.heroDescription')}
              </p>
            </div>

            {/* Quick Proof Metrics */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Phản hồi</span>
                <span className="text-sm sm:text-base font-extrabold text-[#085AC0] landing-display">
                  <AnimatedCounter end={150} prefix="< " suffix="ms" duration={1200} />
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Kiểm toán</span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-600 landing-display">
                  <AnimatedCounter end={100} suffix="%" duration={1400} />
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Tốc độ chốt</span>
                <span className="text-sm sm:text-base font-extrabold text-[#07182B] landing-display">
                  <AnimatedCounter end={3.2} decimals={1} suffix="x" duration={1300} />
                </span>
              </div>
            </div>

            {/* 4 Key Consultation Agenda Points */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-3.5 shadow-xs">
              <h2 className="text-xs font-bold text-[#07182B] uppercase tracking-wider flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#085AC0]" />
                Nội dung trong buổi tư vấn trực tiếp
              </h2>
              <div className="space-y-2.5">
                {[
                  'Khảo sát mô hình kinh doanh và dòng chảy dữ liệu khách hàng',
                  'Trải nghiệm thực tế phân hệ Pipeline, Báo giá và Hợp đồng',
                  'Đề xuất cấu trúc phân quyền 4 cấp dữ liệu (RBAC) tối ưu',
                  'Tư vấn kế hoạch chuyển đổi dữ liệu và cam kết thời gian triển khai',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Contact Card */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#07182B]">Cần hỗ trợ kỹ thuật hoặc tư vấn gấp?</h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Hotline: <strong className="text-[#085AC0]">{env.salesPhone || '1900 6868'}</strong> • Email: <strong className="text-[#085AC0]">{env.salesEmail || 'sales@vum.vn'}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Form or Contact Fallback */}
          <div className="lg:col-span-7">
            {canSubmitDemoRequest ? (
              <DemoRequestForm
                privacyPolicyUrl={env.privacyPolicyUrl!}
                salesEmail={env.salesEmail}
                salesPhone={env.salesPhone}
              />
            ) : hasDirectContact ? (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 shadow-lg shadow-blue-900/5 space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-[#085AC0] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                    Liên hệ trực tiếp
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#07182B] landing-display">
                    {t('landing.demo.contact.title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {t('landing.demo.contact.description')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {env.salesEmail && (
                    <a
                      href={`mailto:${env.salesEmail}`}
                      className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#085AC0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-500 uppercase">
                          {t('landing.demo.contact.email')}
                        </p>
                        <p className="text-sm font-bold text-[#07182B] truncate group-hover:text-[#085AC0]">
                          {env.salesEmail}
                        </p>
                      </div>
                    </a>
                  )}

                  {env.salesPhone && (
                    <a
                      href={`tel:${env.salesPhone}`}
                      className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-500 uppercase">
                          {t('landing.demo.contact.phone')}
                        </p>
                        <p className="text-sm font-bold text-[#07182B] truncate group-hover:text-emerald-700">
                          {env.salesPhone}
                        </p>
                      </div>
                    </a>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#085AC0] shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Đội ngũ chuyên gia VUM CRM cam kết phản hồi trong vòng 2 giờ làm việc.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 shadow-lg text-center space-y-4">
                <ShieldCheck className="w-12 h-12 text-[#085AC0] mx-auto" />
                <h2 className="text-xl font-bold text-[#07182B]">Đang cập nhật kênh liên hệ</h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Kênh tiếp nhận demo tự động đang được bảo trì. Vui lòng quay lại sau hoặc đăng nhập vào hệ thống dùng thử.
                </p>
                <div className="pt-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#085AC0] text-white text-xs font-semibold hover:bg-[#06499D] transition-colors"
                  >
                    <span>Dùng thử VUM CRM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
