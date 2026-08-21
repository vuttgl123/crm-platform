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
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandingMetadata } from '../hooks/useLandingMetadata';
import { LandingSection } from '../components/LandingSection';
import { SectionHeading } from '../components/SectionHeading';

const stages = [
  { key: 'lead', number: '01', icon: UserPlus },
  { key: 'account', number: '02', icon: Users },
  { key: 'opportunity', number: '03', icon: Kanban },
  { key: 'commerce', number: '04', icon: FileCheck },
  { key: 'automation', number: '05', icon: Zap },
  { key: 'forecast', number: '06', icon: TrendingUp },
  { key: 'governance', number: '07', icon: ShieldCheck },
] as const;

export const FeaturesPage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.featuresTitle'),
    description: t('landing.metadata.featuresDescription'),
    path: '/features',
  });

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <LandingSection contained className="pt-0">
        <SectionHeading
          as="h1"
          eyebrow={t('landing.features.heroKicker')}
          title={t('landing.features.heroTitle')}
          description={t('landing.features.heroDescription')}
          align="left"
        />

        {/* Seven Lifecycle Stages Grid */}
        <div className="space-y-6 pt-4">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const title = t(`landing.features.stages.${stage.key}.title`);
            const description = t(`landing.features.stages.${stage.key}.description`);

            return (
              <article
                key={stage.key}
                className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 hover:border-blue-200 transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-5">
                  <span className="text-2xl font-extrabold text-[#085AC0] landing-display opacity-80 shrink-0">
                    {stage.number}
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#085AC0] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#07182B] landing-display">
                        {title}
                      </h2>
                    </div>
                    <p className="text-sm sm:text-base text-[#52647A] leading-relaxed max-w-2xl">
                      {description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 md:self-center">
                  <Button asChild variant="ghost" className="text-xs font-semibold text-[#085AC0] hover:bg-blue-50">
                    <Link to="/demo">
                      <span>{t('landing.nav.demo')}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA Bottom Strip */}
        <div className="mt-16 bg-[#07182B] rounded-2xl p-8 sm:p-12 text-white text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold landing-display">
            {t('landing.features.ctaTitle')}
          </h2>
          <Button
            asChild
            className="h-12 px-8 bg-[#085AC0] hover:bg-[#06499D] text-white font-semibold text-base shadow-sm transition-colors"
          >
            <Link to="/demo">
              <span>{t('landing.features.ctaAction')}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </LandingSection>
    </div>
  );
};

export default FeaturesPage;
