import React from 'react';
import { useTranslation } from 'react-i18next';
import { XCircle, CheckCircle2 } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';

export const ProblemOutcomeSection: React.FC = () => {
  const { t } = useTranslation();

  const beforeItems = t('landing.home.problem.beforeItems', { returnObjects: true }) as string[];
  const afterItems = t('landing.home.problem.afterItems', { returnObjects: true }) as string[];

  return (
    <LandingSection className="bg-[#F5F8FC]">
      <SectionHeading
        eyebrow={t('landing.home.problem.eyebrow')}
        title={t('landing.home.problem.title')}
        align="left"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Side: Before (Fragmented) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h3 className="text-lg font-bold text-slate-800 landing-display">
              {t('landing.home.problem.beforeTitle')}
            </h3>
          </div>

          <ul className="space-y-4">
            {Array.isArray(beforeItems) &&
              beforeItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-[#52647A] leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
          </ul>
        </div>

        {/* Right Side: After (VUM CRM Governed) */}
        <div className="bg-white border-2 border-[#085AC0]/30 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-lg font-bold text-[#07182B] landing-display">
              {t('landing.home.problem.afterTitle')}
            </h3>
          </div>

          <ul className="space-y-4">
            {Array.isArray(afterItems) &&
              afterItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#085AC0] shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base font-medium text-[#07182B] leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </LandingSection>
  );
};

export default ProblemOutcomeSection;
