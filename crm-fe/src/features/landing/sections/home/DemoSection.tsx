import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, Check } from 'lucide-react';
import { env } from '@/config/env';
import { DemoRequestForm } from '../../components/DemoRequestForm';

const agendaItems = [
  'Khảo sát cấu trúc phòng ban và quy mô đội ngũ',
  'Demo luồng Pipeline và Báo giá theo nghiệp vụ',
  'Tư vấn lộ trình triển khai tối ưu',
];

export const DemoSection: React.FC = () => {
  const { t } = useTranslation();
  const hasDirectContact = Boolean(env.salesEmail || env.salesPhone);

  return (
    <section
      id="demo"
      className="scroll-mt-20 section-py bg-[--color-dark] text-white"
    >
      <div className="landing-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left column: Context */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* Headline */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-5xl font-black text-white landing-display">
                {t('landing.demo.heroTitle')}
              </h2>
              <p className="text-lg text-[--color-dark-muted] leading-relaxed">
                Đội ngũ chuyên gia của chúng tôi sẽ thiết kế một bản demo dành riêng cho mô hình kinh doanh của bạn.
              </p>
            </div>

            {/* 30-min agenda */}
            <div className="space-y-4">
              <div className="font-bold text-[15px] text-white">
                Nội dung 30 phút trao đổi:
              </div>
              <ul className="space-y-4">
                {agendaItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-[--color-dark-muted] leading-relaxed">
                    <Check className="w-5 h-5 text-white shrink-0" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact info */}
            {hasDirectContact && (
              <div className="pt-8 border-t border-[--color-dark-border] flex flex-wrap items-center gap-8 text-[15px] font-medium text-[--color-dark-muted]">
                {env.salesPhone && (
                  <a href={`tel:${env.salesPhone}`} className="flex items-center gap-2.5 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                    {env.salesPhone}
                  </a>
                )}
                {env.salesEmail && (
                  <a href={`mailto:${env.salesEmail}`} className="flex items-center gap-2.5 hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                    {env.salesEmail}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right column: Form card */}
          <div className="lg:col-span-7">
            <div className="rounded-xl p-8 sm:p-12 bg-white text-[--color-ink] border border-transparent">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-[--color-ink] mb-2">
                  Đăng ký nhận bản demo
                </h3>
                <p className="text-[15px] text-[--color-ink-muted]">
                  Chúng tôi sẽ phản hồi trong vòng 2 giờ làm việc.
                </p>
              </div>

              <DemoRequestForm
                privacyPolicyUrl={env.privacyPolicyUrl || '/privacy'}
                salesEmail={env.salesEmail}
                salesPhone={env.salesPhone}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
