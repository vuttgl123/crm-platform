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

const contexts = [
  {
    key: 'regional',
    icon: Building2,
    modules: [
      'Phân quyền 5 cấp độ (RBAC)',
      'Phạm vi dữ liệu 4 cấp (TENANT, TEAM_TREE, TEAM, OWN)',
      'Quản lý danh sách đội nhóm và vùng phụ trách',
    ],
  },
  {
    key: 'b2b',
    icon: Layers,
    modules: [
      'Hồ sơ pháp nhân Account và đa liên hệ Contact 360°',
      'Quản lý cơ hội Opportunity theo pipeline đa giai đoạn',
      'Tạo và phê duyệt Báo giá (Quotes), Đơn hàng và Hợp đồng',
    ],
  },
  {
    key: 'governed',
    icon: ShieldCheck,
    modules: [
      'Nhật ký kiểm toán (Audit Logs) và Truy vết truy cập (Data Access)',
      'Quản lý yêu cầu dữ liệu cá nhân (DSR) và Chính sách lưu giữ (Retention)',
      'Nhập xuất dữ liệu (Data Import) và Webhooks đồng bộ',
    ],
  },
] as const;

export const SolutionsPage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.solutionsTitle'),
    description: t('landing.metadata.solutionsDescription'),
    path: '/solutions',
  });

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <LandingSection contained className="pt-0">
        <SectionHeading
          as="h1"
          eyebrow={t('landing.solutions.heroKicker')}
          title={t('landing.solutions.heroTitle')}
          description={t('landing.solutions.heroDescription')}
          align="left"
        />

        {/* 3 Business Contexts */}
        <div className="space-y-12 pt-4">
          {contexts.map((ctx) => {
            const Icon = ctx.icon;
            const title = t(`landing.solutions.contexts.${ctx.key}.title`);
            const description = t(`landing.solutions.contexts.${ctx.key}.description`);

            return (
              <div
                key={ctx.key}
                className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#085AC0] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#07182B] landing-display">
                      {title}
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-[#52647A] leading-relaxed">
                    {description}
                  </p>
                  <div className="pt-2">
                    <Button asChild className="h-10 px-5 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-xs sm:text-sm">
                      <Link to="/demo">
                        <span>{t('landing.solutions.ctaAction')}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#F5F8FC] border border-[#DCE5F0] rounded-xl p-5 space-y-3">
                  <span className="text-xs font-bold text-[#07182B] uppercase tracking-wider block">
                    Phân hệ VUM CRM hỗ trợ
                  </span>
                  <ul className="space-y-2.5 text-xs text-[#07182B]">
                    {ctx.modules.map((mod, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#085AC0] shrink-0 mt-0.5" />
                        <span className="leading-snug">{mod}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 bg-[#07182B] rounded-2xl p-8 sm:p-12 text-white text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold landing-display">
            {t('landing.solutions.ctaTitle')}
          </h2>
          <Button
            asChild
            className="h-12 px-8 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-base shadow-sm transition-colors"
          >
            <Link to="/demo">
              <span>{t('landing.solutions.ctaAction')}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </LandingSection>
    </div>
  );
};

export default SolutionsPage;
