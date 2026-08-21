import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layers } from 'lucide-react';

export const ProofStrip: React.FC = () => {
  const { t } = useTranslation();
  const items = t('landing.home.proof.items', { returnObjects: true }) as string[];

  return (
    <div className="border-y border-[#DCE5F0] bg-white py-6">
      <div className="landing-container">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#52647A] shrink-0">
            <Layers className="w-4 h-4 text-[#085AC0]" />
            <span>{t('landing.home.proof.label')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {Array.isArray(items) &&
              items.map((item, index) => (
                <div key={index} className="flex items-center gap-6">
                  <span className="text-xs sm:text-sm font-semibold text-[#07182B]">
                    {item}
                  </span>
                  {index < items.length - 1 && (
                    <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                      /
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProofStrip;
