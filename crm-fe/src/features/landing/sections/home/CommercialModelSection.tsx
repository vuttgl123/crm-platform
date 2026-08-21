import React from 'react';
import { useTranslation } from 'react-i18next';
import { LandingSection } from '../../components/LandingSection';
import { commercialScopeItems } from '../../content/homeContent';

export const CommercialModelSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="pricing" aria-labelledby="commercial-title" className="bg-[var(--landing-surface)]">
      <div className="grid gap-10 lg:grid-cols-12">
        <header className="lg:col-span-5">
          <p className="text-sm font-semibold text-[var(--landing-blue)]">
            {t('landing.home.commercial.eyebrow')}
          </p>
          <h2 id="commercial-title" className="landing-display mt-4 text-3xl font-extrabold text-[var(--landing-ink)] md:text-4xl">
            {t('landing.home.commercial.title')}
          </h2>
          <p className="landing-body-copy mt-4 text-base">
            {t('landing.home.commercial.description')}
          </p>
          <a href="#demo" className="landing-primary-action mt-8">
            {t('landing.home.commercial.cta')}
          </a>
        </header>
        <dl className="divide-y divide-[var(--landing-line)] border-y border-[var(--landing-line)] lg:col-span-7">
          {commercialScopeItems.map((item) => (
            <div key={item.id} className="grid gap-2 py-6 sm:grid-cols-[14rem_1fr]">
              <dt className="text-base font-bold text-[var(--landing-ink)]">
                {t(item.titleKey)}
              </dt>
              <dd className="landing-body-copy text-sm">
                {t(item.descriptionKey)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </LandingSection>
  );
};

export default CommercialModelSection;
