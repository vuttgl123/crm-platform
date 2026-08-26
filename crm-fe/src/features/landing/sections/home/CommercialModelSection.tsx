import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { Reveal } from '../../components/Reveal';
import { RoiCalculator } from '../../components/RoiCalculator';
import { commercialScopeItems } from '../../content/homeContent';

export const CommercialModelSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection
      id="pricing"
      tone="dark"
      size="default"
      aria-labelledby="commercial-title"
      className="bg-[#02040A] py-20 md:py-28"
    >
      {/* Interactive Value & ROI Simulation */}
      <Reveal className="mb-14">
        <RoiCalculator />
      </Reveal>

      {/* Structured Implementation Scope Breakdown */}
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <SectionHeading
              id="commercial-title"
              tone="dark"
              eyebrow={t('landing.home.commercial.eyebrow')}
              title={t('landing.home.commercial.title')}
              description={t('landing.home.commercial.description')}
              className="mb-8 sm:mb-8"
            />
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-3 h-13 px-8 rounded-[4px] lp-btn-cinema text-sm font-extrabold uppercase tracking-wider"
            >
              <span>{t('landing.home.commercial.cta')}</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <dl className="lg:col-span-7 rounded-[6px] border border-slate-800 bg-slate-950/90 p-4 sm:p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          {commercialScopeItems.map((item, index) => (
            <Reveal key={item.id} delay={index * 60}>
              <div className="group grid gap-2 border-b border-slate-800/80 p-5 transition-all duration-300 last:border-b-0 hover:bg-slate-900/60 rounded-[4px] sm:grid-cols-[3.5rem_1fr] sm:gap-4">
                <span
                  aria-hidden="true"
                  className="font-mono text-sm font-bold tabular-nums text-cyan-400"
                >
                  0{index + 1}
                </span>
                <div>
                  <dt className="text-base font-bold text-white transition-transform duration-300 group-hover:translate-x-1">
                    {t(item.titleKey)}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    {t(item.descriptionKey)}
                  </dd>
                </div>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </LandingSection>
  );
};

export default CommercialModelSection;
