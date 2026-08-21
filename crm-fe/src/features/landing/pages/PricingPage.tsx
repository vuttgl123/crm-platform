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

const factors = [
  { key: 'scale', icon: Users },
  { key: 'process', icon: Workflow },
  { key: 'integration', icon: Database },
  { key: 'governance', icon: ShieldCheck },
] as const;

export const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const includedItems = t('landing.pricing.includedItems', { returnObjects: true }) as string[];

  useLandingMetadata({
    title: t('landing.metadata.pricingTitle'),
    description: t('landing.metadata.pricingDescription'),
    path: '/pricing',
  });

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <LandingSection contained className="pt-0">
        <SectionHeading
          as="h1"
          eyebrow={t('landing.pricing.heroKicker')}
          title={t('landing.pricing.heroTitle')}
          description={t('landing.pricing.heroDescription')}
          align="left"
        />

        {/* 4 Evaluation Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {factors.map((f) => {
            const Icon = f.icon;
            const title = t(`landing.pricing.factors.${f.key}.title`);
            const description = t(`landing.pricing.factors.${f.key}.description`);

            return (
              <div
                key={f.key}
                className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm hover:border-blue-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#085AC0] flex items-center justify-center">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#07182B] landing-display">
                  {title}
                </h2>
                <p className="text-sm text-[#52647A] leading-relaxed">
                  {description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Core Foundation Strip */}
        <div className="mt-12 bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#085AC0] shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#07182B] landing-display">
              {t('landing.pricing.includedTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {Array.isArray(includedItems) &&
              includedItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-[#F5F8FC] border border-slate-200/80 flex items-center gap-3 text-sm font-semibold text-[#07182B]"
                >
                  <span className="w-2 h-2 rounded-full bg-[#085AC0] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Consultation CTA Banner */}
        <div className="mt-16 bg-[#07182B] rounded-2xl p-8 sm:p-12 text-white text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold landing-display">
            {t('landing.pricing.ctaTitle')}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Đội ngũ chuyên gia VUM sẽ làm việc cùng doanh nghiệp để xác định mô hình phù hợp và tối ưu chi phí.
          </p>
          <Button
            asChild
            className="h-12 px-8 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-base shadow-sm transition-colors"
          >
            <Link to="/demo">
              <span>{t('landing.pricing.ctaAction')}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </LandingSection>
    </div>
  );
};

export default PricingPage;
