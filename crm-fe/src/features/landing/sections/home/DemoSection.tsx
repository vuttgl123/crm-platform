import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { env } from '@/config/env';
import { DemoRequestForm } from '../../components/DemoRequestForm';

export const DemoSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="demo" aria-labelledby="demo-title" className="landing-section bg-[var(--landing-canvas)]">
      <div className="landing-container">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="text-sm font-semibold text-[var(--landing-blue)]">
              {t('landing.home.demo.eyebrow')}
            </p>
            <h2 id="demo-title" className="landing-display mt-4 text-3xl font-extrabold text-[var(--landing-ink)] md:text-5xl">
              {t('landing.home.demo.title')}
            </h2>
            <p className="landing-body-copy mt-5 text-lg">
              {t('landing.home.demo.description')}
            </p>
            <h3 className="landing-display mt-8 text-lg font-bold text-[var(--landing-ink)]">
              {t('landing.home.demo.agendaTitle')}
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-[var(--landing-ink)] font-medium">
                <Check aria-hidden="true" className="w-5 h-5 text-[var(--landing-blue)] shrink-0 mt-0.5" />
                <span>{t('landing.home.demo.agendaDiscovery')}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[var(--landing-ink)] font-medium">
                <Check aria-hidden="true" className="w-5 h-5 text-[var(--landing-blue)] shrink-0 mt-0.5" />
                <span>{t('landing.home.demo.agendaWorkflow')}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[var(--landing-ink)] font-medium">
                <Check aria-hidden="true" className="w-5 h-5 text-[var(--landing-blue)] shrink-0 mt-0.5" />
                <span>{t('landing.home.demo.agendaScope')}</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[var(--landing-line)] bg-white p-7 sm:p-10 shadow-sm">
              <div className="mb-6">
                <h3 className="landing-display text-2xl font-bold text-[var(--landing-ink)]">
                  {t('landing.home.demo.formTitle')}
                </h3>
                <p className="landing-body-copy mt-2 text-sm">
                  {t('landing.home.demo.formDescription')}
                </p>
              </div>
              <DemoRequestForm
                privacyPolicyUrl={env.privacyPolicyUrl || '/privacy'}
                salesEmail={env.salesEmail}
                salesPhone={env.salesPhone}
                headingAs="h3"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
