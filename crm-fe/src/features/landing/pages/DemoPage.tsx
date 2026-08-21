import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { env } from '@/config/env';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { DemoRequestForm } from '../components/DemoRequestForm';

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
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="landing-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Context & Proof */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#085AC0] bg-[#EAF2FC] px-3 py-1 rounded-full mb-4">
                {t('landing.demo.heroKicker')}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#07182B] landing-display leading-tight">
                {t('landing.demo.heroTitle')}
              </h1>
              <p className="mt-4 text-base text-[#52647A] leading-relaxed">
                {t('landing.demo.heroDescription')}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-[#07182B] uppercase tracking-wider">
                Nội dung trong buổi trao đổi
              </h3>
              <ul className="space-y-3">
                {[
                  'Khảo sát luồng dữ liệu khách hàng hiện tại của doanh nghiệp',
                  'Xem thử nghiệm quy trình pipeline, báo giá và hợp đồng mẫu',
                  'Đề xuất cấu trúc phân quyền và phạm vi dữ liệu tối ưu',
                  'Tư vấn kế hoạch chuyển đổi dữ liệu và lộ trình triển khai',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-[#07182B]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#085AC0] shrink-0" />
              <p className="text-xs text-[#52647A]">
                Thông tin được bảo mật và chỉ sử dụng cho mục đích tư vấn giải pháp VUM CRM.
              </p>
            </div>
          </div>

          {/* Right Column: Form or Contact Mode */}
          <div className="lg:col-span-7">
            {canSubmitDemoRequest ? (
              <DemoRequestForm
                privacyPolicyUrl={env.privacyPolicyUrl!}
                salesEmail={env.salesEmail}
                salesPhone={env.salesPhone}
              />
            ) : hasDirectContact ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#07182B] landing-display">
                    {t('landing.demo.contact.title')}
                  </h2>
                  <p className="text-sm text-[#52647A] mt-2 leading-relaxed">
                    {t('landing.demo.contact.description')}
                  </p>
                </div>

                <div className="space-y-4">
                  {env.salesEmail && (
                    <a
                      href={`mailto:${env.salesEmail}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#085AC0] flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#52647A] uppercase">
                          {t('landing.demo.contact.email')}
                        </p>
                        <p className="text-base font-bold text-[#07182B] truncate group-hover:text-[#085AC0]">
                          {env.salesEmail}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#085AC0] group-hover:translate-x-1 transition-all shrink-0" />
                    </a>
                  )}

                  {env.salesPhone && (
                    <a
                      href={`tel:${env.salesPhone}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#52647A] uppercase">
                          {t('landing.demo.contact.phone')}
                        </p>
                        <p className="text-base font-bold text-[#07182B] truncate group-hover:text-[#085AC0]">
                          {env.salesPhone}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#085AC0] group-hover:translate-x-1 transition-all shrink-0" />
                    </a>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-[#52647A]">Bạn muốn trải nghiệm ngay?</span>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#085AC0] hover:text-[#06499D]"
                  >
                    <span>{t('landing.home.hero.secondaryCta')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center space-y-4">
                <h2 className="text-xl font-bold text-[#07182B]">
                  {t('landing.demo.contact.title')}
                </h2>
                <p className="text-sm text-[#52647A] max-w-md mx-auto">
                  {t('landing.demo.contact.unavailable')}
                </p>
                <div className="pt-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-[#085AC0] text-white font-semibold text-sm hover:bg-[#06499D] transition-colors"
                  >
                    {t('landing.home.hero.secondaryCta')}
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
