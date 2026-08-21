import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, History, Database } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';

export const TrustSection: React.FC = () => {
  const { t } = useTranslation();
  const items = t('landing.home.trust.items', { returnObjects: true }) as string[];

  const icons = [Lock, ShieldCheck, History, Database];

  return (
    <LandingSection className="bg-white">
      <SectionHeading
        eyebrow={t('landing.home.trust.eyebrow')}
        title={t('landing.home.trust.title')}
        align="left"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.isArray(items) &&
          items.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-[#F5F8FC] border border-[#DCE5F0] space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-[#085AC0] flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#07182B] landing-display">
                  {item}
                </h3>
              </div>
            );
          })}
      </div>
    </LandingSection>
  );
};

export default TrustSection;
